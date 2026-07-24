import type { ReactNode } from 'react';

type Tone = 'amber' | 'green' | 'zinc' | 'red';

const tones: Record<Tone, string> = {
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  zinc: 'bg-white/5 text-zinc-300 border-white/15',
  red: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function Badge({
  children,
  tone = 'zinc',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
