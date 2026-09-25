"use client";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url" | "tel";
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  maxLength,
}: TextFieldProps) {
  return (
    <label>
      <span>{label}</span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}