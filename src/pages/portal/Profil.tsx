import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import ProgressBar from '../../components/ProgressBar';
import {
  getCurrentUser,
  getLessons,
  getModules,
  getProgress,
  isDemoMode,
  __resetDemoState,
} from '../../lib/data';
import { supabase } from '../../lib/supabase';
import type { Lesson, Module, Progress } from '../../lib/types';

export default function Profil() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  async function load() {
    const [p, m, l] = await Promise.all([getProgress(), getModules(), getLessons()]);
    setProgress(p);
    setModules(m);
    setLessons(l);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetDemo() {
    __resetDemoState();
    void load();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    navigate('/logg-inn');
  }

  if (!progress) return <p className="label-mono text-bone/50">Laster …</p>;

  const certified =
    progress.examTheoryPassed && progress.examAiPassed && progress.examRealCallPassed;

  // 90-dagers nedtelling etter bestått eksamen
  let daysLeft: number | null = null;
  if (certified && progress.examPassedDate) {
    const passed = new Date(progress.examPassedDate).getTime();
    const deadline = passed + 90 * 24 * 3600 * 1000;
    daysLeft = Math.max(0, Math.ceil((deadline - Date.now()) / (24 * 3600 * 1000)));
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <p className="label-mono mb-3 text-signal">— Profil</p>
            <h1 className="font-display text-2xl uppercase leading-[0.95] tracking-tight text-bone sm:text-4xl">
              {user.name}
            </h1>
          </div>
          <p className="label-mono text-bone/50">
            {user.age} år · {user.cohort}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* VENSTRE: progresjon, sertifikat, garanti */}
        <div className="space-y-8 lg:col-span-2">
          {/* Progresjon — moduler som mini-stepper */}
          <section className="border border-line">
            <p className="label-mono border-b border-line p-4 text-bone/50">
              — Progresjon
            </p>
            <div className="space-y-4 p-4 sm:p-5">
              {modules.map((m) => {
                const ml = lessons.filter((l) => l.moduleSlug === m.slug);
                const done = ml.filter((l) =>
                  progress.completedLessons.includes(l.slug),
                ).length;
                const complete = done === ml.length && ml.length > 0;
                return (
                  <div key={m.id} className="flex items-center gap-4">
                    <span
                      className={`font-display text-lg leading-none ${
                        complete ? 'text-win' : done > 0 ? 'text-signal' : 'text-bone/25'
                      }`}
                    >
                      {String(m.order).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-bone/80">
                          {m.title}
                        </span>
                        <span className="label-mono shrink-0 text-bone/40">
                          {done}/{Math.max(1, ml.length)}
                        </span>
                      </div>
                      <ProgressBar
                        value={done}
                        max={Math.max(1, ml.length)}
                        tone={complete ? 'green' : 'amber'}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-line pt-4">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-bone/80">
                    Godkjente AI-samtaler (krav: 25)
                  </span>
                  <span className="label-mono shrink-0 text-bone/40">
                    {progress.approvedCoachSessions}/25
                  </span>
                </div>
                <ProgressBar value={progress.approvedCoachSessions} max={25} />
              </div>
            </div>
          </section>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Sertifikat */}
            <section className={`border p-5 ${certified ? 'border-win bg-win/5' : 'border-line'}`}>
              <p className="label-mono text-bone/50">— Sertifikatstatus</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  { ok: progress.examTheoryPassed, label: 'Teorieksamen' },
                  { ok: progress.examAiPassed, label: 'AI-eksamenssamtale (≥80)' },
                  { ok: progress.examRealCallPassed, label: 'Ekte kundesamtale med sensor' },
                ].map((s) => (
                  <li
                    key={s.label}
                    className={`flex items-center gap-2.5 font-mono text-xs ${
                      s.ok ? 'text-win' : 'text-bone/50'
                    }`}
                  >
                    {s.ok ? (
                      <Icon name="check" size={13} />
                    ) : (
                      <span className="inline-block h-3 w-3 border border-line" aria-hidden />
                    )}
                    {s.label}
                  </li>
                ))}
              </ul>
              <p className="label-mono mt-4 border-t border-line pt-3 text-bone/40">
                {certified
                  ? 'Gratulerer — du er sertifisert closer!'
                  : 'Fullfør alle tre stegene for å bli sertifisert'}
              </p>
            </section>

            {/* Garanti */}
            <section className={`border p-5 ${certified ? 'border-win bg-win/5' : 'border-line'}`}>
              <p className="label-mono flex items-center gap-2 text-bone/50">
                <Icon name="shield" size={13} />
                — Garantistatus
              </p>
              {certified && daysLeft !== null ? (
                <div className="mt-4">
                  <p className="font-mono text-5xl font-semibold tracking-tight text-win">
                    {daysLeft}
                    <span className="ml-2 label-mono text-bone/40">dager igjen</span>
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-bone/60">
                    av 90-dagersperioden. Får du ikke jobbtilbud innen fristen,
                    refunderer vi 100 % — se garantivilkårene.
                  </p>
                  <ProgressBar value={90 - daysLeft} max={90} tone="green" className="mt-4" />
                </div>
              ) : (
                <div className="mt-4">
                  <p className="font-mono text-5xl font-semibold tracking-tight text-bone/25">
                    90
                    <span className="ml-2 label-mono text-bone/40">dager</span>
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-bone/60">
                    Garantiperioden starter dagen du består hele eksamen.
                  </p>
                  <p className="label-mono mt-3 inline-block border border-line px-2 py-0.5 text-bone/50">
                    Ikke startet
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Siste AI-samtaler — scoreboard-rader */}
          <section className="border border-line">
            <p className="label-mono border-b border-line p-4 text-bone/50">
              — Siste AI-samtaler
            </p>
            <div className="px-4 sm:px-5">
              {progress.coachSessions.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0"
                >
                  <span className="font-mono text-xs text-bone/70">
                    {s.personaName} · nivå {s.difficulty} · {s.date}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${
                      s.scorecard.approved ? 'text-win' : 'text-bone/50'
                    }`}
                  >
                    {s.scorecard.total}/100
                    {s.scorecard.approved && <Icon name="check" size={13} />}
                  </span>
                </div>
              ))}
              {progress.coachSessions.length === 0 && (
                <p className="label-mono py-4 text-bone/40">
                  Ingen samtaler ennå — gå til AI-coachen!
                </p>
              )}
            </div>
          </section>
        </div>

        {/* HØYRE: konto */}
        <div className="space-y-8">
          <section className="border border-line p-5">
            <p className="label-mono text-bone/50">— Kontoinfo</p>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="label-mono text-bone/40">Navn</dt>
                <dd className="mt-0.5 font-mono text-sm text-bone">{user.name}</dd>
              </div>
              <div>
                <dt className="label-mono text-bone/40">E-post</dt>
                <dd className="mt-0.5 break-all font-mono text-sm text-bone">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="label-mono text-bone/40">Kull</dt>
                <dd className="mt-0.5 font-mono text-sm text-bone">{user.cohort}</dd>
              </div>
            </dl>
          </section>

          <section className="border border-line p-5">
            <p className="label-mono text-bone/50">— Varsler</p>
            <div className="mt-4 space-y-3">
              {[
                'E-postvarsler om nye jobber',
                'SMS-påminnelse om streak',
                'Vis meg på leaderboard',
              ].map((label) => (
                <label
                  key={label}
                  className="flex items-center justify-between gap-3 font-mono text-xs text-bone/70"
                >
                  {label}
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#FF4D00]" />
                </label>
              ))}
            </div>
          </section>

          <section className="border border-line p-5">
            <p className="label-mono text-bone/50">— Konto</p>
            <div className="mt-4 space-y-3">
              {isDemoMode && (
                <>
                  <p className="label-mono text-signal">
                    Demo-modus: innstillinger lagres ikke. Koble til Supabase for
                    full funksjonalitet.
                  </p>
                  <Button variant="secondary" size="sm" onClick={resetDemo} className="w-full">
                    Nullstill demo
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => void logout()} className="w-full border border-line">
                <Icon name="logout" size={14} /> Logg ut
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
