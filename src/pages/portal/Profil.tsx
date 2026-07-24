import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import {
  getCurrentUser,
  getLessons,
  getModules,
  getProgress,
  isDemoMode,
  __resetDemoState,
} from '../../lib/data';
import type { Lesson, Module, Progress } from '../../lib/types';

export default function Profil() {
  const user = getCurrentUser();
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

  if (!progress) return <p className="text-zinc-400">Laster …</p>;

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-2xl font-black text-amber-400">
          {user.name[0]}
        </span>
        <div>
          <h1 className="text-2xl font-black text-white">{user.name}</h1>
          <p className="text-sm text-zinc-400">
            {user.age} år · {user.cohort}
          </p>
        </div>
      </div>

      {/* Progresjon */}
      <Card>
        <h2 className="font-bold text-white">Progresjon</h2>
        <div className="mt-4 space-y-4">
          {modules.map((m) => {
            const ml = lessons.filter((l) => l.moduleSlug === m.slug);
            const done = ml.filter((l) => progress.completedLessons.includes(l.slug)).length;
            return (
              <div key={m.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-300">Modul {m.order}: {m.title}</span>
                  <span className="text-zinc-500">{done}/{ml.length}</span>
                </div>
                <ProgressBar value={done} max={Math.max(1, ml.length)} tone={done === ml.length ? 'green' : 'amber'} />
              </div>
            );
          })}
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-zinc-300">Godkjente AI-samtaler (krav: 25)</span>
              <span className="text-zinc-500">{progress.approvedCoachSessions}/25</span>
            </div>
            <ProgressBar value={progress.approvedCoachSessions} max={25} />
          </div>
        </div>
      </Card>

      {/* Sertifikat + garanti */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card accent={certified ? 'green' : 'none'}>
          <h2 className="font-bold text-white">Sertifikatstatus 🎖️</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className={progress.examTheoryPassed ? 'text-emerald-400' : 'text-zinc-400'}>
              {progress.examTheoryPassed ? '✓' : '○'} Teorieksamen
            </li>
            <li className={progress.examAiPassed ? 'text-emerald-400' : 'text-zinc-400'}>
              {progress.examAiPassed ? '✓' : '○'} AI-eksamenssamtale (≥80)
            </li>
            <li className={progress.examRealCallPassed ? 'text-emerald-400' : 'text-zinc-400'}>
              {progress.examRealCallPassed ? '✓' : '○'} Ekte kundesamtale med sensor
            </li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            {certified
              ? 'Gratulerer — du er sertifisert closer!'
              : 'Fullfør alle tre stegene for å bli sertifisert.'}
          </p>
        </Card>

        <Card accent={certified ? 'green' : 'none'}>
          <h2 className="font-bold text-white">Garantistatus 🛡️</h2>
          {certified && daysLeft !== null ? (
            <div className="mt-3">
              <p className="text-3xl font-black text-emerald-400">{daysLeft} dager</p>
              <p className="mt-1 text-sm text-zinc-400">
                igjen av 90-dagersperioden. Får du ikke jobbtilbud innen
                fristen, refunderer vi 100 % — se garantivilkårene.
              </p>
              <ProgressBar value={90 - daysLeft} max={90} tone="green" className="mt-3" />
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">
              Garantiperioden på 90 dager starter dagen du består hele
              eksamen. Status: <Badge tone="zinc">Ikke startet</Badge>
            </p>
          )}
        </Card>
      </div>

      {/* Siste AI-samtaler */}
      <Card>
        <h2 className="font-bold text-white">Siste AI-samtaler</h2>
        <div className="mt-3 divide-y divide-white/10">
          {progress.coachSessions.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-zinc-300">
                {s.personaName} · nivå {s.difficulty} · {s.date}
              </span>
              <span className={s.scorecard.approved ? 'font-bold text-emerald-400' : 'font-bold text-zinc-400'}>
                {s.scorecard.total}/100 {s.scorecard.approved && '✓'}
              </span>
            </div>
          ))}
          {progress.coachSessions.length === 0 && (
            <p className="py-2 text-sm text-zinc-500">Ingen samtaler ennå — gå til AI-coachen!</p>
          )}
        </div>
      </Card>

      {/* Innstillinger */}
      <Card>
        <h2 className="font-bold text-white">Innstillinger</h2>
        <div className="mt-3 space-y-3 text-sm text-zinc-300">
          <label className="flex items-center justify-between">
            E-postvarsler om nye jobber
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-amber-500" />
          </label>
          <label className="flex items-center justify-between">
            SMS-påminnelse om streak
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-amber-500" />
          </label>
          <label className="flex items-center justify-between">
            Vis meg på leaderboard
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-amber-500" />
          </label>
        </div>
        {isDemoMode && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-amber-400">
              Demo-modus: innstillinger lagres ikke. Koble til Supabase for full
              funksjonalitet.
            </p>
            <Button variant="secondary" size="sm" onClick={resetDemo}>
              Nullstill demo
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
