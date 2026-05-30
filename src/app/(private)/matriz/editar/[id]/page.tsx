"use client";

import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";

import { toast } from "react-toastify";

import api from "../../../../../service/api";

export default function EditarEmpresa() {
  const router = useRouter();

  const params = useParams();

  const id = params.id;

  const [nome, setNome] = useState("");

  const [cnpj, setCnpj] = useState("");

  const [responsavel, setResponsavel] = useState("");

  const [contatoResponsavel, setContatoResponsavel] = useState("");

  const [assinaturaAtiva, setAssinaturaAtiva] = useState(true);

  const [vencimentoAssinatura, setVencimentoAssinatura] = useState("");

  const [loading, setLoading] = useState(false);

  const [loadingPage, setLoadingPage] = useState(true);

  // =========================================
  // LOAD EMPRESA
  // =========================================

  useEffect(() => {
    async function loadEmpresa() {
      try {
        if (!id) return;

        const response = await api.get("/matriz");

        const empresa = response.data.find(
          (e: any) => String(e.id) === String(id),
        );

        if (!empresa) {
          toast.error("Matriz não encontrada");

          router.push("/matriz");

          return;
        }

        setNome(empresa.nome || "");

        setCnpj(empresa.cnpj || "");

        setResponsavel(empresa.responsavel || "");

        setContatoResponsavel(empresa.contato_responsavel || "");

        setAssinaturaAtiva(Boolean(empresa.assinatura_ativa));

        setVencimentoAssinatura(
          empresa.vencimento_assinatura
            ? empresa.vencimento_assinatura.split("T")[0]
            : "",
        );
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Erro ao carregar empresa");
      } finally {
        setLoadingPage(false);
      }
    }

    loadEmpresa();
  }, [id, router]);

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

    if (!nome || !cnpj || !responsavel || !contatoResponsavel) {
      toast.warning("Preencha todos os campos!");

      return;
    }

    if (cnpj.length !== 14) {
      toast.warning("CNPJ inválido!");

      return;
    }

    setLoading(true);

    try {
      await api.put(`/matriz/${id}`, {
        nome: nome.trim(),

        cnpj: cnpj.trim(),

        responsavel: responsavel.trim(),

        contato_responsavel: contatoResponsavel.trim(),

        assinatura_ativa: assinaturaAtiva,

        vencimento_assinatura: vencimentoAssinatura || null,
      });

      toast.success("Matriz atualizada com sucesso!");

      setTimeout(() => {
        router.push("/matriz");
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao atualizar empresa");
    } finally {
      setLoading(false);
    }
  }

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando empresa...</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="bg-blue-600 px-5 md:px-8 py-6 text-center rounded-t-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Editar Matriz
          </h2>

          <p className="text-blue-100 mt-2 text-sm md:text-base">
            Atualize as informações da matriz
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
          space-y-5
        "
        >
          {/* NOME */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Nome da Matriz
            </label>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da empresa"
              className="
              w-full
              border
              border-gray-300
              rounded-2xl
              px-4
              py-3
              text-sm
              md:text-base
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              transition
            "
            />
          </div>

          {/* CNPJ + RESPONSÁVEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                CNPJ
              </label>

              <input
                value={cnpj}
                onChange={handleCnpjChange}
                maxLength={14}
                placeholder="Somente números"
                className="
                w-full
                border
                border-gray-300
                rounded-2xl
                px-4
                py-3
                text-sm
                md:text-base
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                transition
              "
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Responsável
              </label>

              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Nome do responsável"
                className="
                w-full
                border
                border-gray-300
                rounded-2xl
                px-4
                py-3
                text-sm
                md:text-base
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                transition
              "
              />
            </div>
          </div>

          {/* CONTATO */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Contato do Responsável
            </label>

            <input
              value={contatoResponsavel}
              onChange={(e) => setContatoResponsavel(e.target.value)}
              placeholder="Telefone ou email"
              className="
              w-full
              border
              border-gray-300
              rounded-2xl
              px-4
              py-3
              text-sm
              md:text-base
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              transition
            "
            />
          </div>

          {/* ASSINATURA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Assinatura Ativa
              </label>

              <select
                value={assinaturaAtiva ? "true" : "false"}
                onChange={(e) => setAssinaturaAtiva(e.target.value === "true")}
                className="
                w-full
                border
                border-gray-300
                rounded-2xl
                px-4
                py-3
                text-sm
                md:text-base
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                transition
                bg-white
              "
              >
                <option value="true">Sim</option>

                <option value="false">Não</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Vencimento da Assinatura
              </label>

              <input
                type="date"
                value={vencimentoAssinatura}
                onChange={(e) => setVencimentoAssinatura(e.target.value)}
                className="
                w-full
                border
                border-gray-300
                rounded-2xl
                px-4
                py-3
                text-sm
                md:text-base
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                transition
              "
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
              py-3
              rounded-2xl
              bg-gray-200
              hover:bg-gray-300
              text-gray-700
              font-semibold
              transition
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
