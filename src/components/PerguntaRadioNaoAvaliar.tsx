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
      className="perguntaContainer"
      style={{
        opacity: isDisabled ? 0.45 : 1,
        transition: "0.2s",
      }}
    >
      <span className="questionLabel">{label}</span>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
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

        {!isDisabled && (
          <button
            className="btn btn-outline-secondary btn-sm btnNaoAvaliar"
            onClick={handleNaoAvaliar}
            type="button"
          >
            Não avaliar
          </button>
        )}

        {isDisabled && (
          <button
            className="btn btn-secondary btn-sm btnNaoAvaliar"
            onClick={handleVoltar}
            type="button"
          >
            Avaliar
          </button>
        )}
      </div>

      {isDisabled && (
        <small style={{ color: "#6c757d" }}>
          Não avaliado
        </small>
      )}
    </div>
  );
}