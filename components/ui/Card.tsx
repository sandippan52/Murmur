interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/10 ${className}`}
    >
      {children}
    </div>
  );
}