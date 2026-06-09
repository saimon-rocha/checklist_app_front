"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import api from "../../../service/api";

export default function ListaFiliais() {
  const router = useRouter();
  const [filiais, setFiliais] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [filialToDelete, setFilialToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroMatriz, setFiltroMatriz] = useState("");
  const [busca, setBusca] = useState("");

  // =====================================
  // LOAD
  // =====================================

  useEffect(() => {
    loadFiliais();
  }, []);

  async function loadFiliais() {
    try {
      setLoading(true);

      const response = await api.get("/filiais");

      setFiliais(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao carregar filiais");
    } finally {
      setLoading(false);
    }
  }
  // =====================================
  // NAVIGATION
  // =====================================

  function handleCadastrar() {
    router.push("/filiais/cadastrar");
  }

  function handleEditar(id: string) {
    router.push(`/filiais/editar/${id}`);
  }

  // =====================================
  // DELETE
  // =====================================

  function handleDeleteClick(filial: any) {
    setFilialToDelete(filial);

    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!filialToDelete) return;

    try {
      await api.put(`/filiais/${filialToDelete.id}/desabilitar`);

      setFiliais((prev) => prev.filter((f) => f.id !== filialToDelete.id));

      toast.success("Filial excluída com sucesso!");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao excluir filial.");
    } finally {
      setShowConfirm(false);

      setFilialToDelete(null);
    }
  }

  const matrizes = [
    ...new Map(
      filiais.filter((f) => f.matriz).map((f) => [f.matriz.id, f.matriz]),
    ).values(),
  ];

  const filiaisFiltradas = filiais.filter((filial) => {
    const matchMatriz =
      !filtroMatriz || String(filial.matriz?.id) === filtroMatriz;

    const matchBusca =
      !busca ||
      filial.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      filial.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
      filial.cep?.includes(busca);

    return matchMatriz && matchBusca;
  });

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* HEADER */}
        <div
          className="
          bg-white
          rounded-[2rem]
          border
          border-slate-100
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          p-6
          md:p-8
          mb-6
          text-center
        "
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Filiais
          </h1>

          <p className="text-sm md:text-base text-slate-400 font-medium mt-2">
            Gerencie as filiais ativas e suas respectivas localizações
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Buscar filial, cidade ou CEP..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-premium"
            />

            <select
              value={filtroMatriz}
              onChange={(e) => setFiltroMatriz(e.target.value)}
              className="input-premium"
            >
              <option value="">Todas as matrizes</option>

              {matrizes.map((matriz) => (
                <option key={matriz.id} value={matriz.id}>
                  {matriz.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filiaisFiltradas.length === 0 ? (
          <div
            className="
            bg-white
            rounded-[2rem]
            border
            border-slate-100
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            p-12
            text-center
            text-slate-400
            font-medium
          "
          >
            Nenhuma filial encontrada para os filtros selecionados
          </div>
        ) : (
          <>
            {/* ================= MOBILE ================= */}

            <div className="md:hidden space-y-4 pb-28">
              {filiaisFiltradas.map((f) => (
                <div
                  key={f.id}
                  className="
                  bg-white
                  rounded-[2rem]
                  border
                  border-slate-100
                  shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                  p-5
                  space-y-4
                "
                >
                  {/* TOP */}
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">
                      {f.nome}
                    </h2>

                    <p className="text-xs text-indigo-600 font-semibold mt-1">
                      Matriz: {f.matriz?.nome || "Sem matriz"}
                    </p>
                  </div>

                  {/* INFO */}
                  <div className="space-y-2 text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-700">CEP:</span>{" "}
                      {f.cep || "-"}
                    </p>

                    <p className="text-slate-600">
                      <span className="font-bold text-slate-700">
                        Endereço:
                      </span>{" "}
                      {f.rua
                        ? `${f.rua}, ${f.bairro} - ${f.cidade}/${f.estado}`
                        : "-"}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => handleEditar(f.id)}
                      className="
                      flex-1
                      py-3
                      rounded-xl
                      bg-amber-500
                      hover:bg-amber-600
                      text-white
                      font-bold
                      text-xs
                      transition-all
                      duration-200
                      active:scale-[0.98]
                      cursor-pointer
                      shadow-md
                      shadow-amber-500/10
                    "
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDeleteClick(f)}
                      className="
                      flex-1
                      py-3
                      rounded-xl
                      bg-rose-500
                      hover:bg-rose-600
                      text-white
                      font-bold
                      text-xs
                      transition-all
                      duration-200
                      active:scale-[0.98]
                      cursor-pointer
                      shadow-md
                      shadow-rose-500/10
                    "
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= DESKTOP ================= */}

            <div className="hidden md:block">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-left">
                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Matriz
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Filial
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        CEP
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Endereço
                      </th>

                      <th className="p-4 px-6 text-center font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filiaisFiltradas.map((f) => (
                      <tr
                        key={f.id}
                        className="
                        border-b
                        border-slate-100
                        hover:bg-slate-50/50
                        transition-all
                        duration-200
                      "
                      >
                        <td className="p-4 px-6 text-sm text-slate-500">
                          {f.matriz?.nome || "-"}
                        </td>

                        <td className="p-4 px-6 font-medium text-slate-800">
                          {f.nome}
                        </td>

                        <td className="p-4 px-6 text-sm text-slate-500">
                          {f.cep || "-"}
                        </td>

                        <td className="p-4 px-6 text-sm text-slate-500">
                          {f.rua
                            ? `${f.rua}, ${f.bairro} - ${f.cidade}/${f.estado}`
                            : "-"}
                        </td>

                        <td className="p-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditar(f.id)}
                              className="
                              px-4
                              py-2
                              rounded-xl
                              bg-amber-500
                              hover:bg-amber-600
                              text-white
                              text-xs
                              font-bold
                              transition-all
                              duration-200
                              cursor-pointer
                              shadow-md
                              shadow-amber-500/10
                            "
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => handleDeleteClick(f)}
                              className="
                              px-4
                              py-2
                              rounded-xl
                              bg-rose-500
                              hover:bg-rose-600
                              text-white
                              text-xs
                              font-bold
                              transition-all
                              duration-200
                              cursor-pointer
                              shadow-md
                              shadow-rose-500/10
                            "
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* BUTTON DESKTOP */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleCadastrar}
                  className="
                  px-6
                  py-3.5
                  rounded-2xl
                  premium-gradient-bg
                  hover:opacity-95
                  text-white
                  font-bold
                  transition-all
                  duration-200
                  active:scale-[0.98]
                  shadow-lg
                  shadow-indigo-500/15
                  cursor-pointer
                "
                >
                  Cadastrar Filial
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FAB MOBILE */}
      {!loading && (
        <button
          onClick={handleCadastrar}
          className="
          md:hidden
          fixed
          bottom-24
          right-6
          w-14
          h-14
          rounded-full
          premium-gradient-bg
          hover:opacity-95
          text-white
          text-3xl
          shadow-lg
          shadow-indigo-500/30
          flex
          items-center
          justify-center
          z-50
          cursor-pointer
          active:scale-90
          transition-transform
        "
        >
          +
        </button>
      )}

      {/* MODAL */}
      {showConfirm && (
        <div
          className="
          fixed
          inset-0
          bg-slate-900/40
          backdrop-blur-sm
          flex
          items-center
          justify-center
          px-4
          z-50
        "
        >
          <div
            className="
            bg-white
            rounded-[2rem]
            border
            border-slate-100
            p-6
            md:p-8
            w-full
            max-w-md
            shadow-2xl
            space-y-6
          "
          >
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              Confirmar exclusão
            </h3>

            <p className="text-slate-500 text-sm">
              Deseja realmente desativar a filial abaixo?
            </p>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 font-bold text-slate-800 text-center break-all">
              {filialToDelete?.nome}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="
                px-5
                py-3
                rounded-xl
                bg-slate-100
                hover:bg-slate-200
                text-slate-600
                font-bold
                text-xs
                transition-all
                duration-200
                cursor-pointer
              "
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmDelete}
                className="
                px-5
                py-3
                rounded-xl
                bg-rose-500
                hover:bg-rose-600
                text-white
                font-bold
                text-xs
                transition-all
                duration-200
                cursor-pointer
                shadow-md
                shadow-rose-500/10
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
