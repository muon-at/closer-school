import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accent?: 'none' | 'amber' | 'green';
  /** Liten mono-etikett i øvre høyre hjørne, f.eks. «GARANTI» / «LIVE» */
  cornerTag?: string;
}

export default function Card({
  children,
  accent = 'none',
  cornerTag,
  className = '',
  ...rest
}: CardProps) {
  const accentCls =
    accent === 'amber'
      ? 'border-signal bg-signal/5'
      : accent === 'green'
        ? 'border-win/60 bg-win/5'
        : 'border-line bg-ink';
  return (
    <div className={`relative rounded-none border p-6 ${accentCls} ${className}`} {...rest}>
      {cornerTag && (
        <span className="label-mono absolute right-0 top-0 border-b border-l border-line bg-ink px-2 py-1 text-[10px] text-signal">
          {cornerTag}
        </span>
      )}
      {children}
    </div>
  );
}
