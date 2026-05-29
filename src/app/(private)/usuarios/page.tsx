"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import api from "../../../service/api";

export default function ListaUsuarios() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<any[]>([]);

  const [showConfirm, setShowConfirm] = useState(false);

  const [usuarioToDelete, setUsuarioToDelete] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  // =====================================
  // LOAD
  // =====================================

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      setLoading(true);

      const response = await api.get("/usuarios");

      const data = response.data;

      const ativos = data.filter((u: any) => u.id_ativo === true);

      const usuarioLogado = JSON.parse(
        localStorage.getItem("usuarioLogado") || "{}",
      );

      const filiaisGestor = usuarioLogado?.filiais?.map((f: any) => f.id) || [];

      let usuariosFiltrados = ativos;

      // =====================================
      // GESTOR
      // =====================================

      if (usuarioLogado?.role === "gestor") {
        usuariosFiltrados = ativos.filter((usuario: any) => {
          // NÃO MOSTRA MASTER
          if (usuario.role === "master") {
            return false;
          }

          // FILIAIS DO USUÁRIO
          const filiaisUsuario = usuario?.filiais?.map((f: any) => f.id) || [];

          // TEM FILIAL EM COMUM
          return filiaisUsuario.some((id: number) =>
            filiaisGestor.includes(id),
          );
        });
      }

      setUsuarios(usuariosFiltrados);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // DELETE
  // =====================================

  function handleDeleteClick(usuario: any) {
    const usuarioLogado = JSON.parse(
      localStorage.getItem("usuarioLogado") || "{}",
    );

    // =====================================
    // NÃO PODE EXCLUIR A SI MESMO
    // =====================================

    if (Number(usuarioLogado?.id) === Number(usuario.id)) {
      toast.warning("Você não pode excluir seu próprio usuário!");

      return;
    }

    // =====================================
    // GESTOR NÃO PODE EXCLUIR MASTER
    // =====================================

    if (usuarioLogado?.role === "gestor" && usuario.role === "master") {
      toast.warning("Gestores não podem excluir usuários master!");

      return;
    }

    // =====================================
    // GESTOR NÃO PODE EXCLUIR GESTOR
    // =====================================

    if (usuarioLogado?.role === "gestor" && usuario.role === "gestor") {
      toast.warning("Gestores não podem excluir outros gestores!");

      return;
    }

    setUsuarioToDelete(usuario);

    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!usuarioToDelete) return;

    try {
      await api.put(`/usuarios/${usuarioToDelete.id}/desabilitar`);

      toast.success("Usuário desativado com sucesso!");

      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioToDelete.id));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao desativar usuário");
    } finally {
      setShowConfirm(false);

      setUsuarioToDelete(null);
    }
  }

  // =====================================
  // ROLE COLOR
  // =====================================

  function renderRole(role: string) {
    if (role === "master") {
      return <span className="text-red-500 font-bold">Master</span>;
    }

    if (role === "gestor") {
      return <span className="text-blue-500 font-bold">Gestor</span>;
    }

    return <span className="text-gray-700">Funcionário</span>;
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
            Usuários
          </h1>

          <p className="text-sm md:text-base text-gray-500 mt-2">
            Gerencie os usuários cadastrados no sistema
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : usuarios.length === 0 ? (
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
            Nenhum usuário cadastrado
          </div>
        ) : (
          <>
            {/* ================= MOBILE ================= */}

            <div className="md:hidden space-y-4 pb-28">
              {usuarios.map((u) => (
                <div
                  key={u.id}
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
                    <h2 className="text-lg font-bold text-gray-800 break-all">
                      {u.username}
                    </h2>

                    <div className="mt-2">{renderRole(u.role)}</div>
                  </div>

                  {/* INFO */}
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Filiais:</span>{" "}
                      {u.filiais?.length > 0
                        ? u.filiais.map((f: any) => f.nome).join(", ")
                        : "-"}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => router.push(`/usuarios/editar/${u.id}`)}
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
                      onClick={() => handleDeleteClick(u)}
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
                      <th className="p-4 font-semibold text-gray-700">Email</th>

                      <th className="p-4 font-semibold text-gray-700">
                        Filiais
                      </th>

                      <th className="p-4 font-semibold text-gray-700">
                        Perfil
                      </th>

                      <th className="p-4 text-center font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="
                        border-t
                        hover:bg-gray-50
                        transition
                      "
                      >
                        <td className="p-4 max-w-[260px] truncate">
                          {u.username}
                        </td>

                        <td className="p-4">
                          {u.filiais?.length > 0
                            ? u.filiais.map((f: any) => f.nome).join(", ")
                            : "-"}
                        </td>

                        <td className="p-4">{renderRole(u.role)}</td>

                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                router.push(`/usuarios/editar/${u.id}`)
                              }
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
                              onClick={() => handleDeleteClick(u)}
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
                  onClick={() => router.push("/usuarios/cadastrar")}
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
                  Cadastrar Usuário
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FAB MOBILE */}
      {!loading && (
        <button
          onClick={() => router.push("/usuarios/cadastrar")}
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

            <p className="text-gray-600">Deseja realmente excluir o usuário:</p>

            <div className="bg-gray-100 rounded-xl p-3 font-semibold break-all">
              {usuarioToDelete?.username}
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
