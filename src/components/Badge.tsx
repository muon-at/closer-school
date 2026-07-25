import type { ReactNode } from 'react';

type Tone = 'amber' | 'green' | 'zinc' | 'red';

const tones: Record<Tone, string> = {
  amber: 'border-signal text-signal',
  green: 'border-win text-win',
  zinc: 'border-line text-bone/70',
  red: 'border-red-500/60 text-red-400',
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
      className={`label-mono inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
