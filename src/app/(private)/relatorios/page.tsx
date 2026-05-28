"use client";

import { useState } from "react";

import { toast } from "react-toastify";

import api from "../../../service/api";

import gerarRelatorioPDF from "../../../utils/gerarRelatorioPDF";

type RelatorioItem = {
  bomba: string;

  filial: string;

  dataRelatorio: string;

  totalVazaoMax: number;

  totalVazaoMin: number;

  vazamentoBico: number;

  vazaoBomba: number;
};

export default function Relatorio() {
  const hoje = new Date().toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(hoje);

  const [dataFim, setDataFim] = useState(hoje);

  const [resultado, setResultado] = useState<RelatorioItem[]>([]);

  const [loading, setLoading] = useState(false);

  // =========================================
  // BUSCAR
  // =========================================

  async function buscar() {
    try {
      setLoading(true);

      const response = await api.get("/formularios/periodo", {
        params: {
          dataInicio,
          dataFim,
        },
      });

      const formatado: RelatorioItem[] = response.data.map((item: any) => {
        const respostas = Array.isArray(item.respostas?.ensaio)
          ? item.respostas.ensaio
          : [];

        return {
          bomba: item.titulo || "Não definido",

          filial: item.filial?.nome || "-",

          dataRelatorio: item.created_at
            ? new Date(item.created_at).toLocaleDateString("pt-BR")
            : "-",

          totalVazaoMax: Number(
            respostas.find((e: any) => e.id === "vazaoMax")?.resposta || 0,
          ),

          totalVazaoMin: Number(
            respostas.find((e: any) => e.id === "vazaoMin")?.resposta || 0,
          ),

          vazamentoBico: Number(
            respostas.find((e: any) => e.id === "vazamentoBico")?.resposta || 0,
          ),

          vazaoBomba: Number(
            respostas.find((e: any) => e.id === "vazaoBomba")?.resposta || 0,
          ),
        };
      });

      if (formatado.length === 0) {
        toast.warning("Nenhum dado encontrado no período");
      }

      setResultado(formatado);
    } catch (err) {
      console.error(err);

      toast.error("Erro ao buscar relatórios");
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // PDF
  // =========================================

  function gerarRelatorio() {
    if (resultado.length === 0) {
      toast.error("Nenhum dado para gerar relatório");

      return;
    }

    gerarRelatorioPDF(resultado, dataInicio, dataFim);
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-3 py-6 sm:px-6 flex flex-col items-center">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Relatório de Aferições
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Consulte os relatórios por período
        </p>
      </div>

      {/* FILTROS */}
      <div
        className="
        w-full
        max-w-6xl
        bg-white
        rounded-3xl
        shadow-xl
        p-4
        sm:p-6
        flex
        flex-col
        gap-4
      "
      >
        {/* DATAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Data Inicial
            </label>

            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="
              border
              border-gray-300
              rounded-xl
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              transition
            "
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Data Final
            </label>

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="
              border
              border-gray-300
              rounded-xl
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              transition
            "
            />
          </div>

          {/* BOTÕES */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={buscar}
              className="
              flex-1
              px-4
              py-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              shadow-md
              transition-all
              active:scale-[0.98]
            "
            >
              Buscar
            </button>

            <button
              onClick={gerarRelatorio}
              className="
              flex-1
              px-4
              py-3
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
              font-semibold
              shadow-md
              transition-all
              active:scale-[0.98]
            "
            >
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* RESULTADOS */}
      {resultado.length > 0 && (
        <>
          {/* MOBILE CARDS */}
          <div className="w-full max-w-6xl mt-6 space-y-4 md:hidden">
            {resultado.map((item, index) => (
              <div
                key={index}
                className="
                bg-white
                rounded-2xl
                shadow-lg
                p-4
                space-y-3
              "
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">
                    {item.bomba}
                  </h3>

                  <span className="text-sm text-gray-500">
                    {item.dataRelatorio}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Filial:</span> {item.filial}
                  </p>

                  <p>
                    <span className="font-semibold">Vazão Máx:</span>{" "}
                    {item.totalVazaoMax}
                  </p>

                  <p>
                    <span className="font-semibold">Vazão Mín:</span>{" "}
                    {item.totalVazaoMin}
                  </p>

                  <p>
                    <span className="font-semibold">Vazamento:</span>{" "}
                    {item.vazamentoBico}
                  </p>

                  <p>
                    <span className="font-semibold">Vazão Bomba:</span>{" "}
                    {item.vazaoBomba}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TABELA DESKTOP */}
          <div className="hidden md:block w-full max-w-6xl mt-6 overflow-x-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left font-semibold">Filial</th>

                    <th className="p-4 text-left font-semibold">Bomba</th>

                    <th className="p-4 text-left font-semibold">Data</th>

                    <th className="p-4 text-left font-semibold">Vazão Máx</th>

                    <th className="p-4 text-left font-semibold">Vazão Mín</th>

                    <th className="p-4 text-left font-semibold">Vazamento</th>

                    <th className="p-4 text-left font-semibold">Vazão Bomba</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.map((item, index) => (
                    <tr
                      key={index}
                      className="
                      border-t
                      hover:bg-gray-50
                      transition
                    "
                    >
                      <td className="p-4">{item.filial}</td>

                      <td className="p-4 font-medium">{item.bomba}</td>

                      <td className="p-4">{item.dataRelatorio}</td>

                      <td className="p-4">{item.totalVazaoMax}</td>

                      <td className="p-4">{item.totalVazaoMin}</td>

                      <td className="p-4">{item.vazamentoBico}</td>

                      <td className="p-4">{item.vazaoBomba}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
