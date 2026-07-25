import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t-2 border-signal bg-bone text-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3">
        <div>
          <p className="label-mono mb-3 text-ink/50">— Closerskolen</p>
          <p className="max-w-xs text-sm leading-relaxed text-ink/80">
            Norges eneste salgsutdanning med jobbgaranti. Fra null til closer
            på 8 uker.
          </p>
        </div>
        <div>
          <p className="label-mono mb-4 text-ink/50">— Lenker</p>
          <ul className="space-y-2.5 font-mono text-[13px] uppercase tracking-[0.06em]">
            <li>
              <Link to="/pamelding" className="text-ink/80 hover:text-signal">
                Søk plass
              </Link>
            </li>
            <li>
              <Link to="/garanti" className="text-ink/80 hover:text-signal">
                Jobbgarantien — fulle vilkår
              </Link>
            </li>
            <li>
              <Link to="/vilkar" className="text-ink/80 hover:text-signal">
                Kjøpsvilkår og angrerett
              </Link>
            </li>
            <li>
              <Link to="/logg-inn" className="text-ink/80 hover:text-signal">
                Logg inn
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="label-mono mb-4 text-ink/50">— Kontakt</p>
          <ul className="space-y-2.5 font-mono text-[13px] text-ink/80">
            <li>hei@closerskolen.no</li>
            <li>Muon Holding AS</li>
            <li>Org.nr: [settes inn]</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line-ink">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
          © {new Date().getFullYear()} Closerskolen / Muon Holding AS. 14
          dagers angrerett etter angrerettloven.
        </div>
      </div>
      {/* Stor wordmark nederst — signaturgrep */}
      <div className="overflow-hidden border-t border-line-ink" aria-hidden>
        <p className="select-none whitespace-nowrap text-center font-display text-[17vw] uppercase leading-[0.8] tracking-tight text-ink/90 sm:text-[12vw]">
          Closerskolen
        </p>
      </div>
    </footer>
  );
}
