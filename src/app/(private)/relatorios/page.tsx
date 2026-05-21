"use client";

import { useState } from "react";
import "../../../styles/RelatorioFiltros.css";

import Table from "react-bootstrap/Table";
import gerarRelatorioPDF from "../../../utils/gerarRelatorioPDF";
import { toast } from "react-toastify";
import api from "../../../service/api";

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
  // BUSCAR NA API
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

        const dentroPeriodo =
          dataItem >= dataInicio && dataItem <= dataFim;

        return dentroPeriodo;
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
    } catch (err) {
      console.error(err);
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
    <div className="container-arquivos safeArea">
      <h2 style={{ textAlign: "center" }}>Relatório Aferições</h2>

      {/* FILTROS */}
      <div className="relatorio-filtros">
        <div className="campo-data">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />

          <span>até</span>

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <div className="acoes-relatorio">
          <button className="btn btn-buscar" onClick={buscar}>
            Buscar
          </button>

          <button className="btn btn-relatorio" onClick={gerarRelatorio}>
            Gerar PDF
          </button>
        </div>
      </div>

      {/* TABELA */}
      {resultado.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Bico</th>
              <th>Data</th>
              <th>Vazão Máxima</th>
              <th>Vazão Mínima</th>
              <th>Vazamento Bico</th>
              <th>Vazão Bomba</th>
            </tr>
          </thead>

          <tbody>
            {resultado.map((item, index) => (
              <tr key={index}>
                <td>{item.bomba}</td>
                <td>{item.dataRelatorio}</td>
                <td>{item.totalVazaoMax}</td>
                <td>{item.totalVazaoMin}</td>
                <td>{item.vazamentoBico}</td>
                <td>{item.vazaoBomba}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {loading && <p>Carregando...</p>}
    </div>
  );
}