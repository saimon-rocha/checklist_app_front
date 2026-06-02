"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import PerguntaRadio from "../../../components/PerguntaRadio";
import PerguntaTexto from "../../../components/PerguntaTexto";
import PerguntaRadioDefeito from "../../../components/PerguntaRadioDefeito";
import PerguntaRadioNaoAvaliar from "../../../components/PerguntaRadioNaoAvaliar";
import TopFields from "../../../components/TopFields";

import "../../../styles/ChecklistBomba.css";
import { checklistItems } from "../../../utils/checklistStructure";
import { toast } from "react-toastify";

const getToday = () => new Date().toLocaleDateString("pt-BR");

/* ================= FIELD ================= */
function ChecklistField({ item, formData, onChange }: any) {
  if (item.dependsOn && formData[item.dependsOn] !== item.showIf) {
    return null;
  }

  return (
    <>
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
    </>
  );
}

/* ================= PAGE ================= */
export default function ChecklistBomba() {
  const router = useRouter();

  const [filiais, setFiliais] = useState<any[]>([]);
  const [filialSelecionada, setFilialSelecionada] = useState<number | null>(
    null,
  );

  const initialState = checklistItems.reduce(
    (acc, item) => {
      if (item.type === "checkbox") {
        acc[item.id] = [];
      } else if (item.type === "radio") {
        acc[item.id] = item.defaultValue ?? "Não";
      } else {
        acc[item.id] = "";
      }

      return acc;
    },
    {
      bombaId: "",
      data: getToday(),
      id_filial: "",
    },
  );

  const [form, setForm] = useState<any>(() => {
    if (typeof window === "undefined") return initialState;

    const saved = localStorage.getItem("checklistBombaForm");
    return saved ? JSON.parse(saved) : initialState;
  });

  /* ================= LOAD USER ================= */
  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      data: getToday(),
    }));

    const user = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    // GARANTIA TOTAL CONTRA UNDEFINED
    const userFiliais = Array.isArray(user?.filiais) ? user.filiais : [];

    setFiliais(userFiliais);

    if (userFiliais.length > 0) {
      const filialId = userFiliais[0]?.id;

      if (filialId) {
        setFilialSelecionada(filialId);

        setForm((prev: any) => ({
          ...prev,
          id_filial: filialId,
        }));
      }
    }
  }, []);

  /* ================= CHANGE ================= */
  function handleChange(field: string, value: any) {
    const newForm = {
      ...form,
      [field]: value,
    };

    setForm(newForm);
    localStorage.setItem("checklistBombaForm", JSON.stringify(newForm));
  }

  /* ================= AVANÇAR ================= */
  function handleAvancar() {
    if (!form.id_filial) {
      toast.warning("Filial não identificada para o usuário.");
      return;
    }

    const updatedForm = {
      ...form,
      id_filial: filialSelecionada,
    };

    localStorage.setItem("checklistBombaForm", JSON.stringify(updatedForm));

    router.push("/checklist/ensaio");
  }

  /* ================= CANCELAR ================= */
  function handleCancelar() {
    toast.warn("Operação Cancelada");

    const resetForm = {
      ...initialState,
      data: getToday(),
      id_filial: filialSelecionada,
    };

    setForm(resetForm);

    localStorage.removeItem("checklistBombaForm");
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* CONTAINER */}
      <div
        className="
        w-full
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
            Checklist da Bomba Medidora
          </h1>

          <p
            className="
            text-sm
            md:text-base
            text-slate-400
            font-medium
            mt-2
          "
          >
            Preencha todas as verificações antes de avançar para a próxima etapa
          </p>
        </div>

        {/* TOP FIELDS */}
        <div className="mb-6">
          <TopFields
            formData={form}
            onChange={handleChange}
            filiais={filiais}
          />
        </div>

        {/* LISTA */}
        <div
          className="
          space-y-4
          pb-28
        "
        >
          {checklistItems.map((item: any) => (
            <ChecklistField
              key={item.id}
              item={item}
              formData={form}
              onChange={handleChange}
            />
          ))}
        </div>
      </div>

      {/* BOTÕES MOBILE FIXOS */}
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
        <div className="flex gap-3">
          <button
            onClick={handleCancelar}
            className="
              flex-1
              py-3.5
              rounded-2xl
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
            Cancelar
          </button>

          <button
            onClick={handleAvancar}
            className="
              flex-1
              py-3.5
              rounded-2xl
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
            Avançar
          </button>
        </div>
      </div>

      {/* BOTÕES DESKTOP */}
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
          onClick={handleCancelar}
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
          Cancelar
        </button>

        <button
          onClick={handleAvancar}
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
          Avançar
        </button>
      </div>
    </div>
  );
}
