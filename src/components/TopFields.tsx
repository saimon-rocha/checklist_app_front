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

  role: string;
}

export default function TopFields({
  formData,
  onChange,
  filiais = [],
  role,
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
      <div
        className={`
          grid
          gap-4
          ${
            role === "gestor" || role === "master"
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2"
          }
        `}
      >
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

        {/* FILIAL */}
        {(role === "gestor" || role === "master") && (
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Filial
            </label>

            <select
              value={formData.id_filial || ""}
              onChange={(e) =>
                onChange("id_filial", Number(e.target.value))
              }
              className="
                border
                border-gray-300
                rounded-2xl
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-blue-500
                bg-white
              "
            >
              <option value="">Selecione uma filial</option>

              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
