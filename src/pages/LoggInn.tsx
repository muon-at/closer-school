import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import { supabase, isDemoMode } from '../lib/supabase';

export default function LoggInn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!supabase) {
      setError(
        'Supabase er ikke konfigurert i dette miljøet. Bruk demo-knappen under for å utforske portalen.',
      );
      return;
    }
    setLoading(true);
    if (mode === 'signup') {
      if (fullName.trim().split(/\s+/).length < 2) {
        setLoading(false);
        setError('Skriv fullt navn (fornavn og etternavn).');
        return;
      }
      if (password.length < 8) {
        setLoading(false);
        setError('Passordet må være minst 8 tegn.');
        return;
      }
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      setLoading(false);
      if (authError) {
        setError('Kunne ikke opprette konto. Er e-posten allerede registrert?');
        return;
      }
      if (!data.session) {
        // E-postbekreftelse er påslått i Supabase-prosjektet
        setInfo('Konto opprettet! Sjekk e-posten din for bekreftelseslenke, og logg inn etterpå.');
        setMode('login');
        return;
      }
      navigate('/portal');
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError('Feil e-post eller passord. Prøv igjen.');
      return;
    }
    navigate('/portal');
  }

  const inputCls =
    'w-full rounded-xl border border-white/15 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none';

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-center text-3xl font-black text-white">
          {mode === 'login' ? 'Logg inn' : 'Opprett konto'}
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {mode === 'login'
            ? 'Velkommen tilbake til Closerskolen-portalen.'
            : 'For deg som har fått studieplass på Closerskolen.'}
        </p>
        <Card className="mt-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="login-name"
                  className="mb-1 block text-sm font-medium text-zinc-300"
                >
                  Fullt navn
                </label>
                <input
                  id="login-name"
                  type="text"
                  className={inputCls}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ola Nordmann"
                />
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-zinc-300">
                E-post
              </label>
              <input
                id="login-email"
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deg@epost.no"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-zinc-300">
                Passord
              </label>
              <input
                id="login-password"
                type="password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                {info}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Vent litt …'
                : mode === 'login'
                  ? 'Logg inn'
                  : 'Opprett konto'}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-zinc-400 underline-offset-4 hover:text-amber-400 hover:underline"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setInfo(null);
            }}
          >
            {mode === 'login'
              ? 'Ny student? Opprett konto her'
              : 'Har du allerede konto? Logg inn'}
          </button>
        </Card>

        {isDemoMode && (
          <div className="mt-6 text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
              — eller —
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/portal')}
            >
              🎮 Fortsett som demo-student Jonas (18)
            </Button>
            <p className="mt-3 text-xs text-zinc-500">
              Demo-modus: hele portalen med realistisk innhold, ingen konto
              nødvendig.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
