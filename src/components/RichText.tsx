// Enkel renderer for leksjonstekstene (## overskrift, - punkt, > sitat, avsnitt)
// i «Salgsgulvet»-stil: display-overskrifter, signal-markører, kantete sitatbokser.
import { Fragment } from 'react';

export default function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={i}
              className="pt-4 font-display text-lg uppercase leading-tight tracking-tight text-bone sm:text-xl"
            >
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-signal bg-signal/5 p-4 font-mono text-sm leading-relaxed text-bone/80"
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
            <ul key={i} className="space-y-2.5">
              {items.map((item, j) => (
                <li key={j} className="flex gap-3 text-sm leading-relaxed text-bone/70 sm:text-base">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-signal" aria-hidden />
                  <span>{item.replace(/^([0-9]+\.|-) /, '')}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-bone/70 sm:text-base">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
