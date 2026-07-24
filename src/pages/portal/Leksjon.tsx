import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import RichText from '../../components/RichText';
import VideoPlaceholder from '../../components/VideoPlaceholder';
import {
  getLesson,
  getLessons,
  getModules,
  getQuiz,
  getProgress,
  markLessonComplete,
  isModuleUnlocked,
} from '../../lib/data';
import type { Lesson, Module, Progress, QuizQuestion } from '../../lib/types';

export default function LeksjonPage() {
  const { modulSlug, leksjonSlug } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ correct: number; total: number } | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setQuizResult(null);
    setCompleted(false);
    void (async () => {
      if (!leksjonSlug) return;
      const [l, q, p, lessons, m] = await Promise.all([
        getLesson(leksjonSlug),
        getQuiz(leksjonSlug),
        getProgress(),
        getLessons(),
        getModules(),
      ]);
      setLesson(l ?? null);
      setQuiz(q);
      setProgress(p);
      setModules(m);
      setAllLessons(lessons);
      setCompleted(p.completedLessons.includes(leksjonSlug));
      if (l) {
        const moduleLessons = lessons.filter((ml) => ml.moduleSlug === (modulSlug ?? l.moduleSlug));
        const next = moduleLessons.find((ml) => ml.order === l.order + 1);
        setNextLesson(next ?? null);
      }
    })();
  }, [leksjonSlug, modulSlug]);

  if (!lesson || !progress) return <p className="text-zinc-400">Laster …</p>;

  // Håndhev modullås også ved dyplenke direkte til leksjonen
  const parentModule = modules.find((m) => m.slug === (modulSlug ?? lesson.moduleSlug));
  if (parentModule && !isModuleUnlocked(parentModule, modules, progress, allLessons)) {
    const previous = modules.find((m) => m.order === parentModule.order - 1);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/portal/kurs" className="text-sm text-amber-400 hover:underline">
          ← Alle moduler
        </Link>
        <Card className="text-center">
          <p className="text-5xl" aria-hidden>🔒</p>
          <h1 className="mt-3 text-2xl font-black text-white">
            Låst — fullfør {previous ? `modul ${previous.order}: ${previous.title}` : 'forrige modul'} først
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Denne leksjonen hører til modul {parentModule.order}:{' '}
            {parentModule.title}, som ikke er låst opp ennå
            {parentModule.aiGateRequired > 0 &&
              ` (krever ${parentModule.aiGateRequired} godkjente AI-samtaler — du har ${progress.approvedCoachSessions})`}
            .
          </p>
          <div className="mt-6">
            <Button to="/portal/kurs">Til kursoversikten →</Button>
          </div>
        </Card>
      </div>
    );
  }

  function checkQuiz() {
    const correct = quiz.filter((qq) => answers[qq.id] === qq.correctIndex).length;
    setQuizResult({ correct, total: quiz.length });
  }

  async function complete() {
    if (!leksjonSlug) return;
    await markLessonComplete(leksjonSlug);
    setCompleted(true);
  }

  const quizPassed =
    quizResult !== null && quizResult.correct / Math.max(1, quizResult.total) >= 0.8;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link to={`/portal/kurs/${modulSlug}`} className="text-sm text-amber-400 hover:underline">
          ← Tilbake til modulen
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black text-white sm:text-3xl">{lesson.title}</h1>
          {completed && <Badge tone="green">Fullført ✓</Badge>}
        </div>
        <p className="mt-1 text-sm text-zinc-500">~{lesson.durationMin} min lesing + quiz</p>
      </div>

      <VideoPlaceholder title={lesson.title} />

      <RichText text={lesson.content} />

      {/* QUIZ */}
      <Card>
        <h2 className="text-lg font-bold text-white">Quiz — sjekk at det sitter</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Minst 80 % riktig for å bestå. Du kan prøve så mange ganger du vil.
        </p>
        <div className="mt-5 space-y-6">
          {quiz.map((qq, qi) => (
            <fieldset key={qq.id}>
              <legend className="text-sm font-semibold text-white">
                {qi + 1}. {qq.question}
              </legend>
              <div className="mt-2 space-y-2">
                {qq.options.map((opt, oi) => {
                  const chosen = answers[qq.id] === oi;
                  const showResult = quizResult !== null;
                  const isCorrect = oi === qq.correctIndex;
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                        showResult && chosen && isCorrect
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                          : showResult && chosen && !isCorrect
                            ? 'border-red-500/50 bg-red-500/10 text-red-200'
                            : chosen
                              ? 'border-amber-500/50 bg-amber-500/10 text-white'
                              : 'border-white/10 text-zinc-300 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name={qq.id}
                        className="accent-amber-500"
                        checked={chosen}
                        onChange={() => {
                          setAnswers({ ...answers, [qq.id]: oi });
                          setQuizResult(null);
                        }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button
            variant="secondary"
            onClick={checkQuiz}
            disabled={Object.keys(answers).length < quiz.length}
          >
            Rett quizen
          </Button>
          {quizResult && (
            <span className={quizPassed ? 'text-sm font-semibold text-emerald-400' : 'text-sm font-semibold text-red-400'}>
              {quizResult.correct} av {quizResult.total} riktig{' '}
              {quizPassed ? '— bestått! ✓' : '— du trenger 80 %. Les teksten en gang til.'}
            </span>
          )}
        </div>
      </Card>

      {/* FULLFØR */}
      <div className="flex flex-wrap items-center gap-4">
        {!completed ? (
          <Button onClick={complete} disabled={!quizPassed} size="lg">
            Marker som fullført ✓
          </Button>
        ) : nextLesson ? (
          <Button to={`/portal/kurs/${modulSlug}/${nextLesson.slug}`} size="lg">
            Neste leksjon: {nextLesson.title} →
          </Button>
        ) : (
          <Button to="/portal/kurs" size="lg" variant="green">
            Modulen er ferdig — tilbake til kursoversikten →
          </Button>
        )}
        {!completed && !quizPassed && (
          <p className="text-xs text-zinc-500">Bestå quizen først (minst 80 %).</p>
        )}
      </div>
    </div>
  );
}
