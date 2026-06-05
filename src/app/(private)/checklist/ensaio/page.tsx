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
    if (item.type === "checkbox") {
      acc[item.id] = [];
    } else if (item.type === "radio") {
      acc[item.id] = item.defaultValue ?? "Não";
    } else {
      acc[item.id] = "";
    }

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
        id_usuario: payload?.id,
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
    <div className="min-h-screen bg-slate-50/50">
      {/* CONTAINER */}
      <div
        className="
        max-w-5xl
        mx-auto
        px-4
        sm:px-6
        py-6
        md:py-8
      "
      >
        {/* HEADER */}
        <div
          className="
          bg-white
          rounded-[2rem]
          border
          border-slate-100
          shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          p-6
          md:p-8
          mb-6
          text-center
        "
        >
          <h1
            className="
            text-2xl
            md:text-3xl
            font-extrabold
            text-slate-800
            tracking-tight
          "
          >
            Ensaio / Aferição
          </h1>

          <p className="text-sm md:text-base text-slate-400 font-medium mt-2">
            Preencha os dados do ensaio antes de concluir o checklist
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4 pb-32">
          {ensaioAfericaoItems.map((item: any) => (
            <ChecklistField
              key={item.id}
              item={item}
              formData={combinedForm}
              onChange={handleChange}
            />
          ))}

          {/* OBSERVAÇÕES */}
          <div
            className="
            bg-white
            rounded-2xl
            border
            border-slate-100
            shadow-[0_4px_20px_rgba(0,0,0,0.02)]
            p-5
            space-y-3
          "
          >
            <h2 className="text-base md:text-lg font-bold text-slate-700">
              Observações
            </h2>

            <textarea
              value={form.observacoes || ""}
              onChange={(e) => handleChange("observacoes", e.target.value)}
              placeholder="Digite observações adicionais se necessário..."
              className="
                w-full
                border
                border-slate-200
                rounded-2xl
                p-4
                min-h-[140px]
                resize-none
                outline-none
                bg-slate-50/50
                focus:bg-white
                focus:border-indigo-500
                focus:ring-4
                focus:ring-indigo-500/10
                text-sm
                md:text-base
                transition-all
                duration-300
                placeholder-slate-400
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
        bg-white/90
        backdrop-blur-md
        border-t
        border-slate-100
        shadow-2xl
        p-4
        md:hidden
        z-50
      "
      >
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleBack}
            className="
              py-3.5
              rounded-2xl
              bg-slate-100
              hover:bg-slate-200
              text-slate-600
              font-bold
              transition-all
              duration-200
              active:scale-[0.98]
              text-xs
              cursor-pointer
            "
          >
            Voltar
          </button>

          <button
            onClick={handleCancel}
            className="
              py-3.5
              rounded-2xl
              bg-rose-50
              hover:bg-rose-100
              text-rose-600
              font-bold
              transition-all
              duration-200
              active:scale-[0.98]
              text-xs
              cursor-pointer
            "
          >
            Cancelar
          </button>

          <button
            onClick={handleConclude}
            className="
              py-3.5
              rounded-2xl
              premium-gradient-bg
              hover:opacity-95
              text-white
              font-bold
              transition-all
              duration-200
              active:scale-[0.98]
              text-xs
              cursor-pointer
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
        mb-6
      "
      >
        <button
          onClick={handleBack}
          className="
            px-6
            py-3
            rounded-xl
            bg-slate-100
            hover:bg-slate-200
            text-slate-600
            font-bold
            transition-all
            duration-200
            active:scale-[0.98]
            cursor-pointer
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
            bg-rose-50
            hover:bg-rose-100
            text-rose-600
            font-bold
            transition-all
            duration-200
            active:scale-[0.98]
            cursor-pointer
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
            premium-gradient-bg
            hover:opacity-95
            text-white
            font-bold
            transition-all
            duration-200
            active:scale-[0.98]
            shadow-lg
            shadow-indigo-500/10
            cursor-pointer
          "
        >
          Concluir
        </button>
      </div>
    </div>
  );
}
