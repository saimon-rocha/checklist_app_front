"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";

import { buscaCEP } from "../../../../../utils/buscaCep";
import api from "../../../../../service/api";

export default function EditarPosto() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [nomePosto, setNomePosto] = useState("");
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);

  const [endereco, setEndereco] = useState({
    rua: "",
    bairro: "",
    ruaReadOnly: true,
    bairroReadOnly: true,
  });

  // =========================
  // LOAD POSTO
  // =========================
  useEffect(() => {
    async function loadPosto() {
      try {
        if (!id) return;

        const response = await api.get("/postos");

        const posto = response.data.find(
          (p: any) => String(p.id) === String(id)
        );

        if (!posto) {
          toast.error("Posto não encontrado");
          router.push("/postos");
          return;
        }

        setNomePosto(posto.nome || "");
        setCep(posto.cep || "");

        setEndereco({
          rua: posto.rua || "",
          bairro: posto.bairro || "",
          ruaReadOnly: false,
          bairroReadOnly: false,
        });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.error || "Erro ao carregar posto"
        );
      }
    }

    loadPosto();
  }, [id, router]);

  // =========================
  // CEP
  // =========================
  async function handleCepChange(e: any) {
    const value = e.target.value.replace(/\D/g, "");
    setCep(value);

    if (value.length === 8) {
      const data = await buscaCEP(value);

      const ruaFaltando = !data.rua;
      const bairroFaltando = !data.bairro;

      setEndereco({
        rua: data.rua || "",
        bairro: data.bairro || "",
        ruaReadOnly: !ruaFaltando,
        bairroReadOnly: !bairroFaltando,
      });

      if (ruaFaltando || bairroFaltando) {
        toast.info("Complete os dados manualmente.");
      }
    }
  }

  // =========================
  // SAVE
  // =========================
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!nomePosto || !cep || !endereco.rua || !endereco.bairro) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      await api.put(`/postos/${id}`, {
        nome: nomePosto.trim(),
        cep,
        rua: endereco.rua.trim(),
        bairro: endereco.bairro.trim(),
      });

      toast.success("Posto atualizado com sucesso!");

      setTimeout(() => router.push("/postos"), 1200);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Erro ao atualizar posto."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          Editar Posto
        </h2>

        {/* NOME */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">
            Nome do Posto
          </label>

          <input
            value={nomePosto}
            onChange={(e) => setNomePosto(e.target.value)}
            className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* CEP + RUA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium">CEP</label>

            <input
              value={cep}
              onChange={handleCepChange}
              maxLength={8}
              className="border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Rua</label>

            <input
              value={endereco.rua}
              readOnly={endereco.ruaReadOnly}
              onChange={(e) =>
                setEndereco({ ...endereco, rua: e.target.value })
              }
              className={`border rounded-lg px-3 py-2 mt-1 ${
                endereco.ruaReadOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}
            />
          </div>
        </div>

        {/* BAIRRO */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Bairro</label>

          <input
            value={endereco.bairro}
            readOnly={endereco.bairroReadOnly}
            onChange={(e) =>
              setEndereco({ ...endereco, bairro: e.target.value })
            }
            className={`border rounded-lg px-3 py-2 mt-1 ${
              endereco.bairroReadOnly
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}