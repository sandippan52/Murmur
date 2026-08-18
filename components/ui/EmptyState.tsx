interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
}

export default function EmptyState({
  emoji,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">

      <div className="text-6xl">

        {emoji}

      </div>

      <h2 className="text-white text-2xl font-bold mt-4">

        {title}

      </h2>

      <p className="text-zinc-400 mt-2">

        {description}

      </p>

    </div>
  );
}