"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import api from "../../../service/api";

export default function ListaEmpresas() {
  const router = useRouter();

  const [matriz, setEmpresas] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<any>(null);
  const [filtroMatriz, setFiltroMatriz] = useState("");

  useEffect(() => {
    loadEmpresas();
  }, []);

  async function loadEmpresas() {
    try {
      const response = await api.get("/matriz");

      setEmpresas(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao carregar matriz");
    }
  }

  function handleCadastrar() {
    router.push("/matriz/cadastrar");
  }

  function handleEditar(id: string) {
    router.push(`/matriz/editar/${id}`);
  }

  function handleDeleteClick(empresa: any) {
    setEmpresaToDelete(empresa);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!empresaToDelete) return;

    try {
      await api.put(`/matriz/${empresaToDelete.id}/desabilitar`);

      setEmpresas((prev) => prev.filter((e) => e.id !== empresaToDelete.id));

      toast.success("Matriz excluída com sucesso!");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao excluir empresa.");
    } finally {
      setShowConfirm(false);
      setEmpresaToDelete(null);
    }
  }

  const matrizFiltrada = matriz.filter(
    (empresa) =>
      empresa.nome?.toLowerCase().includes(filtroMatriz.toLowerCase()) ||
      empresa.cnpj?.includes(filtroMatriz),
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* CONTAINER */}
      <div
        className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        py-6
        md:py-8
      "
      >
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
            Empresas / Matriz
          </h1>

          <p className="text-sm md:text-base text-slate-400 font-medium mt-2">
            Gerencie as matrizes do sistema e suas informações básicas de
            contato
          </p>
        </div>

        {/* FILTRO */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Pesquisar por nome ou CNPJ..."
            value={filtroMatriz}
            onChange={(e) => setFiltroMatriz(e.target.value)}
            className="
                        w-full
                        px-4
                        py-3
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500
                        focus:border-indigo-500
                      "
          />
        </div>

        {/* EMPTY */}
        {matrizFiltrada.length === 0 ? (
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
            Nenhuma empresa cadastrada
          </div>
        ) : (
          <>
            {/* ================= MOBILE ================= */}

            <div className="md:hidden space-y-4 pb-28">
              {matrizFiltrada.map((e) => (
                <div
                  key={e.id}
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
                      {e.nome}
                    </h2>

                    <p className="text-xs text-indigo-600 font-semibold mt-1">
                      CNPJ: {e.cnpj}
                    </p>
                  </div>

                  {/* INFO */}
                  <div className="space-y-2 text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-700">
                        Responsável:
                      </span>{" "}
                      {e.responsavel || (
                        <span className="text-slate-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>

                    <p className="text-slate-600">
                      <span className="font-bold text-slate-700">Contato:</span>{" "}
                      {e.contato_responsavel || (
                        <span className="text-slate-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => handleEditar(e.id)}
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
                      onClick={() => handleDeleteClick(e)}
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
                        Nome
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        CNPJ
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Responsável
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Contato
                      </th>

                      <th className="p-4 px-6 text-center font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {matrizFiltrada.map((e) => (
                      <tr
                        key={e.id}
                        className="
                        border-b
                        border-slate-100
                        hover:bg-slate-50/50
                        transition-all
                        duration-200
                      "
                      >
                        <td className="p-4 px-6 font-medium text-slate-800 break-all max-w-[250px]">
                          {e.nome}
                        </td>

                        <td className="p-4 px-6 text-sm text-slate-500">
                          {e.cnpj}
                        </td>

                        <td className="p-4 px-6 text-sm text-slate-500">
                          {e.responsavel}
                        </td>

                        <td className="p-4 px-6 text-sm text-slate-500">
                          {e.contato_responsavel}
                        </td>

                        <td className="p-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditar(e.id)}
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
                              onClick={() => handleDeleteClick(e)}
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
                  Cadastrar Empresa
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FAB MOBILE */}
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
              Deseja realmente desativar a matriz abaixo? Todas as filiais
              ligadas a ela serão afetadas.
            </p>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 font-bold text-slate-800 text-center break-all">
              {empresaToDelete?.nome}
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
