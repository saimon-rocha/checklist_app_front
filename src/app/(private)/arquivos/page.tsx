"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../../../service/api";
import gerarPDF from "../../../utils/gerarChecklistPDF";

import { checklistItems } from "../../../utils/checklistStructure";

type Formulario = {
  id: string;
  titulo: string;
  createdAt?: string;
  usuario_id?: number;
  id_posto?: number;

  respostas?: {
    checklist?: any;
    ensaio?: any;
  };

  usuario?: { id: number; username: string };
  posto?: { id: number; nome: string };
};
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Arquivos() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formularioToDelete, setFormularioToDelete] =
    useState<Formulario | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  // =========================
  // USER LOGADO
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = parseJwt(token);
    setUsuarioLogado(payload);
  }, []);

  // =========================
  // FETCH
  // =========================
  async function fetchFormularios() {
    try {
      setLoading(true);

      const response = await api.get("/arquivos");
      const data: Formulario[] = response.data;
      const filtrados =
        usuarioLogado?.role === "master"
          ? data
          : usuarioLogado?.role === "gestor"
            ? data
            : data.filter(
                (f) => String(f.usuario_id) === String(usuarioLogado?.id),
              );

      setFormularios(filtrados);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao carregar formulários",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuarioLogado) fetchFormularios();
  }, [usuarioLogado]);

  // =========================
  // DELETE
  // =========================
  async function handleConfirmDelete() {
    if (!formularioToDelete) return;

    try {
      await api.put(`/arquivos/${formularioToDelete.id}/desabilitar`);

      toast.success("Formulário excluído com sucesso!");
      setShowConfirm(false);
      setFormularioToDelete(null);

      fetchFormularios();
    } catch (error: any) {
      toast.error("Erro ao excluir formulário");
    }
  }

  // =========================
  // PDF
  // =========================
  async function downloadPdf(id: string) {
    try {
      const response = await api.get(`/arquivos/${id}/pdf`);

      const dados = response.data;

      console.log(dados);

      gerarPDF({
        titulo: dados.titulo,
        usuario: dados.usuario?.username,
        filial_nome: dados.posto?.nome,
        data: dados.createdAt,
        checklist: dados.respostas.checklist,
        ensaio: dados.respostas.ensaio,
        observacoes: dados.respostas.observacoes,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-6 text-center">Formulários</h2>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Posto</th>
                <th className="p-3">Usuário</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {formularios.length > 0 ? (
                formularios.map((f) => (
                  <tr key={f.id} className="border-t">
                    <td className="p-3">{f.titulo}</td>
                    <td className="p-3">{f.posto?.nome || "—"}</td>
                    <td className="p-3">{f.usuario?.username || "—"}</td>

                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => downloadPdf(f.id)}
                          className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm"
                        >
                          PDF
                        </button>

                        <button
                          onClick={() => {
                            setFormularioToDelete(f);
                            setShowConfirm(true);
                          }}
                          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-6">
                    Nenhum formulário cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL (Tailwind puro simples) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Confirmação</h3>

            <p>
              Deseja realmente excluir o formulário?
              <br />
              <strong>{formularioToDelete?.titulo}</strong>
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
