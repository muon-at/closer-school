import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Icon from '../../components/Icon';
import MediaPlaceholder from '../../components/MediaPlaceholder';
import PageHeader from '../../components/PageHeader';
import {
  getCoachPersonas,
  getProgress,
  setExamStep,
  startCoachSession,
  sendCoachMessage,
  endCoachSession,
  saveCoachSession,
  isDemoMode,
} from '../../lib/data';
import type { CoachMessage, CoachPersona, Progress, Scorecard } from '../../lib/types';
import type { Difficulty } from '../../lib/coachSimulator';

const difficultyLabels: Record<Difficulty, string> = {
  1: 'Grei',
  2: 'Krevende',
  3: 'Brutal',
};

function Flames({ level, className = '' }: { level: number; className?: string }) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`} aria-hidden>
      {[1, 2, 3].map((i) => (
        <Icon
          key={i}
          name="flame"
          size={12}
          className={i <= level ? 'text-signal' : 'text-bone/20'}
        />
      ))}
    </span>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-mono text-bone/50">{label}</span>
        <span
          className={`font-mono text-xs font-semibold ${
            value >= 70 ? 'text-win' : 'text-signal'
          }`}
        >
          {value}/100
        </span>
      </div>
      <div className="h-2 border border-line bg-bone/5">
        <div
          className={`h-full ${value >= 70 ? 'bg-win' : 'bg-signal'}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default function AiCoach() {
  const [personas, setPersonas] = useState<CoachPersona[]>([]);
  const [persona, setPersona] = useState<CoachPersona | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void Promise.all([getCoachPersonas(), getProgress()]).then(([p, pr]) => {
      setPersonas(p);
      setProgress(pr);
    });
  }, []);

  // Eksamenskunden vises KUN når teorieksamen er bestått
  const visiblePersonas = personas.filter(
    (p) => !p.isExam || progress?.examTheoryPassed,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, scorecard]);

  const now = () =>
    new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });

  function start(p: CoachPersona) {
    // Eksamenskunden kjøres alltid på vanskelighetsgrad 3 (låst)
    const d: Difficulty = p.isExam ? 3 : difficulty;
    if (p.isExam) setDifficulty(3);
    setPersona(p);
    setSessionId(startCoachSession(p.id, d));
    setMessages([]);
    setTimes([]);
    setScorecard(null);
  }

  async function send() {
    if (!sessionId || !input.trim() || busy) return;
    const text = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'seller', text }]);
    setTimes((t) => [...t, now()]);
    setBusy(true);
    try {
      const reply = await sendCoachMessage(sessionId, text, {
        persona: persona?.id ?? '',
        difficulty,
        messages: messages.map((m) => ({ role: m.role, text: m.text })),
      });
      setMessages((m) => [...m, { role: 'customer', text: reply }]);
      setTimes((t) => [...t, now()]);
    } finally {
      setBusy(false);
    }
  }

  async function endSession() {
    if (!sessionId || !persona) return;
    setBusy(true);
    try {
      const sc = await endCoachSession(sessionId, {
        persona: persona.id,
        difficulty,
        messages: messages.map((m) => ({ role: m.role, text: m.text })),
      });
      setScorecard(sc);
      await saveCoachSession({
        id: sessionId,
        personaId: persona.id,
        personaName: `${persona.name} (${persona.age})`,
        difficulty,
        scorecard: sc,
        date: new Date().toISOString().slice(0, 10),
      });
      // AI-eksamen: score ≥80 mot eksamenspersonaen = bestått steg 2
      if (persona.isExam && sc.total >= 80) {
        await setExamStep('ai');
        setProgress((p) => (p ? { ...p, examAiPassed: true } : p));
      }
      setSessionId(null);
    } finally {
      setBusy(false);
    }
  }

  const examPass = persona?.isExam && scorecard && scorecard.total >= 80;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI-Coach"
        title="Treningsgulvet"
        sub={`Velg motstander og vanskelighetsgrad — og øv så mye du vil. Score ≥70 gir godkjent samtale, og du trenger 25 godkjente for jobbgarantien.${
          isDemoMode
            ? ' (Demo-modus: lokal simulator — i produksjon svarer Claude via Supabase.)'
            : ''
        }`}
        right={
          progress ? (
            <p className="font-mono text-sm font-semibold text-bone">
              {progress.approvedCoachSessions}
              <span className="text-bone/40">/25</span>{' '}
              <span className="label-mono text-bone/40">godkjent</span>
            </p>
          ) : undefined
        }
      />

      <div className="grid gap-8 lg:grid-cols-5">
        {/* VENSTRE: velg motstander */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg uppercase tracking-tight text-bone">
            Velg kunde
          </h2>

          <div className="mt-4 border border-line p-4">
            <p className="label-mono text-bone/50">Vanskelighetsgrad:</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {([1, 2, 3] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex flex-col items-center gap-1.5 border px-2 py-2.5 transition-colors ${
                    difficulty === d
                      ? 'border-signal bg-signal/10'
                      : 'border-line hover:border-bone/40'
                  }`}
                >
                  <Flames level={d} />
                  <span
                    className={`label-mono ${
                      difficulty === d ? 'text-signal' : 'text-bone/50'
                    }`}
                  >
                    {difficultyLabels[d]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {visiblePersonas.map((p) => {
              const active = persona?.id === p.id && !scorecard;
              return (
                <button
                  key={p.id}
                  onClick={() => start(p)}
                  className={`group relative text-left transition-colors ${
                    p.isExam
                      ? 'border border-signal bg-signal/5'
                      : active
                        ? 'border border-bone/60'
                        : 'border border-line hover:border-signal'
                  }`}
                >
                  {p.isExam && (
                    <span className="label-mono absolute right-0 top-0 z-10 border-b border-l border-signal bg-signal px-2 py-1 text-[10px] text-ink">
                      EKSAMEN
                    </span>
                  )}
                  <MediaPlaceholder
                    kind="image"
                    ratio="1/1"
                    size="sm"
                    label={
                      p.isExam
                        ? 'Persona-portrett: skjult kunde'
                        : `Persona-portrett: ${p.name} ${p.age}`
                    }
                  />
                  <div className="p-3.5">
                    <p className="font-display text-sm uppercase tracking-tight text-bone">
                      {p.name} ({p.age})
                    </p>
                    <p className="label-mono mt-1 text-signal">{p.role}</p>
                    <p className="mt-2 text-xs leading-relaxed text-bone/60">
                      {p.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                      <span className="label-mono flex items-center gap-1.5 text-bone/50">
                        <Icon name={p.channel === 'dør' ? 'door' : 'phone'} size={12} />
                        {p.channel === 'dør' ? 'Dørsalg' : 'Telefon'}
                      </span>
                      <Flames level={p.isExam ? 3 : difficulty} />
                    </div>
                    {p.isExam && (
                      <Badge tone="red" className="mt-3">
                        EKSAMEN · nivå 3 (låst) · krav ≥80
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* HØYRE: chatvindu / scorecard */}
        <div className="lg:col-span-3">
          {/* Aktiv samtale */}
          {persona && sessionId && !scorecard && (
            <div className="flex h-[36rem] flex-col border border-line">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
                <div>
                  <p className="font-display text-sm uppercase tracking-tight text-bone">
                    {persona.name} ({persona.age}) — {persona.role}
                  </p>
                  <p className="label-mono mt-1 text-bone/40">
                    Nivå {difficulty} · {difficultyLabels[difficulty]}
                    {persona.isExam && ' (låst for eksamen) · krav ≥80'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={endSession}
                  disabled={busy || messages.length === 0}
                >
                  Avslutt & få score
                </Button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className="label-mono py-8 text-center text-bone/40">
                    {persona.channel === 'dør'
                      ? 'Døra åpnes … Du starter. Hva sier du?'
                      : 'Det ringer ut … Kunden tar telefonen. Du starter. Hva sier du?'}
                  </p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={m.role === 'seller' ? 'ml-auto max-w-[85%]' : 'max-w-[85%]'}
                  >
                    <p
                      className={`label-mono mb-1 text-bone/40 ${
                        m.role === 'seller' ? 'text-right' : ''
                      }`}
                    >
                      {m.role === 'seller' ? 'Du' : persona.name}
                      {times[i] ? ` · ${times[i]}` : ''}
                    </p>
                    <div
                      className={
                        m.role === 'seller'
                          ? 'border border-signal bg-signal/10 p-3 text-sm leading-relaxed text-bone'
                          : 'border border-line bg-bone/5 p-3 text-sm leading-relaxed text-bone/80'
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {busy && (
                  <p className="label-mono text-bone/40">{persona.name} tenker …</p>
                )}
                <div ref={bottomRef} />
              </div>

              <form
                className="flex gap-2 border-t border-line p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <input
                  className="flex-1 rounded-none border border-line bg-ink px-4 py-2.5 text-sm text-bone placeholder-bone/30 focus:border-signal focus:outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Skriv det du ville sagt til kunden …"
                  aria-label="Melding til kunden"
                />
                <Button type="submit" disabled={busy || !input.trim()}>
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* Scorecard */}
          {scorecard && (
            <div className="border border-line">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
                <p className="label-mono text-signal">— Scorecard</p>
                {persona && (
                  <p className="label-mono text-bone/40">
                    {persona.name} ({persona.age}) · nivå {difficulty}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 p-5 sm:p-8">
                <p className="font-display text-7xl leading-none tracking-tight text-bone sm:text-8xl">
                  {scorecard.total}
                  <span className="ml-2 font-mono text-base font-medium text-bone/40">
                    /100
                  </span>
                </p>
                {/* Stempel */}
                {persona?.isExam ? (
                  <span
                    className={`inline-block -rotate-3 border-2 px-4 py-2 font-mono text-sm font-semibold uppercase tracking-[0.15em] ${
                      examPass ? 'border-win text-win' : 'border-red-500 text-red-400'
                    }`}
                  >
                    {examPass ? 'Bestått' : 'Ikke bestått'}
                  </span>
                ) : (
                  <span
                    className={`inline-block -rotate-3 border-2 px-4 py-2 font-mono text-sm font-semibold uppercase tracking-[0.15em] ${
                      scorecard.approved
                        ? 'border-win text-win'
                        : 'border-red-500 text-red-400'
                    }`}
                  >
                    {scorecard.approved ? 'Godkjent' : 'Ikke godkjent'}
                  </span>
                )}
              </div>

              <p className="label-mono border-y border-line px-5 py-3 text-bone/50">
                {persona?.isExam
                  ? examPass
                    ? 'AI-eksamen bestått — registrert automatisk på Eksamen-siden'
                    : 'Under 80 — repeter innvendingsbanken og prøv igjen'
                  : scorecard.approved
                    ? 'Teller mot de 25 godkjente samtalene'
                    : 'Under 70 — juster og prøv igjen'}
              </p>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8 sm:pt-6">
                <ScoreRow label="Åpning" value={scorecard.opening} />
                <ScoreRow label="Behovsavdekking" value={scorecard.needs} />
                <ScoreRow label="Innvendinger" value={scorecard.objections} />
                <ScoreRow label="Closing" value={scorecard.closing} />
              </div>

              <div className="space-y-2 border-t border-line p-5 sm:p-8">
                <p className="label-mono mb-3 text-bone/50">— Konkret feedback</p>
                {(Array.isArray(scorecard.feedback) ? scorecard.feedback : []).map(
                  (f, i) => (
                    <p key={i} className="flex gap-3 font-mono text-sm text-bone/80">
                      <span className="text-signal" aria-hidden>
                        →
                      </span>
                      {f}
                    </p>
                  ),
                )}
              </div>

              {typeof scorecard.topCloserExample === 'string' &&
                scorecard.topCloserExample.length > 0 && (
                  <div className="border-t border-line p-5 sm:p-8">
                    <div className="border-l-2 border-signal bg-signal/5 p-4">
                      <p className="label-mono text-signal">
                        — Hva en topp-closer ville sagt
                      </p>
                      <p className="mt-2 font-mono text-sm leading-relaxed text-bone/80">
                        {scorecard.topCloserExample}
                      </p>
                    </div>
                  </div>
                )}

              <div className="border-t border-line p-5">
                <Button
                  onClick={() => {
                    setPersona(null);
                    setScorecard(null);
                  }}
                >
                  Ny samtale <Icon name="arrow-right" size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Tomt høyrepanel */}
          {!sessionId && !scorecard && (
            <div className="stripes-soft flex min-h-[20rem] flex-col items-center justify-center gap-4 border border-dashed border-line p-8 text-center lg:min-h-[36rem]">
              <span className="flex h-14 w-14 items-center justify-center border border-line bg-ink text-signal">
                <Icon name="mic" size={22} />
              </span>
              <p className="label-mono max-w-xs text-bone/60">
                Ingen aktiv samtale — velg motstander og trykk på kortet for å starte
              </p>
              <p className="label-mono text-bone/40">
                Score ≥70 = godkjent · 25 godkjente kreves for garantien
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
