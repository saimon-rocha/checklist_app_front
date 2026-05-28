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
    <>
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
    </>
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

      const ensaioArray = [
        ...ensaioAfericaoItems.map((item: any) => ({
          id: item.id,
          label: item.label || item.placeholder || item.id,
          resposta: form[item.id] ?? "—",
        })),

        // OBSERVAÇÕES
        {
          id: "observacoes",
          label: "Observações",
          resposta: form.observacoes || "—",
        },
      ];

      const dadosCompletos = {
        titulo: checklistObj.bombaId || "Checklist Bomba",
        usuario_id: payload?.id,
        id_filial: combinedForm.id_filial,
        respostas: {
          checklist: checklistArray,
          ensaio: ensaioArray,
        },
        id_ativo: true,
      };

      await api.post("/formularios", dadosCompletos);

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
    <div className="min-h-screen bg-gray-100">
      {/* CONTAINER */}
      <div
        className="
        max-w-5xl
        mx-auto
        px-3
        sm:px-4
        md:px-6
        py-4
        md:py-6
      "
      >
        {/* HEADER */}
        <div
          className="
          bg-white
          rounded-3xl
          shadow-md
          p-5
          md:p-7
          mb-5
          text-center
        "
        >
          <h1
            className="
            text-2xl
            md:text-3xl
            font-bold
            text-gray-800
          "
          >
            Ensaio / Aferição
          </h1>

          <p className="text-sm md:text-base text-gray-500 mt-2">
            Preencha os dados do ensaio antes de concluir
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4 md:space-y-5 pb-32">
          {ensaioAfericaoItems.map((item: any) => (
            <div
              key={item.id}
              className="
              bg-white
              rounded-2xl
              shadow-sm
              p-4
              md:p-5
            "
            >
              <ChecklistField
                item={item}
                formData={combinedForm}
                onChange={handleChange}
              />
            </div>
          ))}

          {/* OBSERVAÇÕES */}
          <div
            className="
            bg-white
            rounded-2xl
            shadow-sm
            p-4
            md:p-5
          "
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Observações
            </h2>

            <textarea
              value={form.observacoes || ""}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Digite observações adicionais..."
              className="
              w-full
              border
              border-gray-300
              rounded-2xl
              p-4
              min-h-[140px]
              resize-none
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              text-sm
              md:text-base
            "
            />
          </div>
        </div>
      </div>

      {/* ACTIONS MOBILE */}
      <div
        className="
        fixed
        bottom-0
        left-0
        right-0
        bg-white
        border-t
        shadow-2xl
        p-3
        md:hidden
        z-50
      "
      >
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleBack}
            className="
            py-3
            rounded-2xl
            bg-gray-400
            hover:bg-gray-500
            text-white
            font-semibold
            transition
            text-sm
          "
          >
            Voltar
          </button>

          <button
            onClick={handleCancel}
            className="
            py-3
            rounded-2xl
            bg-red-500
            hover:bg-red-600
            text-white
            font-semibold
            transition
            text-sm
          "
          >
            Cancelar
          </button>

          <button
            onClick={handleConclude}
            className="
            py-3
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            text-white
            font-semibold
            transition
            text-sm
          "
          >
            Concluir
          </button>
        </div>
      </div>

      {/* ACTIONS DESKTOP */}
      <div
        className="
        hidden
        md:flex
        justify-end
        gap-3
        max-w-5xl
        mx-auto
        px-6
        py-6
      "
      >
        <button
          onClick={handleBack}
          className="
          px-6
          py-3
          rounded-xl
          bg-gray-400
          hover:bg-gray-500
          text-white
          font-medium
          transition
        "
        >
          Voltar
        </button>

        <button
          onClick={handleCancel}
          className="
          px-6
          py-3
          rounded-xl
          bg-red-500
          hover:bg-red-600
          text-white
          font-medium
          transition
        "
        >
          Cancelar
        </button>

        <button
          onClick={handleConclude}
          className="
          px-6
          py-3
          rounded-xl
          bg-blue-600
          hover:bg-blue-700
          text-white
          font-medium
          transition
        "
        >
          Concluir
        </button>
      </div>
    </div>
  );
}
