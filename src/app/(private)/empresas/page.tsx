"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import api from "../../../service/api";

export default function ListaEmpresas() {
  const router = useRouter();

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<any>(null);

  useEffect(() => {
    loadEmpresas();
  }, []);

  async function loadEmpresas() {
    try {
      const response = await api.get("/empresas");
      const data = response.data;
      const empresasAtivas = data.filter((e: any) => Boolean(e.id_ativo));
      setEmpresas(empresasAtivas);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao carregar empresas");
    }
  }

  function handleCadastrar() {
    router.push("/empresas/cadastrar");
  }

  function handleEditar(id: string) {
    router.push(`/empresas/editar/${id}`);
  }

  function handleDeleteClick(empresa: any) {
    setEmpresaToDelete(empresa);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!empresaToDelete) return;

    try {
      await api.put(`/empresas/${empresaToDelete.id}/desabilitar`);

      setEmpresas((prev) => prev.filter((e) => e.id !== empresaToDelete.id));

      toast.success("Empresa excluída com sucesso!");
    } catch {
      toast.error("Erro ao excluir empresa.");
    } finally {
      setShowConfirm(false);
      setEmpresaToDelete(null);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Empresas</h2>

      {empresas.length === 0 ? (
        <p className="text-gray-500">Nenhuma empresa cadastrada</p>
      ) : (
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">CNPJ</th>
                <th className="p-3">Responsável</th>
                <th className="p-3">Contato</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {empresas.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">{e.nome}</td>
                  <td className="p-3">{e.cnpj}</td>
                  <td className="p-3">{e.responsavel}</td>
                  <td className="p-3">{e.contato_responsavel}</td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditar(e.id)}
                        className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDeleteClick(e)}
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleCadastrar}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Cadastrar
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Confirmação</h3>

            <p>
              Deseja realmente excluir a empresa{" "}
              <strong>{empresaToDelete?.nome}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Não
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
