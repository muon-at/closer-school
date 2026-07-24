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
export function getCurrentUser(): DemoUser {
  // I produksjon: supabase.auth.getUser() + profiles-tabellen.
  return mock.demoUser;
}

/** Hent innlogget brukers id i Supabase-modus (null i demo). */
async function getSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null;
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
export async function getProgress(): Promise<Progress> {
  if (supabase) {
    // I produksjon: les fra progress- og coach_sessions-tabellene (RLS: egen rad).
    // Faller tilbake til demo-state hvis spørringen feiler.
  }
  return demoState.progress;
}

export async function markLessonComplete(lessonSlug: string): Promise<void> {
  if (!demoState.progress.completedLessons.includes(lessonSlug)) {
    demoState.progress.completedLessons.push(lessonSlug);
    persist();
  }
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
  }
}

export async function saveCoachSession(record: CoachSessionRecord): Promise<void> {
  demoState.progress.coachSessions.unshift(record);
  if (record.scorecard.approved) {
    demoState.progress.approvedCoachSessions += 1;
  }
  persist();
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
  }
}

export async function setExamStep(
  step: 'theory' | 'ai' | 'realBooked' | 'realPassed',
): Promise<void> {
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
