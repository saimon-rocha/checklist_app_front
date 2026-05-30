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
        <div
          className="
            bg-blue-600
            rounded-3xl
            px-5
            md:px-8
            py-6
            text-center
            shadow-lg
            mb-6
          "
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Cadastro de Usuário
          </h2>

          <p className="text-blue-100 mt-2 text-sm md:text-base">
            Cadastre novos usuários no sistema
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-5
            md:p-8
            space-y-6
          "
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
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha"
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

            {/* CPF */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                CPF
              </label>

              <input
                value={cpf}
                onChange={handleCpfChange}
                maxLength={11}
                placeholder="Somente números"
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
          </div>

          {/* PERFIL + FILIAL */}
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
    outline-none
    focus:ring-2
    focus:ring-blue-500
    bg-white
  "
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
            {/* FILIAL */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                {role === "gestor" || role === "master"
                  ? "Filiais Vinculadas"
                  : "Filial"}
              </label>

              {role === "gestor" || role === "master" ? (
                <div
                  className="
        border
        border-gray-300
        rounded-2xl
        p-4
        max-h-64
        overflow-y-auto
        space-y-3
      "
                >
                  {filiais.map((filial) => (
                    <label
                      key={filial.id}
                      className="
            flex
            items-center
            gap-3
            cursor-pointer
          "
                    >
                      <input
                        type="checkbox"
                        checked={filiaisGestor.includes(filial.id)}
                        onChange={() => handleToggleFilialGestor(filial.id)}
                        className="w-4 h-4"
                      />

                      <span className="text-gray-700">{filial.nome}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <select
                  value={filialSelecionada}
                  onChange={(e) => setFilialSelecionada(e.target.value)}
                  className="
        border
        border-gray-300
        rounded-2xl
        px-4
        py-3
        outline-none
        focus:ring-2
        focus:ring-blue-500
        bg-white
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
              {loading ? "Salvando..." : "Cadastrar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
