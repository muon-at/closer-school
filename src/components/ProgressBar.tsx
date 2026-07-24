export default function ProgressBar({
  value,
  max = 100,
  tone = 'amber',
  className = '',
}: {
  value: number;
  max?: number;
  tone?: 'amber' | 'green';
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-white/10 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full transition-all ${tone === 'green' ? 'bg-emerald-500' : 'bg-amber-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
