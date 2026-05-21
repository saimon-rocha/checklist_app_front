import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= TOPO ================= */
function addTopo(doc, info, y) {

  y += 30;

  doc.setFontSize(18).setFont("helvetica", "bold");
  doc.text(info.titulo || "Relatório", 105, y, { align: "center" });
  y += 15;

  doc.setFontSize(12).setFont("helvetica", "normal");

  if (info.usuario) {
    doc.text(`Usuário: ${info.usuario}`, 10, y);
    y += 6;
  }

  if (info.filial) {
    doc.text(`Filial: ${info.filial}`, 10, y);
    y += 6;
  }

  if (info.dataInicio && info.dataFim) {
    const inicio = formatarDataBR(info.dataInicio);
    const fim = formatarDataBR(info.dataFim);

    doc.text(`Período: ${inicio} até ${fim}`, 10, y);
    y += 6;
  }

  return y;
}

/* ================= PDF ================= */
export default function gerarRelatorioPDF(resultado, dataInicio, dataFim) {

  const doc = new jsPDF();

  const img = new Image();
  img.src = "/android-chrome-512x512.png";

  img.onload = () => {

    let y = 40;

    // LOGO
    doc.addImage(img, "PNG", 10, 10, 30, 30);

    // pega dados do storage
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
    const filiais = JSON.parse(localStorage.getItem("filiais")) || [];
    const filialNome = filiais?.[0]?.nome || "—";

    // TOPO
    y = addTopo(doc, {
      titulo: "Relatório das Aferições por Bico",
      usuario: usuarioLogado.username,
      filial: filialNome,
      dataInicio,
      dataFim
    }, y);

    // monta tabela
    const body = resultado.map(item => [
      item.bomba,
      item.totalVazaoMax,
      item.totalVazaoMin,
      item.vazamentoBico,
      item.vazaoBomba
    ]);

    autoTable(doc, {
      startY: y,
      head: [[
        "Identificação do Bico",
        "Vazão Máxima ML",
        "Vazão Mínima ML",
        "Vazamento do Bico ML",
        "Vazão da Bomba L/Min"
      ]],
      body,
      styles: {
        fontSize: 11,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold"
      }
    });

    // rodapé
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, 200, 290, { align: "right" });
    }

    doc.save(`Relatorio_${dataInicio}.pdf`);
  };
}

function formatarDataBR(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}