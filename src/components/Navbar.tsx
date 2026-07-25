import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from './Button';
import Icon from './Icon';

const links = [
  { to: '/garanti', label: 'Jobbgarantien' },
  { to: '/vilkar', label: 'Vilkår' },
  { to: '/logg-inn', label: 'Logg inn' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="font-display text-lg uppercase tracking-tight text-bone"
        >
          Closer<span className="text-signal">skolen</span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `label-mono transition-colors ${
                  isActive ? 'text-signal' : 'text-bone/70 hover:text-bone'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Button to="/pamelding" size="sm">
            Søk plass på kull 3
          </Button>
        </div>
        <button
          className="border border-line p-2 text-bone/80 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Meny"
        >
          <Icon name={open ? 'x' : 'menu'} size={18} />
        </button>
      </nav>
      {open && (
        <div className="border-t border-line px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="label-mono text-bone/80"
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
