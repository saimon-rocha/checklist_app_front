"use client";

interface CustomButtonProps {
  onClick?: () => void;
  text: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export default function CustomButton({
  onClick,
  text,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}: CustomButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        w-full
        py-3
        px-4
        rounded-2xl
        font-semibold
        text-white
        transition
        shadow-md
        ${
          loading || disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }
        ${className}
      `}
    >
      {loading ? "Carregando..." : text}
    </button>
  );
}