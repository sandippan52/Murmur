interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) {
  const styles = {
    primary:
      "bg-white text-black hover:bg-zinc-200",

    secondary:
      "border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800",

    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}