import type { ReactNode } from 'react';
import Card from './Card';

export default function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        {icon && <span aria-hidden>{icon}</span>}
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
      {sub && <span className="text-xs text-zinc-400">{sub}</span>}
    </Card>
  );
}
