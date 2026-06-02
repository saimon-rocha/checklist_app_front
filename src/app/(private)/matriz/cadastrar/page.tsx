"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import api from "../../../../service/api";

export default function CadastrarMatriz() {
  const router = useRouter();

  const [nome, setNome] = useState("");

  const [cnpj, setCnpj] = useState("");

  const [responsavel, setResponsavel] = useState("");

  const [contatoResponsavel, setContatoResponsavel] = useState("");

  const [assinaturaAtiva, setAssinaturaAtiva] = useState(true);

  const [vencimentoAssinatura, setVencimentoAssinatura] = useState("");

  const [loading, setLoading] = useState(false);

  const [loadingPage] = useState(false);
  // =========================================
  // FORMATA CNPJ
  // =========================================

  function handleCnpjChange(e: any) {
    const value = e.target.value.replace(/\D/g, "");

    setCnpj(value);
  }

  // =========================================
  // SUBMIT
  // =========================================

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (
      !nome ||
      !cnpj ||
      !responsavel ||
      !contatoResponsavel ||
      !vencimentoAssinatura
    ) {
      toast.warning("Preencha todos os campos!");
      return;
    }
    const dataAtual = new Date();
    const dataAssinatura = new Date(vencimentoAssinatura);
    if (dataAssinatura < dataAtual) {
      toast.warning("Data da Assinatura deve ser maior que a Data Atual");
      return;
    }

    if (cnpj.length !== 14) {
      toast.warning("CNPJ inválido!");
      return;
    }
    const telefoneLimpo = contatoResponsavel.replace(/\D/g, "");

    if (telefoneLimpo.length !== 11) {
      toast.warning("Telefone inválido!");
      return;
    }

    setLoading(true);

    try {
      await api.post("/matriz", {
        nome: nome.trim(),
        cnpj: cnpj.trim(),
        responsavel: responsavel.trim(),
        contato_responsavel: contatoResponsavel.replace(/\D/g, ""),
        assinatura_ativa: assinaturaAtiva,
        vencimento_assinatura: vencimentoAssinatura || null,
      });

      toast.success("Matriz cadastrada com sucesso!");

      setTimeout(() => {
        router.push("/matriz");
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao cadastrar matriz");
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />

          <p className="text-gray-600 font-medium">Carregando matriz...</p>
        </div>
      </div>
    );
  }

  function handleContatoChange(e: any) {
    let value = e.target.value.replace(/\D/g, "");

    value = value.slice(0, 11);

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }

    setContatoResponsavel(value);
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* HEADER */}
        <div
          className="
          bg-gradient-to-tr
          from-slate-950
          via-slate-900
          to-indigo-950
          rounded-[2rem]
          shadow-lg
          p-6
          md:p-8
          text-white
          mb-6
          relative
          overflow-hidden
        "
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Cadastrar Matriz
          </h1>

          <p className="text-indigo-200/80 mt-2 text-sm md:text-base font-medium">
            Cadastre uma nova empresa matriz no sistema
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
          {/* NOME */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Nome da Matriz
            </label>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value.slice(0, 100))}
              maxLength={25}
              placeholder="Digite o nome da empresa"
              className="input-premium"
            />
          </div>

          {/* CNPJ + RESPONSÁVEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CNPJ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">CNPJ</label>

              <input
                value={cnpj}
                onChange={handleCnpjChange}
                maxLength={14}
                inputMode="numeric"
                placeholder="Somente números"
                className="input-premium"
              />
            </div>

            {/* RESPONSÁVEL */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Responsável
              </label>

              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value.slice(0, 80))}
                maxLength={20}
                placeholder="Nome do responsável"
                className="input-premium"
              />
            </div>
          </div>

          {/* CONTATO */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Contato do Responsável
            </label>

            <input
              value={contatoResponsavel}
              onChange={handleContatoChange}
              maxLength={15}
              inputMode="numeric"
              placeholder="(54) 999999999"
              className="input-premium"
            />
          </div>

          {/* ASSINATURA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* STATUS */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Assinatura Ativa
              </label>

              <select
                value={assinaturaAtiva ? "true" : "false"}
                onChange={(e) => setAssinaturaAtiva(e.target.value === "true")}
                className="input-premium appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
              >
                <option value="true">Sim</option>

                <option value="false">Não</option>
              </select>
            </div>

            {/* DATA */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Vencimento da Assinatura
              </label>

              <input
                type="date"
                value={vencimentoAssinatura}
                onChange={(e) => setVencimentoAssinatura(e.target.value)}
                className="input-premium"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div
            className="
            pt-4
            flex
            flex-col-reverse
            md:flex-row
            gap-3
            justify-end
          "
          >
            <button
              type="button"
              onClick={() => router.push("/matriz")}
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
              Cancelar
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
              {loading ? "Salvando..." : "Cadastrar Matriz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
