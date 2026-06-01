"use client";

import { useEffect, useState } from "react";

import PerguntaTexto from "../components/PerguntaTexto";

interface TopFieldsProps {
  formData: {
    bombaId?: string;
    data?: string;
    id_filial?: number;
  };

  onChange: (field: string, value: any) => void;

  filiais: { id: number; nome: string }[];
}

export default function TopFields({
  formData,
  onChange,
}: TopFieldsProps) {
  const [today, setToday] = useState("");

  useEffect(() => {
    const date = new Date();

    const formatted = `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}/${date.getFullYear()}`;

    setToday(formatted);

    if (!formData.data) {
      onChange("data", formatted);
    }
  }, [onChange, formData.data]);

  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-slate-100
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        p-5
        md:p-8
        space-y-6
      "
    >
      {/* HEADER */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
          Informações Iniciais
        </h2>

        <p className="text-sm text-slate-400 mt-1 font-medium">
          Preencha os dados básicos da aferição
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* BICO */}
        <PerguntaTexto
          label="Identificação do Bico"
          placeholder="Digite o identificador do bico"
          value={formData.bombaId || ""}
          onChange={(val) => onChange("bombaId", val)}
        />

        {/* DATA */}
        <PerguntaTexto
          label="Data da Aferição"
          value={formData.data || today}
          onChange={() => {}}
          readOnly
        />
      </div>
    </div>
  );
}