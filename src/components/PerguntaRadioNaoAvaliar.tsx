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
  const value = selectedValue || "sim";

  const isDisabled = value === "NAO_AVALIADO";

  function handleToggle() {
    if (isDisabled) return;

    const newValue = value === "sim" ? "nao" : "sim";

    onChange(newValue);
  }

  function handleNaoAvaliar() {
    onChange("NAO_AVALIADO");
  }

  function handleVoltar() {
    onChange("sim");
  }

  return (
    <div
      className={`
        bg-white
        rounded-2xl
        border
        border-gray-200
        p-4
        shadow-sm
        transition
        ${isDisabled ? "opacity-50" : ""}
      `}
    >
      {/* LABEL */}
      <div className="mb-4">
        <span className="text-sm md:text-base font-semibold text-gray-800">
          {label}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* TOGGLE */}
        <div
          className="toggleSwitch"
          onClick={handleToggle}
          style={{
            pointerEvents: isDisabled ? "none" : "auto",
          }}
        >
          <div
            className={`toggleTrack ${
              value === "sim" ? "sim" : "nao"
            }`}
          >
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
              border-gray-300
              hover:bg-gray-100
              text-sm
              font-medium
              transition
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
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm
              font-medium
              transition
            "
          >
            Avaliar
          </button>
        )}
      </div>

      {/* STATUS */}
      {isDisabled && (
        <div className="mt-3">
          <span className="text-sm text-gray-500 italic">
            Pergunta não avaliada
          </span>
        </div>
      )}
    </div>
  );
}