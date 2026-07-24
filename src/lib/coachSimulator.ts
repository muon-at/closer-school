// Regelbasert kundesimulator for DEMO-MODUS.
// Oppfører seg som en norsk kunde: skeptisk åpning → innvendinger fra en bank
// → mykner når selgeren stiller spørsmål og håndterer innvendinger riktig
// → aksepterer booking når closing forsøkes ETTER håndterte innvendinger.
// I produksjon byttes denne ut med Supabase edge function (functions/coach)
// som kaller Anthropic Messages API — samme grensesnitt, ekte AI.
import type { Scorecard } from './types';

export type Difficulty = 1 | 2 | 3;

interface ObjectionDef {
  id: string;
  text: string;
  /** Nøkkelord som viser at selgeren svarer på DENNE innvendingen riktig */
  handledBy: RegExp;
  softReply: string;
}

interface PersonaScript {
  name: string;
  openingGood: string;
  openingWeak: string;
  infoAnswers: string[];
  objections: ObjectionDef[];
  softened: string;
  bookedReply: string;
  prematureClose: string;
  fallback: string;
}

// ── Regex-hjelpere ────────────────────────────────────────────────────────
const RE_REFERENCE =
  /velforening|borettslag|nabo|avtale med|området|gata|feltet|referanse|idrettslag/i;
const RE_INTRO = /heter|det er .{2,25}fra|ringer fra|kommer fra/i;
const RE_SOCIAL_PROOF = /flere (gikk|har gått|ble med)|gikk sammen|andre i (gata|feltet|området)|naboen din/i;
const RE_ACK = /skjønner|forstår|helt greit|selvfølgelig|klart|godt spørsmål|det er vanlig|helt i orden|fair/i;
const RE_OPEN_Q = /\b(hva|hvordan|hvorfor|hvilke[nt]?|fortell)\b[^.!]*\?/i;
const RE_BOOKING =
  /passer (det )?(mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag|i morgen|klokka|kl)|book|komme innom|ta en prat (på )?(tirsdag|onsdag|torsdag)|skal vi si|sette deg opp|sees (på )?(mandag|tirsdag|onsdag|torsdag|fredag)|avtale (på|om)|eller (er|passer) \d{1,2}/i;
const RE_CONCRETE_TIME = /klokka \d|kl\.? ?\d|\d{1,2}[:.]\d{2}|(mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)/i;
const RE_SMS = /sms|tekstmelding|melding med|skriftlig/i;
/** Spørreord som viser at selgeren stiller et relevant spørsmål tilbake */
const RE_QUESTION_WORD = /\b(hva|hvordan|hvorfor|hvilke[nt]?|hvem|når|hvor|hvis|fortell)\b/i;

// ── Anti-juks-hjelpere ────────────────────────────────────────────────────
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\wæøåäöü\s]/gi, ' ')
      .split(/\s+/)
      .filter(Boolean),
  );
}

/** Jaccard-likhet mellom to meldinger (0–1). */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ── Innvendingsbanken ─────────────────────────────────────────────────────
const OBJECTIONS: Record<string, ObjectionDef> = {
  samboer: {
    id: 'samboer',
    text: 'Jeg må nesten snakke med samboeren min først, vi bestemmer sånt sammen.',
    handledBy: /begge|sammen|dere to|når (er )?dere|samboer|hvis det sto på deg|hva tror du (hun|han)/i,
    softReply: 'Ja … det er jo egentlig mest jeg som styrer sånt, da.',
  },
  raad: {
    id: 'raad',
    text: 'Ærlig talt har vi ikke råd til noe mer i måneden nå.',
    handledBy: /spare|regne|i måneden|totalen|neste måned|billigere|mindre enn|koster deg i dag|betaler dere i dag/i,
    softReply: 'Hm, når du regner på det sånn blir det jo faktisk mindre enn i dag …',
  },
  leverandor: {
    id: 'leverandor',
    text: 'Vi har allerede Verisure, så vi er egentlig dekket.',
    handledBy: /hva betaler|fornøyd|i tillegg|samme.*(pluss|og)|sammenlign|hva har dere i dag|hvor lenge har dere/i,
    softReply: 'Vi betaler vel rundt 549 i måneden … det har krøpet oppover, egentlig.',
  },
  mail: {
    id: 'mail',
    text: 'Kan du ikke bare sende meg noe på mail, så ser jeg på det?',
    handledBy: /sms|fem minutt|kort|drukner|ringe (deg )?(opp )?(igjen)?.*(torsdag|tirsdag|onsdag|fredag|i morgen)|når du har sett/i,
    softReply: 'Ja, ok — det er kanskje like greit å bare ta det på telefonen.',
  },
  tenke: {
    id: 'tenke',
    text: 'Jeg må tenke litt på det, tror jeg.',
    handledBy: /usikker på|hva er det du|prisen eller|hjelpe deg å tenke|hva (skal|må) til|noe mer som stopper/i,
    softReply: 'Det er vel egentlig prisen jeg lurer mest på … men det du sa ga mening.',
  },
  travelt: {
    id: 'travelt',
    text: 'Vi står midt i middagen her, jeg har ikke tid til dette nå.',
    handledBy: /kjapp|kort|ti sekunder|ringe (deg )?(når|senere|i kveld|i morgen)|passer bedre|etter (middag|jobb|leggetid)/i,
    softReply: 'Ok, hvis det går fort da …',
  },
  skeptisk: {
    id: 'skeptisk',
    text: 'Jeg har lest om så mye svindel på telefon, hvordan vet jeg at dette er seriøst?',
    handledBy: /angrerett|skriftlig|sms|nettside|organisasjonsnummer|sjekke oss|ta det i ro|ingen forpliktelse|velforening/i,
    softReply: 'Sånn ja … det hørtes jo ryddig ut, da.',
  },
  pris: {
    id: 'pris',
    text: 'Konkurrenten deres tilbød meg det billigere. Hvorfor skal jeg betale mer hos dere?',
    handledBy: /verdi|inkluder|forskjell|hva (fikk|inneholdt)|ta bort|pakke|totalen|kvalitet|hvis pris var eneste/i,
    softReply: 'Nja, når du sier hva som er inkludert er det kanskje ikke helt likt, nei.',
  },
};

// ── Personas ──────────────────────────────────────────────────────────────
const SCRIPTS: Record<string, PersonaScript> = {
  kari: {
    name: 'Kari',
    openingGood:
      'Å ja, velforeningen ja … jo, vi har jo Allente-pakka, men jeg har faktisk vurdert å si den opp. Alt er blitt så dyrt.',
    openingWeak: 'Hallo? Hvem er dette? Er det salg? Jeg har ikke tid til sånt.',
    infoAnswers: [
      'Vi betaler vel rundt 1 100 i måneden, tror jeg. Mannen min MÅ ha sporten, det er det eneste vi egentlig ser på.',
      'Nei altså, det er mest at prisen bare kryper oppover hvert år uten at vi får noe mer.',
    ],
    objections: [OBJECTIONS.samboer, OBJECTIONS.raad, OBJECTIONS.tenke],
    softened: 'Hm … det hørtes egentlig ikke så dumt ut, det der.',
    bookedReply: 'Ja, vet du hva, det kan vi godt. Send meg en melding på det, så husker jeg det.',
    prematureClose: 'Nei, nå går det litt fort i svingene her. Jeg er ikke der ennå.',
    fallback: 'Mm … ja, altså, jeg vet ikke helt jeg.',
  },
  bjorn: {
    name: 'Bjørn',
    openingGood:
      'Jaha, dere holder på i feltet ja — jeg så bilen deres borti gata. Vi har alarm fra Verisure allerede, men hva var det dere hadde?',
    openingWeak: 'Nei takk, vi kjøper ikke noe på døra. [døra på vei igjen]',
    infoAnswers: [
      'Vi har hatt Verisure i seks-sju år. Funker greit, men jo, prisen har vel blitt derétter.',
      'Det er vel rundt 549 i måneden nå, pluss at vi betalte en del for utstyret i starten.',
    ],
    objections: [OBJECTIONS.leverandor, OBJECTIONS.pris, OBJECTIONS.samboer],
    softened: 'Hm. Det er faktisk et greit poeng, det der.',
    bookedReply: 'Ja, kom innom da, så tar vi det ordentlig. Send meg tidspunktet på SMS.',
    prematureClose: 'Ta det med ro, vi er ikke der ennå. Jeg må vite hva dette faktisk er først.',
    fallback: 'Hm. Fortsett, da.',
  },
  martin: {
    name: 'Martin',
    openingGood:
      'Hei — jo, jeg har hørt om den avtalen. Men jeg står midt i middagen med to unger her, så du må være kjapp.',
    openingWeak: 'Sorry, midt i middagen her. Ikke interessert. Hadet.',
    infoAnswers: [
      'Kjapt da: nettet hjemme er helt håpløst på ungerommene, det er det eneste jeg irriterer meg over.',
      'Vi betaler sikkert 800–900 for bredbånd og streaming til sammen. Aner ikke nøyaktig, har ikke tid til å sjekke.',
    ],
    objections: [OBJECTIONS.travelt, OBJECTIONS.mail, OBJECTIONS.tenke],
    softened: 'Ok ok, du har et poeng. Hvis det fikser wifi-en på rommene er jeg interessert.',
    bookedReply: 'Deal. Send SMS med en gang, ellers glemmer jeg det garantert.',
    prematureClose: 'Nei, stopp litt — du har ikke engang spurt hva vi trenger. Kjapt nå.',
    fallback: 'Mhm. Og? Jeg har cirka tretti sekunder til.',
  },
  solveig: {
    name: 'Solveig',
    openingGood:
      'Velforeningen, sier du? Jaha … jo, det ringte faktisk en fra dere til naboen min også. Hva var det dette gjaldt, helt konkret?',
    openingWeak:
      'Nei, nå må jeg si … jeg kjøper ingenting av folk som ringer. Datteren min har sagt jeg skal legge på sånt.',
    infoAnswers: [
      'Jeg har det abonnementet jeg alltid har hatt. Det er sikkert altfor dyrt, men jeg tør ikke røre det.',
      'Det viktigste for meg er at ting bare virker, og at jeg ikke blir lurt. Jeg har lest så mye rart i avisa.',
    ],
    objections: [OBJECTIONS.skeptisk, OBJECTIONS.tenke, OBJECTIONS.samboer],
    softened: 'Ja … du virker jo ryddig, da. Det skal du ha.',
    bookedReply: 'Da gjør vi det sånn. Men send meg det skriftlig, er du snill — jeg vil ha ting på papiret.',
    prematureClose: 'Nei, vet du hva, nå går dette altfor fort. Sånt skriver man ikke under på over telefonen.',
    fallback: 'Jaha … ja, si det, du.',
  },
  rune: {
    name: 'Rune',
    openingGood:
      'Jo, jeg vet om avtalen. Men jeg skal si deg med en gang: jeg bytter ikke uten at det lønner seg. Hva er prisen?',
    openingWeak: 'Enda en selger. Hva koster det? Kom til poenget.',
    infoAnswers: [
      'Jeg betaler 749 i dag, og jeg har allerede fått tilbud om 649 fra konkurrenten deres. Slå det.',
      'Innhold interesserer meg middels. Bunnlinja er det som teller.',
    ],
    objections: [OBJECTIONS.pris, OBJECTIONS.raad, OBJECTIONS.mail],
    softened: 'Ok. Hvis totalen faktisk blir lavere, er jeg med på å se på det.',
    bookedReply: 'Greit. Men jeg lover ingenting før jeg ser tallene. Send SMS.',
    prematureClose: 'Du har ikke gitt meg ett eneste tall ennå. Ingen avtale før jeg ser regnestykket.',
    fallback: 'Tall, takk. Jeg hører bare ord.',
  },
  eksamenskunden: {
    name: 'Eksamenskunden',
    openingGood:
      'Jaha, dere igjen. Greit, du har ett minutt. Hva gjelder det — helt konkret?',
    openingWeak: 'Nei. Dårlig start. Hvem er du, og hvorfor ringer du akkurat meg?',
    infoAnswers: [
      'Vi har en leverandør i dag og betaler 899 i måneden. Middels fornøyd, hvis jeg skal være ærlig.',
      'Det som irriterer meg er kundeservicen. Prisen er én ting, men å sitte en time i kø er verre.',
    ],
    objections: [OBJECTIONS.leverandor, OBJECTIONS.raad, OBJECTIONS.tenke, OBJECTIONS.pris],
    softened: 'Greit. Du har faktisk svart ordentlig på det jeg har spurt om. Fortsett.',
    bookedReply: 'Ok. Da setter vi opp det. Skriftlig bekreftelse, takk.',
    prematureClose: 'Nei. Du hopper over stegene. Tilbake til start.',
    fallback: 'Hm. Jeg er ikke overbevist ennå.',
  },
};

// ── Simulatoren ───────────────────────────────────────────────────────────
export class CoachSimulator {
  readonly personaId: string;
  readonly difficulty: Difficulty;

  private script: PersonaScript;
  private turn = 0;
  private phase: 'opening' | 'dialog' | 'softened' | 'booked' = 'opening';
  private objectionQueue: ObjectionDef[];
  private pendingObjection: ObjectionDef | null = null;
  private raisedCount = 0;
  private handledCount = 0;
  // Anti-juks: kun ÉN innvending kan «håndteres» med generisk ack+spørsmål-mal.
  // Resten krever innholdsmessig svar (handledBy-regex per innvending).
  private genericHandledCount = 0;
  private requiredHandled: number;
  private infoIndex = 0;

  // Poengsamling
  private openingScore = 0;
  private needsScore = 0;
  private closingAttempted = false;
  private booked = false;
  private concreteTime = false;
  private smsMentioned = false;
  private ackUsed = false;
  /** Anti-juks: tidligere selgermeldinger + antall nesten-identiske repetisjoner */
  private previousMessages: string[] = [];
  private repeatedCount = 0;

  constructor(personaId: string, difficulty: Difficulty = 1) {
    this.personaId = personaId;
    this.difficulty = difficulty;
    this.script = SCRIPTS[personaId] ?? SCRIPTS.kari;
    this.objectionQueue = [...this.script.objections].slice(0, 1 + difficulty);
    this.requiredHandled = difficulty;
  }

  /** Selgeren sier noe → simulatoren svarer som kunden. */
  sendMessage(sellerText: string): string {
    this.turn += 1;
    const text = sellerText.trim();

    if (RE_ACK.test(text)) this.ackUsed = true;
    if (RE_SMS.test(text)) this.smsMentioned = true;

    // Anti-juks (d): straff nesten identiske meldinger (Jaccard-likhet)
    const isRepetition = this.previousMessages.some(
      (prev) => jaccardSimilarity(prev, text) >= 0.8,
    );
    if (isRepetition) this.repeatedCount += 1;
    this.previousMessages.push(text);

    // Spørsmål gir behovspoeng gjennom hele samtalen —
    // men ikke for korte meldinger (<4 ord) eller repetisjoner (anti-juks b/d)
    if (text.includes('?') && wordCount(text) >= 4 && !isRepetition) {
      this.needsScore += RE_OPEN_Q.test(text) ? 25 : 15;
      if (this.needsScore > 100) this.needsScore = 100;
    }

    // ── Tur 1: åpningen vurderes ──
    if (this.phase === 'opening') {
      let score = 25;
      if (RE_INTRO.test(text)) score += 20;
      if (RE_REFERENCE.test(text)) score += 25;
      if (RE_SOCIAL_PROOF.test(text)) score += 15;
      if (text.includes('?')) score += 15;
      this.openingScore = Math.min(100, score);
      this.phase = 'dialog';
      return this.openingScore >= 60 ? this.script.openingGood : this.script.openingWeak;
    }

    if (this.phase === 'booked') {
      return 'Da er vi ferdige her — vi har jo en avtale. Sees!';
    }

    // ── Håndtering av utestående innvending ──
    if (this.pendingObjection) {
      const obj = this.pendingObjection;
      const handledSpecific = obj.handledBy.test(text);
      // Anti-juks (a): generisk håndtering krever ≥6 ord OG anerkjennelse
      // OG et relevant spørsmål tilbake — «skjønner?» holder ikke.
      const handledGeneric =
        wordCount(text) >= 6 &&
        RE_ACK.test(text) &&
        text.includes('?') &&
        RE_QUESTION_WORD.test(text) &&
        !isRepetition;
      const genericAllowed = handledGeneric && this.genericHandledCount < 1;
      if (handledSpecific || genericAllowed) {
        if (!handledSpecific) this.genericHandledCount += 1;
        this.handledCount += 1;
        this.pendingObjection = null;
        if (this.handledCount >= this.requiredHandled) {
          this.phase = 'softened';
          return `${obj.softReply} ${this.script.softened}`;
        }
        // Mykner litt, men neste innvending kommer
        const next = this.nextObjection();
        return next
          ? `${obj.softReply} Men … ${next.text}`
          : `${obj.softReply} ${this.script.softened}`;
      }
      // Prøver selgeren å close mens innvendingen står ubesvart?
      if (RE_BOOKING.test(text)) {
        this.closingAttempted = true;
        return `${this.script.prematureClose} ${obj.text}`;
      }
      // Ikke håndtert — kunden står på sitt
      return `Nja, du svarte ikke helt på det jeg sa. ${obj.text}`;
    }

    // ── Closing-forsøk ──
    if (RE_BOOKING.test(text)) {
      this.closingAttempted = true;
      if (RE_CONCRETE_TIME.test(text)) this.concreteTime = true;
      const ready =
        this.phase === 'softened' || this.handledCount >= this.requiredHandled;
      if (ready) {
        this.phase = 'booked';
        this.booked = true;
        return this.script.bookedReply;
      }
      const next = this.nextObjection();
      return next
        ? `${this.script.prematureClose} ${next.text}`
        : this.script.prematureClose;
    }

    // ── Vanlig dialog: spørsmål gir info, ellers innvending/fallback ──
    if (this.phase === 'softened') {
      return this.script.softened;
    }

    if (text.includes('?') && this.infoIndex < this.script.infoAnswers.length) {
      const answer = this.script.infoAnswers[this.infoIndex];
      this.infoIndex += 1;
      // Etter andre info-svar kommer første innvending naturlig
      if (this.infoIndex >= 2 && this.raisedCount === 0) {
        const next = this.nextObjection();
        return next ? `${answer} Men ${next.text.toLowerCase()}` : answer;
      }
      return answer;
    }

    // Selger prater uten spørsmål → kunden kommer med innvending
    const next = this.nextObjection();
    if (next) return next.text;
    return this.script.fallback;
  }

  private nextObjection(): ObjectionDef | null {
    const next = this.objectionQueue.shift();
    if (!next) return null;
    this.pendingObjection = next;
    this.raisedCount += 1;
    return next;
  }

  /** Avslutt samtalen og få scorecard. */
  end(): Scorecard {
    const opening = this.openingScore;
    const needs = Math.min(100, this.needsScore);
    // Anti-juks (c): innvendingsscore skalerer med antall innvendinger
    // presentert — under 2 håndterte kan aldri gi mer enn 80.
    let objections: number;
    if (this.raisedCount === 0) {
      objections = 40;
    } else {
      objections = Math.min(
        100,
        Math.round(30 + 70 * (this.handledCount / this.raisedCount)) +
          (this.ackUsed ? 0 : -10),
      );
      if (this.handledCount < 2) objections = Math.min(objections, 80);
      objections = Math.max(0, objections);
    }
    let closing = 15;
    if (this.closingAttempted) closing = 40;
    if (this.booked) {
      closing = 85;
      if (this.concreteTime) closing += 10;
      if (this.smsMentioned) closing += 5;
    }
    closing = Math.min(100, closing);

    // Anti-juks (d): straff repetisjon av nesten identiske meldinger
    const repetitionPenalty = Math.min(20, this.repeatedCount * 7);
    const total = Math.max(
      0,
      Math.round(
        opening * 0.2 + needs * 0.25 + objections * 0.3 + closing * 0.25,
      ) - repetitionPenalty,
    );
    const threshold = this.personaId === 'eksamenskunden' ? 80 : 70;

    const feedback: string[] = [];
    if (opening >= 70)
      feedback.push('Sterk åpning — du brukte referanse og forklarte hvorfor du ringte akkurat denne kunden.');
    else
      feedback.push('Åpningen manglet en konkret grunn. Bruk referanse-metoden: «vi har en avtale med velforeningen der …»');
    if (needs >= 60)
      feedback.push('Bra spørreteknikk — du gravde i kundens situasjon før du pitchet.');
    else
      feedback.push('Du stilte for få spørsmål. Avdekk behovet før du selger: «hva har dere i dag, og hva irriterer mest?»');
    if (this.raisedCount > 0 && this.handledCount === this.raisedCount)
      feedback.push('Alle innvendinger håndtert etter formelen: anerkjenn → utforsk → svar → fremdrift. Meget bra.');
    else if (this.raisedCount > 0)
      feedback.push(`Du håndterte ${this.handledCount} av ${this.raisedCount} innvendinger. Husk å anerkjenne først («skjønner deg godt») og still et spørsmål tilbake.`);
    if (this.repeatedCount > 0)
      feedback.push('Du gjentok nesten identiske meldinger — det trekker ned. Varier språket og bygg videre på det kunden faktisk sier.');
    if (this.booked)
      feedback.push(
        this.smsMentioned
          ? 'Perfekt avslutning: konkret tidspunkt og SMS-bekreftelse. Sånn gjør en closer det.'
          : 'Du booket — bra! Husk SMS-bekreftelsen med en gang, den halverer no-shows.',
      );
    else if (this.closingAttempted)
      feedback.push('Du forsøkte å close før kunden var klar. Håndter innvendingene først — så lander bookingen av seg selv.');
    else
      feedback.push('Du ba aldri om noe konkret. Hver samtale skal ende i et neste steg: «passer tirsdag klokka 10, eller er 14 bedre?»');

    const weakest = Math.min(opening, needs, objections, closing);
    let topCloserExample: string;
    if (weakest === opening)
      topCloserExample =
        '«Hei, det er Jonas fra [firma]. Vi fikk en avtale med velforeningen der i forbindelse med oppgraderingen, så jeg ringer rundt i feltet. Flere gikk sammen og fikk prisen ned til 2 500 — har dere dette fra før?»';
    else if (weakest === needs)
      topCloserExample =
        '«Før jeg sier noe som helst om pris: hva har dere i dag, og hva er det som irriterer mest med det?»';
    else if (weakest === objections)
      topCloserExample =
        '«Skjønner deg godt — sånt bestemmer man sammen. Bare så jeg vet det: hvis det sto på deg alene, hadde du gått for det?»';
    else
      topCloserExample =
        '«Jeg er faktisk i området på tirsdag. Passer det klokka 10, eller er 14 bedre? … Perfekt — jeg sender deg en SMS med en gang, så har du alt skriftlig.»';

    return {
      opening,
      needs,
      objections,
      closing,
      total,
      approved: total >= threshold,
      feedback,
      topCloserExample,
      booked: this.booked,
    };
  }
}
