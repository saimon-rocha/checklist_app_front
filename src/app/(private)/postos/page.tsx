"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import api from "../../../service/api";

export default function ListaPostos() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [postos, setPostos] = useState<any[]>([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [postoToDelete, setPostoToDelete] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [postosResponse, usuariosResponse] = await Promise.all([
        api.get("/postos"),
        api.get("/usuarios"),
      ]);

      const postosAtivos = postosResponse.data.filter((p: any) =>
        Boolean(p.id_ativo)
      );

      const usuariosAtivos = usuariosResponse.data.filter((u: any) =>
        Boolean(u.id_ativo)
      );

      setPostos(postosAtivos);
      setUsuarios(usuariosAtivos);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }

  function handleCadastrar() {
    router.push("/postos/cadastrar");
  }

  function handleEditar(id: string) {
    router.push(`/postos/editar/${id}`);
  }

  function handleDeleteClick(posto: any) {
    const usuariosVinculados = usuarios.filter(
      (u) => u.id_posto === posto.id
    );

    if (usuariosVinculados.length > 0) {
      toast.warning(
        "Não é possível excluir este posto, pois há usuários vinculados."
      );
      return;
    }

    setPostoToDelete(posto);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!postoToDelete) return;

    try {
      await api.put(`/postos/${postoToDelete.id}/desabilitar`);

      setPostos((prev) =>
        prev.filter((p) => p.id !== postoToDelete.id)
      );

      toast.success("Posto excluído com sucesso!");
    } catch {
      toast.error("Erro ao excluir posto.");
    } finally {
      setShowConfirm(false);
      setPostoToDelete(null);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-6">Postos</h2>

      {/* EMPTY */}
      {postos.length === 0 ? (
        <p className="text-gray-500">Nenhum posto cadastrado</p>
      ) : (
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Posto</th>
                <th className="p-3">CEP</th>
                <th className="p-3">Rua</th>
                <th className="p-3">Bairro</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {postos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.nome}</td>
                  <td className="p-3">{p.cep}</td>
                  <td className="p-3">{p.rua}</td>
                  <td className="p-3">{p.bairro}</td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditar(p.id)}
                        className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDeleteClick(p)}
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

          {/* BOTÃO CADASTRAR */}
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

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Confirmação</h3>

            <p>
              Deseja realmente excluir o posto{" "}
              <strong>{postoToDelete?.nome}</strong>?
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