import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
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
      setWins(w.slice(0, 2));
    })();
  }, []);

  if (!progress) return <p className="text-zinc-400">Laster …</p>;

  const completedModules = modules.filter((m) =>
    lessons
      .filter((l) => l.moduleSlug === m.slug)
      .every((l) => progress.completedLessons.includes(l.slug)),
  ).length;

  const nextLesson = lessons.find(
    (l) => !progress.completedLessons.includes(l.slug),
  );
  const nextModule = nextLesson
    ? modules.find((m) => m.slug === nextLesson.moduleSlug)
    : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          Velkommen tilbake, {user.name.split(' ')[0]} 👊
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{user.cohort}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Moduler fullført"
          value={`${completedModules} av ${modules.length}`}
          icon="🎓"
        />
        <StatCard
          label="AI-samtaler godkjent"
          value={`${progress.approvedCoachSessions} av 25`}
          sub="25 kreves for jobbgarantien"
          icon="🤖"
        />
        <StatCard
          label="Streak"
          value={`${progress.streakDays} dager 🔥`}
          sub="Hold den i live — logg inn i morgen"
        />
        <StatCard
          label="Leksjoner fullført"
          value={`${progress.completedLessons.length} av ${lessons.length}`}
          icon="📚"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Neste leksjon</h2>
            <Badge tone="amber">Fortsett der du slapp</Badge>
          </div>
          {nextLesson && nextModule ? (
            <div className="mt-4">
              <p className="text-sm text-amber-500">
                Modul {nextModule.order}: {nextModule.title}
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {nextLesson.title}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                ~{nextLesson.durationMin} min · leksjon {nextLesson.order} av 4
              </p>
              <div className="mt-4">
                <Button to={`/portal/kurs/${nextModule.slug}/${nextLesson.slug}`}>
                  Start leksjonen →
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-zinc-300">
              Alle leksjoner fullført! 🎉 Neste steg:{' '}
              <Link to="/portal/eksamen" className="text-amber-400 underline">
                eksamen
              </Link>
              .
            </p>
          )}
          <div className="mt-6">
            <div className="mb-1 flex justify-between text-xs text-zinc-400">
              <span>Kursprogresjon</span>
              <span>
                {Math.round(
                  (progress.completedLessons.length / Math.max(1, lessons.length)) * 100,
                )}
                %
              </span>
            </div>
            <ProgressBar
              value={progress.completedLessons.length}
              max={Math.max(1, lessons.length)}
            />
          </div>
        </Card>

        <Card accent="amber">
          <h2 className="font-bold text-white">💡 Ukens tips</h2>
          <p className="mt-3 text-sm italic leading-relaxed text-amber-100">
            «{getWeeklyTip()}»
          </p>
          <p className="mt-3 text-xs text-zinc-500">— Sebastian, Closerskolen</p>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">Siste wins fra communityet 🏆</h2>
          <Link to="/portal/community" className="text-sm text-amber-400 hover:underline">
            Se alle →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {wins.map((w) => (
            <Card key={w.id} accent="green">
              <p className="text-sm font-bold text-white">{w.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{w.body}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {w.author} · 🔥 {w.reactions.fire} · 👏 {w.reactions.clap}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
