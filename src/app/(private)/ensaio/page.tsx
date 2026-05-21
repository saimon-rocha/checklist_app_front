"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Card from "../../../components/Card";
import PerguntaTexto from "../../../components/PerguntaTexto";
import PerguntaRadio from "../../../components/PerguntaRadio";
import PerguntaRadioDefeito from "../../../components/PerguntaRadioDefeito";
import PerguntaCheckbox from "../../../components/PerguntaCheckbox";

import { ensaioAfericaoItems } from "../../../utils/checklistStructure";

import { salvarEnsaioOffline } from "../../../utils/storage";

import { toast } from "react-toastify";

import "../../../styles/EnsaioAfericao.css";

interface ChecklistFieldProps {
  item: any;
  formData: any;
  onChange: (field: string, value: any) => void;
}

function ChecklistField({
  item,
  formData,
  onChange,
}: ChecklistFieldProps) {

  if (
    item.dependsOn &&
    formData[item.dependsOn] !== item.showIf
  ) {
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

  const initialState = ensaioAfericaoItems.reduce(
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
    {}
  );

  const [form, setForm] = useState<any>(() => {

    if (typeof window === "undefined") {
      return initialState;
    }

    const saved = localStorage.getItem("ensaioForm");

    return saved
      ? JSON.parse(saved)
      : initialState;
  });

  useEffect(() => {

    localStorage.setItem(
      "ensaioForm",
      JSON.stringify(form)
    );

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

  function handleConclude() {

    try {

      const token = localStorage.getItem("token");

      const payload = token
        ? parseJwt(token)
        : null;

      const primeiroForm = JSON.parse(
        localStorage.getItem("checklistBombaForm") || "{}"
      );

      const ensaioArray = Object.keys(form).map((key) => ({
        id: key,

        label:
          ensaioAfericaoItems.find(
            (i: any) => i.id === key
          )?.label || key,

        resposta: form[key],
      }));

      const filiais = JSON.parse(
        localStorage.getItem("filiais") || "[]"
      );

      const filialSelecionada = filiais.find(
        (f: any) =>
          String(f.id) === String(payload?.filial) ||
          String(f.id) === String(payload?.filial_id) ||
          String(f.simpleId) === String(payload?.filial)
      );

      const usuarioLogado = JSON.parse(
        localStorage.getItem("usuarioLogado") ||
          '{"username":"offlineUser"}'
      );

      const dadosCompletos = {
        checklist: primeiroForm,

        ensaio: ensaioArray,

        usuario: usuarioLogado.username,

        filial_id: filialSelecionada?.id || "1",

        filial_nome:
          filialSelecionada?.nome || "—",

        titulo:
          primeiroForm.bombaId || "Não Definido",

        data: new Date().toISOString(),

        id: Date.now() + Math.random(),
      };

      salvarEnsaioOffline(dadosCompletos);

      setForm(initialState);

      localStorage.removeItem("ensaioForm");

      localStorage.removeItem(
        "checklistBombaForm"
      );

      toast.success(
        "Dados salvos com sucesso!"
      );

      setTimeout(() => {
        router.push("/checklist");
      }, 1500);

    } catch (error) {

      console.error(error);

      toast.error(
        "Erro ao salvar os dados offline!"
      );
    }
  }

  return (
    <div className="container-ensaio my-4">

      <h1 className="title mb-4">
        Ensaio / Aferição
      </h1>

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
          onChange={(e) =>
            handleChange(
              "observacoes",
              e.target.value
            )
          }
        />

      </div>

      <div className="d-flex justify-content-end gap-2">

        <button
          className="btn btn-secondary"
          onClick={handleBack}
        >
          Voltar
        </button>

        <button
          className="btn btn-danger"
          onClick={handleCancel}
        >
          Cancelar
        </button>

        <button
          className="btn btn-primary"
          onClick={handleConclude}
        >
          Concluir
        </button>

      </div>

    </div>
  );
}