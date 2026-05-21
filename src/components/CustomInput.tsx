"use client";

interface CustomInputProps {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

export default function CustomInput({
  value,
  setValue,
  placeholder = "",
  secureTextEntry = false,
}: CustomInputProps) {
  const containerStyle = {
    backgroundColor: "#f2f2f2",
    width: "100%",
    border: "1px solid #e8e8e8",
    borderRadius: "10px",
    padding: "0 15px",
    margin: "8px 0",
  };

  const inputStyle = {
    height: "50px",
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "16px",
    color: "#333",
  };

  return (
    <div style={containerStyle}>
      <input
        type={secureTextEntry ? "password" : "text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}