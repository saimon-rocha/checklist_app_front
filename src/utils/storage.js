// src/utils/storage.js
export function salvarEnsaioOffline(dadosCompletos) {
  try {
    // pega os formulários existentes
    const existentes = JSON.parse(localStorage.getItem("ensaioOffline")) || [];

    // adiciona o novo formulário
    existentes.push(dadosCompletos);

    // salva tudo de volta
    localStorage.setItem("ensaioOffline", JSON.stringify(existentes));
  } catch (err) {
    console.error("Erro ao salvar formulário offline:", err);
    throw err;
  }
}

export function gerarJSONDownload(dados) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `checklist_${dados.titulo}.json`;
  link.click();
}
