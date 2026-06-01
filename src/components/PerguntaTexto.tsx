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
        border-slate-100
        rounded-2xl
        p-5
        shadow-[0_4px_20px_rgba(0,0,0,0.02)]
        space-y-2
      "
    >
      {/* LABEL */}
      {label && (
        <label className="text-sm md:text-base font-bold text-slate-700">
          {label}
        </label>
      )}

      {/* SUBTITLE */}
      {subtitle && (
        <span className="block text-xs font-medium text-slate-400">{subtitle}</span>
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
          py-3.5
          text-base
          transition-all
          duration-300
          outline-none
          ${
            readOnly
              ? "bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed"
              : `
                bg-slate-50/50
                border-slate-200
                focus:bg-white
                focus:border-indigo-500
                focus:ring-4
                focus:ring-indigo-500/10
                placeholder-slate-400
              `
          }
        `}
      />
    </div>
  );
}
