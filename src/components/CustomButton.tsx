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
  const buttonStyle = {
    backgroundColor: "#3b71f3",
    width: "100%",
    padding: "8px",
    margin: "10px 0",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: loading || disabled ? "not-allowed" : "pointer",
    opacity: loading || disabled ? 0.7 : 1,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={buttonStyle}
      className={className}
    >
      {loading ? "Carregando..." : text}
    </button>
  );
}