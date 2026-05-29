"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import api from "../../../../service/api";
import { buscaCEP } from "../../../../utils/buscaCep";

export default function CadastroFilial() {
  const router = useRouter();

  const [nomeFilial, setNomeFilial] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [empresas, setEmpresas] = useState<any[]>([]);
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
  // USUARIO LOGADO
  // =========================================

  const usuarioLogado =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("usuarioLogado") || "{}")
      : {};

  const isMaster = usuarioLogado?.role === "master";

  // =========================================
  // CARREGA MATRIZES
  // =========================================

  useEffect(() => {
    loadEmpresas();
  }, []);

  async function loadEmpresas() {
    try {
      const response = await api.get("/matriz");

      let empresasAtivas = response.data.filter((e: any) =>
        Boolean(e.id_ativo),
      );

      // =========================================
      // GESTOR -> SOMENTE MATRIZES VINCULADAS
      // =========================================

      if (!isMaster) {
        const filiaisUsuario = Array.isArray(usuarioLogado?.filiais)
          ? usuarioLogado.filiais
          : [];

        const matrizesPermitidas = [
          ...new Set(
            filiaisUsuario.map((f: any) => f.matriz_id).filter(Boolean),
          ),
        ];

        empresasAtivas = empresasAtivas.filter((empresa: any) =>
          matrizesPermitidas.includes(empresa.id),
        );
      }

      setEmpresas(empresasAtivas);

      // AUTO SELECT QUANDO EXISTE APENAS 1 MATRIZ
      if (empresasAtivas.length === 1) {
        setEmpresaId(String(empresasAtivas[0].id));
      }
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

    const ruaFaltando = !data.rua;
    const bairroFaltando = !data.bairro;
    const cidadeFaltando = !data.cidade;
    const estadoFaltando = !data.uf;

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

    // TOAST AZUL
    if (ruaFaltando || bairroFaltando || cidadeFaltando || estadoFaltando) {
      toast.info("CEP parcial encontrado. Complete os dados manualmente.");
    }
  }

  // =========================================
  // SUBMIT
  // =========================================

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (
      !empresaId ||
      !nomeFilial ||
      !cep ||
      !endereco.rua ||
      !endereco.bairro ||
      !endereco.cidade ||
      !endereco.estado
    ) {
      toast.warning("Preencha todos os campos!");

      return;
    }

    setLoading(true);

    try {
      await api.post("/filiais", {
        matriz_id: Number(empresaId),

        nome: nomeFilial.trim(),

        cep,

        rua: endereco.rua,

        bairro: endereco.bairro,

        cidade: endereco.cidade,

        estado: endereco.estado,
      });

      toast.success("Filial cadastrada com sucesso!");

      setNomeFilial("");
      setCep("");

      // mantém matriz selecionada caso tenha apenas uma
      if (empresas.length !== 1) {
        setEmpresaId("");
      }

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

      setTimeout(() => {
        router.push("/filiais");
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao salvar filial.");
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
              Cadastro de Filial
            </h2>

            <p className="text-blue-100 mt-2 text-sm md:text-base">
              Cadastre uma nova filial no sistema
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
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
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

                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
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
                {loading ? "Salvando..." : "Cadastrar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
