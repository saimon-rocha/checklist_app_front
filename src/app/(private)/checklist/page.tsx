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

import api from "../../../service/api";

const getToday = () => new Date().toLocaleDateString("pt-BR");

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

  const [filiais, setFiliais] = useState<any[]>([]);

  const [role, setRole] = useState("");

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

    carregarDadosUsuario();
  }, []);

  async function carregarDadosUsuario() {
    const user = JSON.parse(
      localStorage.getItem("usuarioLogado") || "null",
    );

    const userRole = user?.role || "";

    setRole(userRole);

    // =====================================
    // MASTER
    // =====================================

    if (userRole === "master") {
      await carregarTodasFiliais();

      return;
    }

    // =====================================
    // GESTOR / FUNCIONÁRIO
    // =====================================

    const userFiliais = Array.isArray(user?.filiais)
      ? user.filiais
      : [];

    setFiliais(userFiliais);

    // =====================================
    // FUNCIONÁRIO
    // =====================================

    if (userRole === "funcionario") {
      const filialId = userFiliais[0]?.id;

      if (filialId) {
        setForm((prev: any) => ({
          ...prev,
          id_filial: filialId,
        }));
      }
    }
  }

  /* ================= LOAD FILIAIS ================= */

  async function carregarTodasFiliais() {
    try {
      const response = await api.get("/filiais");

      const filiaisAtivas = response.data.filter((f: any) =>
        Boolean(f.id_ativo),
      );

      setFiliais(filiaisAtivas);
    } catch {
      toast.error("Erro ao carregar filiais");
    }
  }

  /* ================= CHANGE ================= */

  function handleChange(field: string, value: any) {
    const newForm = {
      ...form,
      [field]: value,
    };

    setForm(newForm);

    localStorage.setItem(
      "checklistBombaForm",
      JSON.stringify(newForm),
    );
  }

  /* ================= AVANÇAR ================= */

  function handleAvancar() {
    if (!form.id_filial) {
      toast.warning("Selecione uma filial.");

      return;
    }

    localStorage.setItem(
      "checklistBombaForm",
      JSON.stringify(form),
    );

    router.push("/checklist/ensaio");
  }

  /* ================= CANCELAR ================= */

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
    <div className="min-h-screen bg-gray-100">
      {/* CONTAINER */}
      <div
        className="
        w-full
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
            Checklist da Bomba Medidora
          </h1>

          <p
            className="
            text-sm
            md:text-base
            text-gray-500
            mt-2
          "
          >
            Preencha todas as verificações antes de avançar
          </p>
        </div>

        {/* TOP FIELDS */}
        <div className="mb-5">
          <TopFields
            formData={form}
            onChange={handleChange}
            filiais={filiais}
            role={role}
          />
        </div>

        {/* LISTA */}
        <div
          className="
          space-y-4
          md:space-y-5
          pb-28
        "
        >
          {checklistItems.map((item: any) => (
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
                formData={form}
                onChange={handleChange}
              />
            </div>
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
        bg-white
        border-t
        shadow-2xl
        p-3
        md:hidden
        z-50
      "
      >
        <div className="flex gap-3">
          <button
            onClick={handleCancelar}
            className="
            flex-1
            py-3
            rounded-2xl
            bg-gray-500
            hover:bg-gray-600
            text-white
            font-semibold
            transition
          "
          >
            Cancelar
          </button>

          <button
            onClick={handleAvancar}
            className="
            flex-1
            py-3
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            text-white
            font-semibold
            transition
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
      "
      >
        <button
          onClick={handleCancelar}
          className="
          px-6
          py-3
          rounded-xl
          bg-gray-500
          hover:bg-gray-600
          text-white
          font-medium
          transition
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
          bg-blue-600
          hover:bg-blue-700
          text-white
          font-medium
          transition
        "
        >
          Avançar
        </button>
      </div>
    </div>
  );
}