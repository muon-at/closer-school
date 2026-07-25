// Tester den regelbaserte kundesimulatoren (demo-modus for AI-coachen) —
// «skjult kunde»-modellen: oppdrag i stedet for personas, discovery-mekanikk,
// utfallsbasert closing og anti-juks-regler.
import { CoachSimulator } from '../lib/coachSimulator';

const GOOD_OPENING =
  'Hei, det er Jonas fra Closerskolen. Vi fikk en avtale med velforeningen der du bor, og flere gikk sammen og fikk prisen ned til 2 500. Har dere dette fra før?';

describe('CoachSimulator — skjult kunde', () => {
  it('svarer som norsk kunde på selgerens meldinger', () => {
    const sim = new CoachSimulator('o1', 1);
    const reply = sim.sendMessage(GOOD_OPENING);
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(10);
    // God åpning med referanse → kunden svarer positivt (ikke avvisning)
    expect(reply).toMatch(/velforening/i);
  });

  it('svak åpning gir skeptisk kunde og lav åpningsscore', () => {
    const sim = new CoachSimulator('o1', 1);
    const reply = sim.sendMessage('hei kjøp tv pakke billig nå');
    expect(reply).toMatch(/hvem er dette|ikke tid/i);
    const sc = sim.end();
    expect(sc.opening).toBeLessThan(60);
  });

  it('discovery: relevante spørsmål avdekker facts, som synes i scorecardet', () => {
    const sim = new CoachSimulator('o1', 1);
    sim.sendMessage(GOOD_OPENING); // god åpning → navnet avsløres naturlig
    expect(sim.revealedFacts().map((f) => f.id)).toContain('navn');

    const okonomi = sim.sendMessage('Hva betaler dere i måneden for TV i dag?');
    expect(okonomi).toMatch(/1 100/);
    expect(sim.revealedFacts().map((f) => f.id)).toContain('okonomi');

    const sc = sim.end();
    expect(sc.factsRevealed).toBe(2);
    expect(sc.factsTotal).toBe(5);
    expect(sc.needs).toBeGreaterThan(0);
  });

  it('discovery: kunden gir ikke bort info uten relevante spørsmål', () => {
    const sim = new CoachSimulator('o1', 1);
    sim.sendMessage('god dag god dag'); // svak åpning — ingen intro
    sim.sendMessage('Dette er et helt fantastisk tilbud for dere altså.');
    sim.sendMessage('Vi er markedsledende og har veldig gode priser.');
    const sc = sim.end();
    expect(sc.factsRevealed).toBe(0);
    expect(sc.needs).toBe(0);
  });

  it('navnet avsløres først når selgeren presenterer seg OG spør', () => {
    // Spør uten å ha presentert seg → kunden holder igjen
    const anonym = new CoachSimulator('o1', 1);
    anonym.sendMessage('hei du'); // svak åpning → ikke noe navn
    expect(anonym.revealedFacts().map((f) => f.id)).not.toContain('navn');
    anonym.sendMessage('Hvem snakker jeg med her egentlig?');
    expect(anonym.revealedFacts().map((f) => f.id)).not.toContain('navn');

    // Presenterer seg + spør → navnet kommer
    const hoflig = new CoachSimulator('o1', 1);
    hoflig.sendMessage('hei du'); // svak åpning → ikke noe navn
    const reply = hoflig.sendMessage(
      'Beklager bråstarten — jeg heter Jonas fra Closerskolen. Hvem snakker jeg med?',
    );
    expect(reply).toMatch(/kari/i);
    expect(hoflig.revealedFacts().map((f) => f.id)).toContain('navn');
  });

  it('håndtert innvending gir høyere innvendings-score enn uhåndtert', () => {
    // Sesjon A: dårlig svar på innvendingen
    const bad = new CoachSimulator('o1', 1);
    bad.sendMessage(GOOD_OPENING);
    bad.sendMessage('Dette er et kjempegodt tilbud altså.'); // ingen spørsmål → innvending kommer
    bad.sendMessage('ok.'); // håndterer ikke
    const badCard = bad.end();

    // Sesjon B: godt svar (anerkjenn + spørsmål)
    const good = new CoachSimulator('o1', 1);
    good.sendMessage(GOOD_OPENING);
    good.sendMessage('Dette er et kjempegodt tilbud altså.');
    good.sendMessage(
      'Skjønner deg godt — sånt bestemmer man sammen. Hvis det sto på deg alene, hadde du gått for det?',
    );
    const goodCard = good.end();

    expect(goodCard.objections).toBeGreaterThan(badCard.objections);
  });

  it('closing før innvendinger er håndtert blir avvist', () => {
    const sim = new CoachSimulator('o1', 1);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Hva betaler dere i måneden for det dere har?');
    sim.sendMessage('Og hva er det som irriterer mest med dagens løsning?'); // → innvending kommer
    const reply = sim.sendMessage('Passer tirsdag klokka 10, eller er 14 bedre?');
    expect(reply).toMatch(/fort i svingene|ikke der ennå/i);
  });

  it('godt forløp MED discovery gir suksess-utfall og godkjent (≥70)', () => {
    const sim = new CoachSimulator('o1', 1);
    sim.sendMessage(GOOD_OPENING); // navn
    sim.sendMessage('Hva betaler dere i måneden for det dere har?'); // økonomi
    sim.sendMessage('Og hva er det som irriterer mest med dagens løsning?'); // behov → innvending
    // Innvendingen («samboer») håndteres etter formelen:
    sim.sendMessage(
      'Skjønner deg godt — sånt bestemmer man sammen. Hvis det sto på deg alene, hadde du gått for det?',
    );
    // ≥60 % vektet info avdekket + innvending håndtert → close lander:
    const closeReply = sim.sendMessage(
      'Så bra! Da gjør vi det enkelt: passer tirsdag klokka 10, eller er 14 bedre? Jeg sender deg en SMS med en gang.',
    );
    expect(closeReply.toLowerCase()).toMatch(/gjør vi det|melding/);

    const sc = sim.end();
    expect(sc.booked).toBe(true);
    expect(sc.outcome).toBe('salg'); // O1 er et salgs-oppdrag
    expect(sc.closing).toBeGreaterThanOrEqual(85);
    expect(sc.total).toBeGreaterThanOrEqual(70);
    expect(sc.approved).toBe(true);
    expect(sc.feedback.length).toBeGreaterThan(0);
    expect(sc.topCloserExample.length).toBeGreaterThan(10);
  });

  it('utfall: closing UTEN discovery feiler selv med håndterte innvendinger', () => {
    const sim = new CoachSimulator('o2', 1); // DØR · boligalarm
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Dette er et kjempegodt tilbud altså.'); // pitch uten spørsmål → innvending
    // Innvendingen («leverandør») håndteres riktig:
    sim.sendMessage('Skjønner deg godt — men hva betaler dere for den i dag, egentlig?');
    // Closing med nesten ingenting avdekket → kunden gir «send meg noe»-utfall:
    const reply = sim.sendMessage('Passer tirsdag klokka 10, eller er 14 bedre?');
    expect(reply).toMatch(/skriftlig|postkassa|mail/i);

    const sc = sim.end();
    expect(sc.booked).toBe(false);
    expect(sc.outcome).toBe('oppfolging'); // hederlig forsøk → oppfølging, ikke booket
  });

  it('utfall: juksemønster ender i TAPT', () => {
    const sim = new CoachSimulator('o1', 1);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('skjønner?');
    sim.sendMessage('skjønner?');
    sim.sendMessage('skjønner?');
    sim.sendMessage('Passer tirsdag klokka 10? Jeg sender SMS.');
    const sc = sim.end();
    expect(sc.booked).toBe(false);
    expect(sc.outcome).toBe('tapt');
  });

  it('eksamensoppdraget krever ≥80 for godkjent', () => {
    const sim = new CoachSimulator('eksamen', 3);
    sim.sendMessage('hei');
    const sc = sim.end();
    expect(sc.approved).toBe(false);
  });

  it('eksamensoppdraget avslører ALDRI navnet i åpningen', () => {
    const sim = new CoachSimulator('eksamen', 3);
    sim.sendMessage(GOOD_OPENING);
    expect(sim.revealedFacts().map((f) => f.id)).not.toContain('navn');
  });

  it('anti-juks: «skjønner?» ×4 + booking gir under 70 og ingen booking', () => {
    const sim = new CoachSimulator('o1', 1);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('skjønner?');
    sim.sendMessage('skjønner?');
    sim.sendMessage('skjønner?');
    sim.sendMessage('skjønner?');
    sim.sendMessage('Passer tirsdag klokka 10? Jeg sender SMS.');
    const sc = sim.end();
    expect(sc.booked).toBe(false);
    expect(sc.total).toBeLessThan(70);
    expect(sc.approved).toBe(false);
  });

  it('anti-juks: meldinger under 4 ord gir ikke behovspoeng', () => {
    const short = new CoachSimulator('o1', 1);
    short.sendMessage(GOOD_OPENING);
    short.sendMessage('hva?');
    short.sendMessage('hvorfor?');
    const shortCard = short.end();

    const long = new CoachSimulator('o1', 1);
    long.sendMessage(GOOD_OPENING);
    long.sendMessage('Hva har dere i dag, og hva betaler dere for det?');
    long.sendMessage('Hva er det som irriterer dere mest med den løsningen?');
    const longCard = long.end();

    expect(longCard.needs).toBeGreaterThan(shortCard.needs);
    expect(longCard.factsRevealed).toBeGreaterThan(shortCard.factsRevealed);
  });

  it('anti-juks: repetisjon av nesten identiske meldinger straffes', () => {
    const varied = new CoachSimulator('o1', 1);
    varied.sendMessage(GOOD_OPENING);
    varied.sendMessage('Hva betaler dere i måneden i dag, cirka?');
    varied.sendMessage('Og hva irriterer dere mest ved dagens løsning?');
    const v = varied.end();

    const repeat = new CoachSimulator('o1', 1);
    repeat.sendMessage(GOOD_OPENING);
    repeat.sendMessage('Hva betaler dere i måneden i dag, cirka?');
    repeat.sendMessage('Hva betaler dere i måneden i dag, cirka?');
    const r = repeat.end();

    expect(r.total).toBeLessThan(v.total);
  });

  it('anti-juks: én håndtert innvending kan ikke gi innvendingsscore over 80', () => {
    const sim = new CoachSimulator('o1', 1);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Dette er et kjempegodt tilbud altså.');
    sim.sendMessage(
      'Skjønner deg godt — sånt bestemmer man sammen. Hvis det sto på deg alene, hadde du gått for det?',
    );
    const sc = sim.end();
    expect(sc.objections).toBeLessThanOrEqual(80);
  });

  it('eksamensflyt: godt forløp med full discovery mot eksamensoppdraget (nivå 3) gir ≥80', () => {
    const sim = new CoachSimulator('eksamen', 3);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Hva har dere i dag av løsning, helt konkret?'); // situasjon
    sim.sendMessage('Og hva er det som irriterer deg mest med dagens løsning?'); // behov → innvending
    // Innvending 1 (råd):
    sim.sendMessage('Skjønner deg godt. Men hva betaler dere i dag, helt ærlig?'); // + økonomi
    // Innvending 2 (pris):
    sim.sendMessage('Forstår det. Men hvis vi ser på totalen og hva som er inkludert — er det egentlig likt?');
    // Innvending 3 (tenke):
    sim.sendMessage('Helt greit. Hva er det du er mest usikker på — prisen eller innholdet?');
    // Kunden har myknet + nok info avdekket → close:
    const reply = sim.sendMessage(
      'Da gjør vi det enkelt: passer tirsdag klokka 10, eller er 14 bedre? Jeg sender deg en SMS med en gang.',
    );
    expect(reply.toLowerCase()).toContain('setter vi opp');

    const sc = sim.end();
    expect(sc.booked).toBe(true);
    expect(sc.outcome).toBe('booket');
    expect(sc.total).toBeGreaterThanOrEqual(80);
    expect(sc.approved).toBe(true);
  });

  it('vanskelighetsgrad 3 krever flere håndterte innvendinger før booking', () => {
    const sim = new CoachSimulator('o2', 3);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Bare et lite spørsmål — hva har dere i dag?');
    sim.sendMessage('Og hva betaler dere for det i måneden?'); // → første innvending
    // Håndterer én innvending — men nivå 3 krever tre:
    sim.sendMessage('Skjønner! Hva betaler dere i måneden for det i dag?');
    const reply = sim.sendMessage('Passer tirsdag klokka 10?');
    expect(reply).not.toMatch(/kom innom da/i); // ikke booket ennå
    const sc = sim.end();
    expect(sc.booked).toBe(false);
  });
});
