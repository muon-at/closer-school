// Delte typer for hele appen (både demo-modus og Supabase-modus).

export interface Module {
  id: string;
  slug: string;
  title: string;
  week: number;
  description: string;
  /** Beskrivelse av gate-kravet for å låse opp NESTE modul */
  gate: string;
  /** Antall godkjente AI-samtaler (kumulativt) som kreves for å låse opp denne modulen */
  aiGateRequired: number;
  order: number;
}

export interface Lesson {
  id: string;
  moduleSlug: string;
  slug: string;
  title: string;
  durationMin: number;
  /** Leksjonstekst i enkelt markdown-aktig format (## overskrift, - punkt, > sitat) */
  content: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  lessonSlug: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CoachPersona {
  id: string;
  name: string;
  age: number;
  role: string;
  description: string;
  channel: 'telefon' | 'dør';
  emoji: string;
  isExam?: boolean;
}

export interface CoachMessage {
  role: 'seller' | 'customer';
  text: string;
}

export interface Scorecard {
  opening: number;
  needs: number;
  objections: number;
  closing: number;
  total: number;
  approved: boolean;
  feedback: string[];
  topCloserExample: string;
  booked: boolean;
}

export interface CoachSessionRecord {
  id: string;
  personaId: string;
  personaName: string;
  difficulty: number;
  scorecard: Scorecard;
  date: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  pay: string;
  type: string;
  description: string;
  tags: string[];
}

export interface Post {
  id: string;
  author: string;
  type: 'win' | 'tips' | 'sporsmal';
  title: string;
  body: string;
  reactions: { fire: number; clap: number; money: number };
  date: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  approvedCalls: number;
  bestScore: number;
  isYou?: boolean;
}

export interface Application {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  motivation: string;
  cohort: string;
  createdAt: string;
  status: 'ny' | 'intervju' | 'akseptert' | 'avslått';
}

export interface Progress {
  completedLessons: string[]; // lesson slugs
  approvedCoachSessions: number;
  coachSessions: CoachSessionRecord[];
  streakDays: number;
  examTheoryPassed: boolean;
  examAiPassed: boolean;
  examRealCallBooked: boolean;
  examRealCallPassed: boolean;
  examPassedDate: string | null;
}

export interface StudentRow {
  id: string;
  name: string;
  cohort: string;
  modulesCompleted: number;
  approvedCalls: number;
  avgScore: number;
  examStatus: string;
}

export interface DemoUser {
  id: string;
  name: string;
  age: number;
  email: string;
  cohort: string;
}
