import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
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

  if (!progress) return <p className="label-mono text-bone/50">Laster …</p>;

  const completedModules = modules.filter((m) => {
    const ml = lessons.filter((l) => l.moduleSlug === m.slug);
    return ml.length > 0 && ml.every((l) => progress.completedLessons.includes(l.slug));
  }).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Kurs"
        title="Kursmoduler"
        sub="6 moduler + eksamen over 8 uker. Hver modul låses opp når forrige er fullført og AI-gaten er bestått — sånn vet vi at du faktisk kan det når du møter en ekte kunde."
        right={
          <p className="font-mono text-sm font-semibold text-bone">
            {completedModules}
            <span className="text-bone/40">/{Math.max(1, modules.length)}</span>{' '}
            <span className="label-mono text-bone/40">fullført</span>
          </p>
        }
      />

      {/* Løypa — én kolonne, uke for uke */}
      <ol>
        {modules.map((m, idx) => {
          const moduleLessons = lessons.filter((l) => l.moduleSlug === m.slug);
          const done = moduleLessons.filter((l) =>
            progress.completedLessons.includes(l.slug),
          ).length;
          const unlocked = isModuleUnlocked(m, modules, progress, lessons);
          const complete = done === moduleLessons.length && moduleLessons.length > 0;

          const weekColor = complete
            ? 'text-win'
            : unlocked
              ? 'text-signal'
              : 'text-bone/20';

          const inner = (
            <div
              className={`flex gap-5 py-6 sm:gap-8 ${
                idx < modules.length - 1 ? 'border-b border-line' : ''
              } ${!unlocked ? 'opacity-70' : ''}`}
            >
              {/* Stort uketall */}
              <div className="w-14 shrink-0 sm:w-24">
                <span
                  className={`font-display text-3xl leading-none tracking-tight sm:text-6xl ${weekColor}`}
                >
                  {String(m.week).padStart(2, '0')}
                </span>
                <p className="label-mono mt-2 text-bone/40">Uke {m.week}</p>
              </div>

              {/* Innhold */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  {complete ? (
                    <span className="label-mono border border-win px-2 py-0.5 text-win">
                      Fullført ✓
                    </span>
                  ) : unlocked ? (
                    <span className="label-mono border border-signal px-2 py-0.5 text-signal">
                      Åpen →
                    </span>
                  ) : (
                    <span className="label-mono inline-flex items-center gap-1.5 border border-line px-2 py-0.5 text-bone/50">
                      <Icon name="lock" size={11} />
                      Låst
                    </span>
                  )}
                  <span className="label-mono text-bone/40">
                    {done}/{Math.max(1, moduleLessons.length)} leksjoner
                  </span>
                </div>

                <h2
                  className={`mt-3 font-display text-lg uppercase leading-tight tracking-tight sm:text-2xl ${
                    unlocked ? 'text-bone group-hover:text-signal' : 'text-bone/50'
                  } transition-colors`}
                >
                  Modul {m.order}: {m.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-bone/60">
                  {m.description}
                </p>

                <ProgressBar
                  value={done}
                  max={Math.max(1, moduleLessons.length)}
                  tone={complete ? 'green' : 'amber'}
                  className="mt-4 max-w-[10rem]"
                />

                <div className="label-mono mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-bone/40">
                  <span>
                    <span className="text-bone/60">Gate for neste modul:</span> {m.gate}
                  </span>
                  {!unlocked && (
                    <span className="text-signal">
                      Krav: fullfør modul {m.order - 1}
                      {m.aiGateRequired > 0 &&
                        ` + ${m.aiGateRequired} godkjente AI-samtaler (du har ${progress.approvedCoachSessions})`}
                    </span>
                  )}
                </div>
              </div>

              {/* Pil for åpne moduler */}
              {unlocked && (
                <div className="hidden shrink-0 items-center self-center text-bone/30 transition-colors group-hover:text-signal sm:flex">
                  <Icon name="arrow-right" size={20} />
                </div>
              )}
            </div>
          );

          return unlocked ? (
            <li key={m.id}>
              <Link to={`/portal/kurs/${m.slug}`} className="group block">
                {inner}
              </Link>
            </li>
          ) : (
            <li key={m.id}>{inner}</li>
          );
        })}
      </ol>
    </div>
  );
}
