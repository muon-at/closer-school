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
    <Card className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="label-mono text-bone/50">— {label}</span>
        {icon && (
          <span aria-hidden className="text-signal">
            {icon}
          </span>
        )}
      </div>
      <span className="font-mono text-3xl font-semibold tracking-tight text-bone">{value}</span>
      {sub && <span className="font-mono text-xs text-bone/50">{sub}</span>}
    </Card>
  );
}
