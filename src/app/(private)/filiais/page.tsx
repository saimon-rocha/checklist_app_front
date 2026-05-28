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

      const filiaisAtivas = response.data.filter((f: any) =>
        Boolean(f.id_ativo),
      );

      setFiliais(filiaisAtivas);
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

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
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
            Filiais
          </h1>

          <p className="text-sm md:text-base text-gray-500 mt-2">
            Gerencie as filiais cadastradas no sistema
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filiais.length === 0 ? (
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
            Nenhuma filial cadastrada
          </div>
        ) : (
          <>
            {/* ================= MOBILE ================= */}

            <div className="md:hidden space-y-4 pb-28">
              {filiais.map((f) => (
                <div
                  key={f.id}
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
                      {f.nome}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {f.matriz?.nome || "Sem matriz"}
                    </p>
                  </div>

                  {/* INFO */}
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">CEP:</span> {f.cep || "-"}
                    </p>

                    <p>
                      <span className="font-semibold">Rua:</span> {f.rua || "-"}
                    </p>

                    <p>
                      <span className="font-semibold">Bairro:</span>{" "}
                      {f.bairro || "-"}
                    </p>

                    <p>
                      <span className="font-semibold">Cidade:</span>{" "}
                      {f.cidade || "-"}
                    </p>

                    <p>
                      <span className="font-semibold">Estado:</span>{" "}
                      {f.estado || "-"}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditar(f.id)}
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
                      onClick={() => handleDeleteClick(f)}
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
                      <th className="p-4 font-semibold text-gray-700">
                        Matriz
                      </th>

                      <th className="p-4 font-semibold text-gray-700">
                        Filial
                      </th>

                      <th className="p-4 font-semibold text-gray-700">CEP</th>

                      <th className="p-4 font-semibold text-gray-700">Rua</th>

                      <th className="p-4 font-semibold text-gray-700">
                        Bairro
                      </th>

                      <th className="p-4 font-semibold text-gray-700">
                        Cidade
                      </th>

                      <th className="p-4 font-semibold text-gray-700">
                        Estado
                      </th>

                      <th className="p-4 text-center font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filiais.map((f) => (
                      <tr
                        key={f.id}
                        className="
                        border-t
                        hover:bg-gray-50
                        transition
                      "
                      >
                        <td className="p-4">{f.matriz?.nome || "-"}</td>

                        <td className="p-4 font-medium">{f.nome}</td>

                        <td className="p-4">{f.cep || "-"}</td>

                        <td className="p-4">{f.rua || "-"}</td>

                        <td className="p-4">{f.bairro || "-"}</td>

                        <td className="p-4">{f.cidade || "-"}</td>

                        <td className="p-4">{f.estado || "-"}</td>

                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditar(f.id)}
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
                              onClick={() => handleDeleteClick(f)}
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
      )}

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

            <p className="text-gray-600">Deseja realmente excluir a filial:</p>

            <div className="bg-gray-100 rounded-xl p-3 font-semibold">
              {filialToDelete?.nome}
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
