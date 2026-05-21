"use client";

import "../styles/PerguntaRadio.css";

interface PerguntaRadioProps {
  label: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function PerguntaRadio({
  label,
  selectedValue,
  onChange,
}: PerguntaRadioProps) {

  function handleToggle() {
    const newValue = selectedValue === "sim" ? "nao" : "sim";
    onChange(newValue);
  }

  return (
    <div className="perguntaContainer">
      <span className="questionLabel">{label}</span>

      <div className="toggleSwitch" onClick={handleToggle}>
        <div className={`toggleTrack ${selectedValue}`}>
          <div className="toggleThumb" />
        </div>

        <div className="toggleLabels">
          <span className="labelSim">Sim</span>
          <span className="labelNao">Não</span>
        </div>
      </div>
    </div>
  );
}