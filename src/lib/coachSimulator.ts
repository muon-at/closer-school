// Regelbasert kundesimulator for DEMO-MODUS — «skjult kunde»-modellen.
//
// Studenten velger et OPPDRAG (kanal + produkt + lead-type), IKKE en ferdig
// beskrevet person. Kunden bak oppdraget er SKJULT og avslører navn, situasjon,
// behov, beslutningsdynamikk og økonomi KUN når studenten graver med relevante
// (helst åpne) spørsmål. En kunde i salg gir aldri bort noe gratis.
//
// Samtalen er UTFALLSBASERT: BOOKET MØTE / SALG kun når nok nøkkelinfo er
// avdekket (≥60 % vektet) OG innvendingene er håndtert. Closer studenten for
// tidlig, ender det i «send meg noe på mail» → OPPFØLGING eller TAPT.
//
// I produksjon byttes denne ut med Supabase edge function (functions/coach)
// som kaller Anthropic Messages API — samme grensesnitt, ekte AI.
import type { CoachOutcome, Scorecard } from './types';

export type Difficulty = 1 | 2 | 3;

interface ObjectionDef {
  id: string;
  text: string;
  /** Nøkkelord som viser at selgeren svarer på DENNE innvendingen riktig */
  handledBy: RegExp;
  softReply: string;
}

/** Én bit skjult kundeinfo som må graves frem med relevante spørsmål. */
export interface FactDef {
  id: string;
  /** Kort etikett til «AVDEKKET INFO»-panelet og scorecardet */
  label: string;
  /** Temaord: spørsmål som avdekker denne facten */
  trigger: RegExp;
  /** Kundens svar når facten avdekkes */
  answer: string;
  /** Vekt i needs-scoren (summen per profil = 100) */
  weight: number;
}

interface HiddenProfile {
  /** Kundens navn — SKJULT for studenten til det graves frem */
  name: string;
  goal: 'booket' | 'salg';
  openingGood: string;
  /** Avslører den gode åpningen navnet naturlig? (eksamen: aldri) */
  nameInGoodOpening: boolean;
  openingWeak: string;
  facts: FactDef[];
  objections: ObjectionDef[];
  softened: string;
  successReply: string;
  /** Closing-forsøk med for lite avdekket info → «send meg noe»-utfall */
  lowInfoBrushoff: string;
  prematureClose: string;
  fallback: string;
}

// ── Regex-hjelpere ────────────────────────────────────────────────────────
const RE_REFERENCE =
  /velforening|borettslag|nabo|avtale med|området|gata|feltet|referanse|idrettslag|la igjen (nummer|interesse)|skjemaet/i;
const RE_INTRO = /heter|det er .{2,25}fra|ringer fra|kommer fra/i;
const RE_SOCIAL_PROOF = /flere (gikk|har gått|ble med)|gikk sammen|andre i (gata|feltet|området)|naboen din/i;
const RE_ACK = /skjønner|forstår|helt greit|selvfølgelig|klart|godt spørsmål|det er vanlig|helt i orden|fair/i;
const RE_BOOKING =
  /passer (det )?(mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag|i morgen|klokka|kl)|book|komme innom|ta en prat (på )?(tirsdag|onsdag|torsdag)|skal vi si|sette deg opp|sees (på )?(mandag|tirsdag|onsdag|torsdag|fredag)|avtale (på|om)|eller (er|passer) \d{1,2}/i;
const RE_SALE_CLOSE =
  /sette i gang|bestille|signere|slå til på|avtalen i boks|skal vi kjøre|sette opp avtalen|bytte i dag/i;
const RE_CONCRETE_TIME = /klokka \d|kl\.? ?\d|\d{1,2}[:.]\d{2}|(mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag)/i;
const RE_SMS = /sms|tekstmelding|melding med|skriftlig|kalenderinvitt/i;
/** Spørreord som viser at selgeren stiller et relevant spørsmål tilbake */
const RE_QUESTION_WORD = /\b(hva|hvordan|hvorfor|hvilke[nt]?|hvem|når|hvor|hvis|fortell)\b/i;
/** «Hvem snakker jeg med?»-aktige spørsmål — avdekker navnet (etter egen intro) */
const RE_WHO =
  /hvem (snakker|er det) |snakker jeg med|hva heter du|hvem har jeg (gleden|æren)|hvem er du/i;

/** Hvor stor vektet andel av factene som må være avdekket før kunden sier ja */
const DISCOVERY_THRESHOLD = 0.6;

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

// ── Delte tema-regexer for discovery ──────────────────────────────────────
const T_SITUASJON =
  /hva har (du|dere)|hvilke[nt]? (avtale|leverandør|pakke|løsning|alarm|linje|system)|fra før|hvordan (er|har) (du|dere)|bruker (du|dere)|hva slags|situasjon/i;
const T_BEHOV =
  /irriter|plage|savner|fornøyd|utfordr|problem|hva (er )?viktig|ønsker (du|dere)|forbedre|mangler|frustrer|fungerer (det|den|alt)/i;
const T_BESLUTNING =
  /hvem.{0,30}(bestemmer|avgjør|involvert|med på|være med)|bestemmer (du|dere|sånt)|tar (du|dere) .{0,20}(beslutning|avgjørelse)|flere som (må|skal)|andre som (må|skal)/i;
const T_OKONOMI = /betaler|koster|pris|i måneden|i året|kroner|budsjett|regning/i;

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
    text: 'Vi har allerede en leverandør på det der, så vi er egentlig dekket.',
    handledBy: /hva betaler|fornøyd|i tillegg|samme.*(pluss|og)|sammenlign|hva har dere i dag|hvor lenge har dere/i,
    softReply: 'Vi betaler vel en del i måneden … det har krøpet oppover, egentlig.',
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
  system: {
    id: 'system',
    text: 'Vi har allerede et system for dette, så jeg ser ikke helt poenget.',
    handledBy: /hva bruker dere|fornøyd|hva koster|dekker det|savner|i tillegg|sammenlign|hvor lenge har dere/i,
    softReply: 'Nja … det dekker vel ikke alt, hvis jeg skal være helt ærlig.',
  },
};

// ── Skjulte kundeprofiler per oppdrag ─────────────────────────────────────
// Studenten ser KUN kanal/produkt/lead-type. Alt her er skjult og må graves frem.
const PROFILES: Record<string, HiddenProfile> = {
  // O1 · TELEFON · TV & strømming (nysalg) · kald liste
  // Kari (54): dyr, gammel avtale hun ikke tenker over. Misfornøyd med pris —
  // men IKKE i oppsigelsesmodus. Rent nysalg, aldri winback.
  o1: {
    name: 'Kari',
    goal: 'salg',
    nameInGoodOpening: true,
    openingGood:
      'Å ja, velforeningen ja … jo, hei du. Kari heter jeg. Hva var det dette gjaldt, da?',
    openingWeak: 'Hallo? Hvem er dette? Er det salg? Jeg har ikke tid til sånt.',
    facts: [
      {
        id: 'navn',
        label: 'Navn: Kari (54)',
        trigger: RE_WHO,
        answer: 'Kari, heter jeg. Kari.',
        weight: 10,
      },
      {
        id: 'situasjon',
        label: 'Situasjon: samme TV-pakke i ti år',
        trigger: T_SITUASJON,
        answer:
          'Vi har hatt den samme TV-pakka i sikkert ti år, med boks og alt mulig. Det bare ruller og går, jeg tenker aldri over det.',
        weight: 20,
      },
      {
        id: 'behov',
        label: 'Pain: prisen kryper + betaler for ubrukte kanaler',
        trigger: T_BEHOV,
        answer:
          'Nei altså … prisen kryper oppover hvert eneste år, og halvparten av kanalene ser vi jo aldri på. Det irriterer meg egentlig litt, nå som du sier det.',
        weight: 30,
      },
      {
        id: 'beslutning',
        label: 'Beslutning: Kari styrer, men mannen MÅ ha sporten',
        trigger: T_BESLUTNING,
        answer:
          'Det er stort sett jeg som styrer sånt her i huset — men mannen min MÅ ha sporten, ellers blir det leven.',
        weight: 20,
      },
      {
        id: 'okonomi',
        label: 'Økonomi: ~1 100 kr/mnd i dag',
        trigger: T_OKONOMI,
        answer:
          'Vi betaler vel rundt 1 100 i måneden totalt, tror jeg. Jeg har ærlig talt ikke sjekket på lenge.',
        weight: 20,
      },
    ],
    objections: [OBJECTIONS.samboer, OBJECTIONS.raad, OBJECTIONS.tenke],
    softened: 'Hm … det hørtes egentlig ikke så dumt ut, det der.',
    successReply:
      'Ja, vet du hva — det hørtes fornuftig ut. Da gjør vi det sånn. Send meg bekreftelsen på melding, er du snill.',
    lowInfoBrushoff:
      'Nja … du vet jo egentlig ingenting om oss ennå. Kan du ikke heller sende meg noe på mail, så ser jeg på det?',
    prematureClose: 'Nei, nå går det litt fort i svingene her. Jeg er ikke der ennå.',
    fallback: 'Mm … ja, altså, jeg vet ikke helt jeg.',
  },

  // O2 · DØR · boligalarm · referanse fra nabolaget
  o2: {
    name: 'Bjørn',
    goal: 'booket',
    nameInGoodOpening: true,
    openingGood:
      'Jaha, dere holder på i feltet ja — jeg så bilen deres borti gata. Bjørn. Hva var det dere hadde?',
    openingWeak: 'Nei takk, vi kjøper ikke noe på døra. [døra på vei igjen]',
    facts: [
      {
        id: 'navn',
        label: 'Navn: Bjørn (47)',
        trigger: RE_WHO,
        answer: 'Bjørn. Og du var …?',
        weight: 10,
      },
      {
        id: 'situasjon',
        label: 'Situasjon: har alarm fra før (6–7 år)',
        trigger: T_SITUASJON,
        answer: 'Vi har hatt alarm i seks-sju år hos samme leverandør. Funker greit nok, det.',
        weight: 20,
      },
      {
        id: 'behov',
        label: 'Pain: prisen har krøpet + garasjen er udekket',
        trigger: T_BEHOV,
        answer:
          'Skal jeg være ærlig, er det prisen som har krøpet oppover. Og så dekker ikke sensorene garasjen, der jeg har verktøyet.',
        weight: 30,
      },
      {
        id: 'beslutning',
        label: 'Beslutning: tar det med kona, men Bjørn følger opp',
        trigger: T_BESLUTNING,
        answer: 'Kona og jeg tar sånt sammen, men det er jeg som følger opp alarmen i praksis.',
        weight: 20,
      },
      {
        id: 'okonomi',
        label: 'Økonomi: ~549 kr/mnd + utstyr betalt',
        trigger: T_OKONOMI,
        answer:
          'Det er vel rundt 549 i måneden nå, pluss at vi betalte en del for utstyret i starten.',
        weight: 20,
      },
    ],
    objections: [OBJECTIONS.leverandor, OBJECTIONS.pris, OBJECTIONS.samboer],
    softened: 'Hm. Det er faktisk et greit poeng, det der.',
    successReply: 'Ja, kom innom da, så tar vi det ordentlig. Send meg tidspunktet på SMS.',
    lowInfoBrushoff:
      'Vet du hva — du har ikke spurt meg om noen ting ennå. Legg heller igjen noe skriftlig i postkassa, så ser vi på det.',
    prematureClose: 'Ta det med ro, vi er ikke der ennå. Jeg må vite hva dette faktisk er først.',
    fallback: 'Hm. Fortsett, da.',
  },

  // O3 · TELEFON · strømavtale · innkommende interesse (har lagt igjen nummer)
  o3: {
    name: 'Solveig',
    goal: 'salg',
    nameInGoodOpening: true,
    openingGood:
      'Ja, hallo … jo, det stemmer at jeg la igjen nummeret mitt på det skjemaet. Solveig heter jeg. Men jeg lover ingenting, altså.',
    openingWeak:
      'Nei, nå må jeg si … jeg kjøper ingenting av folk som ringer. Datteren min har sagt jeg skal legge på sånt.',
    facts: [
      {
        id: 'navn',
        label: 'Navn: Solveig (71)',
        trigger: RE_WHO,
        answer: 'Solveig. Men det står vel i det skjemaet jeg fylte ut?',
        weight: 10,
      },
      {
        id: 'situasjon',
        label: 'Situasjon: gammel strømavtale, aner ikke hvilken',
        trigger: T_SITUASJON,
        answer:
          'Jeg har den strømavtalen jeg alltid har hatt, helt siden mannen min levde. Jeg aner faktisk ikke hva slags avtale det er.',
        weight: 20,
      },
      {
        id: 'behov',
        label: 'Pain: regningen føles altfor høy + redd for å bli lurt',
        trigger: T_BEHOV,
        answer:
          'Det viktigste for meg er at ting bare virker, og at jeg ikke blir lurt. Datteren min sa regningen min så altfor høy ut — det var derfor jeg fylte ut det skjemaet.',
        weight: 30,
      },
      {
        id: 'beslutning',
        label: 'Beslutning: hører alltid med datteren først',
        trigger: T_BESLUTNING,
        answer: 'Jeg pleier å høre med datteren min før jeg skriver under på noe som helst.',
        weight: 20,
      },
      {
        id: 'okonomi',
        label: 'Økonomi: ~2 400 kr sist måned — alene i huset',
        trigger: T_OKONOMI,
        answer:
          'Sist måned var regningen på nesten 2 400, og det er bare meg i huset. Det kan vel ikke være riktig?',
        weight: 20,
      },
    ],
    objections: [OBJECTIONS.skeptisk, OBJECTIONS.tenke, OBJECTIONS.mail],
    softened: 'Ja … du virker jo ryddig, da. Det skal du ha.',
    successReply:
      'Ja … da gjør vi det sånn. Men jeg vil ha alt skriftlig, er du snill — med angreretten og alt.',
    lowInfoBrushoff:
      'Nei, vet du hva — du vet jo ikke engang hva slags avtale jeg har. Send meg heller noe i posten, så ser jeg på det med datteren min.',
    prematureClose:
      'Nei, vet du hva, nå går dette altfor fort. Sånt skriver man ikke under på over telefonen.',
    fallback: 'Jaha … ja, si det, du.',
  },

  // O4 · DØR · fiber/internett · kald
  o4: {
    name: 'Martin',
    goal: 'booket',
    nameInGoodOpening: true,
    openingGood:
      'Hei — jo? Martin. Men jeg står midt i middagen med to unger her, så du må være kjapp.',
    openingWeak: 'Sorry, midt i middagen her. Ikke interessert. Hadet.',
    facts: [
      {
        id: 'navn',
        label: 'Navn: Martin (34)',
        trigger: RE_WHO,
        answer: 'Martin. Kjapt nå.',
        weight: 10,
      },
      {
        id: 'situasjon',
        label: 'Situasjon: bredbånd via gammel kabel, aldri byttet',
        trigger: T_SITUASJON,
        answer:
          'Vi har bredbånd via den kabelen som lå her da vi kjøpte huset. Aldri byttet, aldri giddet å sjekke.',
        weight: 20,
      },
      {
        id: 'behov',
        label: 'Pain: håpløst nett på ungerommene i 2. etasje',
        trigger: T_BEHOV,
        answer:
          'Kjapt da: nettet er helt håpløst på ungerommene i andre etasje. Det er det eneste jeg irriterer meg over her i huset.',
        weight: 30,
      },
      {
        id: 'beslutning',
        label: 'Beslutning: Martin bestemmer (så lenge strømmingen funker)',
        trigger: T_BESLUTNING,
        answer: 'Sånt bestemmer jeg. Kona bryr seg ikke så lenge serien hennes ruller.',
        weight: 20,
      },
      {
        id: 'okonomi',
        label: 'Økonomi: ~800–900 kr/mnd for nett + strømming',
        trigger: T_OKONOMI,
        answer:
          'Vi betaler sikkert 800–900 for bredbånd og strømming til sammen. Aner ikke nøyaktig, har ikke tid til å sjekke.',
        weight: 20,
      },
    ],
    objections: [OBJECTIONS.travelt, OBJECTIONS.mail, OBJECTIONS.tenke],
    softened: 'Ok ok, du har et poeng. Hvis det fikser nettet på rommene er jeg interessert.',
    successReply: 'Deal — kom tilbake da. Send SMS med en gang, ellers glemmer jeg det garantert.',
    lowInfoBrushoff:
      'Du har ikke engang spurt hva vi har i dag. Legg igjen en lapp, så ser jeg på det når ungene har lagt seg.',
    prematureClose: 'Nei, stopp litt — du har ikke engang spurt hva vi trenger. Kjapt nå.',
    fallback: 'Mhm. Og? Jeg har cirka tretti sekunder til.',
  },

  // O5 · TELEFON · B2B møtebooking (SaaS) · kald
  o5: {
    name: 'Rune',
    goal: 'booket',
    nameInGoodOpening: true,
    openingGood:
      'Rune, daglig leder, ja — du har fått tak i riktig person. Men jeg har et møte om fem minutter, så vær konkret.',
    openingWeak: 'Enda en selger. Vi har ikke behov. Kom til poenget eller legg på.',
    facts: [
      {
        id: 'navn',
        label: 'Navn: Rune (41), daglig leder',
        trigger: RE_WHO,
        answer: 'Rune. Daglig leder. Og du har 30 sekunder.',
        weight: 10,
      },
      {
        id: 'situasjon',
        label: 'Situasjon: regneark + gammelt CRM',
        trigger: T_SITUASJON,
        answer: 'Vi kjører alt i regneark og et gammelt CRM i dag. Det halter, men det funker.',
        weight: 20,
      },
      {
        id: 'behov',
        label: 'Pain: selgerne kaster bort halve dagen på manuelt arbeid',
        trigger: T_BEHOV,
        answer:
          'Det som faktisk koster oss penger, er at selgerne mine bruker halve dagen på ting som burde vært automatisk. Det irriterer meg hver eneste uke.',
        weight: 30,
      },
      {
        id: 'beslutning',
        label: 'Beslutning: Rune beslutter, økonomisjefen ser tallene',
        trigger: T_BESLUTNING,
        answer: 'Jeg tar beslutningen, men økonomisjefen min skal alltid se tallene først.',
        weight: 20,
      },
      {
        id: 'okonomi',
        label: 'Økonomi: ~40 000 kr/år for dagens system',
        trigger: T_OKONOMI,
        answer:
          'Vi betaler rundt 40 000 i året for dagens oppsett. Skal dere være dyrere, må det bevises på bunnlinja.',
        weight: 20,
      },
    ],
    objections: [OBJECTIONS.system, OBJECTIONS.mail, OBJECTIONS.pris],
    softened: 'Ok. Hvis det faktisk frigjør tid for selgerne mine, er jeg med på å se på det.',
    successReply:
      'Greit. Book møtet — tirsdag funker. Send kalenderinvitt og en kort agenda, så stiller jeg.',
    lowInfoBrushoff:
      'Du vet ingenting om hvordan vi jobber. Send meg en kort presentasjon på mail, så tar vi det derfra — kanskje.',
    prematureClose: 'Du har ikke gitt meg én eneste grunn ennå. Ingen møter før jeg ser poenget.',
    fallback: 'Konkret, takk. Jeg hører bare ord.',
  },

  // EKSAMEN · tilfeldig kanal/produkt · ALT skjult · låst til nivå 3 · krav ≥80
  eksamen: {
    name: 'Eksamenskunden',
    goal: 'booket',
    nameInGoodOpening: false,
    openingGood: 'Jaha, dere igjen. Greit, du har ett minutt. Hva gjelder det — helt konkret?',
    openingWeak: 'Nei. Dårlig start. Hvem er du, og hvorfor ringer du akkurat meg?',
    facts: [
      {
        id: 'navn',
        label: 'Navn: Roger (49)',
        trigger: RE_WHO,
        answer: 'Hvem jeg er? … Roger, da. Fortsett.',
        weight: 10,
      },
      {
        id: 'situasjon',
        label: 'Situasjon: har leverandør, middels fornøyd',
        trigger: T_SITUASJON,
        answer: 'Vi har en leverandør i dag. Middels fornøyd, hvis jeg skal være ærlig.',
        weight: 20,
      },
      {
        id: 'behov',
        label: 'Pain: elendig kundeservice (time i kø)',
        trigger: T_BEHOV,
        answer:
          'Det som irriterer meg er kundeservicen. Prisen er én ting, men å sitte en time i kø er verre.',
        weight: 30,
      },
      {
        id: 'beslutning',
        label: 'Beslutning: Roger bestemmer, men diskuterer hjemme',
        trigger: T_BESLUTNING,
        answer:
          'Jeg bestemmer. Men jeg diskuterer alt med min bedre halvdel, så ikke tro du er i mål med meg alene.',
        weight: 20,
      },
      {
        id: 'okonomi',
        label: 'Økonomi: 899 kr/mnd i dag',
        trigger: T_OKONOMI,
        answer: 'Vi betaler 899 i måneden i dag. Og nei, jeg betaler ikke mer for det samme.',
        weight: 20,
      },
    ],
    objections: [OBJECTIONS.raad, OBJECTIONS.pris, OBJECTIONS.tenke, OBJECTIONS.mail],
    softened: 'Greit. Du har faktisk svart ordentlig på det jeg har spurt om. Fortsett.',
    successReply: 'Ok. Da setter vi opp det. Skriftlig bekreftelse, takk.',
    lowInfoBrushoff:
      'Nei. Du vet ikke nok om oss til å be om noe som helst. Send meg noe på mail — og gjør leksa di først neste gang.',
    prematureClose: 'Nei. Du hopper over stegene. Tilbake til start.',
    fallback: 'Hm. Jeg er ikke overbevist ennå.',
  },
};

// ── Simulatoren ───────────────────────────────────────────────────────────
export class CoachSimulator {
  readonly missionId: string;
  readonly difficulty: Difficulty;

  private profile: HiddenProfile;
  private turn = 0;
  private phase: 'opening' | 'dialog' | 'softened' | 'closed' = 'opening';
  private objectionQueue: ObjectionDef[];
  private pendingObjection: ObjectionDef | null = null;
  private raisedCount = 0;
  private handledCount = 0;
  // Anti-juks: kun ÉN innvending kan «håndteres» med generisk ack+spørsmål-mal.
  // Resten krever innholdsmessig svar (handledBy-regex per innvending).
  private genericHandledCount = 0;
  private requiredHandled: number;

  // Discovery-tilstand
  private revealedIds = new Set<string>();
  private introducedSelf = false;

  // Poengsamling
  private openingScore = 0;
  private closingAttempted = false;
  private brushoff = false;
  private success = false;
  private concreteTime = false;
  private smsMentioned = false;
  private ackUsed = false;
  /** Anti-juks: tidligere selgermeldinger + antall nesten-identiske repetisjoner */
  private previousMessages: string[] = [];
  private repeatedCount = 0;

  constructor(missionId: string, difficulty: Difficulty = 1) {
    this.missionId = missionId;
    this.difficulty = difficulty;
    this.profile = PROFILES[missionId] ?? PROFILES.o1;
    this.objectionQueue = [...this.profile.objections].slice(0, 1 + difficulty);
    this.requiredHandled = difficulty;
  }

  /** Facts studenten har gravd frem — brukes av «AVDEKKET INFO»-panelet. */
  revealedFacts(): { id: string; label: string }[] {
    return this.profile.facts
      .filter((f) => this.revealedIds.has(f.id))
      .map((f) => ({ id: f.id, label: f.label }));
  }

  /** Totalt antall facts i den skjulte profilen. */
  factCount(): number {
    return this.profile.facts.length;
  }

  private totalWeight(): number {
    return this.profile.facts.reduce((sum, f) => sum + f.weight, 0);
  }

  private revealedWeight(): number {
    return this.profile.facts
      .filter((f) => this.revealedIds.has(f.id))
      .reduce((sum, f) => sum + f.weight, 0);
  }

  private factFraction(): number {
    const total = this.totalWeight();
    return total === 0 ? 0 : this.revealedWeight() / total;
  }

  private nonNameRevealedCount(): number {
    let n = 0;
    for (const id of this.revealedIds) if (id !== 'navn') n += 1;
    return n;
  }

  /**
   * Finn facten dette spørsmålet avdekker (uten å endre state).
   * Krever ekte spørsmål (≥4 ord, spørsmålstegn) som ikke er repetisjon —
   * og navnet avsløres kun etter at selgeren har presentert seg selv.
   */
  private matchFact(text: string, isRepetition: boolean): FactDef | null {
    if (isRepetition || !text.includes('?') || wordCount(text) < 4) return null;
    for (const fact of this.profile.facts) {
      if (this.revealedIds.has(fact.id)) continue;
      if (fact.id === 'navn') {
        if (this.introducedSelf && RE_WHO.test(text)) return fact;
        continue;
      }
      if (fact.trigger.test(text)) return fact;
    }
    return null;
  }

  private reveal(factId: string) {
    this.revealedIds.add(factId);
  }

  /** Selgeren sier noe → simulatoren svarer som den skjulte kunden. */
  sendMessage(sellerText: string): string {
    this.turn += 1;
    const text = sellerText.trim();

    if (RE_INTRO.test(text)) this.introducedSelf = true;
    if (RE_ACK.test(text)) this.ackUsed = true;
    if (RE_SMS.test(text)) this.smsMentioned = true;

    // Anti-juks (d): straff nesten identiske meldinger (Jaccard-likhet)
    const isRepetition = this.previousMessages.some(
      (prev) => jaccardSimilarity(prev, text) >= 0.8,
    );
    if (isRepetition) this.repeatedCount += 1;
    this.previousMessages.push(text);

    // ── Tur 1: åpningen vurderes ──
    if (this.phase === 'opening') {
      let score = 25;
      if (RE_INTRO.test(text)) score += 20;
      if (RE_REFERENCE.test(text)) score += 25;
      if (RE_SOCIAL_PROOF.test(text)) score += 15;
      if (text.includes('?')) score += 15;
      this.openingScore = Math.min(100, score);
      this.phase = 'dialog';
      if (this.openingScore >= 60) {
        // God åpning (intro + grunn + spørsmål) → kunden presenterer seg
        // naturlig tilbake. Eksamenskunden holder alltid kortene tett.
        if (this.profile.nameInGoodOpening) this.reveal('navn');
        return this.profile.openingGood;
      }
      return this.profile.openingWeak;
    }

    if (this.phase === 'closed') {
      return 'Da er vi ferdige her — vi har jo en avtale. Sees!';
    }

    const factCandidate = this.matchFact(text, isRepetition);

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
        // Godt mot-spørsmål kan avdekke info samtidig (f.eks. «hva betaler dere i dag?»)
        let factPart = '';
        if (factCandidate) {
          this.reveal(factCandidate.id);
          factPart = ` ${factCandidate.answer}`;
        }
        if (this.handledCount >= this.requiredHandled) {
          this.phase = 'softened';
          return `${obj.softReply}${factPart} ${this.profile.softened}`;
        }
        // Mykner litt, men neste innvending kommer
        const next = this.nextObjection();
        return next
          ? `${obj.softReply}${factPart} Men … ${next.text}`
          : `${obj.softReply}${factPart} ${this.profile.softened}`;
      }
      // Prøver selgeren å close mens innvendingen står ubesvart?
      if (RE_BOOKING.test(text) || RE_SALE_CLOSE.test(text)) {
        this.closingAttempted = true;
        return `${this.profile.prematureClose} ${obj.text}`;
      }
      // Ikke håndtert — kunden står på sitt (og gir IKKE bort info gratis)
      return `Nja, du svarte ikke helt på det jeg sa. ${obj.text}`;
    }

    // ── Closing-forsøk ──
    if (RE_BOOKING.test(text) || RE_SALE_CLOSE.test(text)) {
      this.closingAttempted = true;
      if (RE_CONCRETE_TIME.test(text)) this.concreteTime = true;
      const objectionsOk =
        this.phase === 'softened' || this.handledCount >= this.requiredHandled;
      if (!objectionsOk) {
        const next = this.nextObjection();
        return next
          ? `${this.profile.prematureClose} ${next.text}`
          : this.profile.prematureClose;
      }
      // Utfallsregelen: uten nok avdekket nøkkelinfo sier kunden aldri ja —
      // closing uten discovery ender i «send meg noe»-utfallet.
      if (this.factFraction() < DISCOVERY_THRESHOLD) {
        this.brushoff = true;
        return this.profile.lowInfoBrushoff;
      }
      this.phase = 'closed';
      this.success = true;
      return this.profile.successReply;
    }

    // ── Discovery: relevant spørsmål → kunden avslører én fact ──
    if (factCandidate) {
      this.reveal(factCandidate.id);
      // Etter at kunden har åpnet seg litt (2 facts), kommer første innvending
      if (
        this.nonNameRevealedCount() >= 2 &&
        this.raisedCount === 0 &&
        this.phase !== 'softened'
      ) {
        const next = this.nextObjection();
        if (next) {
          return `${factCandidate.answer} Men ${next.text.charAt(0).toLowerCase()}${next.text.slice(1)}`;
        }
      }
      return factCandidate.answer;
    }

    if (this.phase === 'softened') {
      return this.profile.softened;
    }

    // Selger prater uten (relevant) spørsmål → kunden kommer med innvending
    const next = this.nextObjection();
    if (next) return next.text;
    return this.profile.fallback;
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
    // Needs-score = vektet andel avdekket nøkkelinfo (discovery-mekanikken)
    const needs = Math.min(100, Math.round(100 * this.factFraction()));

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
    if (this.success) {
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
    const threshold = this.missionId === 'eksamen' ? 80 : 70;

    // Utfall
    let outcome: CoachOutcome;
    if (this.success) {
      outcome = this.profile.goal;
    } else if (this.closingAttempted && this.handledCount >= 1) {
      outcome = 'oppfolging';
    } else {
      outcome = 'tapt';
    }

    const factsRevealed = this.revealedIds.size;
    const factsTotal = this.profile.facts.length;

    const feedback: string[] = [];
    if (opening >= 70)
      feedback.push('Sterk åpning — du brukte referanse og forklarte hvorfor du tok kontakt med akkurat denne kunden.');
    else
      feedback.push('Åpningen manglet en konkret grunn. Bruk referanse-metoden: «vi har en avtale med velforeningen der …»');
    if (this.factFraction() >= DISCOVERY_THRESHOLD)
      feedback.push(`Grundig graving: du avdekket ${factsRevealed} av ${factsTotal} nøkkelinfo før du gikk mot avslutning. Sånn jobber en closer.`);
    else
      feedback.push(`Du avdekket bare ${factsRevealed} av ${factsTotal} nøkkelinfo. Kunden sier aldri ja før du vet nok — grav i situasjon, behov, hvem som bestemmer og økonomi.`);
    if (this.raisedCount > 0 && this.handledCount === this.raisedCount)
      feedback.push('Alle innvendinger håndtert etter formelen: anerkjenn → utforsk → svar → fremdrift. Meget bra.');
    else if (this.raisedCount > 0)
      feedback.push(`Du håndterte ${this.handledCount} av ${this.raisedCount} innvendinger. Husk å anerkjenne først («skjønner deg godt») og still et spørsmål tilbake.`);
    if (this.repeatedCount > 0)
      feedback.push('Du gjentok nesten identiske meldinger — det trekker ned. Varier språket og bygg videre på det kunden faktisk sier.');
    if (this.success)
      feedback.push(
        this.smsMentioned
          ? 'Perfekt avslutning: konkret neste steg og skriftlig bekreftelse. Sånn gjør en closer det.'
          : 'Du landet utfallet — bra! Husk SMS-bekreftelsen med en gang, den halverer no-shows.',
      );
    else if (this.brushoff)
      feedback.push('Kunden endte med «send meg noe» — du closet før du hadde gravd frem nok. Avdekk mer, så tåler closingen trykk.');
    else if (this.closingAttempted)
      feedback.push('Du forsøkte å close før kunden var klar. Håndter innvendingene og grav mer først — så lander avslutningen av seg selv.');
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
      booked: this.success,
      outcome,
      factsRevealed,
      factsTotal,
    };
  }
}
