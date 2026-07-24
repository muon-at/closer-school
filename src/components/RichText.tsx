// Enkel renderer for leksjonstekstene (## overskrift, - punkt, > sitat, avsnitt).
import { Fragment } from 'react';

export default function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} className="pt-2 text-xl font-bold text-white">
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 italic text-amber-100"
            >
              {trimmed
                .split('\n')
                .map((l) => l.replace(/^> ?/, ''))
                .map((l, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {l}
                  </Fragment>
                ))}
            </blockquote>
          );
        }
        if (/^([0-9]+\.|-) /.test(trimmed)) {
          const items = trimmed.split('\n').filter(Boolean);
          return (
            <ul key={i} className="space-y-2 pl-1">
              {items.map((item, j) => (
                <li key={j} className="flex gap-3 text-zinc-300">
                  <span className="mt-1 text-amber-500" aria-hidden>
                    •
                  </span>
                  <span>{item.replace(/^([0-9]+\.|-) /, '')}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed text-zinc-300">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
