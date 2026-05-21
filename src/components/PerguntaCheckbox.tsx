"use client";

import "../styles/PerguntaCheckbox.css";

interface PerguntaCheckboxProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function PerguntaCheckbox({
  label,
  options,
  selectedValues,
  onChange,
}: PerguntaCheckboxProps) {

  function handleToggle(option: string) {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];

    onChange(newValues);
  }

  return (
    <div className="perguntaContainer">
      <span className="questionLabel">{label}</span>

      <div className="checkboxGroup">
        {options.map((option) => (
          <label key={option} className="checkboxLabel">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={() => handleToggle(option)}
            />

            {option}
          </label>
        ))}
      </div>
    </div>
  );
}