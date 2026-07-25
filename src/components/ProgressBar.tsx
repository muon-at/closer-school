export default function ProgressBar({
  value,
  max = 100,
  tone = 'amber',
  className = '',
  showPct = false,
}: {
  value: number;
  max?: number;
  tone?: 'amber' | 'green';
  className?: string;
  /** Vis mono-prosent til høyre for baren */
  showPct?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="h-2.5 w-full border border-line bg-bone/5"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
      >
        <div
          className={`h-full transition-all ${tone === 'green' ? 'bg-win' : 'bg-signal'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showPct && <span className="label-mono shrink-0 text-bone/60">{Math.round(pct)}%</span>}
    </div>
  );
}
