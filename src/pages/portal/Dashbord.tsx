import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import {
  getCurrentUser,
  getModules,
  getLessons,
  getProgress,
  getWins,
  getWeeklyTip,
} from '../../lib/data';
import type { Lesson, Module, Post, Progress } from '../../lib/types';

export default function Dashbord() {
  const user = getCurrentUser();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [wins, setWins] = useState<Post[]>([]);

  useEffect(() => {
    void (async () => {
      const [m, l, p, w] = await Promise.all([
        getModules(),
        getLessons(),
        getProgress(),
        getWins(),
      ]);
      setModules(m);
      setLessons(l);
      setProgress(p);
      setWins(w.slice(0, 3));
    })();
  }, []);

  if (!progress) return <p className="label-mono text-bone/50">Laster …</p>;

  const completedModules = modules.filter((m) => {
    const ml = lessons.filter((l) => l.moduleSlug === m.slug);
    return ml.length > 0 && ml.every((l) => progress.completedLessons.includes(l.slug));
  }).length;

  const nextLesson = lessons.find(
    (l) => !progress.completedLessons.includes(l.slug),
  );
  const nextModule = nextLesson
    ? modules.find((m) => m.slug === nextLesson.moduleSlug)
    : undefined;
  const moduleLessonCount = nextModule
    ? lessons.filter((l) => l.moduleSlug === nextModule.slug).length
    : 0;

  const pct =
    lessons.length > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((progress.completedLessons.length / lessons.length) * 100),
          ),
        )
      : 0;

  return (
    <div className="space-y-10">
      {/* Topprad: hilsen + opptak */}
      <div className="border-b border-line pb-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <p className="label-mono mb-3 text-signal">— Dashbord</p>
            <h1 className="font-display text-2xl uppercase leading-[0.95] tracking-tight text-bone sm:text-4xl">
              Velkommen tilbake, {user.name.split(' ')[0]}
            </h1>
          </div>
          <p className="label-mono text-bone/50">{user.cohort}</p>
        </div>
      </div>

      {/* NESTE STEG — den ene store handlingen */}
      <Card accent="amber" cornerTag="NESTE STEG" className="p-6 sm:p-8">
        {nextLesson && nextModule ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="label-mono text-signal">— Neste leksjon</p>
              <p className="label-mono mt-3 text-bone/50">
                Modul {String(nextModule.order).padStart(2, '0')} ·{' '}
                {nextModule.title} · Leksjon {String(nextLesson.order).padStart(2, '0')}
                /{String(Math.max(1, moduleLessonCount)).padStart(2, '0')}
              </p>
              <h2 className="mt-2 font-display text-xl uppercase leading-tight tracking-tight text-bone sm:text-3xl">
                {nextLesson.title}
              </h2>
              <p className="mt-2 font-mono text-xs text-bone/50">
                ~{nextLesson.durationMin} MIN · VIDEO + TEKST + QUIZ
              </p>
            </div>
            <div className="shrink-0">
              <Button to={`/portal/kurs/${nextModule.slug}/${nextLesson.slug}`} size="lg">
                Start leksjonen <Icon name="arrow-right" size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-mono text-signal">— Alle leksjoner fullført</p>
              <h2 className="mt-2 font-display text-xl uppercase leading-tight tracking-tight text-bone sm:text-3xl">
                Nå venter eksamen
              </h2>
              <p className="mt-2 font-mono text-xs text-bone/50">
                TEORI · AI-EKSAMEN · EKTE KUNDESAMTALE
              </p>
            </div>
            <div className="shrink-0">
              <Button to="/portal/eksamen" size="lg">
                Gå til eksamen <Icon name="arrow-right" size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Fire kompakte mono-stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Moduler"
          value={`${completedModules} av ${Math.max(1, modules.length)}`}
          sub="fullførte moduler"
          icon={<Icon name="clipboard" size={16} />}
        />
        <StatCard
          label="AI-samtaler"
          value={`${progress.approvedCoachSessions} av 25`}
          sub="godkjente — 25 kreves for garantien"
          icon={<Icon name="mic" size={16} />}
        />
        <StatCard
          label="Streak"
          value={`${progress.streakDays} dager`}
          sub="hold den i live — logg inn i morgen"
          icon={<Icon name="flame" size={16} />}
        />
        <StatCard
          label="Leksjoner"
          value={`${progress.completedLessons.length} av ${Math.max(1, lessons.length)}`}
          sub="fullførte leksjoner"
          icon={<Icon name="check" size={16} />}
        />
      </div>

      {/* Kursprogresjon som smal bar */}
      <div className="border border-line p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="label-mono text-bone/50">— Kursprogresjon</span>
          <span className="font-mono text-sm font-semibold text-signal">{pct}%</span>
        </div>
        <ProgressBar
          value={progress.completedLessons.length}
          max={Math.max(1, lessons.length)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Siste wins som scoreboard-rader */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <span className="label-mono text-bone/50">— Siste wins fra gulvet</span>
            <Link
              to="/portal/community"
              className="label-mono text-signal hover:text-bone"
            >
              Se alle →
            </Link>
          </div>
          <div>
            {wins.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-4 border-b border-line py-3.5"
              >
                <span className="label-mono shrink-0 border border-win px-2 py-0.5 text-win">
                  WIN
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-bone">{w.title}</p>
                  <p className="label-mono mt-0.5 text-bone/40">
                    {w.author} · {w.date}
                  </p>
                </div>
                <span className="label-mono flex shrink-0 items-center gap-1.5 text-bone/50">
                  <Icon name="flame" size={12} className="text-signal" />
                  {w.reactions.fire}
                </span>
              </div>
            ))}
            {wins.length === 0 && (
              <p className="label-mono py-4 text-bone/40">
                Ingen wins ennå — bli den første.
              </p>
            )}
          </div>
        </div>

        {/* Ukens tips */}
        <Card cornerTag="UKENS TIPS" className="flex flex-col justify-between gap-6">
          <p className="font-mono text-sm leading-relaxed text-bone">
            «{getWeeklyTip()}»
          </p>
          <p className="label-mono text-bone/40">— Sebastian, Closerskolen</p>
        </Card>
      </div>
    </div>
  );
}
