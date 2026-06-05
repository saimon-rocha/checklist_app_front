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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* HEADER */}
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
            mb-6
            relative
            overflow-hidden
          "
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Editar Usuário
          </h2>

          <p className="text-indigo-200/80 mt-2 text-sm md:text-base font-medium">
            Atualize as informações do usuário e configure suas permissões
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="
            bg-white
            rounded-[2rem]
            border
            border-slate-100
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            p-6
            md:p-10
            space-y-6
          "
        >
          {/* EMAIL */}
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-700 mb-2">
              E-mail / Usuário
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o e-mail"
              className="input-premium"
            />
          </div>

          {/* SENHA + CPF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SENHA */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                Nova senha
              </label>

              <input
                type="password"
                placeholder="Deixe em branco para manter"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-premium"
              />
            </div>

            {/* CPF */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                CPF
              </label>

              <input
                type="text"
                value={cpf}
                disabled
                className="input-premium bg-slate-100/70 text-slate-500 border-slate-200/60 cursor-not-allowed"
              />
            </div>
          </div>

          {/* PERFIL + FILIAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PERFIL */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                Perfil de Acesso
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-premium appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
              >
                <option value="funcionario">Funcionário</option>

                <option value="gestor">Gestor</option>

                {isMaster && <option value="master">Master</option>}
              </select>
            </div>

            {/* FILIAIS */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                {role === "gestor" || role === "master"
                  ? "Filiais Vinculadas (Múltiplas)"
                  : "Filial Vinculada"}
              </label>

              {/* FUNCIONÁRIO */}
              {role === "funcionario" && (
                <select
                  value={filialSelecionada}
                  onChange={(e) => setFilialSelecionada(e.target.value)}
                  className="input-premium appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
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
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 max-h-64 overflow-y-auto space-y-2.5">
                  {filiais.map((filial) => {
                    const checked = filiaisSelecionadas.includes(filial.id);

                    return (
                      <label
                        key={filial.id}
                        className={`
                          flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          rounded-xl
                          border
                          cursor-pointer
                          transition-all
                          duration-200
                          select-none
                          ${
                            checked
                              ? "border-indigo-500 bg-indigo-50/40 text-indigo-900 font-medium"
                              : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300"
                          }
                        `}
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
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />

                        <span className="text-sm">{filial.nome}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-2 justify-end">
            <button
              type="button"
              onClick={() => router.push("/usuarios")}
              className="
                w-full
                md:w-auto
                px-6
                py-3.5
                rounded-2xl
                bg-slate-100
                hover:bg-slate-200
                text-slate-600
                font-bold
                transition-all
                duration-200
                active:scale-[0.98]
                cursor-pointer
              "
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full
                md:w-auto
                px-6
                py-3.5
                rounded-2xl
                font-bold
                text-white
                transition-all
                duration-200
                active:scale-[0.98]
                shadow-lg
                cursor-pointer
                ${
                  loading
                    ? "bg-slate-300 shadow-none cursor-not-allowed text-slate-500"
                    : "premium-gradient-bg hover:opacity-95 shadow-indigo-500/15"
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
