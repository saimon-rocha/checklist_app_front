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
  const hoje = new Date();

  return hoje.toLocaleDateString("pt-BR");
};

function ChecklistField({ item, formData, onChange }: any) {
  if (item.dependsOn && formData[item.dependsOn] !== item.showIf) {
    return null;
  }

  return (
    <Card>
      {item.type === "radio" &&
        item.allowNotEvaluate && (
          <PerguntaRadioNaoAvaliar
            label={item.label}
            selectedValue={formData[item.id]}
            onChange={(val: string) =>
              onChange(item.id, val)
            }
          />
        )}

      {item.type === "radio" &&
        !item.allowNotEvaluate &&
        !item.dangerOnSim && (
          <PerguntaRadio
            label={item.label}
            selectedValue={formData[item.id]}
            onChange={(val: string) =>
              onChange(item.id, val)
            }
          />
        )}

      {item.type === "radio" &&
        item.dangerOnSim && (
          <PerguntaRadioDefeito
            label={item.label}
            selectedValue={formData[item.id]}
            onChange={(val: string) =>
              onChange(item.id, val)
            }
          />
        )}

      {item.type === "text" && (
        <PerguntaTexto
          label={item.label}
          placeholder={item.placeholder}
          value={formData[item.id]}
          onChange={(val: string) =>
            onChange(item.id, val)
          }
        />
      )}
    </Card>
  );
}

export default function ChecklistBomba() {
  const router = useRouter();

  const initialState = checklistItems.reduce(
    (acc: any, item: any) => {
      if (item.type === "checkbox") {
        acc[item.id] = [];
      } else if (item.type === "radio") {
        acc[item.id] = "nao";
      } else {
        acc[item.id] = "";
      }

      return acc;
    },
    {
      bombaId: "",
      data: getToday(),
    }
  );

  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(
        "checklistBombaForm"
      );

      return saved
        ? JSON.parse(saved)
        : initialState;
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

    localStorage.setItem(
      "checklistBombaForm",
      JSON.stringify(newForm)
    );
  }

  function handleAvancar() {
    router.push("/ensaio");
  }

  function handleCancelar() {
    toast.warn("Operação Cancelada");

    const resetForm = {
      ...initialState,
      data: getToday(),
    };

    setForm(resetForm);

    localStorage.removeItem(
      "checklistBombaForm"
    );
  }

  return (
    <div className="container-checklist">
      <h1 className="title">
        Checklist da Bomba Medidora
      </h1>

      <TopFields
        formData={form}
        onChange={handleChange}
      />

      <div
        className="mb-4"
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {checklistItems.map((item: any) => (
          <ChecklistField
            key={item.id}
            item={item}
            formData={form}
            onChange={handleChange}
          />
        ))}

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={handleCancelar}
          >
            Cancelar
          </button>

          <button
            className="btn btn-primary"
            onClick={handleAvancar}
          >
            Avançar
          </button>
        </div>
      </div>
    </div>
  );
}