"use client";

import { useEffect, useMemo, useState } from "react";

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

  id_usuario?: number;

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

export default function Arquivos() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);

  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);

  const [formularioToDelete, setFormularioToDelete] =
    useState<Formulario | null>(null);

  const hoje = new Date().toISOString().split("T")[0];

  const [filtroFilial, setFiltroFilial] = useState("");
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  // =====================================
  // FETCH
  // =====================================

  async function fetchFormularios(filialId?: string) {
    try {
      setLoading(true);

      const url = filialId
        ? `/formularios?id_filial=${filialId}`
        : "/formularios";

      const response = await api.get(url);

      setFormularios(response.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao carregar formulários",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFormularios();
  }, []);

  // =====================================
  // FILTRO
  // =====================================

  const filiais = useMemo(() => {
    const unicas = formularios.reduce((acc: any[], item) => {
      if (
        item.filial &&
        !acc.find((f) => String(f.id) === String(item.filial?.id))
      ) {
        acc.push(item.filial);
      }

      return acc;
    }, []);

    return unicas;
  }, [formularios]);

  const formulariosFiltrados = useMemo(() => {
    return formularios.filter((f) => {
      const matchFilial =
        !filtroFilial || String(f.id_filial) === String(filtroFilial);

      const dataFormulario = f.createdAt ? new Date(f.createdAt) : null;

      const matchDataInicio =
        !dataInicio ||
        (dataFormulario && dataFormulario >= new Date(dataInicio));

      const matchDataFim =
        !dataFim ||
        (dataFormulario && dataFormulario <= new Date(`${dataFim}T23:59:59`));

      return matchFilial && Boolean(matchDataInicio) && Boolean(matchDataFim);
    });
  }, [formularios, filtroFilial, dataInicio, dataFim]);

  // =====================================
  // DELETE
  // =====================================

  async function handleConfirmDelete() {
    if (!formularioToDelete) return;

    try {
      await api.put(`/formularios/${formularioToDelete.id}/desabilitar`);

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
    <div className="min-h-screen bg-slate-50/50 px-4 py-6 sm:py-8">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <div
          className="
            bg-gradient-to-tr
            from-slate-950
            via-slate-900
            to-indigo-950
            rounded-[2rem]
            px-6
            md:px-10
            py-8
            text-center
            shadow-lg
            relative
            overflow-hidden
          "
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Formulários
          </h2>

          <p className="text-indigo-200/80 mt-2 text-sm md:text-base font-medium">
            Gerencie e exporte os formulários de checklist salvos
          </p>
        </div>
      </div>

      {/* FILTRO */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                Filtrar por filial
              </label>

              <select
                value={filtroFilial}
                onChange={(e) => setFiltroFilial(e.target.value)}
                className="input-premium w-full min-h-[48px]"
              >
                <option value="">Todas as filiais</option>

                {filiais.map((filial: any) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                Data inicial
              </label>

              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="input-premium w-full min-h-[48px]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                Data final
              </label>

              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="input-premium w-full min-h-[48px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">
              Carregando formulários...
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* MOBILE */}
          <div className="md:hidden space-y-4">
            {formulariosFiltrados.length > 0 ? (
              formulariosFiltrados.map((f) => (
                <div
                  key={f.id}
                  className="
                    bg-white
                    rounded-3xl
                    border
                    border-slate-100
                    shadow-[0_8px_30px_rgb(0,0,0,0.02)]
                    p-5
                    space-y-4
                    hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]
                    transition-all
                    duration-200
                  "
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                      {f.titulo}
                    </h3>

                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Filial
                      </span>
                      <span className="font-medium text-slate-800">
                        {f.filial?.nome || "—"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Usuário
                      </span>
                      <span className="font-medium text-slate-800">
                        {f.usuario?.username || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => downloadPdf(f.id)}
                      className="
                        flex-1
                        py-2.5
                        rounded-xl
                        bg-indigo-50
                        hover:bg-indigo-100
                        text-indigo-600
                        font-bold
                        text-sm
                        transition-all
                        duration-200
                        active:scale-[0.97]
                        cursor-pointer
                      "
                    >
                      Visualizar PDF
                    </button>

                    <button
                      onClick={() => {
                        setFormularioToDelete(f);
                        setShowConfirm(true);
                      }}
                      className="
                        flex-1
                        py-2.5
                        rounded-xl
                        bg-rose-50
                        hover:bg-rose-100
                        text-rose-600
                        font-bold
                        text-sm
                        transition-all
                        duration-200
                        active:scale-[0.97]
                        cursor-pointer
                      "
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 text-center text-slate-500 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                Nenhum formulário encontrado
              </div>
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="p-5 text-left font-bold">Título</th>

                  <th className="p-5 text-left font-bold">Filial</th>

                  <th className="p-5 text-left font-bold">Usuário</th>

                  <th className="p-5 text-left font-bold">Data</th>

                  <th className="p-5 text-center font-bold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {formulariosFiltrados.length > 0 ? (
                  formulariosFiltrados.map((f) => (
                    <tr
                      key={f.id}
                      className="
                        hover:bg-slate-50/50
                        transition-all
                        duration-150
                      "
                    >
                      <td className="p-5 font-medium text-slate-900">
                        {f.titulo}
                      </td>

                      <td className="p-5">{f.filial?.nome || "—"}</td>

                      <td className="p-5 text-slate-600">
                        {f.usuario?.username || "—"}
                      </td>

                      <td className="p-5 text-slate-500 font-medium">
                        {f.createdAt
                          ? new Date(f.createdAt).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>

                      <td className="p-5">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => downloadPdf(f.id)}
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-indigo-50
                              hover:bg-indigo-100
                              text-indigo-600
                              font-bold
                              text-xs
                              transition-all
                              duration-200
                              active:scale-[0.96]
                              cursor-pointer
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
                              bg-rose-50
                              hover:bg-rose-100
                              text-rose-600
                              font-bold
                              text-xs
                              transition-all
                              duration-200
                              active:scale-[0.96]
                              cursor-pointer
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
                    <td
                      colSpan={5}
                      className="text-center p-12 text-slate-400 font-medium"
                    >
                      Nenhum formulário cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center px-4 z-50 animate-fade-in">
          <div
            className="
              bg-white
              w-full
              max-w-md
              rounded-[2rem]
              p-6
              md:p-8
              border
              border-slate-100
              shadow-2xl
              space-y-6
              animate-scale-up
            "
          >
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Confirmar exclusão
              </h3>

              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Tem certeza que deseja deletar este formulário? Esta ação não
                pode ser desfeita.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 font-semibold text-slate-800 text-sm">
              {formularioToDelete?.titulo}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-600
                  font-bold
                  text-sm
                  transition-all
                  duration-200
                  active:scale-[0.98]
                  cursor-pointer
                "
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmDelete}
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  bg-rose-600
                  hover:bg-rose-700
                  text-white
                  font-bold
                  text-sm
                  transition-all
                  duration-200
                  active:scale-[0.98]
                  shadow-lg
                  shadow-rose-600/10
                  cursor-pointer
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
