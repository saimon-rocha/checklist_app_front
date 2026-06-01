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
    <div className="min-h-screen bg-slate-50/50">
      {/* CONTAINER */}
      <div
        className="
        max-w-3xl
        mx-auto
        px-4
        sm:px-6
        py-6
        md:py-8
      "
      >
        {/* CARD */}
        <form
          onSubmit={handleSubmit}
          className="
          bg-white
          rounded-[2rem]
          border
          border-slate-100
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          overflow-hidden
        "
        >
          {/* HEADER */}
          <div
            className="
            bg-gradient-to-tr
            from-slate-950
            via-slate-900
            to-indigo-950
            px-6
            md:px-10
            py-8
            text-center
            relative
            overflow-hidden
          "
          >
            {/* Subtle decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

            <h2
              className="
              text-2xl
              md:text-3xl
              font-extrabold
              text-white
              tracking-tight
            "
            >
              Editar Filial
            </h2>

            <p className="text-indigo-200/80 mt-2 text-sm md:text-base font-medium">
              Atualize as informações cadastrais e o endereço da filial
            </p>
          </div>

          {/* FORM CONTENT */}
          <div className="p-6 md:p-10 space-y-6">
            {/* MATRIZ */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                Matriz vinculada
              </label>

              <select
                value={matrizId}
                onChange={(e) => setMatrizId(e.target.value)}
                className="input-premium appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
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
              <label className="text-sm font-bold text-slate-700 mb-2">
                Nome da Filial
              </label>

              <input
                value={nomeFilial}
                onChange={(e) => setNomeFilial(e.target.value)}
                placeholder="Digite o nome da filial"
                className="input-premium"
              />
            </div>

            {/* CEP */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700 mb-2">
                CEP
              </label>

              <input
                value={cep}
                onChange={handleCepChange}
                maxLength={8}
                placeholder="Digite o CEP"
                className="input-premium"
              />
            </div>

            {/* RUA + BAIRRO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-2">
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
                  py-3.5
                  text-base
                  outline-none
                  transition-all
                  duration-300
                  ${
                    endereco.ruaReadOnly
                      ? "bg-slate-100/70 text-slate-400 cursor-not-allowed border-slate-200"
                      : "border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }
                `}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-2">
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
                  py-3.5
                  text-base
                  outline-none
                  transition-all
                  duration-300
                  ${
                    endereco.bairroReadOnly
                      ? "bg-slate-100/70 text-slate-400 cursor-not-allowed border-slate-200"
                      : "border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }
                `}
                />
              </div>
            </div>

            {/* CIDADE + ESTADO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-2">
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
                  py-3.5
                  text-base
                  outline-none
                  transition-all
                  duration-300
                  ${
                    endereco.cidadeReadOnly
                      ? "bg-slate-100/70 text-slate-400 cursor-not-allowed border-slate-200"
                      : "border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }
                `}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-2">
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
                  py-3.5
                  text-base
                  outline-none
                  transition-all
                  duration-300
                  ${
                    endereco.estadoReadOnly
                      ? "bg-slate-100/70 text-slate-400 cursor-not-allowed border-slate-200"
                      : "border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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
                flex-1
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
          </div>
        </form>
      </div>
    </div>
  );
}
