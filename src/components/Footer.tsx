import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-lg font-bold text-white">Closerskolen</p>
          <p className="text-sm text-zinc-400">
            Norges eneste salgsutdanning med jobbgaranti. Fra null til closer på
            8 uker.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Lenker
          </p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>
              <Link to="/pamelding" className="hover:text-white">
                Søk plass
              </Link>
            </li>
            <li>
              <Link to="/garanti" className="hover:text-white">
                Jobbgarantien — fulle vilkår
              </Link>
            </li>
            <li>
              <Link to="/vilkar" className="hover:text-white">
                Kjøpsvilkår og angrerett
              </Link>
            </li>
            <li>
              <Link to="/logg-inn" className="hover:text-white">
                Logg inn
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Kontakt
          </p>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>hei@closerskolen.no</li>
            <li>Muon Holding AS</li>
            <li>Org.nr: [settes inn]</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Closerskolen / Muon Holding AS. 14 dagers
        angrerett etter angrerettloven.
      </div>
    </footer>
  );
}
