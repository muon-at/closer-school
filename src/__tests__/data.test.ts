// Tester at mock-datalaget leverer komplette data i demo-modus.
import {
  getCurrentUser,
  loadUserContext,
  saveCoachSession,
  getModules,
  getLessons,
  getQuiz,
  getJobs,
  getPosts,
  getWins,
  getLeaderboard,
  getCoachMissions,
  getProgress,
  markLessonComplete,
  submitApplication,
  getApplications,
  getExamQuestions,
  isModuleUnlocked,
  setExamStep,
  startCoachSession,
  sendCoachMessage,
  endCoachSession,
  isDemoMode,
  __resetDemoState,
} from '../lib/data';

beforeEach(() => {
  __resetDemoState();
});

describe('Datalaget i demo-modus', () => {
  it('kjører i demo-modus uten Supabase-nøkler', () => {
    expect(isDemoMode).toBe(true);
  });

  it('returnerer 6 moduler i riktig rekkefølge', async () => {
    const modules = await getModules();
    expect(modules).toHaveLength(6);
    expect(modules[0].slug).toBe('fundamentet');
    expect(modules[5].slug).toBe('high-ticket-karriere');
  });

  it('returnerer 24 leksjoner (4 per modul) med ekte innhold', async () => {
    const lessons = await getLessons();
    expect(lessons).toHaveLength(24);
    for (const lesson of lessons) {
      // Hver leksjon skal ha substansielt innhold (300-600 ord ≈ >1500 tegn)
      expect(lesson.content.length).toBeGreaterThan(1000);
    }
    const m2 = await getLessons('telefonsalg-1');
    expect(m2).toHaveLength(4);
    expect(m2.map((l) => l.slug)).toContain('referanse-metoden');
  });

  it('har quiz med minst 3 spørsmål per leksjon', async () => {
    const lessons = await getLessons();
    for (const lesson of lessons) {
      const quiz = await getQuiz(lesson.slug);
      expect(quiz.length).toBeGreaterThanOrEqual(3);
      for (const q of quiz) {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('returnerer jobber med lønn og sted', async () => {
    const jobs = await getJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    for (const job of jobs) {
      expect(job.pay).toBeTruthy();
      expect(job.location).toBeTruthy();
    }
  });

  it('returnerer community-poster og wins', async () => {
    const posts = await getPosts();
    expect(posts.length).toBeGreaterThan(0);
    const wins = await getWins();
    expect(wins.every((w) => w.type === 'win')).toBe(true);
    expect(wins.length).toBeGreaterThan(0);
  });

  it('returnerer leaderboard med topp 3 og «deg»', async () => {
    const board = await getLeaderboard();
    expect(board.length).toBeGreaterThanOrEqual(10);
    expect(board[0].rank).toBe(1);
    expect(board.some((e) => e.isYou)).toBe(true);
  });

  it('returnerer 5 oppdrag + eksamensoppdraget (kunden er skjult)', async () => {
    const missions = await getCoachMissions();
    expect(missions.map((m) => m.id)).toEqual(
      expect.arrayContaining(['o1', 'o2', 'o3', 'o4', 'o5', 'eksamen']),
    );
    const exam = missions.find((m) => m.id === 'eksamen')!;
    expect(exam.isExam).toBe(true);
    // Oppdragskortet viser kun retning — aldri kundenavn/alder/situasjon
    for (const m of missions) {
      expect(m.channel === 'telefon' || m.channel === 'dør').toBe(true);
      expect(m.product.length).toBeGreaterThan(0);
      expect(m.leadTypeLabel.length).toBeGreaterThan(0);
    }
  });

  it('markLessonComplete oppdaterer progresjonen', async () => {
    const before = await getProgress();
    expect(before.completedLessons).not.toContain('pitch-strukturen');
    await markLessonComplete('pitch-strukturen');
    const after = await getProgress();
    expect(after.completedLessons).toContain('pitch-strukturen');
  });

  it('lås-logikken: modul 1 åpen, modul 4 låst for demo-Jonas (7 av 9 AI-samtaler)', async () => {
    const modules = await getModules();
    const lessons = await getLessons();
    const progress = await getProgress();
    const m1 = modules.find((m) => m.slug === 'fundamentet')!;
    const m2 = modules.find((m) => m.slug === 'telefonsalg-1')!;
    const m4 = modules.find((m) => m.slug === 'dorsalg')!;
    expect(isModuleUnlocked(m1, modules, progress, lessons)).toBe(true);
    expect(isModuleUnlocked(m2, modules, progress, lessons)).toBe(true); // m1 fullført
    expect(isModuleUnlocked(m4, modules, progress, lessons)).toBe(false); // krever 9 godkjente
  });

  it('modul-gatene summerer til 25 (kravet for jobbgarantien)', async () => {
    const modules = await getModules();
    // Siste gate («5 AI-samtaler ≥80») kommer på toppen av siste aiGateRequired
    const m6 = modules.find((m) => m.order === 6)!;
    expect(m6.aiGateRequired).toBe(20);
    expect(m6.gate).toMatch(/5 AI-samtaler/);
    // Kumulative gates er stigende og konsistente
    const sorted = [...modules].sort((a, b) => a.order - b.order);
    expect(sorted.map((m) => m.aiGateRequired)).toEqual([0, 0, 4, 9, 14, 20]);
  });

  it('eksamensflyt: teori → AI-eksamen → ekte samtale oppdaterer progresjonen', async () => {
    let p = await getProgress();
    expect(p.examTheoryPassed).toBe(false);
    expect(p.examAiPassed).toBe(false);

    await setExamStep('theory');
    p = await getProgress();
    expect(p.examTheoryPassed).toBe(true);

    await setExamStep('ai');
    p = await getProgress();
    expect(p.examAiPassed).toBe(true);

    await setExamStep('realBooked');
    await setExamStep('realPassed');
    p = await getProgress();
    expect(p.examRealCallBooked).toBe(true);
    expect(p.examRealCallPassed).toBe(true);
    expect(p.examPassedDate).toBeTruthy();
  });

  it('teorieksamen har spørsmål med gyldige svaralternativer', async () => {
    const exam = await getExamQuestions();
    expect(exam.length).toBeGreaterThanOrEqual(12);
    for (const q of exam) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });

  it('søknad lagres og dukker opp i admin-lista', async () => {
    const app = await submitApplication({
      name: 'Test Testesen',
      age: 20,
      email: 'test@example.com',
      phone: '90000000',
      motivation: 'Jeg er sulten.',
      cohort: 'Kull 3 — september 2026',
    });
    expect(app.status).toBe('ny');
    const all = await getApplications();
    expect(all[0].name).toBe('Test Testesen');
  });

  it('getCurrentUser gir demo-brukeren i demo-modus', () => {
    const user = getCurrentUser();
    expect(user.name).toBe('Jonas Berg');
    expect(user.cohort).toContain('Kull 3');
  });

  it('loadUserContext er no-op (null) i demo-modus og endrer ikke getCurrentUser', async () => {
    const ctx = await loadUserContext();
    expect(ctx).toBeNull();
    expect(getCurrentUser().name).toBe('Jonas Berg');
  });

  it('saveCoachSession oppdaterer demo-progresjonen i demo-modus', async () => {
    const before = await getProgress();
    const approvedBefore = before.approvedCoachSessions;
    await saveCoachSession({
      id: 'cs-test-1',
      personaId: 'o1',
      personaName: 'O1 · TV & strømming (nysalg)',
      difficulty: 1,
      scorecard: {
        opening: 85,
        needs: 82,
        objections: 80,
        closing: 84,
        total: 83,
        approved: true,
        feedback: ['Bra åpning'],
        topCloserExample: '',
        booked: true,
        outcome: 'salg',
        factsRevealed: 4,
        factsTotal: 5,
      },
      date: '2026-07-25',
    });
    const after = await getProgress();
    expect(after.approvedCoachSessions).toBe(approvedBefore + 1);
    expect(after.coachSessions[0].id).toBe('cs-test-1');
  });

  it('coach-flyt via datalaget: start → melding → scorecard med utfall', async () => {
    const sessionId = startCoachSession('o4', 1);
    const reply = await sendCoachMessage(
      sessionId,
      'Hei, det er Jonas fra Closerskolen — vi har en avtale med velforeningen der. Har dere fiber fra før?',
    );
    expect(reply.length).toBeGreaterThan(5);
    const scorecard = await endCoachSession(sessionId);
    expect(scorecard.total).toBeGreaterThanOrEqual(0);
    expect(scorecard.total).toBeLessThanOrEqual(100);
    expect(['booket', 'salg', 'oppfolging', 'tapt']).toContain(scorecard.outcome);
    expect(scorecard.factsTotal).toBeGreaterThan(0);
    // Økten lagres ikke automatisk — det gjør UI-et via saveCoachSession
  });
});
