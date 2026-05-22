"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Card from "../../../components/Card";
import PerguntaRadio from "../../../components/PerguntaRadio";
import PerguntaTexto from "../../../components/PerguntaTexto";
import PerguntaRadioDefeito from "../../../components/PerguntaRadioDefeito";
import PerguntaRadioNaoAvaliar from "../../../components/PerguntaRadioNaoAvaliar";
import TopFields from "../../../components/TopFields";

import { checklistItems } from "../../../utils/checklistStructure";
import { toast } from "react-toastify";

const getToday = () => {
  return new Date().toLocaleDateString("pt-BR");
};

function ChecklistField({ item, formData, onChange }: any) {
  if (item.dependsOn && formData[item.dependsOn] !== item.showIf) {
    return null;
  }

  return (
    <Card>
      {item.type === "radio" && item.allowNotEvaluate && (
        <PerguntaRadioNaoAvaliar
          label={item.label}
          selectedValue={formData[item.id]}
          onChange={(val: string) => onChange(item.id, val)}
        />
      )}

      {item.type === "radio" && !item.allowNotEvaluate && !item.dangerOnSim && (
        <PerguntaRadio
          label={item.label}
          selectedValue={formData[item.id]}
          onChange={(val: string) => onChange(item.id, val)}
        />
      )}

      {item.type === "radio" && item.dangerOnSim && (
        <PerguntaRadioDefeito
          label={item.label}
          selectedValue={formData[item.id]}
          onChange={(val: string) => onChange(item.id, val)}
        />
      )}

      {item.type === "text" && (
        <PerguntaTexto
          label={item.label}
          placeholder={item.placeholder}
          value={formData[item.id]}
          onChange={(val: string) => onChange(item.id, val)}
        />
      )}
    </Card>
  );
}

export default function ChecklistBomba() {
  const router = useRouter();

  const initialState = checklistItems.reduce(
    (acc: any, item: any) => {
      if (item.type === "checkbox") acc[item.id] = [];
      else if (item.type === "radio") acc[item.id] = "nao";
      else acc[item.id] = "";

      return acc;
    },
    {
      bombaId: "",
      data: getToday(),
    },
  );

  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("checklistBombaForm");
      return saved ? JSON.parse(saved) : initialState;
    }
    return initialState;
  });

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      data: getToday(),
    }));
  }, []);

  function handleChange(field: string, value: any) {
    setForm((prev: any) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      localStorage.setItem("checklistBombaForm", JSON.stringify(updated));

      return updated;
    });
  }

  function handleAvancar() {
    const current = {
      ...form,
      data: getToday(),
    };

    localStorage.setItem("checklistBombaForm", JSON.stringify(current));

    router.push("/checklist/ensaio");
  }

  function handleCancelar() {
    toast.warn("Operação Cancelada");

    const reset = {
      ...initialState,
      data: getToday(),
    };

    setForm(reset);
    localStorage.removeItem("checklistBombaForm");
  }

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        Checklist da Bomba Medidora
      </h1>

      {/* TOP FIELDS */}
      <div className="w-full max-w-3xl">
        <TopFields formData={form} onChange={handleChange} />
      </div>

      {/* LISTA SCROLLÁVEL */}
      <div className="w-full max-w-3xl mt-4 max-h-[60vh] overflow-y-auto space-y-4 pr-2">
        {checklistItems.map((item: any) => (
          <ChecklistField
            key={item.id}
            item={item}
            formData={form}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* BOTÕES */}
      <div className="w-full max-w-3xl flex justify-end gap-3 mt-6">
        <button
          onClick={handleCancelar}
          className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold transition"
        >
          Cancelar
        </button>

        <button
          onClick={handleAvancar}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          Avançar
        </button>
      </div>
    </div>
  );
}
