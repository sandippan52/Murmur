interface StatCardProps {
  value: number;
  label: string;
}

export default function StatCard({
  value,
  label,
}: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center flex-1">

      <div className="text-2xl font-bold text-white">

        {value}

      </div>

      <div className="text-zinc-400 mt-1">

        {label}

      </div>

    </div>
  );
}