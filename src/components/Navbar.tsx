import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from './Button';

const links = [
  { to: '/garanti', label: 'Jobbgarantien' },
  { to: '/vilkar', label: 'Vilkår' },
  { to: '/logg-inn', label: 'Logg inn' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-black text-zinc-950">
            C
          </span>
          Closerskolen
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="text-sm text-zinc-300 hover:text-white"
            >
              {l.label}
            </NavLink>
          ))}
          <Button to="/pamelding" size="sm">
            Søk plass på kull 3
          </Button>
        </div>
        <button
          className="rounded-lg border border-white/15 p-2 text-zinc-300 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Meny"
        >
          <span aria-hidden>☰</span>
        </button>
      </nav>
      {open && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="text-sm text-zinc-300"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <Button to="/pamelding" size="sm">
              Søk plass på kull 3
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
