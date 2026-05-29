"use client";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import api from "../../../service/api";

import gerarPDF from "../../../utils/gerarChecklistPDF";

// =====================================
// TYPES
// =====================================

type Formulario = {
  id: string;

  titulo: string;

  createdAt?: string;

  usuario_id?: number;

  id_filial?: number;

  id_ativo?: boolean;

  respostas?: {
    checklist?: any;

    ensaio?: any;

    observacoes?: any;
  };

  usuario?: {
    id: number;
    username: string;
  };

  filial?: {
    id: number;
    nome: string;
  };
};

// =====================================
// JWT
// =====================================

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

  // =====================================
  // USER LOGADO
  // =====================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const payload = parseJwt(token);

    setUsuarioLogado(payload);
  }, []);

  // =====================================
  // FETCH
  // =====================================

  async function fetchFormularios() {
    try {
      setLoading(true);

      const response = await api.get("/formularios");

      const data: Formulario[] = response.data;

      // FILTRA SOMENTE ATIVOS
      const ativos = data.filter((f) => Boolean(f.id_ativo));

      // ROLE
      // FILIAIS DO GESTOR
      const filiaisGestor = usuarioLogado?.filiais?.map((f: any) => f.id) || [];

      // =====================================
      // MASTER
      // =====================================

      let filtrados = ativos;

      if (usuarioLogado?.role === "master") {
        filtrados = ativos;
      }

      // =====================================
      // GESTOR
      // =====================================
      else if (usuarioLogado?.role === "gestor") {
        filtrados = ativos.filter((formulario) =>
          filiaisGestor.includes(formulario.id_filial),
        );
      }

      // =====================================
      // FUNCIONÁRIO
      // =====================================
      else {
        filtrados = ativos.filter(
          (formulario) =>
            String(formulario.usuario_id) === String(usuarioLogado?.id),
        );
      }

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
    if (usuarioLogado) {
      fetchFormularios();
    }
  }, [usuarioLogado]);

  // =====================================
  // DELETE
  // =====================================

  async function handleConfirmDelete() {
    if (!formularioToDelete) return;

    try {
      await api.put(`/formularios/${formularioToDelete.id}/ativo`);

      toast.success("Formulário excluído com sucesso!");

      setShowConfirm(false);

      setFormularioToDelete(null);

      fetchFormularios();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao excluir formulário");
    }
  }

  // =====================================
  // PDF
  // =====================================

  async function downloadPdf(id: string) {
    try {
      const response = await api.get(`/formularios/${id}/pdf`);

      const dados = response.data;
      gerarPDF({
        titulo: dados.titulo,

        usuario: dados.usuario?.username,

        filial_nome: dados.filial?.nome,

        data: dados.created_at,

        checklist: dados.respostas?.checklist,

        ensaio: dados.respostas?.ensaio,

        observacoes: dados.respostas?.observacoes,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao gerar PDF");
    }
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Formulários
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Gerencie os formulários cadastrados
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* ========================= */}
          {/* MOBILE */}
          {/* ========================= */}

          <div className="md:hidden space-y-4">
            {formularios.length > 0 ? (
              formularios.map((f) => (
                <div
                  key={f.id}
                  className="
                  bg-white
                  rounded-2xl
                  shadow-md
                  p-4
                  space-y-3
                "
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {f.titulo}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Filial:</span>{" "}
                      {f.filial?.nome || "—"}
                    </p>

                    <p>
                      <span className="font-semibold">Usuário:</span>{" "}
                      {f.usuario?.username || "—"}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => downloadPdf(f.id)}
                      className="
                      flex-1
                      py-2
                      rounded-xl
                      bg-blue-500
                      hover:bg-blue-600
                      text-white
                      font-medium
                      transition
                    "
                    >
                      PDF
                    </button>

                    <button
                      onClick={() => {
                        setFormularioToDelete(f);
                        setShowConfirm(true);
                      }}
                      className="
                      flex-1
                      py-2
                      rounded-xl
                      bg-red-500
                      hover:bg-red-600
                      text-white
                      font-medium
                      transition
                    "
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center shadow">
                Nenhum formulário cadastrado
              </div>
            )}
          </div>

          {/* ========================= */}
          {/* DESKTOP */}
          {/* ========================= */}

          <div className="hidden md:block overflow-x-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-4 font-semibold text-gray-700">Título</th>

                    <th className="p-4 font-semibold text-gray-700">Filial</th>

                    <th className="p-4 font-semibold text-gray-700">Usuário</th>

                    <th className="p-4 font-semibold text-gray-700">Data</th>

                    <th className="p-4 text-center font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {formularios.length > 0 ? (
                    formularios.map((f) => (
                      <tr
                        key={f.id}
                        className="
                        border-t
                        hover:bg-gray-50
                        transition
                      "
                      >
                        <td className="p-4">{f.titulo}</td>

                        <td className="p-4">{f.filial?.nome || "—"}</td>

                        <td className="p-4">{f.usuario?.username || "—"}</td>

                        <td className="p-4">
                          {f.createdAt
                            ? new Date(f.createdAt).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => downloadPdf(f.id)}
                              className="
                              px-4
                              py-2
                              rounded-xl
                              bg-blue-500
                              hover:bg-blue-600
                              text-white
                              text-sm
                              transition
                            "
                            >
                              PDF
                            </button>

                            <button
                              onClick={() => {
                                setFormularioToDelete(f);
                                setShowConfirm(true);
                              }}
                              className="
                              px-4
                              py-2
                              rounded-xl
                              bg-red-500
                              hover:bg-red-600
                              text-white
                              text-sm
                              transition
                            "
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-gray-500">
                        Nenhum formulário cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div
            className="
            bg-white
            w-full
            max-w-md
            rounded-2xl
            p-6
            shadow-2xl
            space-y-5
          "
          >
            <h3 className="text-xl font-bold text-gray-800">
              Confirmar exclusão
            </h3>

            <p className="text-gray-600">
              Deseja realmente excluir o formulário:
            </p>

            <div className="bg-gray-100 rounded-xl p-3 font-semibold">
              {formularioToDelete?.titulo}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="
                px-4
                py-2
                rounded-xl
                bg-gray-400
                hover:bg-gray-500
                text-white
                transition
              "
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmDelete}
                className="
                px-4
                py-2
                rounded-xl
                bg-red-500
                hover:bg-red-600
                text-white
                transition
              "
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
