import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import MediaPlaceholder from '../components/MediaPlaceholder';
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
    'w-full rounded-none border border-line bg-bone/5 px-4 py-3 text-sm text-bone placeholder-bone/30 focus:border-signal focus:outline-none';
  const labelCls = 'label-mono mb-2 block text-bone/60';

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex flex-1">
        <div className="mx-auto grid w-full max-w-6xl lg:grid-cols-2">
          {/* VENSTRE: skjema (ink) */}
          <div className="flex flex-col justify-center px-4 py-16 lg:pr-16">
            <p className="label-mono text-signal">— Studentportalen</p>
            <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone">
              {mode === 'login' ? 'Logg inn' : 'Opprett konto'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-bone/60">
              {mode === 'login'
                ? 'Velkommen tilbake til Closerskolen-portalen.'
                : 'For deg som har fått studieplass på Closerskolen.'}
            </p>
            <form onSubmit={handleLogin} className="mt-10 space-y-6">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="login-name" className={labelCls}>
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
                <label htmlFor="login-email" className={labelCls}>
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
                <label htmlFor="login-password" className={labelCls}>
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
                <p className="border border-red-500/60 bg-red-500/10 p-3 font-mono text-sm text-red-300">
                  {error}
                </p>
              )}
              {info && (
                <p className="border border-win/60 bg-win/10 p-3 font-mono text-sm text-win">
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
              className="label-mono mt-6 w-full text-center text-bone/50 underline-offset-4 hover:text-signal hover:underline"
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

            {isDemoMode && (
              <div className="mt-10 border-t border-line pt-8 text-center">
                <p className="label-mono mb-4 text-bone/40">— eller —</p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/portal')}
                >
                  Fortsett som demo-student Jonas (18)
                </Button>
                <p className="label-mono mt-4 leading-relaxed text-bone/40">
                  Demo-modus: hele portalen med realistisk innhold, ingen konto
                  nødvendig.
                </p>
              </div>
            )}
          </div>

          {/* HØYRE: bone-panel */}
          <div className="hidden flex-col justify-center border-l border-line bg-bone px-10 py-16 text-ink lg:flex xl:px-16">
            <p className="label-mono text-signal">— Fra salgsgulvet</p>
            <p className="mt-5 font-display text-5xl uppercase leading-[0.95] tracking-tight xl:text-6xl">
              Alt du trenger er sult.
            </p>
            <MediaPlaceholder
              kind="image"
              ratio="3/4"
              tone="bone"
              label="Studenter på samling — energibilde"
              className="mt-10 max-w-sm"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
