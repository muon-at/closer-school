import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
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

  if (!module || !progress) return <p className="label-mono text-bone/50">Laster …</p>;

  const lessons = allLessons.filter((l) => l.moduleSlug === module.slug);
  const unlocked = isModuleUnlocked(module, modules, progress, allLessons);
  const done = lessons.filter((l) => progress.completedLessons.includes(l.slug)).length;

  // Dyplenke til låst modul → vis låst-kort i stedet for innhold
  if (!unlocked) {
    const previous = modules.find((m) => m.order === module.order - 1);
    return (
      <div className="space-y-8">
        <nav className="label-mono flex items-center gap-2 text-bone/40">
          <Link to="/portal/kurs" className="text-bone/60 hover:text-signal">
            Kurs
          </Link>
          <span aria-hidden>/</span>
          <span>Uke {String(module.week).padStart(2, '0')}</span>
        </nav>
        <div className="border border-line p-8 text-center sm:p-12">
          <span className="mx-auto flex h-14 w-14 items-center justify-center border border-line text-signal">
            <Icon name="lock" size={22} />
          </span>
          <h1 className="mt-6 font-display text-xl uppercase leading-tight tracking-tight text-bone sm:text-3xl">
            Låst — fullfør{' '}
            {previous ? `modul ${previous.order}: ${previous.title}` : 'forrige modul'}{' '}
            først
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-bone/60">
            Modul {module.order}: {module.title} låses opp når{' '}
            {previous ? `«${previous.title}»` : 'forrige modul'} er fullført
            {module.aiGateRequired > 0 &&
              ` og du har minst ${module.aiGateRequired} godkjente AI-samtaler (du har ${progress.approvedCoachSessions})`}
            .
          </p>
          <div className="mt-8">
            <Button to="/portal/kurs">
              Til kursoversikten <Icon name="arrow-right" size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Brødsmule + modulheader */}
      <div className="border-b border-line pb-6">
        <nav className="label-mono flex items-center gap-2 text-bone/40">
          <Link to="/portal/kurs" className="text-bone/60 hover:text-signal">
            Kurs
          </Link>
          <span aria-hidden>/</span>
          <span>Uke {String(module.week).padStart(2, '0')}</span>
        </nav>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <h1 className="font-display text-2xl uppercase leading-[0.95] tracking-tight text-bone sm:text-4xl">
            Modul {module.order}: {module.title}
          </h1>
          <p className="font-mono text-sm font-semibold text-bone">
            {done}
            <span className="text-bone/40">/{Math.max(1, lessons.length)}</span>{' '}
            <span className="label-mono text-bone/40">fullført</span>
          </p>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bone/60">
          {module.description}
        </p>
      </div>

      {/* Leksjonsliste som nummererte rader */}
      <div>
        {lessons.map((l) => {
          const lessonDone = progress.completedLessons.includes(l.slug);
          return (
            <Link
              key={l.id}
              to={`/portal/kurs/${module.slug}/${l.slug}`}
              className="group flex items-center gap-4 border-b border-line py-5 sm:gap-6"
            >
              <span
                className={`font-display text-xl leading-none sm:text-2xl ${
                  lessonDone ? 'text-win' : 'text-bone/30 group-hover:text-signal'
                } transition-colors`}
              >
                {String(l.order).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-bone transition-colors group-hover:text-signal">
                  {l.title}
                </p>
                <p className="label-mono mt-1 text-bone/40">
                  ~{l.durationMin} min · video + tekst + quiz
                </p>
              </div>
              {lessonDone ? (
                <span className="label-mono flex shrink-0 items-center gap-1.5 text-win">
                  <Icon name="check" size={13} />
                  Fullført
                </span>
              ) : (
                <span className="shrink-0 text-bone/30 transition-colors group-hover:text-signal">
                  <Icon name="arrow-right" size={18} />
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Gate-kravboks */}
      <div className="border border-line p-5">
        <p className="label-mono text-signal">— Gate for neste modul</p>
        <p className="mt-2 font-mono text-sm text-bone/70">{module.gate}</p>
      </div>
    </div>
  );
}
