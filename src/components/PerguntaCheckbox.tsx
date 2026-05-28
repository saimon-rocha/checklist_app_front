"use client";

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
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        p-5
        shadow-sm
        space-y-4
      "
    >
      {/* LABEL */}
      <h3 className="text-base md:text-lg font-semibold text-gray-800">
        {label}
      </h3>

      {/* OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const checked = selectedValues.includes(option);

          return (
            <label
              key={option}
              className={`
                flex
                items-center
                gap-3
                border
                rounded-2xl
                px-4
                py-3
                cursor-pointer
                transition
                select-none
                ${
                  checked
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }
              `}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(option)}
                className="
                  w-4
                  h-4
                  accent-blue-600
                  cursor-pointer
                "
              />

              <span className="text-sm md:text-base text-gray-700">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}