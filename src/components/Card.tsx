import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accent?: 'none' | 'amber' | 'green';
}

export default function Card({
  children,
  accent = 'none',
  className = '',
  ...rest
}: CardProps) {
  const accentCls =
    accent === 'amber'
      ? 'border-amber-500/30 bg-amber-500/5'
      : accent === 'green'
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-white/10 bg-zinc-900/60';
  return (
    <div className={`rounded-2xl border p-6 ${accentCls} ${className}`} {...rest}>
      {children}
    </div>
  );
}
