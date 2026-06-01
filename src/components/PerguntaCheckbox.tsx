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
        border-slate-100
        p-5
        shadow-[0_4px_20px_rgba(0,0,0,0.02)]
        hover:border-slate-200/80
        transition-all
        duration-300
        space-y-4
      "
    >
      {/* LABEL */}
      <h3 className="text-base md:text-lg font-bold text-slate-700">
        {label}
      </h3>

      {/* OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                py-3.5
                cursor-pointer
                transition-all
                duration-200
                select-none
                ${
                  checked
                    ? "border-indigo-500 bg-indigo-50/40 text-indigo-900 font-medium"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
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
                  accent-indigo-600
                  cursor-pointer
                  rounded-md
                "
              />

              <span className="text-sm md:text-base">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}