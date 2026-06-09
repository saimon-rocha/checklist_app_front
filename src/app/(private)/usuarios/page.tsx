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

  const [busca, setBusca] = useState("");
  const [filtroMatriz, setFiltroMatriz] = useState("");
  const [filtroFilial, setFiltroFilial] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");

  const [matrizes, setMatrizes] = useState([]);
  const [filiais, setFiliais] = useState([]);

  // =====================================
  // LOAD
  // =====================================

  useEffect(() => {
    loadUsuarios();
    loadFiliais();
    loadMatrizes();
  }, []);

  async function loadFiliais() {
    const response = await api.get("/filiais");
    setFiliais(response.data);
  }

  async function loadMatrizes() {
    const response = await api.get("/matriz");
    setMatrizes(response.data);
  }

  async function loadUsuarios() {
    try {
      setLoading(true);

      const response = await api.get("/usuarios");

      setUsuarios(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }
  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      !busca || u.username?.toLowerCase().includes(busca.toLowerCase());

    const matchPerfil = !filtroPerfil || u.perfil === filtroPerfil;

    const matchFilial =
      !filtroFilial ||
      u.filiais?.some((f: any) => String(f.id) === filtroFilial);

    const matchMatriz =
      !filtroMatriz ||
      u.filiais?.some((f: any) => String(f.matriz_id) === filtroMatriz);

    return matchBusca && matchPerfil && matchFilial && matchMatriz;
  });
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

    if (usuarioLogado?.perfil === "gestor" && usuario.perfil === "master") {
      toast.warning("Gestores não podem excluir usuários master!");

      return;
    }

    // =====================================
    // GESTOR NÃO PODE EXCLUIR GESTOR
    // =====================================

    if (usuarioLogado?.perfil === "gestor" && usuario.perfil === "gestor") {
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

  function renderRole(perfil: string) {
    if (perfil === "master") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
          Master
        </span>
      );
    }

    if (perfil === "gestor") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
          Gestor
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
        Funcionário
      </span>
    );
  }

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
            Usuários
          </h1>

          <p className="text-sm md:text-base text-slate-400 font-medium mt-2">
            Gerencie os usuários cadastrados e as permissões de acesso do
            sistema
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Pesquisar usuário..."
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

              {matrizes.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroFilial}
              onChange={(e) => setFiltroFilial(e.target.value)}
              className="input-premium"
            >
              <option value="">Todas as filiais</option>

              {filiais.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
              className="input-premium"
            >
              <option value="">Todos os perfis</option>
              <option value="master">Master</option>
              <option value="gestor">Gestor</option>
              <option value="funcionario">Funcionário</option>
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : usuarios.length === 0 ? (
          <div
            className="
            bg-white
            rounded-3xl
            border
            border-slate-100
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            p-12
            text-center
            text-slate-400
            font-medium
          "
          >
            Nenhum usuário cadastrado
          </div>
        ) : (
          <>
            {/* ================= MOBILE ================= */}

            <div className="md:hidden space-y-4 pb-28">
              {usuariosFiltrados.map((u) => (
                <div
                  key={u.id}
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
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="text-lg font-bold text-slate-800 break-all leading-snug">
                      {u.username}
                    </h2>

                    <div className="shrink-0">{renderRole(u.perfil)}</div>
                  </div>

                  {/* INFO */}
                  <div className="space-y-2 text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-700">Filiais:</span>{" "}
                      {u.filiais?.length > 0 ? (
                        u.filiais.map((f: any) => f.nome).join(", ")
                      ) : (
                        <span className="text-slate-400 italic">Nenhuma</span>
                      )}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => router.push(`/usuarios/editar/${u.id}`)}
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
                      onClick={() => handleDeleteClick(u)}
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
                        Email/Usuário
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Filiais associadas
                      </th>

                      <th className="p-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Perfil
                      </th>

                      <th className="p-4 px-6 text-center font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr
                        key={u.id}
                        className="
                        border-b
                        border-slate-100
                        hover:bg-slate-50/50
                        transition-all
                        duration-200
                      "
                      >
                        <td className="p-4 px-6 font-medium text-slate-800 max-w-[260px] truncate">
                          {u.username}
                        </td>

                        <td className="p-4 px-6 text-sm text-slate-500">
                          {u.filiais?.length > 0 ? (
                            u.filiais.map((f: any) => f.nome).join(", ")
                          ) : (
                            <span className="text-slate-400 italic">
                              Sem filial associada
                            </span>
                          )}
                        </td>

                        <td className="p-4 px-6">{renderRole(u.perfil)}</td>

                        <td className="p-4 px-6">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                router.push(`/usuarios/editar/${u.id}`)
                              }
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
                              onClick={() => handleDeleteClick(u)}
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
                  onClick={() => router.push("/usuarios/cadastrar")}
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
              Deseja realmente desativar o usuário abaixo? Ele perderá acesso ao
              sistema.
            </p>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 font-bold text-slate-800 text-center break-all">
              {usuarioToDelete?.username}
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
