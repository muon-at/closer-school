import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import { getModules, getLessons, getProgress, isModuleUnlocked } from '../../lib/data';
import type { Lesson, Module, Progress } from '../../lib/types';

export default function Kurs() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    void (async () => {
      const [m, l, p] = await Promise.all([getModules(), getLessons(), getProgress()]);
      setModules(m);
      setLessons(l);
      setProgress(p);
    })();
  }, []);

  if (!progress) return <p className="text-zinc-400">Laster …</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Kursmoduler</h1>
        <p className="mt-1 text-sm text-zinc-400">
          8 uker, 6 moduler + eksamen. Hver modul låses opp når forrige er
          fullført og AI-gaten er bestått — sånn sikrer vi at du faktisk kan
          det når du møter en ekte kunde.
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((m) => {
          const moduleLessons = lessons.filter((l) => l.moduleSlug === m.slug);
          const done = moduleLessons.filter((l) =>
            progress.completedLessons.includes(l.slug),
          ).length;
          const unlocked = isModuleUnlocked(m, modules, progress, lessons);
          const complete = done === moduleLessons.length && moduleLessons.length > 0;

          const inner = (
            <Card
              className={
                unlocked
                  ? 'transition-colors hover:border-amber-500/40'
                  : 'opacity-60'
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-amber-500">Uke {m.week}</span>
                    {complete ? (
                      <Badge tone="green">Fullført ✓</Badge>
                    ) : unlocked ? (
                      <Badge tone="amber">Åpen</Badge>
                    ) : (
                      <Badge tone="zinc">🔒 Låst</Badge>
                    )}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Modul {m.order}: {m.title}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-zinc-400">{m.description}</p>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  <p>{done} av {moduleLessons.length} leksjoner</p>
                  <ProgressBar
                    value={done}
                    max={Math.max(1, moduleLessons.length)}
                    className="mt-2 w-28"
                    tone={complete ? 'green' : 'amber'}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Gate for neste modul:</span>
                {m.gate}
                {!unlocked && (
                  <span className="text-amber-400">
                    · Krav for å åpne denne: fullfør modul {m.order - 1}
                    {m.aiGateRequired > 0 &&
                      ` + ${m.aiGateRequired} godkjente AI-samtaler (du har ${progress.approvedCoachSessions})`}
                  </span>
                )}
              </div>
            </Card>
          );

          return unlocked ? (
            <Link key={m.id} to={`/portal/kurs/${m.slug}`} className="block">
              {inner}
            </Link>
          ) : (
            <div key={m.id}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
