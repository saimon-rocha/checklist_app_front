"use client";

import { useCallback, useEffect, useState } from "react";

import moment from "moment";
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

type Filial = {
  id: number;
  nome: string;
};

export default function Relatorio() {
  const hoje = new Date().toLocaleDateString("en-CA");

  const [dataInicio, setDataInicio] = useState(hoje);

  const [dataFim, setDataFim] = useState(hoje);

  const [resultado, setResultado] = useState<RelatorioItem[]>([]);

  const [filiais, setFiliais] = useState<Filial[]>([]);

  const [idFilial, setIdFilial] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarFiliais() {
      try {
        const response = await api.get("/filiais");
        setFiliais(response.data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar filiais");
      }
    }

    carregarFiliais();
  }, []);

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
          id_filial: idFilial || undefined,
        },
      });

      if (response.data.length === 0) {
        toast.warning("Nenhum dado encontrado no período");
      }

      setResultado(response.data);
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
    <div className="min-h-screen bg-slate-50/50 px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full max-w-6xl mb-6">
        <div
          className="
            bg-gradient-to-tr
            from-slate-950
            via-slate-900
            to-indigo-950
            rounded-[2rem]
            px-6
            md:px-10
            py-8
            text-center
            shadow-lg
            relative
            overflow-hidden
          "
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Relatório de Aferições
          </h2>

          <p className="text-indigo-200/80 mt-2 text-sm md:text-base font-medium">
            Consulte e exporte os relatórios consolidados por período
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div
        className="
          w-full
          max-w-6xl
          bg-white
          rounded-[2rem]
          border
          border-slate-100
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          p-6
          space-y-6
        "
      >
        {/* DATAS & FILTRO */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-700 mb-2">
              Data Inicial
            </label>

            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="input-premium"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-700 mb-2">
              Data Final
            </label>

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="input-premium"
            />
          </div>

          <div className="flex flex-col col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-slate-700 mb-2">
              Filial
            </label>

            <select
              value={idFilial}
              onChange={(e) => setIdFilial(e.target.value)}
              className="input-premium"
            >
              <option value="">Todas as filiais</option>

              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-50">
          <button
            onClick={buscar}
            className="
              px-8
              py-3.5
              rounded-2xl
              premium-gradient-bg
              hover:opacity-95
              text-white
              font-bold
              shadow-lg
              shadow-indigo-500/10
              transition-all
              duration-200
              active:scale-[0.98]
              cursor-pointer
              w-full
              sm:w-auto
              text-center
            "
          >
            Buscar
          </button>

          <button
            onClick={gerarRelatorio}
            className="
              px-8
              py-3.5
              rounded-2xl
              bg-emerald-50
              hover:bg-emerald-100
              text-emerald-700
              font-bold
              border
              border-emerald-200/50
              transition-all
              duration-200
              active:scale-[0.98]
              cursor-pointer
              w-full
              sm:w-auto
              text-center
            "
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">
              Buscando relatórios...
            </p>
          </div>
        </div>
      )}

      {/* RESULTADOS */}
      {resultado.length > 0 && !loading && (
        <>
          {/* MOBILE CARDS */}
          <div className="w-full max-w-6xl mt-6 space-y-4 md:hidden">
            {resultado.map((item, index) => (
              <div
                key={index}
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-slate-100
                  shadow-[0_8px_30px_rgb(0,0,0,0.02)]
                  p-5
                  space-y-4
                "
              >
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h3 className="font-extrabold text-slate-800 text-base">
                    {item.bomba}
                  </h3>

                  <span className="text-xs font-semibold text-slate-400">
                    {moment
                      .utc(item.dataRelatorio)
                      .local()
                      .format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50/50">
                    <span className="font-bold text-slate-500 text-xs uppercase">
                      Filial
                    </span>
                    <span className="font-medium text-slate-800">
                      {item.filial}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-50/50">
                    <span className="font-bold text-slate-500 text-xs uppercase">
                      Vazão Máx
                    </span>
                    <span className="font-medium text-slate-800">
                      {item.totalVazaoMax}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-50/50">
                    <span className="font-bold text-slate-500 text-xs uppercase">
                      Vazão Mín
                    </span>
                    <span className="font-medium text-slate-800">
                      {item.totalVazaoMin}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-50/50">
                    <span className="font-bold text-slate-500 text-xs uppercase">
                      Vazamento Bico
                    </span>
                    <span className="font-medium text-slate-800">
                      {item.vazamentoBico}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="font-bold text-slate-500 text-xs uppercase">
                      Vazão Bomba
                    </span>
                    <span className="font-medium text-slate-800">
                      {item.vazaoBomba}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TABELA DESKTOP */}
          <div className="hidden md:block w-full max-w-6xl mt-6 overflow-x-auto rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="p-5 text-left font-bold">Filial</th>

                  <th className="p-5 text-left font-bold">Bomba</th>

                  <th className="p-5 text-left font-bold">Data</th>

                  <th className="p-5 text-left font-bold">Vazão Máx</th>

                  <th className="p-5 text-left font-bold">Vazão Mín</th>

                  <th className="p-5 text-left font-bold">Vazamento Bico</th>

                  <th className="p-5 text-left font-bold">Vazão Bomba</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {resultado.map((item, index) => (
                  <tr
                    key={index}
                    className="
                      hover:bg-slate-50/50
                      transition-all
                      duration-150
                    "
                  >
                    <td className="p-5 font-medium text-slate-900">
                      {item.filial}
                    </td>

                    <td className="p-5 font-bold text-indigo-950">
                      {item.bomba}
                    </td>

                    <td className="p-5 text-slate-500">
                      {moment
                        .utc(item.dataRelatorio)
                        .local()
                        .format("DD/MM/YYYY HH:mm")}
                    </td>

                    <td className="p-5 text-slate-800 font-medium">
                      {item.totalVazaoMax}
                    </td>

                    <td className="p-5 text-slate-800 font-medium">
                      {item.totalVazaoMin}
                    </td>

                    <td className="p-5 text-slate-800 font-medium">
                      {item.vazamentoBico}
                    </td>

                    <td className="p-5 text-slate-800 font-medium">
                      {item.vazaoBomba}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
