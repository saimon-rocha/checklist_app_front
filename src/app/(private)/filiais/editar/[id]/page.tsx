"use client";

import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation";

import { toast } from "react-toastify";

import { buscaCEP } from "../../../../../utils/buscaCep";

import api from "../../../../../service/api";

export default function EditarFilial() {
  const router = useRouter();

  const params = useParams();

  const id = params?.id;

  const [nomeFilial, setNomeFilial] = useState("");

  const [matrizId, setMatrizId] = useState("");

  const [matrizes, setMatrizes] = useState<any[]>([]);

  const [cep, setCep] = useState("");

  const [loading, setLoading] = useState(false);

  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    cidade: "",
    estado: "",

    ruaReadOnly: true,
    bairroReadOnly: true,
    cidadeReadOnly: true,
    estadoReadOnly: true,
  });

  // =========================================
  // LOAD FILIAL + MATRIZES
  // =========================================

  useEffect(() => {
    async function loadData() {
      try {
        if (!id) return;

        const [filialResponse, matrizesResponse] = await Promise.all([
          api.get(`/filiais/${id}`),
          api.get("/matriz"),
        ]);

        const filial = filialResponse.data;

        setMatrizes(
          matrizesResponse.data.filter((m: any) => Boolean(m.id_ativo)),
        );

        setNomeFilial(filial.nome || "");

        setMatrizId(filial.matriz_id ? String(filial.matriz_id) : "");

        setCep(filial.cep || "");

        setEndereco({
          rua: filial.rua || "",
          bairro: filial.bairro || "",
          cidade: filial.cidade || "",
          estado: filial.estado || "",

          ruaReadOnly: Boolean(filial.rua),
          bairroReadOnly: Boolean(filial.bairro),
          cidadeReadOnly: Boolean(filial.cidade),
          estadoReadOnly: Boolean(filial.estado),
        });
      } catch (error: any) {
        toast.error(error?.response?.data?.error || "Erro ao carregar filial");

        router.push("/filiais");
      }
    }

    loadData();
  }, [id, router]);

  // =========================================
  // CEP
  // =========================================

  async function handleCepChange(e: any) {
    const value = e.target.value.replace(/\D/g, "");

    setCep(value);

    // RESET
    if (value.length !== 8) {
      setEndereco({
        rua: "",
        bairro: "",
        cidade: "",
        estado: "",

        ruaReadOnly: true,
        bairroReadOnly: true,
        cidadeReadOnly: true,
        estadoReadOnly: true,
      });

      return;
    }

    const data = await buscaCEP(value);

    // VERIFICA CAMPOS FALTANDO
    const ruaFaltando = !data.rua;
    const bairroFaltando = !data.bairro;
    const cidadeFaltando = !data.cidade;
    const estadoFaltando = !data.uf;

    // CEP GERAL / CEP PARCIAL
    const cepParcial =
      data.isCepGeral ||
      ruaFaltando ||
      bairroFaltando ||
      cidadeFaltando ||
      estadoFaltando;

    setEndereco({
      rua: data.rua || "",
      bairro: data.bairro || "",
      cidade: data.cidade || "",
      estado: data.uf || "",

      ruaReadOnly: !ruaFaltando,
      bairroReadOnly: !bairroFaltando,
      cidadeReadOnly: !cidadeFaltando,
      estadoReadOnly: !estadoFaltando,
    });

    if (cepParcial) {
      toast.info("CEP parcial encontrado. Complete os dados manualmente.");
    }
  }

  // =========================================
  // SAVE
  // =========================================

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (
      !nomeFilial ||
      !matrizId ||
      !cep ||
      !endereco.rua ||
      !endereco.bairro ||
      !endereco.cidade ||
      !endereco.estado
    ) {
      toast.warning("Preencha todos os campos.");

      return;
    }

    try {
      setLoading(true);

      await api.put(`/filiais/${id}`, {
        matriz_id: Number(matrizId),

        nome: nomeFilial.trim(),

        cep,

        rua: endereco.rua.trim(),

        bairro: endereco.bairro.trim(),

        cidade: endereco.cidade.trim(),

        estado: endereco.estado.trim(),
      });

      toast.success("Filial atualizada com sucesso!");

      setTimeout(() => {
        router.push("/filiais");
      }, 1200);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao atualizar filial.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* CONTAINER */}
      <div
        className="
        max-w-3xl
        mx-auto
        px-3
        sm:px-4
        md:px-6
        py-4
        md:py-8
      "
      >
        {/* CARD */}
        <form
          onSubmit={handleSubmit}
          className="
          bg-white
          rounded-3xl
          shadow-xl
          overflow-hidden
        "
        >
          {/* HEADER */}
          <div
            className="
            bg-blue-600
            px-5
            md:px-8
            py-6
            text-center
          "
          >
            <h2
              className="
              text-2xl
              md:text-3xl
              font-bold
              text-white
            "
            >
              Editar Filial
            </h2>

            <p className="text-blue-100 mt-2 text-sm md:text-base">
              Atualize as informações da filial
            </p>
          </div>

          {/* FORM CONTENT */}
          <div className="p-4 md:p-8 space-y-5">
            {/* MATRIZ */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Matriz
              </label>

              <select
                value={matrizId}
                onChange={(e) => setMatrizId(e.target.value)}
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
              >
                <option value="">Selecione uma matriz</option>

                {matrizes.map((matriz) => (
                  <option key={matriz.id} value={matriz.id}>
                    {matriz.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* NOME */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Nome da Filial
              </label>

              <input
                value={nomeFilial}
                onChange={(e) => setNomeFilial(e.target.value)}
                placeholder="Digite o nome da filial"
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
              "
              />
            </div>

            {/* CEP */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                CEP
              </label>

              <input
                value={cep}
                onChange={handleCepChange}
                maxLength={8}
                placeholder="Digite o CEP"
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
              "
              />
            </div>

            {/* RUA + BAIRRO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
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
                  className={`
                  border
                  rounded-2xl
                  px-4
                  py-3
                  text-base
                  outline-none
                  transition
                  ${
                    endereco.ruaReadOnly
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }
                `}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
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
                  className={`
                  border
                  rounded-2xl
                  px-4
                  py-3
                  text-base
                  outline-none
                  transition
                  ${
                    endereco.bairroReadOnly
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }
                `}
                />
              </div>
            </div>

            {/* CIDADE + ESTADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Cidade
                </label>

                <input
                  value={endereco.cidade}
                  readOnly={endereco.cidadeReadOnly}
                  onChange={(e) =>
                    setEndereco({
                      ...endereco,
                      cidade: e.target.value,
                    })
                  }
                  className={`
                  border
                  rounded-2xl
                  px-4
                  py-3
                  text-base
                  outline-none
                  transition
                  ${
                    endereco.cidadeReadOnly
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }
                `}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>

                <input
                  value={endereco.estado}
                  readOnly={endereco.estadoReadOnly}
                  onChange={(e) =>
                    setEndereco({
                      ...endereco,
                      estado: e.target.value,
                    })
                  }
                  className={`
                  border
                  rounded-2xl
                  px-4
                  py-3
                  text-base
                  outline-none
                  transition
                  ${
                    endereco.estadoReadOnly
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }
                `}
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div
              className="
              flex
              flex-col-reverse
              md:flex-row
              gap-3
              pt-4
            "
            >
              <button
                type="button"
                onClick={() => router.push("/filiais")}
                className="
                w-full
                md:w-auto
                px-6
                py-3
                rounded-2xl
                bg-gray-300
                hover:bg-gray-400
                text-gray-800
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
                w-full
                flex-1
                py-3
                rounded-2xl
                font-semibold
                text-white
                transition
                shadow-md
                ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
              `}
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
