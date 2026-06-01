import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= FORMATAR DATA ================= */

function formatarDataBR(data) {
  if (!data) return "-";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano} `;
}

/* ================= HEADER MODERNO ================= */

function addHeader(doc, info) {
  // FUNDO DO TOPO
  doc.setFillColor(25, 118, 210);

  doc.rect(0, 0, 220, 45, "F");

  // LOGO
  try {
    doc.addImage(info.logo, "PNG", 12, 8, 24, 24);
  } catch (err) {
    console.error(err);
  }

  // TÍTULO
  doc.setTextColor(255, 255, 255);

  doc.setFontSize(22);

  doc.setFont("helvetica", "bold");

  doc.text("RELATÓRIO DE AFERIÇÕES", 105, 18, { align: "center" });

  // SUBTÍTULO
  doc.setFontSize(11);

  doc.setFont("helvetica", "normal");

  doc.text("Controle e monitoramento de bombas", 105, 27, { align: "center" });

  // LINHA
  doc.setDrawColor(255, 255, 255);

  doc.line(45, 34, 165, 34);

  return 55;
}

/* ================= INFO BOX ================= */

function addInfoBox(doc, info, y) {
  // BOX
  doc.setFillColor(245, 247, 250);

  doc.roundedRect(10, y, 190, 28, 3, 3, "F");

  // TITULOS
  doc.setTextColor(100);

  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");

  doc.text("Usuário", 15, y + 8);

  doc.text("Filiais", 80, y + 8);

  doc.text("Período", 145, y + 8);

  // VALORES
  doc.setTextColor(40);

  doc.setFont("helvetica", "normal");

  doc.text(info.usuario || "-", 15, y + 17);

  doc.text(`${info.totalFiliais} filial(is)`, 80, y + 17);

  doc.text(
    `${formatarDataBR(info.dataInicio)} até ${formatarDataBR(info.dataFim)} `,
    145,
    y + 17,
  );

  return y + 40;
}

/* ================= PDF ================= */

export default function gerarRelatorioPDF(resultado, dataInicio, dataFim) {
  if (!Array.isArray(resultado)) {
    console.error("Resultado inválido:", resultado);

    return;
  }

  const doc = new jsPDF();

  const img = new Image();

  img.src = "/android-chrome-512x512.png";

  img.onload = () => {
    /* ================= STORAGE ================= */

    let usuarioLogado = {};

    try {
      usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
    } catch (err) {
      console.error(err);
    }

    const totalFiliais = new Set(resultado.map((item) => item.filial)).size;
    /* ================= HEADER ================= */

    let y = addHeader(doc, {
      logo: img,
    });

    /* ================= INFO ================= */

    y = addInfoBox(
      doc,
      {
        usuario: usuarioLogado?.username || "-",

        totalFiliais,

        dataInicio,

        dataFim,
      },
      y,
    );

    /* ================= BODY ================= */

    const body = resultado.map((item) => [
      item.filial || "-",

      item.bomba || "-",

      new Date(item.dataRelatorio).toLocaleString("pt-BR"),

      `${item.totalVazaoMax} ML`,

      `${item.totalVazaoMin} ML`,

      `${item.vazamentoBico} ML`,

      `${item.vazaoBomba} L/min`,
    ]);

    /* ================= TABELA ================= */

    autoTable(doc, {
      startY: y,

      head: [
        [
          "FILIAL",
          "BOMBA",
          "DATA",
          "VAZÃO MÁX",
          "VAZÃO MÍN",
          "VAZAMENTO DO BICO",
          "VAZÃO BOMBA",
        ],
      ],

      body,

      theme: "grid",

      tableWidth: "auto",

      margin: {
        left: 10,
        right: 10,
      },

      styles: {
        fontSize: 10,

        cellPadding: 5,

        valign: "middle",

        overflow: "linebreak",

        textColor: [40, 40, 40],
      },

      headStyles: {
        fillColor: [25, 118, 210],

        textColor: 255,

        fontStyle: "bold",

        halign: "center",

        fontSize: 11,
      },

      bodyStyles: {
        halign: "center",
      },

      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },

      columnStyles: {
        0: {
          halign: "left",
          fontStyle: "bold",
        },
      },

      didDrawPage: () => {
        // RODAPÉ
        const pageCount = doc.internal.getNumberOfPages();

        const pageHeight = doc.internal.pageSize.height;

        const pageWidth = doc.internal.pageSize.width;

        doc.setFontSize(9);

        doc.setTextColor(120);

        doc.text(
          `Gerado em ${new Date().toLocaleString("pt-BR")} `,
          10,
          pageHeight - 8,
        );

        doc.text(
          `Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount} `,
          pageWidth - 10,
          pageHeight - 8,
          { align: "right" },
        );
      },
    });

    /* ================= RESUMO ================= */

    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFillColor(245, 247, 250);

    doc.roundedRect(10, finalY, 190, 20, 3, 3, "F");

    doc.setFontSize(11);

    doc.setFont("helvetica", "bold");

    doc.setTextColor(40);

    doc.text(`Total de aferições: ${resultado.length} `, 15, finalY + 12);

    /* ================= SAVE ================= */

    doc.save(`Relatorio_${dataInicio}_${dataFim}.pdf`);
  };

  img.onerror = () => {
    console.error("Erro ao carregar imagem");
  };
}
