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
import "../../../../styles/EnsaioAfericao.css";
import "../../../../styles/ChecklistBomba.css";
import api from "../../../../service/api";

interface ChecklistFieldProps {
  item: any;
  formData: any;
  onChange: (field: string, value: any) => void;
}

function ChecklistField({ item, formData, onChange }: ChecklistFieldProps) {
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

function parseJwt(token: string) {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function EnsaioAfericaoPage() {
  const router = useRouter();

  const initialState = ensaioAfericaoItems.reduce((acc: any, item: any) => {
    if (item.type === "checkbox") {
      acc[item.id] = [];
    } else if (item.type === "radio") {
      acc[item.id] = "nao";
    } else {
      acc[item.id] = "";
    }

    return acc;
  }, {});

  const [form, setForm] = useState<any>(() => {
    if (typeof window === "undefined") {
      return initialState;
    }

    const saved = localStorage.getItem("ensaioForm");

    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem("ensaioForm", JSON.stringify(form));
  }, [form]);

  function handleChange(field: string, value: any) {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleBack() {
    router.push("/checklist");
  }

  function handleCancel() {
    toast.warning("Operação Cancelada");

    setForm(initialState);

    localStorage.removeItem("ensaioForm");
  }

  async function handleConclude() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Usuário não autenticado");

        router.replace("/login");

        return;
      }

      const payload = parseJwt(token);

      // =========================
      // CHECKLIST SALVO
      // =========================
      const checklistSalvo = localStorage.getItem("checklistBombaForm");

      const checklistObj = checklistSalvo ? JSON.parse(checklistSalvo) : {};

      console.log("CHECKLIST OBJ:", checklistObj);

      // =========================
      // CHECKLIST ARRAY
      // =========================
      const checklistArray = checklistItems.map((item: any) => ({
        id: item.id,

        label: item.label || item.placeholder || item.id,

        resposta: checklistObj[item.id] || "",
      }));

      console.log("CHECKLIST ARRAY:", checklistArray);

      // =========================
      // ENSAIO ARRAY
      // =========================
      const ensaioArray = ensaioAfericaoItems.map((item: any) => ({
        id: item.id,

        label: item.label || item.placeholder || item.id,

        resposta: form[item.id] || "",
      }));

      console.log("ENSAIO ARRAY:", ensaioArray);

      // =========================
      // DADOS COMPLETOS
      // =========================
      const dadosCompletos = {
        titulo: checklistObj.bombaId || "Checklist Bomba",

        usuario_id: payload?.id,

        id_posto: payload?.id_posto,

        respostas: {
          checklist: checklistArray,

          ensaio: ensaioArray,
        },

        id_ativo: true,
      };

      console.log("DADOS COMPLETOS:", dadosCompletos);

      // =========================
      // SALVAR
      // =========================
      await api.post("/arquivos", dadosCompletos);

      // =========================
      // LIMPAR
      // =========================
      setForm(initialState);

      localStorage.removeItem("ensaioForm");

      localStorage.removeItem("checklistBombaForm");

      toast.success("Checklist salvo com sucesso!");

      setTimeout(() => {
        router.push("/checklist");
      }, 1500);
    } catch (error: any) {
      console.error(error);

      toast.error(error?.response?.data?.error || "Erro ao salvar checklist");
    }
  }

  return (
    <div className="container-ensaio my-4">
      <h1 className="title mb-4">Ensaio / Aferição</h1>

      <div
        className="mb-4"
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {ensaioAfericaoItems.map((item: any) => (
          <ChecklistField
            key={item.id}
            item={item}
            formData={form}
            onChange={handleChange}
          />
        ))}

        <h4>Observações</h4>

        <textarea
          className="form-control"
          rows={3}
          value={form.observacoes || ""}
          onChange={(e) => handleChange("observacoes", e.target.value)}
        />
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-secondary" onClick={handleBack}>
          Voltar
        </button>

        <button className="btn btn-danger" onClick={handleCancel}>
          Cancelar
        </button>

        <button className="btn btn-primary" onClick={handleConclude}>
          Concluir
        </button>
      </div>
    </div>
  );
}
