"use client";

import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";

import { toast } from "react-toastify";

import validarCPF from "../../../../../utils/validarCPF";

import api from "../../../../../service/api";

export default function EditarUsuario() {
  const router = useRouter();

  const params = useParams();

  const id = params.id;

  const [email, setEmail] = useState("");

  const [senha, setSenha] = useState("");

  const [cpf, setCpf] = useState("");

  const [role, setRole] = useState("funcionario");

  const [filialSelecionada, setFilialSelecionada] = useState("");

  const [filiaisSelecionadas, setFiliaisSelecionadas] = useState<number[]>([]);

  const [filiais, setFiliais] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [loadingPage, setLoadingPage] = useState(true);

  // =========================================
  // USUARIO LOGADO
  // =========================================

  const usuarioLogado =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("usuarioLogado") || "{}")
      : {};

  const isMaster = usuarioLogado?.role === "master";

  // =========================================
  // LOAD
  // =========================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingPage(true);

        await Promise.all([loadFiliais(), loadUsuario()]);
      } finally {
        setLoadingPage(false);
      }
    }

    loadData();
  }, []);

  async function loadFiliais() {
    try {
      const response = await api.get("/filiais");

      const filiaisAtivas = response.data.filter((f: any) =>
        Boolean(f.id_ativo),
      );

      setFiliais(filiaisAtivas);
    } catch {
      toast.error("Erro ao carregar filiais");
    }
  }

  async function loadUsuario() {
    try {
      const response = await api.get(`/usuarios/${id}`);

      const usuario = response.data;

      setEmail(usuario.username || "");

      setCpf(usuario.cpf || "");

      setRole(usuario.role || "funcionario");

      // =========================================
      // FILIAIS
      // =========================================

      if (usuario.filiais?.length > 0) {
        const ids = usuario.filiais.map((f: any) => Number(f.id));

        setFiliaisSelecionadas(ids);

        setFilialSelecionada(String(ids[0]));
      }
    } catch {
      toast.error("Usuário não encontrado!");

      router.push("/usuarios");
    }
  }

  // =========================================
  // SUBMIT
  // =========================================

  async function handleSubmit(e: any) {
    e.preventDefault();

    // =========================================
    // VALIDA FILIAIS
    // =========================================

    if (role === "funcionario" && !filialSelecionada) {
      toast.warning("Selecione uma filial.");
      return;
    }

    if (
      (role === "gestor" || role === "master") &&
      filiaisSelecionadas.length === 0
    ) {
      toast.warning("Selecione ao menos uma filial.");
      return;
    }

    // =========================================
    // CPF
    // =========================================

    if (!validarCPF(cpf)) {
      toast.warning("CPF inválido!");
      return;
    }

    // =========================================
    // MASTER
    // =========================================

    if (!isMaster && role === "master") {
      toast.error("Você não possui permissão para definir perfil master.");
      return;
    }

    // =========================================
    // SENHA
    // =========================================

    if (senha && senha.trim().length < 6) {
      toast.warning("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // =========================================
      // USUARIO ORIGINAL
      // =========================================

      const responseUsuario = await api.get(`/usuarios/${id}`);

      const usuarioOriginal = responseUsuario.data;

      // =========================================
      // BODY
      // =========================================

      const body: any = {
        username: email.trim(),

        cpf,

        role,

        filiais:
          role === "gestor" || role === "master"
            ? filiaisSelecionadas
            : [Number(filialSelecionada)],
      };

      if (senha.trim()) {
        body.password = senha.trim();
      }

      // =========================================
      // UPDATE
      // =========================================

      await api.put(`/usuarios/${id}`, body);

      // =========================================
      // VERIFICA SE EDITOU A SI MESMO
      // =========================================

      const editouProprioUsuario = String(usuarioLogado?.id) === String(id);

      // =========================================
      // ALTERAÇÕES SENSÍVEIS
      // =========================================

      const emailAlterado = usuarioOriginal.username !== email.trim();

      const senhaAlterada = senha.trim().length > 0;

      const roleAlterado = usuarioOriginal.role !== role;

      const filiaisOriginais =
        usuarioOriginal?.filiais?.map((f: any) => Number(f.id)) || [];

      const filiaisAtuais =
        role === "gestor" || role === "master"
          ? filiaisSelecionadas
          : [Number(filialSelecionada)];

      const filialAlterada =
        JSON.stringify(filiaisOriginais.sort()) !==
        JSON.stringify(filiaisAtuais.sort());

      // =========================================
      // LOGOFF OBRIGATÓRIO
      // =========================================

      if (
        editouProprioUsuario &&
        (emailAlterado ||
          senhaAlterada ||
          roleAlterado ||
          filialAlterada)
      ) {
        toast.success("Dados alterados. Faça login novamente.");

        localStorage.removeItem("token");

        localStorage.removeItem("usuarioLogado");

        setTimeout(() => {
          router.replace("/login");
        }, 1500);

        return;
      }

      // =========================================
      // SUCESSO
      // =========================================

      toast.success("Usuário atualizado com sucesso!");

      setTimeout(() => {
        router.push("/usuarios");
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao atualizar usuário.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="bg-blue-600 px-5 md:px-8 py-6 text-center rounded-t-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Editar Usuario
          </h2>

          <p className="text-blue-100 mt-2 text-sm md:text-base">
            Atualize as informações do usuario
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-b-3xl shadow-lg p-5 md:p-8 space-y-6"
        >
          {/* EMAIL */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email"
              className="
                border
                border-gray-300
                rounded-2xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                text-base
                bg-white
              "
            />
          </div>

          {/* SENHA + CPF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SENHA */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Nova senha
              </label>

              <input
                type="password"
                placeholder="Deixe em branco para manter"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="
                  border
                  border-gray-300
                  rounded-2xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  transition
                "
              />
            </div>

            {/* CPF */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                CPF
              </label>

              <input
                type="text"
                value={cpf}
                disabled
                className="
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  bg-gray-100
                  text-gray-500
                  cursor-not-allowed
                "
              />
            </div>
          </div>

          {/* PERFIL + FILIAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PERFIL */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Perfil
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="
                  border
                  border-gray-300
                  rounded-2xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  transition
                "
              >
                <option value="funcionario">Funcionário</option>

                <option value="gestor">Gestor</option>

                {isMaster && <option value="master">Master</option>}
              </select>
            </div>

            {/* FILIAIS */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                {role === "gestor" || role === "master"
                  ? "Filiais Vinculadas"
                  : "Filial"}
              </label>

              {/* FUNCIONÁRIO */}
              {role === "funcionario" && (
                <select
                  value={filialSelecionada}
                  onChange={(e) => setFilialSelecionada(e.target.value)}
                  className="
                    border
                    border-gray-300
                    rounded-2xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    transition
                  "
                >
                  <option value="">Selecione uma filial</option>

                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </select>
              )}

              {/* GESTOR / MASTER */}
              {(role === "gestor" || role === "master") && (
                <div
                  className="
                    border
                    border-gray-300
                    rounded-2xl
                    p-4
                    bg-gray-50
                    max-h-64
                    overflow-y-auto
                    space-y-3
                  "
                >
                  {filiais.map((filial) => {
                    const checked = filiaisSelecionadas.includes(filial.id);

                    return (
                      <label
                        key={filial.id}
                        className="
                          flex
                          items-center
                          gap-3
                          cursor-pointer
                          p-2
                          rounded-xl
                          hover:bg-white
                          transition
                        "
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiliaisSelecionadas((prev) => [
                                ...prev,
                                filial.id,
                              ]);
                            } else {
                              setFiliaisSelecionadas((prev) =>
                                prev.filter((id) => id !== filial.id),
                              );
                            }
                          }}
                          className="
                            w-5
                            h-5
                            accent-blue-600
                          "
                        />

                        <span className="text-gray-700 font-medium">
                          {filial.nome}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/usuarios")}
              className="
                w-full
                md:w-auto
                px-6
                py-3
                rounded-2xl
                bg-gray-400
                hover:bg-gray-500
                text-white
                font-semibold
                transition
              "
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`
                flex-1
                py-3
                rounded-2xl
                font-semibold
                text-white
                transition
                shadow-md
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
