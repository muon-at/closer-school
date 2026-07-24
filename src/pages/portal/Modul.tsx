import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { getModules, getLessons, getProgress, isModuleUnlocked } from '../../lib/data';
import type { Lesson, Module, Progress } from '../../lib/types';

export default function ModulPage() {
  const { modulSlug } = useParams();
  const [module, setModule] = useState<Module | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    void (async () => {
      const [m, l, p] = await Promise.all([
        getModules(),
        getLessons(),
        getProgress(),
      ]);
      setModules(m);
      setModule(m.find((mm) => mm.slug === modulSlug) ?? null);
      setAllLessons(l);
      setProgress(p);
    })();
  }, [modulSlug]);

  if (!module || !progress) return <p className="text-zinc-400">Laster …</p>;

  const lessons = allLessons.filter((l) => l.moduleSlug === module.slug);
  const unlocked = isModuleUnlocked(module, modules, progress, allLessons);

  // Dyplenke til låst modul → vis låst-kort i stedet for innhold
  if (!unlocked) {
    const previous = modules.find((m) => m.order === module.order - 1);
    return (
      <div className="space-y-6">
        <Link to="/portal/kurs" className="text-sm text-amber-400 hover:underline">
          ← Alle moduler
        </Link>
        <Card className="text-center">
          <p className="text-5xl" aria-hidden>🔒</p>
          <h1 className="mt-3 text-2xl font-black text-white">
            Låst — fullfør {previous ? `modul ${previous.order}: ${previous.title}` : 'forrige modul'} først
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Modul {module.order}: {module.title} låses opp når{' '}
            {previous ? `«${previous.title}»` : 'forrige modul'} er fullført
            {module.aiGateRequired > 0 &&
              ` og du har minst ${module.aiGateRequired} godkjente AI-samtaler (du har ${progress.approvedCoachSessions})`}
            .
          </p>
          <div className="mt-6">
            <Button to="/portal/kurs">Til kursoversikten →</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/portal/kurs" className="text-sm text-amber-400 hover:underline">
          ← Alle moduler
        </Link>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          Modul {module.order}: {module.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">{module.description}</p>
        <p className="mt-2 text-xs text-zinc-500">
          Uke {module.week} · Gate: {module.gate}
        </p>
      </div>

      <div className="space-y-3">
        {lessons.map((l) => {
          const done = progress.completedLessons.includes(l.slug);
          return (
            <Link
              key={l.id}
              to={`/portal/kurs/${module.slug}/${l.slug}`}
              className="block"
            >
              <Card className="flex items-center gap-4 transition-colors hover:border-amber-500/40">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {done ? '✓' : l.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{l.title}</p>
                  <p className="text-xs text-zinc-500">
                    ~{l.durationMin} min · video + tekst + quiz
                  </p>
                </div>
                {done && <Badge tone="green">Fullført</Badge>}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
