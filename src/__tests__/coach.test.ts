// Tester den regelbaserte kundesimulatoren (demo-modus for AI-coachen).
import { CoachSimulator } from '../lib/coachSimulator';

const GOOD_OPENING =
  'Hei, det er Jonas fra Closerskolen. Vi fikk en avtale med velforeningen der du bor, og flere gikk sammen og fikk prisen ned til 2 500. Har dere dette fra før?';

describe('CoachSimulator', () => {
  it('svarer som norsk kunde på selgerens meldinger', () => {
    const sim = new CoachSimulator('kari', 1);
    const reply = sim.sendMessage(GOOD_OPENING);
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(10);
    // God åpning med referanse → kunden svarer positivt (ikke avvisning)
    expect(reply).toMatch(/allente|velforening/i);
  });

  it('svak åpning gir skeptisk kunde og lav åpningsscore', () => {
    const sim = new CoachSimulator('kari', 1);
    const reply = sim.sendMessage('hei kjøp tv pakke billig nå');
    expect(reply).toMatch(/hvem er dette|ikke tid/i);
    const sc = sim.end();
    expect(sc.opening).toBeLessThan(60);
  });

  it('håndtert innvending gir høyere innvendings-score enn uhåndtert', () => {
    // Sesjon A: dårlig svar på innvendingen
    const bad = new CoachSimulator('kari', 1);
    bad.sendMessage(GOOD_OPENING);
    bad.sendMessage('Dette er et kjempegodt tilbud altså.'); // ingen spørsmål → innvending kommer
    bad.sendMessage('ok.'); // håndterer ikke
    const badCard = bad.end();

    // Sesjon B: godt svar (anerkjenn + spørsmål)
    const good = new CoachSimulator('kari', 1);
    good.sendMessage(GOOD_OPENING);
    good.sendMessage('Dette er et kjempegodt tilbud altså.');
    good.sendMessage(
      'Skjønner deg godt — sånt bestemmer man sammen. Hvis det sto på deg alene, hadde du gått for det?',
    );
    const goodCard = good.end();

    expect(goodCard.objections).toBeGreaterThan(badCard.objections);
  });

  it('closing før innvendinger er håndtert blir avvist', () => {
    const sim = new CoachSimulator('kari', 1);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Hva betaler dere i dag, cirka?');
    sim.sendMessage('Og hva er det som irriterer mest med dagens løsning?'); // → innvending kommer
    const reply = sim.sendMessage('Passer tirsdag klokka 10, eller er 14 bedre?');
    expect(reply).toMatch(/fort i svingene|ikke der ennå/i);
  });

  it('full god flyt gir scorecard med booking og godkjent (≥70)', () => {
    const sim = new CoachSimulator('kari', 1);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Hva betaler dere i dag, cirka?');
    sim.sendMessage('Og hva er det som irriterer mest med dagens løsning?');
    // Innvendingen («samboer») håndteres etter formelen:
    sim.sendMessage(
      'Skjønner deg godt — sånt bestemmer man sammen. Hvis det sto på deg alene, hadde du gått for det?',
    );
    // Kunden har myknet → close med konkret tid + SMS:
    const bookedReply = sim.sendMessage(
      'Så bra! Da gjør vi det enkelt: passer tirsdag klokka 10, eller er 14 bedre? Jeg sender deg en SMS med en gang.',
    );
    expect(bookedReply.toLowerCase()).toContain('melding');

    const sc = sim.end();
    expect(sc.booked).toBe(true);
    expect(sc.closing).toBeGreaterThanOrEqual(85);
    expect(sc.total).toBeGreaterThanOrEqual(70);
    expect(sc.approved).toBe(true);
    expect(sc.feedback.length).toBeGreaterThan(0);
    expect(sc.topCloserExample.length).toBeGreaterThan(10);
  });

  it('eksamenskunden krever ≥80 for godkjent', () => {
    const sim = new CoachSimulator('eksamenskunden', 1);
    sim.sendMessage('hei');
    const sc = sim.end();
    expect(sc.approved).toBe(false);
  });

  it('anti-juks: «skjønner?» ×4 + booking gir under 70 og ingen booking', () => {
    const sim = new CoachSimulator('kari', 1);
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
    const short = new CoachSimulator('kari', 1);
    short.sendMessage(GOOD_OPENING);
    short.sendMessage('hva?');
    short.sendMessage('hvorfor?');
    const shortCard = short.end();

    const long = new CoachSimulator('kari', 1);
    long.sendMessage(GOOD_OPENING);
    long.sendMessage('Hva har dere i dag, og hva betaler dere for det?');
    long.sendMessage('Hvorfor vurderer dere å bytte akkurat nå?');
    const longCard = long.end();

    expect(longCard.needs).toBeGreaterThan(shortCard.needs);
  });

  it('anti-juks: repetisjon av nesten identiske meldinger straffes', () => {
    const varied = new CoachSimulator('kari', 1);
    varied.sendMessage(GOOD_OPENING);
    varied.sendMessage('Hva betaler dere i dag, cirka?');
    varied.sendMessage('Og hva irriterer dere mest ved dagens løsning?');
    const v = varied.end();

    const repeat = new CoachSimulator('kari', 1);
    repeat.sendMessage(GOOD_OPENING);
    repeat.sendMessage('Hva betaler dere i dag, cirka?');
    repeat.sendMessage('Hva betaler dere i dag, cirka?');
    const r = repeat.end();

    expect(r.total).toBeLessThan(v.total);
  });

  it('anti-juks: én håndtert innvending kan ikke gi innvendingsscore over 80', () => {
    const sim = new CoachSimulator('kari', 1);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Dette er et kjempegodt tilbud altså.');
    sim.sendMessage(
      'Skjønner deg godt — sånt bestemmer man sammen. Hvis det sto på deg alene, hadde du gått for det?',
    );
    const sc = sim.end();
    expect(sc.objections).toBeLessThanOrEqual(80);
  });

  it('eksamensflyt: godt samtaleforløp mot eksamenskunden (nivå 3) gir ≥80', () => {
    const sim = new CoachSimulator('eksamenskunden', 3);
    sim.sendMessage(GOOD_OPENING);
    sim.sendMessage('Hva har dere i dag, og hva betaler dere i måneden?');
    sim.sendMessage('Og hva er det som irriterer deg mest med dagens løsning?');
    // Innvending 1 (leverandør):
    sim.sendMessage('Skjønner deg godt. Hva betaler dere i dag, og hvor lenge har dere hatt dem?');
    // Innvending 2 (råd):
    sim.sendMessage('Forstår det. Hvis vi regner på totalen — hva koster dagens løsning deg i måneden?');
    // Innvending 3 (tenke):
    sim.sendMessage('Helt greit. Hva er det du er mest usikker på — prisen eller innholdet?');
    // Kunden har myknet → close:
    const reply = sim.sendMessage(
      'Da gjør vi det enkelt: passer tirsdag klokka 10, eller er 14 bedre? Jeg sender deg en SMS med en gang.',
    );
    expect(reply.toLowerCase()).toContain('setter vi opp');

    const sc = sim.end();
    expect(sc.booked).toBe(true);
    expect(sc.total).toBeGreaterThanOrEqual(80);
    expect(sc.approved).toBe(true);
  });

  it('vanskelighetsgrad 3 krever flere håndterte innvendinger før booking', () => {
    const sim = new CoachSimulator('bjorn', 3);
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
