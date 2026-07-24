import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import { supabase, isDemoMode } from '../lib/supabase';

export default function LoggInn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError(
        'Supabase er ikke konfigurert i dette miljøet. Bruk demo-knappen under for å utforske portalen.',
      );
      return;
    }
    setLoading(true);
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
        <h1 className="text-center text-3xl font-black text-white">Logg inn</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Velkommen tilbake til Closerskolen-portalen.
        </p>
        <Card className="mt-8">
          <form onSubmit={handleLogin} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logger inn …' : 'Logg inn'}
            </Button>
          </form>
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
