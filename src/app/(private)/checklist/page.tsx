"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Card from "../../../components/Card";
import PerguntaRadio from "../../../components/PerguntaRadio";
import PerguntaTexto from "../../../components/PerguntaTexto";
import PerguntaRadioDefeito from "../../../components/PerguntaRadioDefeito";
import PerguntaRadioNaoAvaliar from "../../../components/PerguntaRadioNaoAvaliar";
import TopFields from "../../../components/TopFields";

import "../../../styles/ChecklistBomba.css";

import { checklistItems } from "../../../utils/checklistStructure";

import { toast } from "react-toastify";

const getToday = () => {
  return new Date().toLocaleDateString("pt-BR");
};

/* ================= FIELD ================= */
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

      {item.type === "radio" &&
        !item.allowNotEvaluate &&
        !item.dangerOnSim && (
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

/* ================= PAGE ================= */
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
    }
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
    const newForm = {
      ...form,
      [field]: value,
    };

    setForm(newForm);
    localStorage.setItem("checklistBombaForm", JSON.stringify(newForm));
  }

  function handleAvancar() {
    localStorage.setItem("checklistBombaForm", JSON.stringify(form));
    router.push("/checklist/ensaio");
  }

  function handleCancelar() {
    toast.warn("Operação Cancelada");

    const resetForm = {
      ...initialState,
      data: getToday(),
    };

    setForm(resetForm);
    localStorage.removeItem("checklistBombaForm");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-4xl text-center mb-6">
        <h1 className="text-2xl font-bold">
          Checklist da Bomba Medidora
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Preencha todas as verificações antes de avançar
        </p>
      </div>

      {/* TOP FIELDS */}
      <div className="w-full max-w-4xl mb-4">
        <TopFields formData={form} onChange={handleChange} />
      </div>

      {/* LISTA */}
      <div className="w-full max-w-4xl space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {checklistItems.map((item: any) => (
          <ChecklistField
            key={item.id}
            item={item}
            formData={form}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* BOTÕES FIXOS VISUAIS */}
      <div className="w-full max-w-4xl flex justify-end gap-3 mt-6">
        <button
          onClick={handleCancelar}
          className="px-5 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition"
        >
          Cancelar
        </button>

        <button
          onClick={handleAvancar}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        >
          Avançar
        </button>
      </div>
    </div>
  );
}