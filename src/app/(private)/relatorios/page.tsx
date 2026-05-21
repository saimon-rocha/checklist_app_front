import { useState } from "react";
import "../../styles/RelatorioFiltros.css";
import Table from "react-bootstrap/Table";
import gerarRelatorioPDF from "../../../utils/gerarRelatorioPDF";
import { toast } from "react-toastify";

export default function Relatorio() {

    const filtrarPorPeriodo = (dataInicio, dataFim) => {

        const dados = JSON.parse(localStorage.getItem("ensaioOffline")) || [];
        const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || {};

        const filtrados = dados.filter(item => {

            const dataItem = new Date(item.data).toISOString().split("T")[0];
            const dentroPeriodo = dataItem >= dataInicio && dataItem <= dataFim;

            // admin vê tudo
            if (usuarioLogado.isAdmin) {
                return dentroPeriodo;
            }

            const mesmaFilial = item.filial === usuarioLogado.filial;
            const mesmoUsuario = item.usuario === usuarioLogado.username;

            return dentroPeriodo && mesmaFilial && mesmoUsuario;

        });

        const resultadoFormatado = filtrados.map(item => {
            return {
                bomba: item.checklist?.bombaId || "Não Definido",
                filial: item.filial || "-",
                dataRelatorio: item.data ? new Date(item.data).toLocaleDateString() : "-",
                totalVazaoMax: Number(item.ensaio?.find(e => e.id === "vazaoMax")?.resposta || 0),
                totalVazaoMin: Number(item.ensaio?.find(e => e.id === "vazaoMin")?.resposta || 0),
                vazamentoBico: Number(item.ensaio?.find(e => e.id === "vazamentoBico")?.resposta || 0),
                vazaoBomba: Number(item.ensaio?.find(e => e.id === "vazaoBomba")?.resposta || 0)
            };
        });

        return resultadoFormatado;
    };

    // Datas padrão
    const hoje = new Date().toISOString().split("T")[0];
    const [dataInicio, setDataInicio] = useState(hoje);
    const [dataFim, setDataFim] = useState(hoje);
    const [resultado, setResultado] = useState([]);

    const buscar = () => {
        const res = filtrarPorPeriodo(dataInicio, dataFim);

        if (res.length === 0) {
            toast.warning("Nenhum dado encontrado para esse período");
        }

        setResultado(res);
    };

    const gerarRelatorio = () => {
        if (resultado.length === 0) {
            toast.error("Nenhum dado para gerar relatório");
            return;
        }
        console.log(dataInicio, dataFim);
        gerarRelatorioPDF(resultado, dataInicio, dataFim);
    };

    return (
        <div className="container-arquivos safeArea">
            <h2 style={{ textAlign: "center" }}>Relatório Aferições</h2>

            <div className="relatorio-filtros">
                <div
                    className="campo-data"
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="input-data"
                    />
                    <span>até</span>
                    <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="input-data"
                    />
                </div>

                <div className="acoes-relatorio">
                    <button className="btn btn-buscar" onClick={buscar}>
                        Buscar
                    </button>

                    <button className="btn btn-relatorio" onClick={gerarRelatorio}>
                        Gerar Relatório
                    </button>
                </div>
            </div>

            {resultado.length > 0 && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Bico</th>
                            <th>Data</th>
                            <th>Vazão Máxima<br /><span className="unidade">ML</span></th>
                            <th>Vazão Mínima<br /><span className="unidade">ML</span></th>
                            <th>Vazamento do Bico<br /><span className="unidade">ML</span></th>
                            <th>Vazão da Bomba<br /><span className="unidade">L/Min</span></th>
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
        </div>
    );
}