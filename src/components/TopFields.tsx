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
  filiais = [],
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
        shadow-lg
        p-4
        md:p-6
        space-y-4
      "
    >
      {/* HEADER */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Informações iniciais
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Preencha os dados básicos da aferição
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BICO */}
        <PerguntaTexto
          label="Identificação do Bico"
          placeholder="Digite o identificador"
          value={formData.bombaId || ""}
          onChange={(val) => onChange("bombaId", val)}
        />

        {/* DATA */}
        <PerguntaTexto
          label="Data"
          value={formData.data || today}
          onChange={() => {}}
          readOnly
        />
      </div>
    </div>
  );
}
