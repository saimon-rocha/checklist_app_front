import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { checklistItems, ensaioAfericaoItems } from "./checklistStructure.js";

/* =========================================================
   FORMATADORES
========================================================= */

function formatarDataHora(data) {
  if (!data) return "-";

  return new Date(data).toLocaleString("pt-BR");
}

function adicionarRodape(doc) {
  const totalPages = doc.internal.getNumberOfPages();

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(220);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text(
      `Relatório gerado automaticamente • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" },
    );
  }
}

/* =========================================================
   HEADER / TOPO
========================================================= */

function addTopo(doc, dados, y, img) {
  const pageWidth = doc.internal.pageSize.width;

  /* FUNDO HEADER */
  doc.setFillColor(28, 55, 90);
  doc.rect(0, 0, pageWidth, 36, "F");

  /* LOGO */
  try {
    doc.addImage(img, "PNG", 14, 5, 22, 22);
  } catch (err) {
    console.error("Erro logo:", err);
  }

  /* TÍTULO */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255);

  doc.text(dados.titulo || "Relatório", pageWidth / 2, 16, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.setTextColor(220);

  doc.text("Relatório Técnico de Checklist e Aferição", pageWidth / 2, 24, {
    align: "center",
  });

  y = 45;

  /* CARD INFORMAÇÕES */
  doc.setFillColor(248, 249, 251);
  doc.roundedRect(14, y, 182, 30, 3, 3, "F");

  doc.setDrawColor(225);
  doc.roundedRect(14, y, 182, 30, 3, 3);

  let infoY = y + 8;

  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text("Usuário:", 20, infoY);
  doc.text("Posto:", 105, infoY);

  infoY += 6;

  doc.setFont("helvetica", "normal");

  doc.text(dados.usuario || "-", 20, infoY);

  doc.text(dados.filial_nome || "-", 105, infoY);

  infoY += 8;

  doc.setFont("helvetica", "bold");

  doc.text("Data/Hora:", 20, infoY);

  const identificacao = dados.titulo || "-";

  doc.text("Identificação:", 105, infoY);

  infoY += 6;

  doc.setFont("helvetica", "normal");

  doc.text(formatarDataHora(dados.data), 20, infoY);

  doc.text(identificacao, 105, infoY);

  return y + 38;
}

/* =========================================================
   TÍTULOS DE SEÇÃO
========================================================= */

function addSectionTitle(doc, titulo, y, cor = [41, 128, 185]) {
  doc.setFillColor(...cor);

  doc.roundedRect(14, y, 182, 8, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255);

  doc.text(titulo, 18, y + 5.5);

  return y + 12;
}

/* =========================================================
   CHECKLIST
========================================================= */

function addChecklist(doc, checklist, startY) {
  startY = addSectionTitle(doc, "Checklist Técnico", startY, [41, 128, 185]);

  const body = checklistItems
    .filter((item) => item.id !== "bombaId")
    .map((def) => {
      const item = checklist.find((c) => c.id === def.id);

      if (def.dependsOn) {
        const dependeItem = checklist.find((c) => c.id === def.dependsOn);

        const dependeValor = dependeItem?.resposta?.toLowerCase?.();

        if (dependeValor !== def.showIf) {
          return null;
        }
      }

      const resposta = Array.isArray(item?.resposta)
        ? item.resposta.join(", ")
        : (item?.resposta ?? "—");

      return [def.label || def.placeholder || def.id, resposta];
    })
    .filter(Boolean);

  autoTable(doc, {
    startY,

    head: [["Item Verificado", "Resposta"]],

    body,

    theme: "grid",

    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },

    styles: {
      fontSize: 8.5,

      cellPadding: 2,

      valign: "middle",

      lineColor: [230, 230, 230],

      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [41, 128, 185],

      textColor: 255,

      fontStyle: "bold",

      halign: "center",

      fontSize: 9,
    },

    columnStyles: {
      0: {
        cellWidth: 90,
        fontStyle: "bold",
      },
      1: {
        cellWidth: 92,
      },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/* =========================================================
   ENSAIO / AFERIÇÃO
========================================================= */

function addEnsaio(doc, ensaio, startY) {
  startY = addSectionTitle(doc, "Ensaio / Aferição", startY, [39, 174, 96]);
  const body = ensaioAfericaoItems
    .map((def) => {
      const item = ensaio.find((e) => e.id === def.id);

      if (def.dependsOn) {
        const depende = ensaio.find((e) => e.id === def.dependsOn)?.resposta;

        if (depende?.toLowerCase?.() !== def.showIf?.toLowerCase?.()) {
          return null;
        }
      }

      const resposta = item?.resposta ?? "—";

      return [def.label || def.placeholder || def.id, resposta];
    })
    .filter(Boolean);

  autoTable(doc, {
    startY,

    head: [["Item de Ensaio", "Resultado"]],

    body,

    theme: "grid",

    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },

    styles: {
      fontSize: 8.5,

      cellPadding: 2,

      valign: "middle",

      lineColor: [230, 230, 230],

      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [39, 174, 96],

      textColor: 255,

      fontStyle: "bold",

      halign: "center",

      fontSize: 9,
    },

    columnStyles: {
      0: {
        cellWidth: 110,
        fontStyle: "bold",
      },

      1: {
        cellWidth: 72,
      },
    },
  });

  return doc.lastAutoTable.finalY + 5;
}

/* =========================================================
   OBSERVAÇÕES
========================================================= */

function addObservacoes(doc, observacoes, startY) {
  if (!observacoes) {
    return startY;
  }

  startY = addSectionTitle(doc, "Observações Técnicas", startY, [230, 126, 34]);

  doc.setFillColor(252, 252, 252);

  doc.roundedRect(14, startY, 182, 28, 3, 3, "F");

  doc.setDrawColor(220);

  doc.roundedRect(14, startY, 182, 28, 3, 3);

  doc.setTextColor(60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(observacoes, 18, startY + 7, {
    maxWidth: 174,
    align: "justify",
  });

  return startY + 35;
}

/* =========================================================
   PDF FINAL
========================================================= */

export default function gerarPDF(dadosCompletos) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const img = new Image();

  img.src = "/android-chrome-512x512.png";

  img.onload = () => {
    /* =====================================================
       PÁGINA 1
    ===================================================== */

    let y = 15;

    y = addTopo(doc, dadosCompletos, y, img);

    y = addChecklist(doc, dadosCompletos.checklist || [], y);

    /* =====================================================
       PÁGINA 2
    ===================================================== */

    doc.addPage();

    y = 15;

    y = addTopo(doc, dadosCompletos, y, img);

    y = addEnsaio(doc, dadosCompletos.ensaio || [], y);

    y = addObservacoes(
      doc,
      dadosCompletos.ensaio?.find((e) => e.id === "observacoes")?.resposta ||
        dadosCompletos.observacoes,
      y,
    );

    /* =====================================================
       RODAPÉ
    ===================================================== */

    adicionarRodape(doc);

    /* =====================================================
       SAVE
    ===================================================== */

    const nomeArquivo =
      dadosCompletos?.titulo?.replace(/\s+/g, "_")?.replace(/[^\w-]/g, "") ||
      "Relatorio";

    doc.save(`${nomeArquivo}.pdf`);
  };

  img.onerror = () => {
    console.error("Erro ao carregar logo do relatório");
  };
}
