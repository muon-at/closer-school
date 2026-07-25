// Supabase Edge Function: coach
// Kaller Anthropic Messages API for å spille norsk kunde (mode: 'chat')
// eller generere scorecard (mode: 'score').
//
// Deploy:  supabase functions deploy coach
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Systemprompten ligger i ./systemprompt.md og bakes inn her ved deploy
// (Deno kan lese filen relativt til funksjonen).

// deno-lint-ignore-file no-explicit-any

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ChatMessage {
  role: 'seller' | 'customer';
  text: string;
}

interface CoachRequest {
  persona: string;
  difficulty: number;
  messages: ChatMessage[];
  latest?: string;
  mode: 'chat' | 'score';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function loadSystemPrompt(): Promise<string> {
  try {
    const url = new URL('./systemprompt.md', import.meta.url);
    return await Deno.readTextFile(url);
  } catch {
    // Fallback hvis filen ikke fulgte med deployen
    return 'Du er Coach Muon: spill en skeptisk norsk kunde i en salgstreningssamtale. Svar kort, folkelig og på norsk. Bryt aldri rollen.';
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Bruk POST.' }, 405);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return json(
      { error: 'ANTHROPIC_API_KEY er ikke satt. Kjør: supabase secrets set ANTHROPIC_API_KEY=...' },
      500,
    );
  }

  let body: CoachRequest;
  try {
    body = (await req.json()) as CoachRequest;
  } catch {
    return json({ error: 'Ugyldig JSON i request body.' }, 400);
  }

  const { persona, difficulty, messages, latest, mode } = body;
  if (!persona || !mode) {
    return json({ error: 'Mangler persona eller mode.' }, 400);
  }

  const systemPrompt = await loadSystemPrompt();

  // Bygg samtalehistorikken: selger = user, kunde = assistant
  const history: { role: 'user' | 'assistant'; content: string }[] = (
    messages ?? []
  ).map((m) => ({
    role: m.role === 'seller' ? 'user' : 'assistant',
    content: m.text,
  }));

  let userInstruction: string;
  if (mode === 'chat') {
    if (latest) history.push({ role: 'user', content: latest });
    userInstruction =
      `AKTIVT OPPDRAG: ${persona}. VANSKELIGHETSGRAD: ${difficulty ?? 1} (1=grei, 2=krevende, 3=brutal). ` +
      'Du er den SKJULTE kunden bak oppdraget. Gi aldri bort info gratis — avslør kun ved gode, relevante spørsmål. ' +
      'Svar KUN som kunden, på norsk, maks 2-3 setninger. Bryt aldri rollen.';
  } else {
    userInstruction =
      'SCORE-MODUS: Samtalen er over. Vurder SELGEREN (user-meldingene) og returner KUN gyldig JSON ' +
      'etter scorecard-skjemaet i systemprompten — ingen tekst utenfor JSON-objektet.';
  }

  // Anthropic krever at meldingslisten starter med 'user'
  if (history.length === 0 || history[0].role !== 'user') {
    history.unshift({ role: 'user', content: '(Samtalen starter nå.)' });
  }
  history.push({ role: 'user', content: userInstruction });

  // Slå sammen påfølgende meldinger med samme rolle (API-krav om alternering håndteres best sånn)
  const merged: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of history) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === m.role) {
      prev.content += '\n' + m.content;
    } else {
      merged.push({ ...m });
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: mode === 'score' ? 1500 : 400,
        system: systemPrompt,
        messages: merged,
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Anthropic API-feil:', response.status, detail);
      return json(
        { error: `Anthropic API svarte ${response.status}. Prøv igjen om litt.` },
        502,
      );
    }

    const data: any = await response.json();
    const text: string =
      data?.content?.find((c: any) => c.type === 'text')?.text ?? '';

    if (mode === 'chat') {
      return json({ reply: text.trim() });
    }

    // score-modus: parse JSON robust (modellen KAN pakke inn i ```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return json({ error: 'Klarte ikke å tolke scorecard fra modellen.', raw: text }, 502);
    }
    try {
      const scorecard = JSON.parse(jsonMatch[0]);
      // Validering + utledede felt (modellen kan levere misdannede felt)
      for (const key of ['opening', 'needs', 'objections', 'closing']) {
        const v = Number(scorecard[key]);
        scorecard[key] = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
      }
      scorecard.feedback = Array.isArray(scorecard.feedback)
        ? scorecard.feedback
            .filter((f: any) => typeof f === 'string' && f.trim().length > 0)
            .slice(0, 10)
        : [];
      scorecard.booked =
        typeof scorecard.booked === 'boolean' ? scorecard.booked : false;
      // Utfall: valider mot enum — alt ukjent faller tilbake til 'tapt'
      const VALID_OUTCOMES = ['booket', 'salg', 'oppfolging', 'tapt'];
      scorecard.outcome = VALID_OUTCOMES.includes(scorecard.outcome)
        ? scorecard.outcome
        : 'tapt';
      // booked skal alltid være konsistent med utfallet
      scorecard.booked =
        scorecard.outcome === 'booket' || scorecard.outcome === 'salg';
      // Avdekket nøkkelinfo: modellen leverer uncoveredFacts/totalFacts (tall)
      const revealed = Number(scorecard.uncoveredFacts);
      const totalFacts = Number(scorecard.totalFacts);
      scorecard.factsTotal =
        Number.isFinite(totalFacts) && totalFacts > 0
          ? Math.min(20, Math.round(totalFacts))
          : 5;
      scorecard.factsRevealed = Number.isFinite(revealed)
        ? Math.max(0, Math.min(scorecard.factsTotal, Math.round(revealed)))
        : 0;
      delete scorecard.uncoveredFacts;
      delete scorecard.totalFacts;
      scorecard.topCloserExample =
        typeof scorecard.topCloserExample === 'string'
          ? scorecard.topCloserExample
          : '';
      // total regnes alltid server-side fra clampede delscorer —
      // vi stoler aldri på modell-levert total (kan hallusineres, f.eks. 500).
      scorecard.total = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            scorecard.opening * 0.2 +
              scorecard.needs * 0.25 +
              scorecard.objections * 0.3 +
              scorecard.closing * 0.25,
          ),
        ),
      );
      const threshold = persona === 'eksamen' || persona === 'eksamenskunden' ? 80 : 70;
      scorecard.approved = scorecard.total >= threshold;
      return json({ scorecard });
    } catch {
      return json({ error: 'Scorecard var ikke gyldig JSON.', raw: text }, 502);
    }
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? 'Tidsavbrudd mot Anthropic API (25 s).'
        : 'Uventet feil i coach-funksjonen.';
    console.error('coach-feil:', err);
    return json({ error: message }, 500);
  }
});
