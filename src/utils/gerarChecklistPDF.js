import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { checklistItems, ensaioAfericaoItems } from "./checklistStructure.js";

/* ================= TOPO ================= */
function addTopo(doc, dados, y) {
  y += 30;

  doc.setFontSize(18).setFont("helvetica", "bold");
  doc.text(dados.titulo, 105, y, { align: "center" });
  y += 15;

  doc.setFontSize(12).setFont("helvetica", "normal");
  doc.text(`Usuário: ${dados.usuario}`, 10, y); y += 6;
  doc.text(`Posto: ${dados.filial_nome}`, 10, y); y += 6;
  doc.text(`Data e Hora: ${new Date(dados.data).toLocaleString()}`, 10, y); y += 6;

  if (Array.isArray(dados.checklist)) {
    const bombaItem = dados.checklist.find(c => c.id === "bombaId");
    if (bombaItem?.resposta) {
      doc.text(`Identificação da Bomba: ${bombaItem.resposta}`, 10, y);
      y += 10;
    }
  }

  return y;
}

/* ================= CHECKLIST ================= */
function addChecklist(doc, checklist, startY) {
  const body = checklistItems
    .filter(item => item.id !== "bombaId")
    .map(def => {
      const item = checklist.find(c => c.id === def.id);

      const resposta =
        Array.isArray(item?.resposta)
          ? item.resposta.join(", ")
          : item?.resposta ?? "—";

      // valida dependência corretamente
      if (def.dependsOn) {
        const dependeItem = checklist.find(c => c.id === def.dependsOn);
        const dependeValor = dependeItem?.resposta?.toLowerCase();

        if (dependeValor !== def.showIf) return null;
      }

      return [
        def.label || def.placeholder || def.id,
        resposta
      ];
    })
    .filter(Boolean);

  autoTable(doc, {
    head: [["Checklist", "Resposta"]],
    body,
    startY,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold"
    }
  });

  return doc.lastAutoTable.finalY + 10;
}

/* ================= ENSAIO / AFERIÇÃO ================= */
function addEnsaio(doc, ensaio, startY) {
  const body = ensaio
    .map(item => {
      const def = ensaioAfericaoItems.find(i => i.id === item.id);
      if (!def) return null;

      if (def.dependsOn) {
        const depende = ensaio.find(c => c.id === def.dependsOn)?.resposta;
        if (depende?.toLowerCase() !== def.showIf) return null;
      }

      let fullLabel;
      if (item.id === "bico") {
        fullLabel = "BICO";
      } else {
        const labelBase = def.label || item.id;
        const placeholder =
          def.placeholder && !labelBase.includes(def.placeholder)
            ? ` (${def.placeholder})`
            : "";
        const subtitle = def.subtitle ? ` ${def.subtitle}` : "";
        fullLabel = labelBase + placeholder + subtitle;
      }

      const resposta = Array.isArray(item.resposta)
        ? item.resposta.join(", ")
        : item.resposta || "—";

      return [fullLabel, resposta];
    })
    .filter(Boolean);

  autoTable(doc, {
    head: [["Ensaio/Aferição", "Resposta"]],
    body,
    startY,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: {
      fillColor: [39, 174, 96],
      textColor: 255,
      fontStyle: "bold"
    }
  });

  return doc.lastAutoTable.finalY + 10;
}

/* ================= OBSERVAÇÕES ================= */
function addObservacoes(doc, observacoes, startY) {
  if (!observacoes) return startY;

  doc.setFontSize(12).setFont("helvetica", "bold");
  doc.text("Observações:", 10, startY);

  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text(observacoes, 10, startY + 7, { maxWidth: 190 });

  return startY + 20;
}

/* ================= PDF FINAL ================= */
export default function gerarPDF(dadosCompletos) {
  const doc = new jsPDF();
  const img = new Image();

  img.src = "/android-chrome-512x512.png";

  img.onload = () => {
    // Página 1
    let y = 40;
    doc.addImage(img, "PNG", 10, 10, 30, 30);

    y = addTopo(doc, dadosCompletos, y);
    y = addChecklist(doc, dadosCompletos.checklist, y);

    // Página 2
    doc.addPage();
    y = 40;

    y = addEnsaio(doc, dadosCompletos.ensaio, y);
    addObservacoes(
      doc,
      dadosCompletos.ensaio.find(e => e.id === "observacoes")?.resposta
      || dadosCompletos.observacoes,
      y
    );

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, 200, 290, { align: "right" });
    }

    doc.save(`${dadosCompletos.titulo}.pdf`);
  };
}
