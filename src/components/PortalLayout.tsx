import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { getCurrentUser, isDemoMode } from '../lib/data';

const nav = [
  { to: '/portal', label: 'Dashbord', icon: '📊', end: true },
  { to: '/portal/kurs', label: 'Kurs', icon: '🎓' },
  { to: '/portal/ai-coach', label: 'AI-coach', icon: '🤖' },
  { to: '/portal/eksamen', label: 'Eksamen', icon: '📝' },
  { to: '/portal/community', label: 'Community', icon: '💬' },
  { to: '/portal/jobber', label: 'Jobber', icon: '💼' },
  { to: '/portal/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/portal/profil', label: 'Profil', icon: '👤' },
];

export default function PortalLayout() {
  const [open, setOpen] = useState(false);
  const user = getCurrentUser();

  const navItems = nav.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-amber-500/10 text-amber-400'
            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <span aria-hidden>{item.icon}</span>
      {item.label}
    </NavLink>
  ));

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 p-4 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-black text-zinc-950">
            C
          </span>
          Closerskolen
        </Link>
        <nav className="flex flex-1 flex-col gap-1">{navItems}</nav>
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-xs">
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-zinc-400">{user.cohort}</p>
          {isDemoMode && (
            <p className="mt-1 text-amber-400">Demo-modus (uten Supabase)</p>
          )}
        </div>
      </aside>

      {/* Mobil-toppbar */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-zinc-950/90 px-4 backdrop-blur lg:hidden">
          <Link to="/" className="font-bold text-white">
            Closerskolen
          </Link>
          <button
            className="rounded-lg border border-white/15 p-2 text-zinc-300"
            onClick={() => setOpen(!open)}
            aria-label="Portalmeny"
          >
            ☰
          </button>
        </header>
        {open && (
          <nav className="border-b border-white/10 bg-zinc-950 p-3 lg:hidden">
            {navItems}
          </nav>
        )}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
