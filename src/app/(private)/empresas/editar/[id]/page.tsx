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

        const response = await api.get("/empresas");

        const empresa = response.data.find(
          (e: any) => String(e.id) === String(id),
        );

        if (!empresa) {
          toast.error("Empresa não encontrada");

          router.push("/empresas");

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
      await api.put(`/empresas/${id}`, {
        nome: nome.trim(),

        cnpj: cnpj.trim(),

        responsavel: responsavel.trim(),

        contato_responsavel: contatoResponsavel.trim(),

        assinatura_ativa: assinaturaAtiva,

        vencimento_assinatura: vencimentoAssinatura || null,
      });

      toast.success("Empresa atualizada com sucesso!");

      setTimeout(() => {
        router.push("/empresas");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Editar Empresa</h2>

        {/* NOME */}

        <div className="flex flex-col">
          <label className="text-sm font-medium">Nome da Empresa</label>

          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome da empresa"
            className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* CNPJ + RESPONSÁVEL */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium">CNPJ</label>

            <input
              value={cnpj}
              onChange={handleCnpjChange}
              maxLength={14}
              placeholder="Somente números"
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Responsável</label>

            <input
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do responsável"
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* CONTATO */}

        <div className="flex flex-col">
          <label className="text-sm font-medium">Contato do Responsável</label>

          <input
            value={contatoResponsavel}
            onChange={(e) => setContatoResponsavel(e.target.value)}
            placeholder="Telefone ou email"
            className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ASSINATURA */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Assinatura Ativa</label>

            <select
              value={assinaturaAtiva ? "true" : "false"}
              onChange={(e) => setAssinaturaAtiva(e.target.value === "true")}
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Sim</option>

              <option value="false">Não</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">
              Vencimento da Assinatura
            </label>

            <input
              type="date"
              value={vencimentoAssinatura}
              onChange={(e) => setVencimentoAssinatura(e.target.value)}
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* BUTTON */}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Salvando..." : "Atualizar"}
        </button>
      </form>
    </div>
  );
}
