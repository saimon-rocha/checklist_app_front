"use client";

import "../styles/PerguntaRadio.css";

interface PerguntaRadioDefeitoProps {
  label: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function PerguntaRadioDefeito({
  label,
  selectedValue,
  onChange,
}: PerguntaRadioDefeitoProps) {

  function handleToggle() {
    const newValue = selectedValue === "sim" ? "nao" : "sim";
    onChange(newValue);
  }

  const trackClass = `toggleTrack ${
    selectedValue === "sim" ? "nao" : "sim"
  }`;

  return (
    <div className="perguntaContainer">
      <span className="questionLabel">{label}</span>

      <div className="toggleSwitch" onClick={handleToggle}>
        <div className={trackClass}>
          <div className="toggleThumb" />
        </div>

        <div className="toggleLabels">
          <span className="labelSim">Não</span>
          <span className="labelNao">Sim</span>
        </div>
      </div>
    </div>
  );
}