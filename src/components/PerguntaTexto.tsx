"use client";

import "../styles/PerguntaTexto.css";

interface PerguntaTextoProps {
  label?: string;
  subtitle?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  numeric?: boolean;
}

export default function PerguntaTexto({
  label,
  subtitle,
  placeholder,
  value,
  onChange,
  readOnly = false,
  numeric = false,
}: PerguntaTextoProps) {

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;

    if (numeric) {
      // Permite apenas números positivos ou negativos
      if (/^-?\d*$/.test(val)) {
        onChange(val);
      }

      return;
    }

    onChange(val);
  }

  return (
    <div className="perguntaTexto">
      {label && (
        <label className="perguntaLabel">
          {label}
        </label>
      )}

      {subtitle && (
        <span className="perguntaSubtitle">
          {subtitle}
        </span>
      )}

      <input
        className="perguntaInput"
        placeholder={placeholder}
        value={value}
        onChange={readOnly ? undefined : handleChange}
        type="text"
        readOnly={readOnly}
      />
    </div>
  );
}