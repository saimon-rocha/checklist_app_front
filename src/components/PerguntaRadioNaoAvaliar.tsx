"use client";

import "../styles/PerguntaRadio.css";

interface PerguntaRadioNaoAvaliarProps {
  label: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function PerguntaRadioNaoAvaliar({
  label,
  selectedValue,
  onChange,
}: PerguntaRadioNaoAvaliarProps) {
  const value = selectedValue || "Sim";

  const isDisabled = value === "NAO_AVALIADO";

  function handleToggle() {
    if (isDisabled) return;

    const newValue = value === "Sim" ? "Não" : "Sim";

    onChange(newValue);
  }

  function handleNaoAvaliar() {
    onChange("NAO_AVALIADO");
  }

  function handleVoltar() {
    onChange("Sim");
  }

  return (
    <div
      className={`
        bg-white
        rounded-2xl
        border
        border-slate-100
        p-5
        shadow-[0_4px_20px_rgba(0,0,0,0.02)]
        transition-all
        duration-300
        ${isDisabled ? "opacity-60 bg-slate-50/50" : "hover:border-slate-200/80"}
      `}
    >
      {/* LABEL */}
      <div className="mb-4">
        <span className="text-base md:text-lg font-bold text-slate-700">
          {label}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* TOGGLE */}
        <div
          className="toggleSwitch"
          onClick={handleToggle}
          style={{
            pointerEvents: isDisabled ? "none" : "auto",
          }}
        >
          <div className={`toggleTrack ${value === "Sim" ? "sim" : "nao"}`}>
            <div className="toggleThumb" />
          </div>

          <div className="toggleLabels">
            <span className="labelSim">Sim</span>
            <span className="labelNao">Não</span>
          </div>
        </div>

        {/* BUTTON */}
        {!isDisabled ? (
          <button
            type="button"
            onClick={handleNaoAvaliar}
            className="
              px-4
              py-2
              rounded-xl
              border
              border-slate-200
              hover:bg-slate-50
              hover:border-slate-300
              text-xs
              font-bold
              text-slate-500
              hover:text-slate-700
              transition-all
              duration-200
              cursor-pointer
            "
          >
            Não avaliar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleVoltar}
            className="
              px-4
              py-2
              rounded-xl
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              text-xs
              font-bold
              transition-all
              duration-200
              cursor-pointer
              shadow-sm
              shadow-indigo-500/10
            "
          >
            Avaliar Item
          </button>
        )}
      </div>

      {/* STATUS */}
      {isDisabled && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-xs text-slate-400 font-medium italic">
            Pergunta não avaliada
          </span>
        </div>
      )}
    </div>
  );
}
