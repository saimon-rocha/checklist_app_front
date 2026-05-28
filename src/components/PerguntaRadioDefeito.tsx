"use client";

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
  const hasDefeito = selectedValue === "sim";

  function handleToggle() {
    onChange(hasDefeito ? "nao" : "sim");
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
        flex
        flex-col
        gap-4
      "
    >
      {/* LABEL */}
      <h3 className="text-base md:text-lg font-semibold text-gray-800">
        {label}
      </h3>

      {/* TOGGLE */}
      <button
        type="button"
        onClick={handleToggle}
        className="
          flex
          items-center
          gap-4
          w-fit
          select-none
        "
      >
        {/* SWITCH */}
        <div
          className={`
            relative
            w-16
            h-9
            rounded-full
            transition
            duration-300
            ${
              hasDefeito
                ? "bg-red-500"
                : "bg-green-500"
            }
          `}
        >
          <div
            className={`
              absolute
              top-1
              w-7
              h-7
              bg-white
              rounded-full
              shadow-md
              transition-all
              duration-300
              ${
                hasDefeito
                  ? "translate-x-8"
                  : "translate-x-1"
              }
            `}
          />
        </div>

        {/* STATUS */}
        <span
          className={`
            text-sm
            md:text-base
            font-semibold
            transition
            ${
              hasDefeito
                ? "text-red-500"
                : "text-green-600"
            }
          `}
        >
          {hasDefeito ? "Com defeito" : "Sem defeito"}
        </span>
      </button>
    </div>
  );
}