// Datalaget. Hver funksjon bruker Supabase når det er konfigurert,
// ellers rik norsk mock-data (DEMO-MODUS). UI-koden kaller kun dette laget
// og vet ikke hvilken kilde som brukes.
import { supabase, isDemoMode } from './supabase';
import * as mock from './mockData';
import { lessonContent } from './lessonContent';
import { CoachSimulator, type Difficulty } from './coachSimulator';
import type {
  Application,
  CoachPersona,
  CoachSessionRecord,
  DemoUser,
  Job,
  LeaderboardEntry,
  Lesson,
  Module,
  Post,
  Progress,
  QuizQuestion,
  Scorecard,
  StudentRow,
} from './types';

// ── Lokal lagring for demo-progresjon ─────────────────────────────────────
const STORAGE_KEY = 'closerskolen_demo_v1';

interface DemoState {
  progress: Progress;
  applications: Application[];
}

function loadDemoState(): DemoState {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as DemoState;
    } catch {
      /* korrupt state → start på nytt */
    }
  }
  return {
    progress: structuredClone
      ? structuredClone(mock.defaultProgress)
      : JSON.parse(JSON.stringify(mock.defaultProgress)),
    applications: [...mock.applications],
  };
}

let demoState: DemoState = loadDemoState();

function persist() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoState));
    } catch {
      /* full/blokkert storage er ikke kritisk i demo */
    }
  }
}

/** Kun for tester: nullstill demo-state. */
export function __resetDemoState() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  demoState = loadDemoState();
}

// ── Bruker ────────────────────────────────────────────────────────────────
// Modul-cache for innlogget bruker i Supabase-modus. Fylles av
// loadUserContext() (kalles av PortalLayout før portalen rendres) slik at
// getCurrentUser() kan forbli synkron for alle eksisterende kall.
let cachedUser: DemoUser | null = null;

export function getCurrentUser(): DemoUser {
  if (supabase && cachedUser) return cachedUser;
  // Demo-modus (eller cache ikke lastet ennå): mock-brukeren.
  return mock.demoUser;
}

/**
 * Supabase-modus: hent auth-bruker + profiles-rad (full_name, kull, streak)
 * og fyll cachen som getCurrentUser() leser. Returnerer null i demo-modus
 * eller når ingen er innlogget.
 */
export async function loadUserContext(): Promise<DemoUser | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    const authUser = data?.user;
    if (!authUser) {
      cachedUser = null;
      return null;
    }
    let name = String(
      (authUser.user_metadata as Row | undefined)?.full_name ?? '',
    );
    let age = 0;
    let cohort = '';
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, age, cohort_id, streak_days')
      .eq('id', authUser.id)
      .maybeSingle();
    if (profile) {
      const p = profile as Row;
      if (p.full_name) name = String(p.full_name);
      if (p.age != null) age = Number(p.age);
      if (p.cohort_id) {
        const { data: cohortRow } = await supabase
          .from('cohorts')
          .select('name')
          .eq('id', p.cohort_id)
          .maybeSingle();
        if (cohortRow && (cohortRow as Row).name) {
          cohort = String((cohortRow as Row).name);
        }
      }
    }
    cachedUser = {
      id: authUser.id,
      name: name || authUser.email || 'Student',
      age,
      email: authUser.email ?? '',
      cohort,
    };
    return cachedUser;
  } catch {
    // Nettverksfeil o.l. — behold ev. eksisterende cache.
    return cachedUser;
  }
}

/** Hent innlogget brukers id i Supabase-modus (null i demo). */
async function getSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null;
  if (cachedUser) return cachedUser.id;
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

// ── Mapping-lag: Supabase-rader (snake_case) → app-typer (camelCase) ──────
type Row = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapModule(row: Row): Module {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    week: Number(row.week ?? 0),
    description: String(row.description ?? ''),
    gate: String(row.gate ?? ''),
    aiGateRequired: Number(row.ai_gate_required ?? row.aiGateRequired ?? 0),
    order: Number(row.sort_order ?? row.order ?? 0),
  };
}

/** Er DB-innholdet tomt eller en stub («[Fulltekst: lessonContent.ts]»)? */
function isStubContent(content: string): boolean {
  return content.trim().length === 0 || content.includes('[Fulltekst');
}

function mapLesson(row: Row): Lesson {
  const slug = String(row.slug);
  const dbContent = String(row.content ?? '');
  return {
    id: String(row.id),
    moduleSlug: String(row.module_slug ?? row.moduleSlug ?? ''),
    slug,
    title: String(row.title),
    durationMin: Number(row.duration_min ?? row.durationMin ?? 10),
    // Demo-fallback (SETUP.md steg 4): tom/stub content i DB → lokal fulltekst
    content: isStubContent(dbContent) ? (lessonContent[slug] ?? dbContent) : dbContent,
    order: Number(row.sort_order ?? row.order ?? 0),
  };
}

function mapQuiz(row: Row): QuizQuestion {
  return {
    id: String(row.id),
    lessonSlug: String(row.lesson_slug ?? row.lessonSlug ?? ''),
    question: String(row.question),
    options: asStringArray(row.options),
    correctIndex: Number(row.correct_index ?? row.correctIndex ?? 0),
  };
}

function mapJob(row: Row): Job {
  return {
    id: String(row.id),
    title: String(row.title),
    company: String(row.company ?? ''),
    location: String(row.location ?? ''),
    pay: String(row.pay ?? ''),
    type: String(row.type ?? 'Fulltid'),
    description: String(row.description ?? ''),
    tags: asStringArray(row.tags),
  };
}

function mapPost(row: Row): Post {
  const rawType = String(row.type ?? 'sporsmal');
  return {
    id: String(row.id),
    author: String(row.author ?? row.author_name ?? 'Student'),
    // Eldre skjema brukte 'question' — normaliser til app-typen 'sporsmal'
    type: (rawType === 'question' ? 'sporsmal' : rawType) as Post['type'],
    title: String(row.title ?? ''),
    body: String(row.body ?? ''),
    reactions:
      (row.reactions as Post['reactions'] | undefined) ??
      { fire: 0, clap: 0, money: 0 },
    date: String(row.created_at ?? row.date ?? '').slice(0, 10),
  };
}

function mapApplication(row: Row): Application {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    age: Number(row.age ?? 0),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    motivation: String(row.motivation ?? ''),
    cohort: String(row.cohort_name ?? row.cohort ?? ''),
    createdAt: String(row.created_at ?? row.createdAt ?? '').slice(0, 10),
    status: (row.status as Application['status']) ?? 'ny',
  };
}

// ── Kurs ──────────────────────────────────────────────────────────────────
export async function getModules(): Promise<Module[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('sort_order');
    if (!error && data) return (data as Row[]).map(mapModule);
  }
  return mock.modules;
}

export async function getLessons(moduleSlug?: string): Promise<Lesson[]> {
  if (supabase) {
    let query = supabase.from('lessons').select('*').order('sort_order');
    if (moduleSlug) query = query.eq('module_slug', moduleSlug);
    const { data, error } = await query;
    if (!error && data) return (data as Row[]).map(mapLesson);
  }
  return moduleSlug
    ? mock.lessons.filter((l) => l.moduleSlug === moduleSlug)
    : mock.lessons;
}

export async function getLesson(slug: string): Promise<Lesson | undefined> {
  const all = await getLessons();
  return all.find((l) => l.slug === slug);
}

export async function getQuiz(lessonSlug: string): Promise<QuizQuestion[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_slug', lessonSlug)
      .eq('is_exam', false);
    if (!error && data) return (data as Row[]).map(mapQuiz);
  }
  return mock.quizQuestions.filter((qq) => qq.lessonSlug === lessonSlug);
}

export async function getExamQuestions(): Promise<QuizQuestion[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('is_exam', true);
    if (!error && data && data.length > 0) return (data as Row[]).map(mapQuiz);
  }
  return mock.examQuestions;
}

// ── Progresjon ────────────────────────────────────────────────────────────
/** Tomt Progress-objekt — utgangspunktet for en fersk student i Supabase-modus. */
function freshProgress(): Progress {
  return {
    completedLessons: [],
    approvedCoachSessions: 0,
    coachSessions: [],
    streakDays: 0,
    examTheoryPassed: false,
    examAiPassed: false,
    examRealCallBooked: false,
    examRealCallPassed: false,
    examPassedDate: null,
  };
}

function mapCoachSessionRow(row: Row): CoachSessionRecord {
  const scores = (row.scores ?? {}) as Partial<Scorecard>;
  const personaId = String(row.persona ?? '');
  const persona = mock.coachPersonas.find((cp) => cp.id === personaId);
  return {
    id: String(row.id),
    personaId,
    personaName: persona?.name ?? personaId,
    difficulty: Number(row.difficulty ?? 1),
    scorecard: {
      opening: Number(scores.opening ?? 0),
      needs: Number(scores.needs ?? 0),
      objections: Number(scores.objections ?? 0),
      closing: Number(scores.closing ?? 0),
      total: Number(scores.total ?? 0),
      approved: Boolean(scores.approved ?? row.approved ?? false),
      feedback: Array.isArray(scores.feedback) ? scores.feedback.map(String) : [],
      topCloserExample: String(scores.topCloserExample ?? ''),
      booked: Boolean(scores.booked ?? false),
    },
    date: String(row.created_at ?? '').slice(0, 10),
  };
}

/** Supabase-modus: bygg Progress fra DB (RLS gjør alle selects per bruker). */
async function fetchSupabaseProgress(
  client: NonNullable<typeof supabase>,
): Promise<Progress> {
  const p = freshProgress();
  try {
    const userId = await getSupabaseUserId();
    const [lessonsRes, approvedRes, sessionsRes, examRes, bookingRes, profileRes] =
      await Promise.all([
        client.from('progress').select('lesson_slug').eq('completed', true),
        client
          .from('coach_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('approved', true),
        client
          .from('coach_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        client.from('exam_attempts').select('kind, passed').eq('passed', true),
        client
          .from('real_call_bookings')
          .select('status, created_at')
          .order('created_at', { ascending: false }),
        client
          .from('profiles')
          .select('streak_days')
          .eq('id', userId ?? '')
          .maybeSingle(),
      ]);

    if (!lessonsRes.error && lessonsRes.data) {
      p.completedLessons = (lessonsRes.data as Row[]).map((r) =>
        String(r.lesson_slug),
      );
    }
    if (!approvedRes.error && typeof approvedRes.count === 'number') {
      p.approvedCoachSessions = approvedRes.count;
    }
    if (!sessionsRes.error && sessionsRes.data) {
      p.coachSessions = (sessionsRes.data as Row[]).map(mapCoachSessionRow);
    }
    if (!examRes.error && examRes.data) {
      for (const row of examRes.data as Row[]) {
        if (row.kind === 'teori') p.examTheoryPassed = true;
        if (row.kind === 'ai') p.examAiPassed = true;
        if (row.kind === 'ekte') p.examRealCallPassed = true;
      }
    }
    if (!bookingRes.error && bookingRes.data && bookingRes.data.length > 0) {
      p.examRealCallBooked = true;
      const passedRow = (bookingRes.data as Row[]).find(
        (r) => r.status === 'bestått',
      );
      if (passedRow) {
        p.examRealCallPassed = true;
        p.examPassedDate = String(passedRow.created_at ?? '').slice(0, 10);
      }
    }
    if (!profileRes.error && profileRes.data) {
      p.streakDays = Number((profileRes.data as Row).streak_days ?? 0);
    }
  } catch {
    // Feilende spørringer → tomt/ferskt Progress-objekt, aldri demo-staten.
    return freshProgress();
  }
  return p;
}

export async function getProgress(): Promise<Progress> {
  if (supabase) {
    return fetchSupabaseProgress(supabase);
  }
  return demoState.progress;
}

export async function markLessonComplete(lessonSlug: string): Promise<void> {
  if (supabase) {
    const userId = await getSupabaseUserId();
    if (userId) {
      await supabase.from('progress').upsert(
        {
          user_id: userId,
          lesson_slug: lessonSlug,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_slug' },
      );
    }
    return; // ikke bland inn demo-state i Supabase-modus
  }
  if (!demoState.progress.completedLessons.includes(lessonSlug)) {
    demoState.progress.completedLessons.push(lessonSlug);
    persist();
  }
}

export async function saveCoachSession(record: CoachSessionRecord): Promise<void> {
  if (supabase) {
    const userId = await getSupabaseUserId();
    if (userId) {
      await supabase.from('coach_sessions').insert({
        user_id: userId,
        persona: record.personaId,
        difficulty: record.difficulty,
        scores: record.scorecard,
        approved: record.scorecard.approved,
      });
    }
    return; // ikke bland inn demo-state i Supabase-modus
  }
  demoState.progress.coachSessions.unshift(record);
  if (record.scorecard.approved) {
    demoState.progress.approvedCoachSessions += 1;
  }
  persist();
}

export async function setExamStep(
  step: 'theory' | 'ai' | 'realBooked' | 'realPassed',
): Promise<void> {
  if (supabase) {
    const userId = await getSupabaseUserId();
    if (userId) {
      if (step === 'theory' || step === 'ai') {
        await supabase.from('exam_attempts').insert({
          user_id: userId,
          kind: step === 'theory' ? 'teori' : 'ai',
          score: null,
          passed: true,
        });
      }
      if (step === 'realBooked') {
        await supabase.from('real_call_bookings').insert({
          user_id: userId,
          // Placeholder-slot: sensor bekrefter reelt tidspunkt manuelt.
          slot: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          status: 'booket',
        });
      }
      // 'realPassed' settes av sensor/admin i DB (bookings-status 'bestått').
    }
    return;
  }
  const p = demoState.progress;
  if (step === 'theory') p.examTheoryPassed = true;
  if (step === 'ai') p.examAiPassed = true;
  if (step === 'realBooked') p.examRealCallBooked = true;
  if (step === 'realPassed') {
    p.examRealCallPassed = true;
    p.examPassedDate = new Date().toISOString().slice(0, 10);
  }
  persist();
}

/**
 * Er modulen låst opp for studenten?
 * `lessons` er leksjonene fra datalaget (Supabase eller mock) — sendes inn
 * av kalleren slik at låsingen alltid bruker samme kilde som resten av UI-et.
 */
export function isModuleUnlocked(
  module: Module,
  modules: Module[],
  progress: Progress,
  lessons: Lesson[] = mock.lessons,
): boolean {
  if (module.order === 1) return true;
  const previous = modules.find((m) => m.order === module.order - 1);
  if (!previous) return true;
  const prevLessons = lessons.filter((l) => l.moduleSlug === previous.slug);
  const prevDone = prevLessons.every((l) =>
    progress.completedLessons.includes(l.slug),
  );
  const aiOk = progress.approvedCoachSessions >= module.aiGateRequired;
  return prevDone && aiOk;
}

// ── AI-coach ──────────────────────────────────────────────────────────────
export async function getCoachPersonas(): Promise<CoachPersona[]> {
  return mock.coachPersonas;
}

const activeSimulators = new Map<string, CoachSimulator>();

export function startCoachSession(personaId: string, difficulty: Difficulty): string {
  const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeSimulators.set(sessionId, new CoachSimulator(personaId, difficulty));
  return sessionId;
}

/**
 * Send selger-melding → få kundesvar.
 * Demo: lokal regelbasert simulator. Produksjon: Supabase edge function `coach`
 * som kaller Anthropic Messages API.
 */
export async function sendCoachMessage(
  sessionId: string,
  text: string,
  context?: { persona: string; difficulty: number; messages: { role: string; text: string }[] },
): Promise<string> {
  if (supabase && context) {
    const { data, error } = await supabase.functions.invoke('coach', {
      body: { ...context, mode: 'chat', latest: text },
    });
    if (!error && data?.reply) return data.reply as string;
  }
  const sim = activeSimulators.get(sessionId);
  if (!sim) throw new Error('Ukjent samtale-økt: ' + sessionId);
  return sim.sendMessage(text);
}

export async function endCoachSession(
  sessionId: string,
  context?: { persona: string; difficulty: number; messages: { role: string; text: string }[] },
): Promise<Scorecard> {
  if (supabase && context) {
    const { data, error } = await supabase.functions.invoke('coach', {
      body: { ...context, mode: 'score' },
    });
    if (!error && data?.scorecard) return data.scorecard as Scorecard;
  }
  const sim = activeSimulators.get(sessionId);
  if (!sim) throw new Error('Ukjent samtale-økt: ' + sessionId);
  const scorecard = sim.end();
  activeSimulators.delete(sessionId);
  return scorecard;
}

// ── Jobber, community, leaderboard ───────────────────────────────────────
export async function getJobs(): Promise<Job[]> {
  if (supabase) {
    const { data, error } = await supabase.from('jobs').select('*');
    if (!error && data) return (data as Row[]).map(mapJob);
  }
  return mock.jobs;
}

export async function getPosts(): Promise<Post[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return (data as Row[]).map(mapPost);
  }
  return mock.posts;
}

export async function getWins(): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter((p) => p.type === 'win');
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return mock.leaderboard;
}

export function getWeeklyTip(): string {
  const week = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  return mock.weeklyTips[week % mock.weeklyTips.length];
}

// ── Søknader ──────────────────────────────────────────────────────────────
export async function submitApplication(
  input: Omit<Application, 'id' | 'createdAt' | 'status'>,
): Promise<Application> {
  const app: Application = {
    ...input,
    id: `app-${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'ny',
  };
  if (supabase) {
    await supabase.from('applications').insert({
      name: app.name,
      age: app.age,
      email: app.email,
      phone: app.phone,
      motivation: app.motivation,
      cohort_name: app.cohort,
    });
  }
  demoState.applications.unshift(app);
  persist();
  return app;
}

export async function getApplications(): Promise<Application[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return (data as Row[]).map(mapApplication);
  }
  return demoState.applications;
}

export async function getStudents(): Promise<StudentRow[]> {
  return mock.students;
}

export function getCohorts(): string[] {
  return mock.cohorts;
}

export { isDemoMode };
