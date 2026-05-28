"use client";

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
    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-2xl
        p-4
        shadow-sm
        space-y-2
      "
    >
      {/* LABEL */}
      {label && (
        <label className="text-sm md:text-base font-semibold text-gray-800">
          {label}
        </label>
      )}

      {/* SUBTITLE */}
      {subtitle && (
        <span className="block text-sm text-gray-500">{subtitle}</span>
      )}

      {/* INPUT */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={readOnly ? undefined : handleChange}
        readOnly={readOnly}
        className={`
          w-full
          rounded-2xl
          border
          px-4
          py-3
          text-base
          transition
          outline-none
          ${
            readOnly
              ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
              : `
                bg-white
                border-gray-300
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
              `
          }
        `}
      />
    </div>
  );
}
