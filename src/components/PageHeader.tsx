// Konsistent side-header for portalen: mono-eyebrow, display-tittel og
// valgfri nøkkel-stat i mono til høyre. Avsluttes med 1px delelinje.
import type { ReactNode } from 'react';

export default function PageHeader({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  /** Nøkkel-stat e.l. i mono, vises til høyre på sm+ */
  right?: ReactNode;
}) {
  return (
    <div className="border-b border-line pb-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="label-mono mb-3 text-signal">— {eyebrow}</p>
          <h1 className="font-display text-2xl uppercase leading-[0.95] tracking-tight text-bone sm:text-4xl">
            {title}
          </h1>
        </div>
        {right && <div className="shrink-0 text-right">{right}</div>}
      </div>
      {sub && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone/60">{sub}</p>
      )}
    </div>
  );
}
