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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* CONTAINER */}
      <div
        className="
        max-w-7xl
        mx-auto
        px-3
        sm:px-4
        md:px-6
        py-4
        md:py-6
      "
      >
        {/* HEADER */}
        <div
          className="
          bg-white
          rounded-3xl
          shadow-md
          p-5
          md:p-7
          mb-6
          text-center
        "
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Empresas / Matriz
          </h1>

          <p className="text-sm md:text-base text-gray-500 mt-2">
            Gerencie as matrizes cadastradas no sistema
          </p>
        </div>

        {/* EMPTY */}
        {matriz.length === 0 ? (
          <div
            className="
            bg-white
            rounded-2xl
            shadow-sm
            p-10
            text-center
            text-gray-500
          "
          >
            Nenhuma empresa cadastrada
          </div>
        ) : (
          <>
            {/* ================= MOBILE ================= */}

            <div className="md:hidden space-y-4 pb-28">
              {matriz.map((e) => (
                <div
                  key={e.id}
                  className="
                  bg-white
                  rounded-2xl
                  shadow-sm
                  p-4
                  space-y-4
                "
                >
                  {/* TOP */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {e.nome}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">CNPJ: {e.cnpj}</p>
                  </div>

                  {/* INFO */}
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Responsável:</span>{" "}
                      {e.responsavel || "-"}
                    </p>

                    <p>
                      <span className="font-semibold">Contato:</span>{" "}
                      {e.contato_responsavel || "-"}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditar(e.id)}
                      className="
                      flex-1
                      py-2.5
                      rounded-xl
                      bg-yellow-500
                      hover:bg-yellow-600
                      text-white
                      font-medium
                      transition
                    "
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDeleteClick(e)}
                      className="
                      flex-1
                      py-2.5
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
              ))}
            </div>

            {/* ================= DESKTOP ================= */}

            <div className="hidden md:block overflow-x-auto">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="p-4 font-semibold text-gray-700">Nome</th>

                      <th className="p-4 font-semibold text-gray-700">CNPJ</th>

                      <th className="p-4 font-semibold text-gray-700">
                        Responsável
                      </th>

                      <th className="p-4 font-semibold text-gray-700">
                        Contato
                      </th>

                      <th className="p-4 text-center font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {matriz.map((e) => (
                      <tr
                        key={e.id}
                        className="
                        border-t
                        hover:bg-gray-50
                        transition
                      "
                      >
                        <td className="p-4 font-medium">{e.nome}</td>

                        <td className="p-4">{e.cnpj}</td>

                        <td className="p-4">{e.responsavel}</td>

                        <td className="p-4">{e.contato_responsavel}</td>

                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditar(e.id)}
                              className="
                              px-4
                              py-2
                              rounded-xl
                              bg-yellow-500
                              hover:bg-yellow-600
                              text-white
                              text-sm
                              transition
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
                  py-3
                  rounded-2xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-semibold
                  transition
                  shadow-md
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
        bottom-5
        right-5
        w-16
        h-16
        rounded-full
        bg-blue-600
        hover:bg-blue-700
        text-white
        text-3xl
        shadow-2xl
        flex
        items-center
        justify-center
        z-50
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
          bg-black/50
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
            rounded-3xl
            p-6
            w-full
            max-w-md
            shadow-2xl
            space-y-5
          "
          >
            <h3 className="text-xl font-bold text-gray-800">
              Confirmar exclusão
            </h3>

            <p className="text-gray-600">Deseja realmente excluir a empresa:</p>

            <div className="bg-gray-100 rounded-xl p-3 font-semibold">
              {empresaToDelete?.nome}
            </div>

            <div className="flex justify-end gap-3">
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
