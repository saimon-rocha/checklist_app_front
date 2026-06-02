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
  const hasDefeito = selectedValue === "Sim";

  function handleToggle() {
    onChange(hasDefeito ? "Não" : "Sim");
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
        flex
        flex-col
        gap-4
      "
    >
      {/* LABEL */}
      <h3 className="text-base md:text-lg font-bold text-slate-700">
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
          cursor-pointer
          group
        "
      >
        {/* SWITCH */}
        <div
          className={`
            relative
            w-16
            h-9
            rounded-full
            transition-all
            duration-300
            shadow-inner
            ${hasDefeito ? "bg-rose-500 shadow-rose-600/20" : "bg-emerald-500 shadow-emerald-600/20"}
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
              shadow-lg
              transition-all
              duration-300
              ease-[cubic-bezier(0.34,1.56,0.64,1)]
              group-active:scale-90
              ${hasDefeito ? "translate-x-8" : "translate-x-1"}
            `}
          />
        </div>

        {/* STATUS */}
        <span
          className={`
            text-sm
            md:text-base
            font-bold
            tracking-wide
            transition-colors
            duration-300
            ${hasDefeito ? "text-rose-600" : "text-emerald-600"}
          `}
        >
          {hasDefeito ? "Sim" : "Não"}
        </span>
      </button>
    </div>
  );
}