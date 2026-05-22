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

  // =========================
  // BUSCAR
  // =========================
  async function buscar() {
    try {
      setLoading(true);

      const response = await api.get("/formularios");
      const data = response.data;

      const filtrados = data.filter((item: any) => {
        const dataItem = new Date(item.created_at)
          .toISOString()
          .split("T")[0];

        return dataItem >= dataInicio && dataItem <= dataFim;
      });

      const formatado: RelatorioItem[] = filtrados.map((item: any) => ({
        bomba: item.titulo || "Não definido",
        filial: item.filial_nome || "-",
        dataRelatorio: item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "-",

        totalVazaoMax: Number(
          item.ensaio?.find((e: any) => e.id === "vazaoMax")?.resposta || 0
        ),
        totalVazaoMin: Number(
          item.ensaio?.find((e: any) => e.id === "vazaoMin")?.resposta || 0
        ),
        vazamentoBico: Number(
          item.ensaio?.find((e: any) => e.id === "vazamentoBico")?.resposta || 0
        ),
        vazaoBomba: Number(
          item.ensaio?.find((e: any) => e.id === "vazaoBomba")?.resposta || 0
        ),
      }));

      if (formatado.length === 0) {
        toast.warning("Nenhum dado encontrado no período");
      }

      setResultado(formatado);
    } catch {
      toast.error("Erro ao buscar relatórios");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // PDF
  // =========================
  function gerarRelatorio() {
    if (resultado.length === 0) {
      toast.error("Nenhum dado para gerar relatório");
      return;
    }

    gerarRelatorioPDF(resultado, dataInicio, dataFim);
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-6 text-center">
        Relatório Aferições
      </h2>

      {/* FILTROS */}
      <div className="w-full max-w-5xl bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* datas */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <span className="text-gray-500">até</span>

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {/* ações */}
        <div className="flex gap-2">
          <button
            onClick={buscar}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Buscar
          </button>

          <button
            onClick={gerarRelatorio}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            PDF
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="mt-6 w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      )}

      {/* TABELA */}
      {resultado.length > 0 && (
        <div className="w-full max-w-5xl mt-6 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Bico</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Vazão Máx</th>
                <th className="p-3 text-left">Vazão Mín</th>
                <th className="p-3 text-left">Vazamento</th>
                <th className="p-3 text-left">Bomba</th>
              </tr>
            </thead>

            <tbody>
              {resultado.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.bomba}</td>
                  <td className="p-3">{item.dataRelatorio}</td>
                  <td className="p-3">{item.totalVazaoMax}</td>
                  <td className="p-3">{item.totalVazaoMin}</td>
                  <td className="p-3">{item.vazamentoBico}</td>
                  <td className="p-3">{item.vazaoBomba}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}