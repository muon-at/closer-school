import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { getExamQuestions, getProgress, setExamStep, getCurrentUser } from '../../lib/data';
import type { Progress, QuizQuestion } from '../../lib/types';

const timeSlots = [
  'Tirsdag 10:00', 'Tirsdag 13:00', 'Onsdag 10:00',
  'Onsdag 15:00', 'Torsdag 12:00', 'Fredag 10:00',
];

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

  if (!progress) return <p className="text-zinc-400">Laster …</p>;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Eksamen 📝</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tre steg: teori, AI-eksamenssamtale og en ekte kundesamtale med
          sensor på linja. Består du alle tre, får du sertifikatet — og
          jobbgarantiperioden på 90 dager starter.
        </p>
      </div>

      {/* Steg 1: Teori */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white">1</span>
            <h2 className="font-bold text-white">Teorieksamen</h2>
          </div>
          {progress.examTheoryPassed ? (
            <Badge tone="green">Bestått ✓</Badge>
          ) : (
            <Badge tone="zinc">40 spørsmål · krav 80 %</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Hele pensumet fra modul 1–6. I denne demoen er 12 av de 40
          spørsmålene implementert — resten produseres til lansering.
        </p>
        {!progress.examTheoryPassed && !showTheory && (
          <div className="mt-4">
            <Button onClick={() => setShowTheory(true)}>Start teorieksamen →</Button>
          </div>
        )}
        {showTheory && !progress.examTheoryPassed && (
          <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
            {questions.map((q, qi) => (
              <fieldset key={q.id}>
                <legend className="text-sm font-semibold text-white">
                  {qi + 1}. {q.question}
                </legend>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${
                        answers[q.id] === oi
                          ? 'border-amber-500/50 bg-amber-500/10 text-white'
                          : 'border-white/10 text-zinc-300 hover:border-white/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        className="accent-amber-500"
                        checked={answers[q.id] === oi}
                        onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={submitTheory} disabled={Object.keys(answers).length < questions.length}>
                Lever eksamen
              </Button>
              {theoryResult && (
                <span
                  className={
                    theoryResult.correct / theoryResult.total >= 0.8
                      ? 'text-sm font-semibold text-emerald-400'
                      : 'text-sm font-semibold text-red-400'
                  }
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
      </Card>

      {/* Steg 2: AI-eksamen */}
      <Card className={!progress.examTheoryPassed ? 'opacity-60' : ''}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white">2</span>
            <h2 className="font-bold text-white">AI-eksamenssamtale</h2>
          </div>
          {progress.examAiPassed ? (
            <Badge tone="green">Bestått ✓</Badge>
          ) : (
            <Badge tone="zinc">Persona: Eksamenskunden · krav ≥80</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Eksamenskunden 🎓 kombinerer det verste fra alle personas: skeptisk
          åpning, fire innvendinger og prispress. Du må score minst 80 totalt.
          Samtalen tas i AI-coachen: når teorieksamen er bestått, dukker
          Eksamenskunden opp i persona-velgeren der (med egen EKSAMEN-merking,
          vanskelighetsgrad låst til 3). Scorer du ≥80, registreres dette
          steget automatisk som bestått.
        </p>
        {progress.examTheoryPassed && !progress.examAiPassed && (
          <div className="mt-4">
            <Button to="/portal/ai-coach">Gå til AI-coachen →</Button>
          </div>
        )}
      </Card>

      {/* Steg 3: Ekte samtale — låst til steg 1 + 2 er bestått */}
      <Card className={!realUnlocked ? 'opacity-60' : ''}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-white">3</span>
            <h2 className="font-bold text-white">Ekte kundesamtale med sensor</h2>
          </div>
          {progress.examRealCallPassed ? (
            <Badge tone="green">Bestått ✓</Badge>
          ) : progress.examRealCallBooked ? (
            <Badge tone="amber">Booket — {slot ?? 'se e-post'}</Badge>
          ) : (
            <Badge tone="zinc">Finalen 🔥</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Du ringer en reell kunde (ekte Allente-/Muon-lead) med sensor på
          linja. Sensoren vurderer åpning, behov, innvendinger og avslutning —
          og gir deg muntlig feedback rett etterpå. Velg et tidspunkt:
        </p>
        {!realUnlocked && (
          <p className="mt-3 text-sm font-medium text-amber-400">
            🔒 Låst — bestå teorieksamen (steg 1) og AI-eksamenssamtalen
            (steg 2) før du kan booke den ekte samtalen.
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {timeSlots.map((s) => (
            <button
              key={s}
              onClick={() => void bookSlot(s)}
              disabled={!realUnlocked || progress.examRealCallBooked}
              className={`rounded-xl border p-3 text-sm font-medium transition-colors ${
                slot === s
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/15 text-zinc-300 hover:border-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {progress.examRealCallBooked && !progress.examRealCallPassed && (
          <p className="mt-3 text-sm text-emerald-400">
            ✓ Booket! Du får SMS-bekreftelse med oppringingsdetaljer. (Sensor:
            Sebastian eller teamet.)
          </p>
        )}
      </Card>

      {/* Sertifikat-preview */}
      {allPassed && (
        <Card accent="green" className="text-center">
          <p className="text-5xl" aria-hidden>🎖️</p>
          <h2 className="mt-3 text-2xl font-black text-white">SERTIFISERT CLOSER</h2>
          <p className="mt-1 font-semibold text-emerald-400">{user.name}</p>
          <p className="mt-2 text-sm text-zinc-400">
            har bestått Closerskolens eksamen: teori, AI-eksamenssamtale og
            reell kundesamtale med sensor.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Jobbgarantien din er nå aktiv — se{' '}
            <Link to="/portal/profil" className="text-amber-400 underline">profilen</Link>{' '}
            for 90-dagers nedtellingen.
          </p>
        </Card>
      )}
    </div>
  );
}
