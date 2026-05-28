"use client";

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
  const isSim = selectedValue === "sim";

  function handleToggle() {
    onChange(isSim ? "nao" : "sim");
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
            ${isSim ? "bg-green-500" : "bg-red-500"}
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
              ${isSim ? "translate-x-8" : "translate-x-1"}
            `}
          />
        </div>

        {/* TEXT */}
        <span
          className={`
            text-sm
            md:text-base
            font-semibold
            transition
            ${isSim ? "text-green-600" : "text-red-500"}
          `}
        >
          {isSim ? "Sim" : "Não"}
        </span>
      </button>
    </div>
  );
}
