import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
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

const optionLetters = ['A', 'B', 'C', 'D', 'E'];

export default function LeksjonPage() {
  const { modulSlug, leksjonSlug } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
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
        const moduleLessons = lessons.filter(
          (ml) => ml.moduleSlug === (modulSlug ?? l.moduleSlug),
        );
        setNextLesson(moduleLessons.find((ml) => ml.order === l.order + 1) ?? null);
        setPrevLesson(moduleLessons.find((ml) => ml.order === l.order - 1) ?? null);
      }
    })();
  }, [leksjonSlug, modulSlug]);

  if (!lesson || !progress) return <p className="label-mono text-bone/50">Laster …</p>;

  // Håndhev modullås også ved dyplenke direkte til leksjonen
  const parentModule = modules.find((m) => m.slug === (modulSlug ?? lesson.moduleSlug));
  if (parentModule && !isModuleUnlocked(parentModule, modules, progress, allLessons)) {
    const previous = modules.find((m) => m.order === parentModule.order - 1);
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <nav className="label-mono flex items-center gap-2 text-bone/40">
          <Link to="/portal/kurs" className="text-bone/60 hover:text-signal">
            Kurs
          </Link>
          <span aria-hidden>/</span>
          <span>Uke {String(parentModule.week).padStart(2, '0')}</span>
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
            Denne leksjonen hører til modul {parentModule.order}:{' '}
            {parentModule.title}, som ikke er låst opp ennå
            {parentModule.aiGateRequired > 0 &&
              ` (krever ${parentModule.aiGateRequired} godkjente AI-samtaler — du har ${progress.approvedCoachSessions})`}
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
    <div className="mx-auto max-w-3xl space-y-8 pb-20 sm:pb-0">
      {/* Brødsmule + leksjonsheader */}
      <div className="border-b border-line pb-6">
        <nav className="label-mono flex items-center gap-2 text-bone/40">
          <Link to="/portal/kurs" className="text-bone/60 hover:text-signal">
            Kurs
          </Link>
          <span aria-hidden>/</span>
          <Link to={`/portal/kurs/${modulSlug}`} className="text-bone/60 hover:text-signal">
            {parentModule ? `Uke ${String(parentModule.week).padStart(2, '0')}` : 'Modul'}
          </Link>
          <span aria-hidden>/</span>
          <span>Leksjon {String(lesson.order).padStart(2, '0')}</span>
        </nav>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-xl uppercase leading-tight tracking-tight text-bone sm:text-3xl">
            {lesson.title}
          </h1>
          {completed && (
            <span className="label-mono flex shrink-0 items-center gap-1.5 border border-win px-2 py-1 text-win">
              <Icon name="check" size={12} />
              Fullført
            </span>
          )}
        </div>
        <p className="label-mono mt-3 text-bone/40">
          ~{lesson.durationMin} min lesing + quiz
        </p>
      </div>

      <VideoPlaceholder title={lesson.title} />

      <RichText text={lesson.content} />

      {/* QUIZ */}
      <section className="border border-line">
        <div className="border-b border-line p-5">
          <h2 className="font-display text-lg uppercase tracking-tight text-bone">
            Quiz — sjekk at det sitter
          </h2>
          <p className="label-mono mt-2 text-bone/40">
            Minst 80 % riktig for å bestå · ubegrenset antall forsøk
          </p>
        </div>
        <div className="space-y-8 p-5">
          {quiz.map((qq, qi) => (
            <fieldset key={qq.id}>
              <legend className="text-sm font-semibold leading-relaxed text-bone">
                <span className="label-mono mr-2 text-signal">
                  {String(qi + 1).padStart(2, '0')}
                </span>
                {qq.question}
              </legend>
              <div className="mt-3 space-y-2">
                {qq.options.map((opt, oi) => {
                  const chosen = answers[qq.id] === oi;
                  const showResult = quizResult !== null;
                  const isCorrect = oi === qq.correctIndex;
                  const stateCls =
                    showResult && chosen && isCorrect
                      ? 'border-win bg-win/10 text-bone'
                      : showResult && chosen && !isCorrect
                        ? 'border-red-500/60 bg-red-500/10 text-bone'
                        : chosen
                          ? 'border-signal bg-signal/10 text-bone'
                          : 'border-line text-bone/70 hover:border-bone/40';
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-start gap-3 border p-3 text-sm transition-colors ${stateCls}`}
                    >
                      <input
                        type="radio"
                        name={qq.id}
                        className="sr-only"
                        checked={chosen}
                        onChange={() => {
                          setAnswers({ ...answers, [qq.id]: oi });
                          setQuizResult(null);
                        }}
                      />
                      <span
                        className={`label-mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
                          chosen ? 'border-current' : 'border-line'
                        }`}
                        aria-hidden
                      >
                        {optionLetters[oi] ?? oi + 1}
                      </span>
                      {opt}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-line p-5">
          <Button
            variant="secondary"
            onClick={checkQuiz}
            disabled={Object.keys(answers).length < quiz.length}
          >
            Rett quizen
          </Button>
          {quizResult && (
            <span
              className={`font-mono text-sm font-semibold ${
                quizPassed ? 'text-win' : 'text-red-400'
              }`}
            >
              {quizResult.correct} av {quizResult.total} riktig{' '}
              {quizPassed ? '— bestått! ✓' : '— du trenger 80 %. Les teksten en gang til.'}
            </span>
          )}
        </div>
      </section>

      {/* FULLFØR — sticky nederst på mobil */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-ink/95 p-3 backdrop-blur-sm sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
          {!completed ? (
            <>
              <Button onClick={complete} disabled={!quizPassed} size="lg" className="flex-1 sm:flex-none">
                Marker som fullført ✓
              </Button>
              {!quizPassed && (
                <p className="label-mono text-bone/40">Bestå quizen først (minst 80 %)</p>
              )}
            </>
          ) : nextLesson ? (
            <Button to={`/portal/kurs/${modulSlug}/${nextLesson.slug}`} size="lg" className="flex-1 sm:flex-none">
              Neste leksjon <Icon name="arrow-right" size={16} />
            </Button>
          ) : (
            <Button to="/portal/kurs" size="lg" variant="green" className="flex-1 sm:flex-none">
              Modulen er ferdig — til kursoversikten <Icon name="arrow-right" size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Forrige / neste leksjon */}
      <nav className="grid grid-cols-2 border-t border-line pt-6">
        <div>
          {prevLesson && (
            <Link
              to={`/portal/kurs/${modulSlug}/${prevLesson.slug}`}
              className="group inline-block"
            >
              <span className="label-mono text-bone/40">← Forrige</span>
              <p className="mt-1 text-sm font-semibold text-bone/70 transition-colors group-hover:text-signal">
                {prevLesson.title}
              </p>
            </Link>
          )}
        </div>
        <div className="text-right">
          {nextLesson && (
            <Link
              to={`/portal/kurs/${modulSlug}/${nextLesson.slug}`}
              className="group inline-block"
            >
              <span className="label-mono text-bone/40">Neste →</span>
              <p className="mt-1 text-sm font-semibold text-bone/70 transition-colors group-hover:text-signal">
                {nextLesson.title}
              </p>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
