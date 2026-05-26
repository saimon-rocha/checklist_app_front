"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "../../../../components/Card";
import PerguntaTexto from "../../../../components/PerguntaTexto";
import PerguntaRadio from "../../../../components/PerguntaRadio";
import PerguntaRadioDefeito from "../../../../components/PerguntaRadioDefeito";
import PerguntaCheckbox from "../../../../components/PerguntaCheckbox";

import {
  ensaioAfericaoItems,
  checklistItems,
} from "../../../../utils/checklistStructure";

import { toast } from "react-toastify";
import api from "../../../../service/api";

/* ================= FIELD ================= */
function ChecklistField({ item, formData, onChange }: any) {
  if (!formData) return null;

  if (item.dependsOn && formData[item.dependsOn] !== item.showIf) {
    return null;
  }

  return (
    <Card>
      {item.type === "radio" && !item.dangerOnSim && (
        <PerguntaRadio
          label={item.label}
          selectedValue={formData[item.id]}
          onChange={(val) => onChange(item.id, val)}
        />
      )}

      {item.type === "radio" && item.dangerOnSim && (
        <PerguntaRadioDefeito
          label={item.label}
          selectedValue={formData[item.id]}
          onChange={(val) => onChange(item.id, val)}
        />
      )}

      {item.type === "text" && (
        <PerguntaTexto
          label={item.label}
          subtitle={item.subtitle}
          placeholder={item.placeholder}
          value={formData[item.id]}
          onChange={(val) => onChange(item.id, val)}
          numeric
        />
      )}

      {item.type === "checkbox" && (
        <PerguntaCheckbox
          label={item.label}
          options={item.options}
          selectedValues={formData[item.id]}
          onChange={(vals) => onChange(item.id, vals)}
        />
      )}
    </Card>
  );
}

/* ================= JWT ================= */
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

/* ================= PAGE ================= */
export default function EnsaioAfericaoPage() {
  const router = useRouter();

  /* ================= INIT ================= */
  const initialState = ensaioAfericaoItems.reduce((acc: any, item: any) => {
    if (item.type === "checkbox") acc[item.id] = [];
    else if (item.type === "radio") acc[item.id] = "nao";
    else acc[item.id] = "";
    return acc;
  }, {});

  /* ================= ENSAIO STATE ================= */
  const [form, setForm] = useState<any>(() => {
    if (typeof window === "undefined") return initialState;

    const saved = localStorage.getItem("ensaioForm");
    return saved ? JSON.parse(saved) : initialState;
  });

  /* ================= CHECKLIST STATE ================= */
  const [checklist, setChecklist] = useState<any>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("checklistBombaForm");
    setChecklist(saved ? JSON.parse(saved) : {});
  }, []);

  /* ================= MERGE FINAL (CORRETO) ================= */
  const combinedForm = {
    ...checklist,
    ...form,
  };

  /* ================= SYNC STORAGE ================= */
  useEffect(() => {
    localStorage.setItem("ensaioForm", JSON.stringify(form));
  }, [form]);

  /* ================= CHANGE ================= */
  function handleChange(field: string, value: any) {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* ================= NAV ================= */
  function handleBack() {
    router.push("/checklist");
  }

  function handleCancel() {
    toast.warning("Operação Cancelada");
    setForm(initialState);
    localStorage.removeItem("ensaioForm");
  }

  /* ================= SUBMIT ================= */
  async function handleConclude() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Usuário não autenticado");
        router.replace("/login");
        return;
      }

      const payload = parseJwt(token);

      const checklistObj = combinedForm;

      const checklistArray = checklistItems.map((item: any) => ({
        id: item.id,
        label: item.label || item.placeholder || item.id,
        resposta: checklistObj[item.id] ?? "—",
      }));

      const ensaioArray = ensaioAfericaoItems.map((item: any) => ({
        id: item.id,
        label: item.label || item.placeholder || item.id,
        resposta: form[item.id] ?? "—",
      }));

      const dadosCompletos = {
        titulo: checklistObj.bombaId || "Checklist Bomba",
        usuario_id: payload?.id,
        id_posto: combinedForm.id_posto,
        respostas: {
          checklist: checklistArray,
          ensaio: ensaioArray,
        },
        id_ativo: true,
      };

      await api.post("/arquivos", dadosCompletos);

      setForm(initialState);
      localStorage.removeItem("checklistBombaForm");
      localStorage.removeItem("ensaioForm");
      toast.success("Checklist salvo com sucesso!");
      setTimeout(() => {
        router.push("/checklist");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao salvar checklist");
    }
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Ensaio / Aferição
      </h1>

      <div className="w-full max-w-3xl max-h-[60vh] overflow-y-auto space-y-4 pr-2">
        {ensaioAfericaoItems.map((item: any) => (
          <ChecklistField
            key={item.id}
            item={item}
            formData={combinedForm}
            onChange={handleChange}
          />
        ))}

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Observações</h2>

          <textarea
            value={form.observacoes || ""}
            onChange={(e) => handleChange("observacoes", e.target.value)}
            className="w-full border rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="w-full max-w-3xl flex justify-end gap-3 mt-6">
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold"
        >
          Voltar
        </button>

        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
        >
          Cancelar
        </button>

        <button
          onClick={handleConclude}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Concluir
        </button>
      </div>
    </div>
  );
}