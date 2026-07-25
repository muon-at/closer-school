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

export type CoachLeadType = 'kald' | 'referanse' | 'inbound';
export type CoachOutcome = 'booket' | 'salg' | 'oppfolging' | 'tapt';

/**
 * Et treningsoppdrag i AI-coachen. Studenten ser KUN retningen
 * (kanal, produkt/bransje, lead-type) — kunden bak er skjult og
 * må graves frem i samtalen.
 */
export interface CoachMission {
  id: string;
  /** Kort kode til kortet: 'O1' … 'O5', 'EKSAMEN' */
  code: string;
  channel: 'telefon' | 'dør';
  /** Produkt/bransje, f.eks. 'TV & strømming (nysalg)' */
  product: string;
  leadType: CoachLeadType;
  /** Visningstekst, f.eks. 'Kald liste', 'Referanse fra nabolaget' */
  leadTypeLabel: string;
  /** Hva et vellykket utfall er for oppdraget */
  goal: 'booket' | 'salg';
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
  /** Utfallet samtalen endte i */
  outcome: CoachOutcome;
  /** Avdekket X av Y nøkkelinfo (discovery-mekanikken) */
  factsRevealed: number;
  factsTotal: number;
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
