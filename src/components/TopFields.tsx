"use client";

import { useEffect, useState } from "react";
import PerguntaTexto from "../components/PerguntaTexto";
import "../styles/TopFields.css";

interface TopFieldsProps {
  formData: {
    bombaId?: string;
    data?: string;
    id_posto?: number;
  };

  onChange: (field: string, value: any) => void;

  postos: { id: number; nome: string }[];
  postoSelecionado: number | null;
  setPostoSelecionado: (id: number) => void;
}

export default function TopFields({
  formData,
  onChange,
  postos,
  postoSelecionado,
  setPostoSelecionado,
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
    <div className="topFieldsContainer">
      
      {/* POSTO */}
      <div className="topField">
        <label>Posto</label>

        <select
          value={formData.id_posto || ""}
          onChange={(e) => onChange("id_posto", Number(e.target.value))}
        >
          <option value="">Selecione</option>

          {postos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {/* BICO */}
      <div className="topField">
        <PerguntaTexto
          label="Identificação do Bico"
          placeholder="Bico...."
          value={formData.bombaId || ""}
          onChange={(val) => onChange("bombaId", val)}
        />
      </div>

      {/* DATA */}
      <div className="topField">
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
