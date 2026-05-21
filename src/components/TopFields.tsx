"use client";

import { useEffect, useState } from "react";

import PerguntaTexto from "../components/PerguntaTexto";

import "../styles/TopFields.css";

interface TopFieldsProps {
  formData: {
    bombaId?: string;
    data?: string;
  };

  onChange: (field: string, value: string) => void;
}

export default function TopFields({
  formData,
  onChange,
}: TopFieldsProps) {

  const [today, setToday] = useState("");

  useEffect(() => {
    const date = new Date();

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const year = date.getFullYear();

    const formatted = `${day}/${month}/${year}`;

    setToday(formatted);

    if (!formData.data) {
      onChange("data", formatted);
    }

  }, [onChange, formData.data]);

  return (
    <div className="topFieldsContainer">

      <div className="topField">
        <PerguntaTexto
          label="Identificação do Bico"
          placeholder="Bico...."
          value={formData.bombaId || ""}
          onChange={(val) => onChange("bombaId", val)}
        />
      </div>

      <div className="topField">
        <PerguntaTexto
          label="Data"
          placeholder="DD/MM/AAAA"
          value={formData.data || today}
          onChange={(val) => onChange("data", val)}
          readOnly
        />
      </div>

    </div>
  );
}