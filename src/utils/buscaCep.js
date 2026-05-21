// utils/buscaCep.js
export async function buscaCEP(cep) {
    try {
        
        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8) {
            throw new Error("CEP inválido. Deve ter 8 dígitos.");
        }

        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

        if (!response.ok) {
            throw new Error("Erro ao buscar o CEP.");
        }

        const data = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado.");
        }

        // Aqui verificamos se é CEP "geral" (sem logradouro/bairro)
        const isCepGeral = !data.logradouro && !data.bairro;

        return {
            cep: data.cep || cepLimpo,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            uf: data.uf || "",
            mensagem: isCepGeral
                ? "CEP geral da cidade. Preencha rua e bairro manualmente."
                : null,
            isCepGeral
        };
    } catch (error) {
        console.error("Erro na buscaCEP:", error.message);
        return {
            cep: cep,
            rua: "",
            bairro: "",
            cidade: "",
            uf: "",
            mensagem: "CEP não encontrado. Preencha os dados manualmente.",
            isCepGeral: true
        };
    }
}
