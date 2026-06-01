"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import validarCPF from "../../../../utils/validarCPF";

import api from "../../../../service/api";

export default function CadastroUsuario() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [senha, setSenha] = useState("");

  const [cpf, setCpf] = useState("");

  const [role, setRole] = useState("funcionario");

  const [filialSelecionada, setFilialSelecionada] = useState("");
  const [filiaisGestor, setFiliaisGestor] = useState<number[]>([]);

  const [filiais, setFiliais] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [loadingPage, setLoadingPage] = useState(true);

  const usuarioLogado =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("usuarioLogado") || "{}")
      : {};

  const isMaster = usuarioLogado?.role === "master";
  const isGestor = usuarioLogado?.role === "gestor";

  // =========================================
  // LOAD FILIAIS
  // =========================================

  useEffect(() => {
    carregarFiliais();
  }, []);

  async function carregarFiliais() {
    try {
      setLoadingPage(true);

      const response = await api.get("/filiais");

      const filiaisAtivas = response.data.filter((f: any) =>
        Boolean(f.id_ativo),
      );

      if (isGestor) {
        const filiaisPermitidas =
          usuarioLogado?.filiais?.map((f: any) => Number(f.id)) || [];

        const filiaisFiltradas = filiaisAtivas.filter((f: any) =>
          filiaisPermitidas.includes(Number(f.id)),
        );

        setFiliais(filiaisFiltradas);

        return;
      }

      setFiliais(filiaisAtivas);
    } catch {
      toast.error("Erro ao carregar filiais");
    } finally {
      setLoadingPage(false);
    }
  }

  function handleToggleFilialGestor(id: number) {
    setFiliaisGestor((prev) => {
      if (prev.includes(id)) {
        return prev.filter((f) => f !== id);
      }

      return [...prev, id];
    });
  }
  // =========================================
  // CPF
  // =========================================

  function handleCpfChange(e: any) {
    const value = e.target.value.replace(/\D/g, "");

    setCpf(value);
  }

  // =========================================
  // SUBMIT
  // =========================================

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!email || !senha || !cpf || !role) {
      toast.warning("Preencha todos os campos!");

      return;
    }
    if (
      (role === "gestor" || role === "master") &&
      filiaisGestor.length === 0
    ) {
      toast.warning("Selecione ao menos uma filial.");

      return;
    }

    if (role === "funcionario" && !filialSelecionada) {
      toast.warning("Selecione uma filial!");
      return;
    }
    if (!validarCPF(cpf)) {
      toast.warning("CPF inválido!");

      return;
    }

    if (senha.trim().length < 6) {
      toast.warning("A senha deve ter no mínimo 6 caracteres!");

      return;
    }

    setLoading(true);

    try {
      await api.post("/usuarios", {
        username: email.trim(),
        password: senha.trim(),
        cpf: cpf.trim(),
        role,

        filiais:
          role === "gestor" || role === "master"
            ? filiaisGestor
            : [Number(filialSelecionada)],
      });

      toast.success("Usuário cadastrado com sucesso!");

      setTimeout(() => {
        router.push("/usuarios");
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao cadastrar usuário");
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
            Cadastro de Usuário
          </h2>

          <p className="text-indigo-200/80 mt-2 text-sm md:text-base font-medium">
            Cadastre novos usuários no sistema e configure suas permissões
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
              placeholder="Ex: funcionario@empresa.com"
              className="input-premium"
            />
          </div>

          {/* SENHA + CPF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SENHA */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="input-premium"
              />
            </div>

            {/* CPF */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                CPF
              </label>

              <input
                value={cpf}
                onChange={handleCpfChange}
                maxLength={11}
                placeholder="Somente números"
                className="input-premium"
              />
            </div>
          </div>

          {/* PERFIL + FILIAL */}
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

                {isMaster && (
                  <>
                    <option value="gestor">Gestor</option>
                    <option value="master">Master</option>
                  </>
                )}
              </select>
            </div>

            {/* FILIAL */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                {role === "gestor" || role === "master"
                  ? "Filiais Vinculadas (Múltiplas)"
                  : "Filial Vinculada"}
              </label>

              {role === "gestor" || role === "master" ? (
                <div
                  className="
                    border
                    border-slate-200
                    rounded-2xl
                    p-4
                    max-h-64
                    overflow-y-auto
                    space-y-2.5
                    bg-slate-50/50
                  "
                >
                  {filiais.map((filial) => {
                    const isChecked = filiaisGestor.includes(filial.id);
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
                            isChecked
                              ? "border-indigo-500 bg-indigo-50/40 text-indigo-900 font-medium"
                              : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300"
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFilialGestor(filial.id)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />

                        <span className="text-sm">{filial.nome}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
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
              {loading ? "Salvando..." : "Cadastrar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
