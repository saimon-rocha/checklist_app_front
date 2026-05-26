"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import api from "../../../../service/api";

import { buscaCEP } from "../../../../utils/buscaCep";

export default function CadastroPosto() {

  const router = useRouter();

  const [nomePosto, setNomePosto] = useState("");

  const [empresaId, setEmpresaId] = useState("");

  const [empresas, setEmpresas] = useState<any[]>([]);

  const [cep, setCep] = useState("");

  const [loading, setLoading] = useState(false);

  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    ruaReadOnly: true,
    bairroReadOnly: true,
  });

  // =========================================
  // CARREGA EMPRESAS
  // =========================================

  useEffect(() => {

    loadEmpresas();

  }, []);

  async function loadEmpresas() {

    try {

      const response = await api.get("/empresas");

      const empresasAtivas = response.data.filter(
        (e: any) => Boolean(e.id_ativo)
      );

      setEmpresas(empresasAtivas);

    } catch {

      toast.error("Erro ao carregar empresas");
    }
  }

  // =========================================
  // CEP
  // =========================================

  async function handleCepChange(e: any) {

    const value = e.target.value.replace(/\D/g, "");

    setCep(value);

    if (value.length === 8) {

      const data = await buscaCEP(value);

      const ruaFaltando = !data.rua;

      const bairroFaltando = !data.bairro;

      setEndereco({
        rua: data.rua || "",
        bairro: data.bairro || "",
        ruaReadOnly: !ruaFaltando,
        bairroReadOnly: !bairroFaltando,
      });

      if (ruaFaltando && bairroFaltando) {

        toast.info(
          "CEP geral: preencha Rua e Bairro manualmente."
        );

      } else if (ruaFaltando) {

        toast.info("Preencha Rua manualmente.");

      } else if (bairroFaltando) {

        toast.info("Preencha Bairro manualmente.");
      }

    } else {

      setEndereco({
        rua: "",
        bairro: "",
        ruaReadOnly: true,
        bairroReadOnly: true,
      });
    }
  }

  // =========================================
  // SUBMIT
  // =========================================

  async function handleSubmit(e: any) {

    e.preventDefault();

    if (
      !empresaId ||
      !nomePosto ||
      !cep ||
      !endereco.rua ||
      !endereco.bairro
    ) {

      toast.warning("Preencha todos os campos!");

      return;
    }

    setLoading(true);

    try {

      await api.post("/postos", {
        empresa_id: Number(empresaId),

        nome: nomePosto.trim(),

        cep,

        rua: endereco.rua,

        bairro: endereco.bairro,
      });

      toast.success("Posto cadastrado com sucesso!");

      setNomePosto("");

      setEmpresaId("");

      setCep("");

      setEndereco({
        rua: "",
        bairro: "",
        ruaReadOnly: true,
        bairroReadOnly: true,
      });

      setTimeout(() => {

        router.push("/postos");

      }, 1200);

    } catch (err: any) {

      toast.error(
        err?.response?.data?.error ||
        "Erro ao salvar posto."
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >

        <h2 className="text-2xl font-bold text-center">
          Cadastro de Posto
        </h2>

        {/* EMPRESA */}

        <div className="flex flex-col">

          <label className="text-sm font-medium">
            Empresa
          </label>

          <select
            value={empresaId}
            onChange={(e) =>
              setEmpresaId(e.target.value)
            }
            className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          >

            <option value="">
              Selecione uma empresa
            </option>

            {empresas.map((empresa) => (
              <option
                key={empresa.id}
                value={empresa.id}
              >
                {empresa.nome}
              </option>
            ))}
          </select>
        </div>

        {/* NOME */}

        <div className="flex flex-col">

          <label className="text-sm font-medium">
            Nome do Posto
          </label>

          <input
            value={nomePosto}
            onChange={(e) =>
              setNomePosto(e.target.value)
            }
            placeholder="Digite o nome"
            className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* CEP + RUA */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div className="flex flex-col">

            <label className="text-sm font-medium">
              CEP
            </label>

            <input
              value={cep}
              onChange={handleCepChange}
              maxLength={8}
              placeholder="CEP"
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">

            <label className="text-sm font-medium">
              Rua
            </label>

            <input
              value={endereco.rua}
              readOnly={endereco.ruaReadOnly}
              onChange={(e) =>
                setEndereco({
                  ...endereco,
                  rua: e.target.value,
                })
              }
              className={`border rounded-lg px-3 py-2 mt-1 ${
                endereco.ruaReadOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}
            />
          </div>
        </div>

        {/* BAIRRO */}

        <div className="flex flex-col">

          <label className="text-sm font-medium">
            Bairro
          </label>

          <input
            value={endereco.bairro}
            readOnly={endereco.bairroReadOnly}
            onChange={(e) =>
              setEndereco({
                ...endereco,
                bairro: e.target.value,
              })
            }
            className={`border rounded-lg px-3 py-2 mt-1 ${
              endereco.bairroReadOnly
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
          />
        </div>

        {/* BUTTON */}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}