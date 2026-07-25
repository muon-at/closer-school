import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, loadUserContext, isDemoMode } from '../lib/data';
import { supabase } from '../lib/supabase';
import Icon, { type IconName } from './Icon';

const nav: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/portal', label: 'Dashbord', icon: 'chart', end: true },
  { to: '/portal/kurs', label: 'Kurs', icon: 'clipboard' },
  { to: '/portal/ai-coach', label: 'AI-coach', icon: 'mic' },
  { to: '/portal/eksamen', label: 'Eksamen', icon: 'target' },
  { to: '/portal/community', label: 'Community', icon: 'chat' },
  { to: '/portal/jobber', label: 'Jobber', icon: 'briefcase' },
  { to: '/portal/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { to: '/portal/profil', label: 'Profil', icon: 'user' },
];

export default function PortalLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  // Auth-guard i produksjonsmodus: uten Supabase-sesjon → /logg-inn.
  // I demo-modus (ingen Supabase-config) er portalen åpen med mock-data.
  const [authChecked, setAuthChecked] = useState(isDemoMode);
  const [user, setUser] = useState(getCurrentUser);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        navigate('/logg-inn', { replace: true });
        return;
      }
      // Fyll bruker-cachen (navn/opptak fra profiles) FØR portalen rendres,
      // slik at synkrone getCurrentUser()-kall i undersidene får ekte data.
      await loadUserContext();
      if (!active) return;
      setUser(getCurrentUser());
      setAuthChecked(true);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="label-mono flex min-h-screen items-center justify-center bg-ink text-bone/60">
        Laster …
      </div>
    );
  }

  const navItems = nav.map((item, i) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 border-l-2 px-3 py-2.5 font-mono text-[13px] uppercase tracking-[0.08em] transition-colors ${
          isActive
            ? 'border-signal bg-signal/10 text-signal'
            : 'border-transparent text-bone/60 hover:border-line hover:bg-bone/5 hover:text-bone'
        }`
      }
    >
      <span className="w-6 font-mono text-[10px] text-bone/30">
        {String(i + 1).padStart(2, '0')}
      </span>
      <Icon name={item.icon} size={16} />
      {item.label}
    </NavLink>
  ));

  return (
    <div className="flex min-h-screen bg-ink">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line p-4 lg:flex">
        <Link
          to="/"
          className="mb-8 px-2 font-display text-lg uppercase tracking-tight text-bone"
        >
          Closer<span className="text-signal">skolen</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5">{navItems}</nav>
        <div className="border border-line p-3">
          <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-bone">
            {user.name}
          </p>
          <p className="label-mono mt-1 text-bone/50">{user.cohort}</p>
          {isDemoMode && (
            <p className="label-mono mt-2 border-t border-line pt-2 text-signal">
              Demo-modus (uten Supabase)
            </p>
          )}
        </div>
      </aside>

      {/* Mobil-toppbar */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ink/95 px-4 backdrop-blur-sm lg:hidden">
          <Link to="/" className="font-display text-base uppercase tracking-tight text-bone">
            Closer<span className="text-signal">skolen</span>
          </Link>
          <button
            className="border border-line p-2 text-bone/80"
            onClick={() => setOpen(!open)}
            aria-label="Portalmeny"
          >
            <Icon name={open ? 'x' : 'menu'} size={18} />
          </button>
        </header>
        {open && (
          <nav className="border-b border-line bg-ink p-3 lg:hidden">{navItems}</nav>
        )}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
