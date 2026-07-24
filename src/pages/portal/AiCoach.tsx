import { useEffect, useRef, useState } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
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

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className={value >= 70 ? 'font-bold text-emerald-400' : 'font-bold text-amber-400'}>
          {value}/100
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${value >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${value}%` }}
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

  function start(p: CoachPersona) {
    // Eksamenskunden kjøres alltid på vanskelighetsgrad 3 (låst)
    const d: Difficulty = p.isExam ? 3 : difficulty;
    if (p.isExam) setDifficulty(3);
    setPersona(p);
    setSessionId(startCoachSession(p.id, d));
    setMessages([]);
    setScorecard(null);
  }

  async function send() {
    if (!sessionId || !input.trim() || busy) return;
    const text = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'seller', text }]);
    setBusy(true);
    try {
      const reply = await sendCoachMessage(sessionId, text, {
        persona: persona?.id ?? '',
        difficulty,
        messages: messages.map((m) => ({ role: m.role, text: m.text })),
      });
      setMessages((m) => [...m, { role: 'customer', text: reply }]);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">AI-salgscoach 🤖</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Velg kunde og vanskelighetsgrad, og øv så mye du vil. Score ≥ 70 gir
          godkjent samtale — du trenger 25 godkjente for jobbgarantien.
          {isDemoMode && ' (Demo-modus: lokal simulator — i produksjon svarer Claude via Supabase.)'}
        </p>
      </div>

      {/* Persona-velger */}
      {!persona || scorecard ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-white">Vanskelighetsgrad:</span>
            {([1, 2, 3] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-xl border px-4 py-1.5 text-sm font-medium ${
                  difficulty === d
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                    : 'border-white/15 text-zinc-400 hover:text-white'
                }`}
              >
                {d} {d === 1 ? '· Grei' : d === 2 ? '· Krevende' : '· Brutal'}
              </button>
            ))}
          </div>
          <h2 className="mb-3 font-bold text-white">Velg kunde</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePersonas.map((p) => (
              <button key={p.id} onClick={() => start(p)} className="text-left">
                <Card
                  className={
                    p.isExam
                      ? 'h-full border-red-500/40 transition-colors hover:border-red-500/70'
                      : 'h-full transition-colors hover:border-amber-500/40'
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>{p.emoji}</span>
                    <div>
                      <p className="font-bold text-white">
                        {p.name} ({p.age})
                      </p>
                      <p className="text-xs text-amber-500">{p.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="zinc">
                      {p.channel === 'dør' ? '🚪 Dørsalg' : '📞 Telefon'}
                    </Badge>
                    {p.isExam && (
                      <Badge tone="red">EKSAMEN · nivå 3 (låst) · krav ≥80</Badge>
                    )}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Chat */}
      {persona && !scorecard && (
        <Card className="flex h-[32rem] flex-col p-0">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>{persona.emoji}</span>
              <div>
                <p className="font-bold text-white">
                  {persona.name} ({persona.age}) — {persona.role}
                </p>
                <p className="text-xs text-zinc-500">
                  Vanskelighetsgrad {difficulty}
                  {persona.isExam && ' (låst for eksamen) · krav ≥80'}
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={endSession} disabled={busy || messages.length === 0}>
              Avslutt samtale → scorecard
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-zinc-500">
                {persona.channel === 'dør'
                  ? 'Døra åpnes … Du starter. Hva sier du?'
                  : 'Det ringer ut … Kunden tar telefonen. Du starter. Hva sier du?'}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'seller'
                    ? 'ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-amber-500/20 p-3 text-sm text-amber-50'
                    : 'max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 p-3 text-sm text-zinc-200'
                }
              >
                {m.text}
              </div>
            ))}
            {busy && <p className="text-xs text-zinc-500">{persona.name} tenker …</p>}
            <div ref={bottomRef} />
          </div>
          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              className="flex-1 rounded-xl border border-white/15 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv det du ville sagt til kunden …"
              aria-label="Melding til kunden"
            />
            <Button type="submit" disabled={busy || !input.trim()}>Send</Button>
          </form>
        </Card>
      )}

      {/* Scorecard */}
      {scorecard && (
        <Card accent={scorecard.approved ? 'green' : 'amber'}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Scorecard</h2>
            {persona?.isExam ? (
              scorecard.total >= 80 ? (
                <Badge tone="green">AI-EKSAMEN BESTÅTT ✓ — registrert på Eksamen-siden</Badge>
              ) : (
                <Badge tone="red">Eksamen ikke bestått — under 80. Prøv igjen!</Badge>
              )
            ) : scorecard.approved ? (
              <Badge tone="green">GODKJENT ✓ — teller mot de 25</Badge>
            ) : (
              <Badge tone="amber">Ikke godkjent — under 70. Prøv igjen!</Badge>
            )}
          </div>
          <p className="mt-2 text-3xl font-black text-white">
            {scorecard.total}
            <span className="text-base font-medium text-zinc-400">/100</span>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ScoreRow label="Åpning" value={scorecard.opening} />
            <ScoreRow label="Behovsavdekking" value={scorecard.needs} />
            <ScoreRow label="Innvendingshåndtering" value={scorecard.objections} />
            <ScoreRow label="Closing" value={scorecard.closing} />
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-sm font-bold text-white">Konkret feedback</h3>
            {(Array.isArray(scorecard.feedback) ? scorecard.feedback : []).map((f, i) => (
              <p key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="text-amber-500">→</span> {f}
              </p>
            ))}
          </div>
          {typeof scorecard.topCloserExample === 'string' &&
            scorecard.topCloserExample.length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                <h3 className="text-sm font-bold text-amber-400">Hva en topp-closer ville sagt</h3>
                <p className="mt-1 text-sm italic text-amber-100">{scorecard.topCloserExample}</p>
              </div>
            )}
          <div className="mt-5">
            <Button onClick={() => { setPersona(null); setScorecard(null); }}>
              Ny samtale →
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
