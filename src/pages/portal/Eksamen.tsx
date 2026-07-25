import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';
import { getExamQuestions, getProgress, setExamStep, getCurrentUser } from '../../lib/data';
import type { Progress, QuizQuestion } from '../../lib/types';

const timeSlots = [
  'Tirsdag 10:00', 'Tirsdag 13:00', 'Onsdag 10:00',
  'Onsdag 15:00', 'Torsdag 12:00', 'Fredag 10:00',
];

const optionLetters = ['A', 'B', 'C', 'D', 'E'];

function StatusTag({
  state,
  bookedLabel,
}: {
  state: 'bestatt' | 'booket' | 'ikke-startet' | 'last';
  bookedLabel?: string;
}) {
  if (state === 'bestatt')
    return (
      <span className="label-mono border border-win px-2 py-0.5 text-win">Bestått ✓</span>
    );
  if (state === 'booket')
    return (
      <span className="label-mono border border-signal px-2 py-0.5 text-signal">
        Booket{bookedLabel ? ` — ${bookedLabel}` : ''}
      </span>
    );
  if (state === 'last')
    return (
      <span className="label-mono inline-flex items-center gap-1.5 border border-line px-2 py-0.5 text-bone/50">
        <Icon name="lock" size={11} />
        Låst
      </span>
    );
  return (
    <span className="label-mono border border-line px-2 py-0.5 text-bone/50">
      Ikke startet
    </span>
  );
}

function Ticket({
  step,
  locked,
  children,
}: {
  step: string;
  locked?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`border border-line ${locked ? 'opacity-60' : ''}`}>
      <div className="flex">
        {/* Billett-stubb med perforert kant */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-1.5 border-r border-dashed border-line p-3 sm:w-24">
          <span className="label-mono text-bone/40">Steg</span>
          <span className="font-display text-2xl leading-none tracking-tight text-signal sm:text-4xl">
            {step}
          </span>
        </div>
        <div className="min-w-0 flex-1 p-5 sm:p-6">{children}</div>
      </div>
    </section>
  );
}

export default function Eksamen() {
  const user = getCurrentUser();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showTheory, setShowTheory] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [theoryResult, setTheoryResult] = useState<{ correct: number; total: number } | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [p, qs] = await Promise.all([getProgress(), getExamQuestions()]);
      setProgress(p);
      setQuestions(qs);
    })();
  }, []);

  if (!progress) return <p className="label-mono text-bone/50">Laster …</p>;

  async function submitTheory() {
    const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
    setTheoryResult({ correct, total: questions.length });
    if (correct / Math.max(1, questions.length) >= 0.8) {
      await setExamStep('theory');
      setProgress((p) => (p ? { ...p, examTheoryPassed: true } : p));
    }
  }

  const realUnlocked = progress.examTheoryPassed && progress.examAiPassed;

  async function bookSlot(s: string) {
    if (!realUnlocked || progress?.examRealCallBooked) return;
    setSlot(s);
    await setExamStep('realBooked');
    setProgress((p) => (p ? { ...p, examRealCallBooked: true } : p));
  }

  const allPassed =
    progress.examTheoryPassed && progress.examAiPassed && progress.examRealCallPassed;
  const stepsPassed = [
    progress.examTheoryPassed,
    progress.examAiPassed,
    progress.examRealCallPassed,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Eksamen"
        title="Tre steg til sertifikatet"
        sub="Teori, AI-eksamenssamtale og en ekte kundesamtale med sensor på linja. Består du alle tre, får du sertifikatet — og jobbgarantiperioden på 90 dager starter."
        right={
          <p className="font-mono text-sm font-semibold text-bone">
            {stepsPassed}
            <span className="text-bone/40">/3</span>{' '}
            <span className="label-mono text-bone/40">bestått</span>
          </p>
        }
      />

      {/* STEG 01 — TEORI */}
      <Ticket step="01">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg uppercase tracking-tight text-bone sm:text-xl">
            Teorieksamen
          </h2>
          <StatusTag state={progress.examTheoryPassed ? 'bestatt' : 'ikke-startet'} />
        </div>
        <p className="label-mono mt-2 text-bone/40">Krav: 40 spørsmål · 80 % riktig</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone/60">
          Hele pensumet fra modul 1–6. I denne demoen er 12 av de 40 spørsmålene
          implementert — resten produseres til lansering.
        </p>
        {!progress.examTheoryPassed && !showTheory && (
          <div className="mt-5">
            <Button onClick={() => setShowTheory(true)}>
              Start teorieksamen <Icon name="arrow-right" size={16} />
            </Button>
          </div>
        )}
        {showTheory && !progress.examTheoryPassed && (
          <div className="mt-6 space-y-7 border-t border-dashed border-line pt-6">
            {questions.map((q, qi) => (
              <fieldset key={q.id}>
                <legend className="text-sm font-semibold leading-relaxed text-bone">
                  <span className="label-mono mr-2 text-signal">
                    {String(qi + 1).padStart(2, '0')}
                  </span>
                  {q.question}
                </legend>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => {
                    const chosen = answers[q.id] === oi;
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-start gap-3 border p-3 text-sm transition-colors ${
                          chosen
                            ? 'border-signal bg-signal/10 text-bone'
                            : 'border-line text-bone/70 hover:border-bone/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          className="sr-only"
                          checked={chosen}
                          onChange={() => setAnswers({ ...answers, [q.id]: oi })}
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
            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={submitTheory}
                disabled={Object.keys(answers).length < questions.length}
              >
                Lever eksamen
              </Button>
              {theoryResult && (
                <span
                  className={`font-mono text-sm font-semibold ${
                    theoryResult.correct / theoryResult.total >= 0.8
                      ? 'text-win'
                      : 'text-red-400'
                  }`}
                >
                  {theoryResult.correct} av {theoryResult.total} riktig —{' '}
                  {theoryResult.correct / theoryResult.total >= 0.8
                    ? 'bestått! ✓'
                    : 'ikke bestått. Repeter modulene og prøv igjen.'}
                </span>
              )}
            </div>
          </div>
        )}
      </Ticket>

      {/* STEG 02 — AI-EKSAMEN */}
      <Ticket step="02" locked={!progress.examTheoryPassed}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg uppercase tracking-tight text-bone sm:text-xl">
            AI-eksamenssamtale
          </h2>
          <StatusTag
            state={
              progress.examAiPassed
                ? 'bestatt'
                : progress.examTheoryPassed
                  ? 'ikke-startet'
                  : 'last'
            }
          />
        </div>
        <p className="label-mono mt-2 text-bone/40">
          Krav: score ≥80 · vanskelighetsgrad låst til nivå 3
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone/60">
          Eksamenskunden kombinerer det verste fra alle personas: skeptisk åpning,
          fire innvendinger og prispress. Samtalen tas i AI-coachen — når
          teorieksamen er bestått, dukker den opp i persona-velgeren der (med egen
          EKSAMEN-merking). Scorer du ≥80, registreres dette steget automatisk som
          bestått.
        </p>
        {progress.examTheoryPassed && !progress.examAiPassed && (
          <div className="mt-5">
            <Button to="/portal/ai-coach">
              Gå til AI-coachen <Icon name="arrow-right" size={16} />
            </Button>
          </div>
        )}
      </Ticket>

      {/* STEG 03 — EKTE KUNDESAMTALE */}
      <Ticket step="03" locked={!realUnlocked}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg uppercase tracking-tight text-bone sm:text-xl">
            Ekte kundesamtale med sensor
          </h2>
          <StatusTag
            state={
              progress.examRealCallPassed
                ? 'bestatt'
                : progress.examRealCallBooked
                  ? 'booket'
                  : realUnlocked
                    ? 'ikke-startet'
                    : 'last'
            }
            bookedLabel={slot ?? 'se e-post'}
          />
        </div>
        <p className="label-mono mt-2 text-bone/40">
          Finalen: reell kunde · sensor på linja · muntlig feedback
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone/60">
          Du ringer en reell kunde (ekte Allente-/Muon-lead) med sensor på linja.
          Sensoren vurderer åpning, behov, innvendinger og avslutning — og gir deg
          muntlig feedback rett etterpå. Velg et tidspunkt:
        </p>
        {!realUnlocked && (
          <p className="mt-4 flex items-start gap-2 font-mono text-xs leading-relaxed text-signal">
            <Icon name="lock" size={13} className="mt-0.5 shrink-0" />
            <span>
              Låst — bestå teorieksamen (steg 1) og AI-eksamenssamtalen (steg 2) før
              du kan booke den ekte samtalen.
            </span>
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {timeSlots.map((s) => (
            <button
              key={s}
              onClick={() => void bookSlot(s)}
              disabled={!realUnlocked || progress.examRealCallBooked}
              className={`border p-3 font-mono text-xs font-medium uppercase tracking-[0.08em] transition-colors sm:text-sm ${
                slot === s
                  ? 'border-win bg-win/10 text-win'
                  : 'border-line text-bone/70 hover:border-signal disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {progress.examRealCallBooked && !progress.examRealCallPassed && (
          <p className="mt-4 flex items-start gap-2 font-mono text-xs leading-relaxed text-win">
            <Icon name="check" size={13} className="mt-0.5 shrink-0" />
            <span>
              Booket! Du får SMS-bekreftelse med oppringingsdetaljer. (Sensor:
              Sebastian eller teamet.)
            </span>
          </p>
        )}
      </Ticket>

      {/* Sertifikat — bone-diplom */}
      {allPassed && (
        <div className="relative border border-line bg-bone p-8 text-center text-ink sm:p-12">
          {/* Signal-segl */}
          <span
            className="absolute right-5 top-5 flex h-14 w-14 -rotate-6 items-center justify-center rounded-full border-2 border-signal font-display text-2xl text-signal sm:h-16 sm:w-16"
            aria-hidden
          >
            C
          </span>
          <p className="label-mono text-ink/50">— Closerskolen · Sertifikat</p>
          <h2 className="mt-5 font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl">
            Sertifisert closer
          </h2>
          <p className="mt-4 font-display text-lg uppercase tracking-tight text-signal sm:text-2xl">
            {user.name}
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/70">
            har bestått Closerskolens eksamen: teori, AI-eksamenssamtale og reell
            kundesamtale med sensor.
          </p>
          <p className="label-mono mx-auto mt-6 max-w-md border-t border-line-ink pt-4 text-ink/50">
            {user.cohort}
            {progress.examPassedDate ? ` · bestått ${progress.examPassedDate}` : ''}
          </p>
          <p className="mt-4 text-xs text-ink/60">
            Jobbgarantien din er nå aktiv — se{' '}
            <Link to="/portal/profil" className="font-semibold text-signal underline">
              profilen
            </Link>{' '}
            for 90-dagers nedtellingen.
          </p>
        </div>
      )}
    </div>
  );
}
