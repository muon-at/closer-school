// Rik norsk mock-data for DEMO-MODUS. Samme struktur som Supabase-tabellene,
// slik at datalaget (data.ts) kan bytte kilde uten at UI merker forskjell.
import { lessonContent } from './lessonContent';
import type {
  Application,
  CoachMission,
  DemoUser,
  Job,
  LeaderboardEntry,
  Lesson,
  Module,
  Post,
  Progress,
  QuizQuestion,
  StudentRow,
} from './types';

// ── Demo-bruker ───────────────────────────────────────────────────────────
export const demoUser: DemoUser = {
  id: 'demo-jonas',
  name: 'Jonas Berg',
  age: 18,
  email: 'jonas.demo@closerskolen.no',
  cohort: 'Kull 3 — september 2026',
};

// ── Moduler ───────────────────────────────────────────────────────────────
export const modules: Module[] = [
  {
    id: 'm1',
    slug: 'fundamentet',
    title: 'Fundamentet',
    week: 1,
    description:
      'Hvorfor salg er verdens beste startjobb, mindset rundt avvisning, etisk ryggrad og kunsten å lytte.',
    gate: 'Quiz på alle leksjoner (80 %)',
    aiGateRequired: 0,
    order: 1,
  },
  {
    id: 'm2',
    slug: 'telefonsalg-1',
    title: 'Telefonsalg I',
    week: 2,
    description:
      'Åpningen som vinner de første 10 sekundene, referanse-metoden, pitch-strukturen og konkret booking med SMS-bekreftelse.',
    gate: 'Quiz + 4 godkjente AI-samtaler',
    aiGateRequired: 0,
    order: 2,
  },
  {
    id: 'm3',
    slug: 'telefonsalg-2',
    title: 'Telefonsalg II',
    week: 3,
    description:
      'Behovsavdekking, spørreteknikk, tonalitet og tempo — og kunsten å høre kjøpssignalene.',
    gate: '5 AI-samtaler med score ≥70',
    aiGateRequired: 4,
    order: 3,
  },
  {
    id: 'm4',
    slug: 'dorsalg',
    title: 'Dørsalg',
    week: 4,
    description:
      'D2D-psykologi, 10-sekunders døråpning, territorium og rutiner — og hvordan du håndterer «nei takk» på døra.',
    gate: 'Quiz + 5 godkjente AI-samtaler',
    aiGateRequired: 9,
    order: 4,
  },
  {
    id: 'm5',
    slug: 'innvendinger-closing',
    title: 'Innvendinger & closing',
    week: 5,
    description:
      'Innvendingsbanken med de norske klassikerne, 8 closing-teknikker, prisforhandling og etterarbeid.',
    gate: '6 AI-samtaler med score ≥75',
    aiGateRequired: 14,
    order: 5,
  },
  {
    id: 'm6',
    slug: 'high-ticket-karriere',
    title: 'High ticket & karriere',
    week: 6,
    description:
      'Remote closing, discovery calls, karriereveien TM → D2D → high ticket og planen for dine første 30 dager i ny jobb.',
    gate: '5 AI-samtaler med score ≥80',
    aiGateRequired: 20,
    order: 6,
  },
];

// ── Leksjoner ─────────────────────────────────────────────────────────────
interface LessonDef {
  slug: string;
  title: string;
  durationMin: number;
}

const lessonDefs: Record<string, LessonDef[]> = {
  fundamentet: [
    { slug: 'hvorfor-salg', title: 'Hvorfor salg er verdens beste startjobb', durationMin: 12 },
    { slug: 'mindset-avvisning', title: 'Mindset: avvisning er data', durationMin: 14 },
    { slug: 'etisk-salg', title: 'Etisk salg', durationMin: 11 },
    { slug: 'kunsten-a-lytte', title: 'Kunsten å lytte', durationMin: 13 },
  ],
  'telefonsalg-1': [
    { slug: 'apningen-10-sekunder', title: 'Åpningen — de første 10 sekundene', durationMin: 15 },
    { slug: 'referanse-metoden', title: 'Referanse-metoden', durationMin: 18 },
    { slug: 'pitch-strukturen', title: 'Pitch-strukturen', durationMin: 14 },
    { slug: 'book-motet', title: 'Book møtet', durationMin: 12 },
  ],
  'telefonsalg-2': [
    { slug: 'behovsavdekking', title: 'Behovsavdekking', durationMin: 16 },
    { slug: 'sporreteknikk', title: 'Spørreteknikk: åpne vs. lukkede spørsmål', durationMin: 13 },
    { slug: 'tonalitet-og-tempo', title: 'Tonalitet og tempo', durationMin: 12 },
    { slug: 'kjopssignaler', title: 'Lytt etter kjøpssignaler', durationMin: 11 },
  ],
  dorsalg: [
    { slug: 'd2d-psykologi', title: 'D2D-psykologi', durationMin: 14 },
    { slug: 'ti-sekunders-dorapning', title: '10-sekunders døråpning', durationMin: 15 },
    { slug: 'territorium-og-rutiner', title: 'Territorium og rutiner', durationMin: 13 },
    { slug: 'nei-takk-pa-dora', title: 'Håndter «nei takk» på døra', durationMin: 12 },
  ],
  'innvendinger-closing': [
    { slug: 'innvendingsbanken', title: 'Innvendingsbanken', durationMin: 20 },
    { slug: 'closing-teknikker', title: '8 closing-teknikker', durationMin: 18 },
    { slug: 'prisforhandling', title: 'Prisforhandling', durationMin: 14 },
    { slug: 'etterarbeid-oppfolging', title: 'Etterarbeid og oppfølging', durationMin: 12 },
  ],
  'high-ticket-karriere': [
    { slug: 'hva-er-remote-closing', title: 'Hva er remote closing?', durationMin: 13 },
    { slug: 'discovery-calls', title: 'Discovery calls', durationMin: 17 },
    { slug: 'karriereveien', title: 'Din karrierevei: TM → D2D → high ticket', durationMin: 14 },
    { slug: 'forste-30-dager', title: 'Første 30 dager i ny jobb', durationMin: 12 },
  ],
};

export const lessons: Lesson[] = Object.entries(lessonDefs).flatMap(
  ([moduleSlug, defs]) =>
    defs.map((def, i) => ({
      id: `${moduleSlug}-${i + 1}`,
      moduleSlug,
      slug: def.slug,
      title: def.title,
      durationMin: def.durationMin,
      content: lessonContent[def.slug] ?? '',
      order: i + 1,
    })),
);

// ── Quiz (3 spørsmål per leksjon) ─────────────────────────────────────────
function q(
  lessonSlug: string,
  n: number,
  question: string,
  options: string[],
  correctIndex: number,
): QuizQuestion {
  return { id: `${lessonSlug}-q${n}`, lessonSlug, question, options, correctIndex };
}

export const quizQuestions: QuizQuestion[] = [
  // M1
  q('hvorfor-salg', 1, 'Hva betaler salg for, i motsetning til de fleste andre jobber?', ['Ansiennitet', 'Resultater', 'Utdanning'], 1),
  q('hvorfor-salg', 2, 'Hva er forskjellen på en god og en dårlig selger, ifølge leksjonen?', ['Gode selgere snakker fortere', 'Gode selgere hjelper folk å ta en beslutning de egentlig vil ta', 'Gode selgere gir alltid rabatt'], 1),
  q('hvorfor-salg', 3, 'Hvorfor gir 20 % forbedring i to ledd av trakten mer enn 40 % økning totalt?', ['Fordi forbedringene ganges med hverandre', 'Fordi kundene blir snillere', 'Det stemmer ikke — det gir nøyaktig 40 %'], 0),
  q('mindset-avvisning', 1, 'Hva er et «nei» fra en kunde, ifølge leksjonen?', ['En dom over deg som person', 'Et datapunkt du kan lære av', 'Et tegn på at du bør bytte yrke'], 1),
  q('mindset-avvisning', 2, 'Hva går 30-sekundersregelen ut på?', ['Bruk maks 30 sekunder på åpningen', 'Pust, noter læringen og ring neste innen 30 sekunder', 'Vent 30 sekunder før du svarer på innvendinger'], 1),
  q('mindset-avvisning', 3, 'Hvorfor kan det fungere å sette seg et NEI-mål?', ['Det tvinger frem høy aktivitet og gjør nei til fremgang', 'Fordi nei er bedre enn ja', 'Det senker lønna'], 0),
  q('etisk-salg', 1, 'Hva er testen du alltid kan bruke før du closer?', ['Ville jeg anbefalt dette til mora mi?', 'Tjener jeg nok provisjon på dette?', 'Er kunden lett å overtale?'], 0),
  q('etisk-salg', 2, 'Hvor lang er angreretten ved telefon- og dørsalg i Norge?', ['7 dager', '14 dager', '30 dager'], 1),
  q('etisk-salg', 3, 'Hva er forskjellen på ekte og falsk scarcity?', ['Ingen — scarcity er scarcity', 'Ekte scarcity er sann og lovlig, falsk er løgn og ulovlig', 'Falsk scarcity fungerer bedre'], 1),
  q('kunsten-a-lytte', 1, 'Hvor stor andel av samtalen bør kunden snakke i en god salgssamtale?', ['10–20 %', '60–70 %', '50/50 nøyaktig'], 1),
  q('kunsten-a-lytte', 2, 'Hva er «speiling» i lytteteknikk?', ['Å etterligne kundens dialekt', 'Å gjenta kundens siste nøkkelord som spørsmål', 'Å se deg selv i speilet mens du ringer'], 1),
  q('kunsten-a-lytte', 3, 'Hva bør du gjøre rett etter å ha stilt et godt spørsmål?', ['Fylle stillheten med mer info', 'Ti stille og la kunden tenke', 'Stille to spørsmål til'], 1),
  // M2
  q('apningen-10-sekunder', 1, 'Hvorfor bør du IKKE åpne med «har du tid til en kort prat?»', ['Det er ulovlig', 'Du ber kunden om et nei', 'Det tar for lang tid å si'], 1),
  q('apningen-10-sekunder', 2, 'Hva er nøkkelen i en åpning som fungerer?', ['Et fantastisk tilbud', 'En konkret grunn til at du ringer akkurat denne kunden', 'Å snakke fort så kunden ikke rekker å legge på'], 1),
  q('apningen-10-sekunder', 3, 'Hva bør tempoet ditt være i åpningen?', ['Cirka 20 % saktere enn du tror du må', 'Så raskt som mulig', 'Det spiller ingen rolle'], 0),
  q('referanse-metoden', 1, 'Hva er de fire stegene i referanse-metoden?', ['Pitch, pris, press, close', 'Felles referanse, sosialt bevis, konkret booking, SMS-bekreftelse', 'Hei, tilbud, rabatt, takk'], 1),
  q('referanse-metoden', 2, 'Hva er et godt eksempel på sosialt bevis med tall?', ['«Vi er best i Norge»', '«Flere gikk sammen, og da fikk vi prisen ned til 2 500 i stedet for 4 000»', '«Alle kjøper dette»'], 1),
  q('referanse-metoden', 3, 'Hvorfor sender du SMS-bekreftelse umiddelbart etter booking?', ['For å selge mer', 'Avtalen blir virkelig, no-shows synker og kunden får trygghet', 'Fordi sjefen krever det'], 1),
  q('pitch-strukturen', 1, 'Hva er riktig rekkefølge i pitch-strukturen?', ['Løsning, pris, situasjon', 'Situasjon, problem, løsning, bevis, spørsmål', 'Bevis, problem, close'], 1),
  q('pitch-strukturen', 2, 'Hva er forskjellen på funksjon og fordel?', ['Ingen forskjell', 'Funksjonen er hva produktet har, fordelen er hva det gjør for kunden', 'Fordelen er alltid prisen'], 1),
  q('pitch-strukturen', 3, 'Hvordan skal en pitch alltid avsluttes?', ['Med et spørsmål', 'Med prisen', 'Med en lang pause'], 0),
  q('book-motet', 1, 'Hva er en alternativ-close på tidspunkt?', ['«Passer det en gang neste uke?»', '«Passer tirsdag klokka 10, eller er 14 bedre?»', '«Skal jeg ringe deg opp igjen en dag?»'], 1),
  q('book-motet', 2, 'Hva gjør du med «kan du ikke ringe tilbake senere?»', ['Sier ja og ringer på måfå', 'Konverterer til en konkret avtale med dag og klokkeslett + SMS', 'Gir opp'], 1),
  q('book-motet', 3, 'Hva skal du aldri gjøre før du legger på?', ['Avslutte uten et konkret neste steg', 'Takke for samtalen', 'Oppsummere avtalen'], 0),
  // M3
  q('behovsavdekking', 1, 'Når har du «lov» til å pitche løsningen?', ['Så fort kunden tar telefonen', 'Etter at kunden har sagt problemet høyt med egne ord', 'Etter maks 30 sekunder'], 1),
  q('behovsavdekking', 2, 'Hva er riktig rekkefølge i forenklet SPIN?', ['Situasjon, problem, innvirkning, nytteverdi', 'Nytteverdi, pris, situasjon, close', 'Problem, løsning, pris, SMS'], 0),
  q('behovsavdekking', 3, 'Hva er avdekkingens kraftigste oppfølgingsspørsmål?', ['«Skal vi avslutte?»', '«Hva mer?» og «hvorfor det?»', '«Er du sikker?»'], 1),
  q('sporreteknikk', 1, 'Når bruker du åpne vs. lukkede spørsmål?', ['Åpne tidlig (utforske), lukkede sent (lande)', 'Lukkede tidlig, åpne sent', 'Kun åpne spørsmål hele veien'], 0),
  q('sporreteknikk', 2, 'Hva er galt med doble spørsmål?', ['De er for lange å si', 'Kunden svarer på det letteste og hopper over det viktigste', 'Ingenting'], 1),
  q('sporreteknikk', 3, 'Hva gjemmer «vi er egentlig ganske fornøyde» ofte på?', ['Et «bortsett fra» som du kan grave frem', 'At kunden lyver', 'Ingenting — samtalen er over'], 0),
  q('tonalitet-og-tempo', 1, 'Hva signaliserer lavt tempo og rolig stemme?', ['At du er uinteressert', 'Trygghet og status', 'At du er ny i jobben'], 1),
  q('tonalitet-og-tempo', 2, 'Hvem «taper» som regel etter at prisen er sagt?', ['Den som snakker først', 'Den som tier stille', 'Kunden, alltid'], 0),
  q('tonalitet-og-tempo', 3, 'Hva er speiling på telefon?', ['Å møte kundens tempo, ordvalg og energinivå', 'Å herme etter dialekten', 'Å gjenta alt kunden sier ordrett'], 0),
  q('kjopssignaler', 1, 'Hva er «hvor lang bindingstid er det?» et eksempel på?', ['En innvending', 'Et kjøpssignal', 'Et avslag'], 1),
  q('kjopssignaler', 2, 'Hva gjør du når et kjøpssignal kommer?', ['Fortsetter pitchen for sikkerhets skyld', 'Svarer kort og går rett til neste steg', 'Senker prisen'], 1),
  q('kjopssignaler', 3, 'Hva er en prøveclose?', ['Et lavterskel-spørsmål som måler temperaturen, f.eks. «hvordan høres dette ut så langt?»', 'En rabatt', 'Å legge på først'], 0),
  // M4
  q('d2d-psykologi', 1, 'Hvilke tre spørsmål stiller kundens hjerne når det ringer på?', ['Er dette farlig? Hva vil han? Hvor lang tid tar det?', 'Hvem, hva, hvor mye rabatt?', 'Skal jeg åpne? Skal jeg kjøpe? Skal jeg klage?'], 0),
  q('d2d-psykologi', 2, 'Hva gjør du fysisk idet døra åpnes?', ['Tar et halvt skritt tilbake og gir kunden rom', 'Setter foten i døra', 'Rekker frem hånda umiddelbart'], 0),
  q('d2d-psykologi', 3, 'Hvorfor er naboeffekten sterkere på dør enn på telefon?', ['Fordi beviset er synlig — kunden kan se huset til naboen som kjøpte', 'Den er ikke sterkere', 'Fordi naboer alltid kjøper likt'], 0),
  q('ti-sekunders-dorapning', 1, 'Hva er strukturen i døråpningen?', ['Hils → Ærend → Referanse → Spørsmål', 'Pitch → Pris → Press', 'Unnskyldning → Tilbud → Rabatt'], 0),
  q('ti-sekunders-dorapning', 2, 'Hvorfor skal du aldri si «jeg skal ikke selge deg noe»?', ['Fordi det oppleves uærlig — du skal jo faktisk selge', 'Fordi det er for langt', 'Det er en fin ting å si'], 0),
  q('ti-sekunders-dorapning', 3, 'Hva betyr «ikke interessert» i sekund én som regel?', ['Kunden hater produktet', '«Jeg trodde du var nok en tilfeldig selger» — de har ikke hørt ærendet', 'At du bør ringe i stedet'], 1),
  q('territorium-og-rutiner', 1, 'Hvorfor skal du jobbe feltet sammenhengende, gate for gate?', ['Da kan du alltid bruke ekte naboreferanser og bli et kjent fjes', 'Det er kortere å gå', 'Sjefen ser deg lettere'], 0),
  q('territorium-og-rutiner', 2, 'Hva er gullvinduet for dørsalg på hverdager?', ['08–11', '16:30–20:30', '21–23'], 1),
  q('territorium-og-rutiner', 3, 'Hva gjør du med «ikke hjemme»-husene?', ['Glemmer dem', 'Noterer status og tar dem igjen i et annet tidsvindu', 'Ringer på tre ganger til samme kveld'], 1),
  q('nei-takk-pa-dora', 1, 'Hva er et refleks-nei?', ['En avvisning av kategorien selger før kunden har hørt ærendet', 'Et gjennomtenkt avslag', 'Et ja i forkledning'], 0),
  q('nei-takk-pa-dora', 2, 'Hvor mange ganger gjenåpner du etter et refleks-nei?', ['Så mange som trengs', 'Én gang — rolig og med informasjonen kunden manglet', 'Aldri'], 1),
  q('nei-takk-pa-dora', 3, 'Hvorfor er en hyggelig exit god business?', ['Naboene snakker sammen — ryktet ditt påvirker resten av feltet', 'Det er det ikke', 'Fordi du får tips'], 0),
  // M5
  q('innvendingsbanken', 1, 'Hva er grunnformelen for innvendingshåndtering?', ['Anerkjenn → Utforsk → Svar → Fremdrift', 'Avbryt → Argumenter → Press', 'Ignorer → Gjenta pitch → Rabatt'], 0),
  q('innvendingsbanken', 2, 'Hvorfor er «vi har allerede leverandør» en god innvending?', ['Kunden har bekreftet behov og betalingsvilje', 'Den er ikke god — legg på', 'Fordi da slipper du å selge'], 0),
  q('innvendingsbanken', 3, 'Hva betyr «jeg må tenke på det» som regel?', ['At kunden trenger en kalkulator', 'At det finnes en usagt innvending du må finne', 'At salget er i boks'], 1),
  q('closing-teknikker', 1, 'Hva er alternativ-closen?', ['To positive valg i stedet for ja/nei', 'Å tilby et alternativt produkt', 'Å la kunden velge selger'], 0),
  q('closing-teknikker', 2, 'Hva er regelen om knapphet i closing?', ['Knapphet skal alltid brukes', 'Kun ekte knapphet — falsk scarcity er ulovlig og ødeleggende', 'Knapphet fungerer ikke i Norge'], 1),
  q('closing-teknikker', 3, 'Hva gjør du etter å ha stilt closingspørsmålet?', ['Tier stille til kunden svarer', 'Utdyper med tre nye argumenter', 'Senker prisen uoppfordret'], 0),
  q('prisforhandling', 1, 'Når skal prisen presenteres?', ['Først i samtalen', 'Oppå verdi kunden allerede har sagt ja til', 'Aldri — kunden må spørre'], 1),
  q('prisforhandling', 2, 'Hva gjør du FØR du vurderer rabatt når kunden presser?', ['Lytter, normaliserer, argumenterer verdi og justerer pakken', 'Gir rabatten umiddelbart', 'Avslutter samtalen'], 0),
  q('prisforhandling', 3, 'Hva er regelen for rabatt?', ['Rabatt kun mot noe — f.eks. signering i dag', 'Rabatt til alle som spør', 'Rabatt er alltid forbudt'], 0),
  q('etterarbeid-oppfolging', 1, 'Hva gjør du de første 10 minuttene etter et ja?', ['Bekrefter alt skriftlig og forsterker beslutningen', 'Ringer neste kunde uten å notere', 'Tar fri resten av dagen'], 0),
  q('etterarbeid-oppfolging', 2, 'Når stiller du referansespørsmålet?', ['Mens kunden er varm — rett etter kjøpet', 'Etter tre måneder', 'Aldri'], 0),
  q('etterarbeid-oppfolging', 3, 'Hvordan håndterer du en kunde som angrer?', ['Raskt, hyggelig og uten press', 'Med tre nye salgsforsøk', 'Ignorerer henvendelsen'], 0),
  // M6
  q('hva-er-remote-closing', 1, 'Hva gjør en setter i et high ticket-team?', ['Kvalifiserer leads og booker salgssamtaler', 'Skriver kontrakter', 'Lager markedsføringen'], 0),
  q('hva-er-remote-closing', 2, 'Hva avgjør mest for en closers resultater?', ['Tilbudet/selskapet hen selger for', 'Antall følgere på TikTok', 'Dress og klokke'], 0),
  q('hva-er-remote-closing', 3, 'Hva er hovedforskjellen på TM-samtale og discovery call?', ['Lengre samtale betyr mer avdekking, ikke mer pitch', 'Discovery calls har ingen struktur', 'TM er vanskeligere'], 0),
  q('discovery-calls', 1, 'Hva er rammen for en discovery call?', ['Du er rådgiver som diagnostiserer før du foreskriver', 'Du pitcher i minutt fem', 'Du snakker 80 % av tiden'], 0),
  q('discovery-calls', 2, 'Hva følger alltid etter at kunden svarer «7» på viktighetsskalaen?', ['«Hva skal til for at det blir en 9?»', '«Det holder, vi går videre»', '«Er du sikker på at det ikke er 6?»'], 0),
  q('discovery-calls', 3, 'Hva gjør toppclosere med leads som ikke passer?', ['Disker dem høflig og raskt — det er riktig og lønnsomt', 'Closer dem uansett', 'Sender dem til konkurrenten'], 0),
  q('karriereveien', 1, 'Hva er den typiske karrieretrappen?', ['TM → D2D/feltsalg → setter → closer', 'Closer → TM → pensjon', 'D2D → TM → butikk'], 0),
  q('karriereveien', 2, 'Hva gir TM-trinnet deg mest av?', ['Volumtrening — mer salgstrening på 3 måneder enn de fleste får på 3 år', 'Fast høy lønn uten krav', 'Reiseerfaring'], 0),
  q('karriereveien', 3, 'Hva ansetter salgssjefer, ifølge leksjonen?', ['Folk som kan demonstrere faget på sparket', 'Kun folk med mastergrad', 'De med lengst CV'], 0),
  q('forste-30-dager', 1, 'Hva er målet i uke 2 i ny jobb?', ['Aktivitet — slå aktivitetsmålene hver dag', 'Bli topp 3 på gulvet', 'Be om lønnsforhøyelse'], 0),
  q('forste-30-dager', 2, 'Hvordan finner du «lekkasjen» din i uke 3?', ['Ser på egne tall og finner hvor trakten lekker', 'Spør kundene direkte', 'Gjetter'], 0),
  q('forste-30-dager', 3, 'Hva slår motivasjon i lengden?', ['Standarder og rutiner', 'Flaks', 'Energidrikk'], 0),
];

// ── AI-coach oppdrag ──────────────────────────────────────────────────────
// Studenten velger et OPPDRAG (kanal + produkt + lead-type) — kunden bak er
// SKJULT og må graves frem med gode spørsmål i selve samtalen.
export const coachMissions: CoachMission[] = [
  {
    id: 'o1',
    code: 'O1',
    channel: 'telefon',
    product: 'TV & strømming (nysalg)',
    leadType: 'kald',
    leadTypeLabel: 'Kald liste',
    goal: 'salg',
  },
  {
    id: 'o2',
    code: 'O2',
    channel: 'dør',
    product: 'Boligalarm',
    leadType: 'referanse',
    leadTypeLabel: 'Referanse fra nabolaget',
    goal: 'booket',
  },
  {
    id: 'o3',
    code: 'O3',
    channel: 'telefon',
    product: 'Strømavtale',
    leadType: 'inbound',
    leadTypeLabel: 'Innkommende interesse',
    goal: 'salg',
  },
  {
    id: 'o4',
    code: 'O4',
    channel: 'dør',
    product: 'Fiber & internett',
    leadType: 'kald',
    leadTypeLabel: 'Kald dør',
    goal: 'booket',
  },
  {
    id: 'o5',
    code: 'O5',
    channel: 'telefon',
    product: 'B2B møtebooking (SaaS)',
    leadType: 'kald',
    leadTypeLabel: 'Kald liste',
    goal: 'booket',
  },
  {
    id: 'eksamen',
    code: 'EKSAMEN',
    channel: 'telefon',
    product: 'Eksamensoppdrag',
    leadType: 'kald',
    leadTypeLabel: 'Alt skjult · tilfeldig kanal og produkt',
    goal: 'booket',
    isExam: true,
  },
];

// ── Jobber ────────────────────────────────────────────────────────────────
export const jobs: Job[] = [
  {
    id: 'job-1',
    title: 'TM-selger — TV & strømming',
    company: 'Nordic Salgspartner AS',
    location: 'Oslo (kontor) / hybrid',
    pay: 'Fastlønn 220 000 + provisjon. Realistisk år 1: 420 000–550 000 kr',
    type: 'Fulltid',
    description:
      'Ring varme og kalde lister for en av Nordens største TV- og strømmeaktører. Full opplæring, ung kultur, tydelig karrierevei mot teamleder.',
    tags: ['Telefonsalg', 'B2C', 'Garanti-partner'],
  },
  {
    id: 'job-2',
    title: 'D2D-selger — boligalarm',
    company: 'TryggHjem Sikkerhet AS',
    location: 'Østlandet (felt)',
    pay: 'Provisjonsbasert. Snitt team: 45 000/mnd, topp: 90 000+/mnd',
    type: 'Fulltid',
    description:
      'Dørsalg av alarmpakker i etablerte felt. Firmabil etter prøvetid. Passer deg som vil ha høy provisjon og rask utvikling.',
    tags: ['Dørsalg', 'Høy provisjon', 'Garanti-partner'],
  },
  {
    id: 'job-3',
    title: 'SDR — SaaS-selskap',
    company: 'Fjord Software AS',
    location: 'Bergen / remote i Norge',
    pay: 'Fastlønn 480 000 + bonus (OTE 600 000)',
    type: 'Fulltid',
    description:
      'Book møter for salgsteamet i et voksende norsk SaaS-selskap. B2B-erfaring bygges fra dag én — vanligste springbrett til Account Executive.',
    tags: ['B2B', 'SaaS', 'Remote-mulig'],
  },
  {
    id: 'job-4',
    title: 'Remote closer — high ticket',
    company: 'Vekstakademiet (kursaktør)',
    location: '100 % remote',
    pay: '10–15 % provisjon per salg. Etablerte closere: 60 000–150 000/mnd',
    type: 'Engasjement / provisjon',
    description:
      'Ta discovery calls for et norsk kursprogram med varme leads fra betalt markedsføring. Krever dokumenterte resultater — Closerskolen-sertifikat med topp AI-scores kvalifiserer til intervju.',
    tags: ['High ticket', 'Remote', 'Kun erfarne'],
  },
];

// ── Community-poster ──────────────────────────────────────────────────────
export const posts: Post[] = [
  {
    id: 'post-1',
    author: 'Emilie K.',
    type: 'win',
    title: 'FØRSTE SALG PÅ EKTE! 🎉',
    body:
      'Etter 34 AI-samtaler og en uke i felt: closet min første alarmpakke i dag! Brukte dugnads-closen fra modul 5 — «fire til i gata er med» — og kunden sa ja på dørstokken. Takk for pushet, folkens!',
    reactions: { fire: 24, clap: 18, money: 9 },
    date: '2026-07-22',
  },
  {
    id: 'post-2',
    author: 'Sebastian (Closerskolen)',
    type: 'tips',
    title: 'Ukens closing-tips: stillheten etter pris',
    body:
      'Så det på tre call reviews denne uka: dere sier prisen — og så fortsetter dere å snakke. STOPP. «Det blir 349 i måneden.» Punktum. Pust. Den som snakker først etter pris, taper. Tren på det mot AI-en i kveld: si prisen, og skriv ingenting mer før kunden svarer.',
    reactions: { fire: 31, clap: 12, money: 4 },
    date: '2026-07-21',
  },
  {
    id: 'post-3',
    author: 'Adrian S.',
    type: 'sporsmal',
    title: 'Hva svarer dere på «vi har akkurat forlenget avtalen»?',
    body:
      'Fikk denne tre ganger i dag på TV-leverandør-lister. Prøvde «når går den ut?» men det føltes tynt. Noen som har et bedre spor?',
    reactions: { fire: 2, clap: 0, money: 0 },
    date: '2026-07-21',
  },
  {
    id: 'post-4',
    author: 'Sara M.',
    type: 'win',
    title: 'Godkjent AI-eksamen på første forsøk — 84!',
    body:
      'Eksamensoppdraget er BRUTALT: alt om kunden er skjult, og du får ingenting gratis. Formelen funker: anerkjenn, utforsk, svar, fremdrift. Ikke hopp over utforsk-steget — det var der jeg feilet i øvingene. Nå gjenstår bare den ekte samtalen 😬',
    reactions: { fire: 19, clap: 22, money: 3 },
    date: '2026-07-20',
  },
  {
    id: 'post-5',
    author: 'Jonas B.',
    type: 'sporsmal',
    title: 'Tips til å holde energien oppe på slutten av lista?',
    body:
      'De siste 20 samtalene på en økt blir alltid dårligere enn de første 20. Hører det på meg selv. Hvordan holder dere trykket oppe?',
    reactions: { fire: 5, clap: 1, money: 0 },
    date: '2026-07-19',
  },
];

// ── Leaderboard ───────────────────────────────────────────────────────────
export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Sara M.', points: 2840, approvedCalls: 31, bestScore: 92 },
  { rank: 2, name: 'Emilie K.', points: 2615, approvedCalls: 28, bestScore: 89 },
  { rank: 3, name: 'Adrian S.', points: 2390, approvedCalls: 26, bestScore: 86 },
  { rank: 4, name: 'Mats H.', points: 2110, approvedCalls: 22, bestScore: 84 },
  { rank: 5, name: 'Jonas B.', points: 1875, approvedCalls: 7, bestScore: 81, isYou: true },
  { rank: 6, name: 'Nora F.', points: 1730, approvedCalls: 18, bestScore: 79 },
  { rank: 7, name: 'Oliver T.', points: 1540, approvedCalls: 15, bestScore: 77 },
  { rank: 8, name: 'Ida L.', points: 1320, approvedCalls: 12, bestScore: 75 },
  { rank: 9, name: 'Marius W.', points: 1105, approvedCalls: 10, bestScore: 72 },
  { rank: 10, name: 'Thea N.', points: 890, approvedCalls: 8, bestScore: 70 },
];

// ── Søknader (admin-demo) ─────────────────────────────────────────────────
export const applications: Application[] = [
  {
    id: 'app-1',
    name: 'Markus Lien',
    age: 19,
    email: 'markus.lien@example.com',
    phone: '412 34 567',
    motivation:
      'Jobber på lager nå og ser ingen vei videre. Har alltid fått høre at jeg er god med folk. Jeg er villig til å jobbe hardere enn alle andre for å bevise det.',
    cohort: 'Kull 3 — september 2026',
    createdAt: '2026-07-20',
    status: 'intervju',
  },
  {
    id: 'app-2',
    name: 'Amalie Ruud',
    age: 22,
    email: 'amalie.ruud@example.com',
    phone: '923 45 678',
    motivation:
      'Droppet ut av studiene og har jobbet i butikk i to år. Jeg vil ha en jobb der innsatsen min faktisk synes på lønnsslippen.',
    cohort: 'Kull 3 — september 2026',
    createdAt: '2026-07-21',
    status: 'ny',
  },
  {
    id: 'app-3',
    name: 'Daniel Moe',
    age: 18,
    email: 'daniel.moe@example.com',
    phone: '934 56 789',
    motivation:
      'Ferdig med videregående i sommer. Ser folk på TikTok tjene bra på salg og vil lære det ordentlig — ikke bare gjette meg frem.',
    cohort: 'Kull 4 — november 2026',
    createdAt: '2026-07-22',
    status: 'ny',
  },
];

// ── Studenter (admin-demo) ────────────────────────────────────────────────
export const students: StudentRow[] = [
  { id: 's1', name: 'Sara M.', cohort: 'Kull 2', modulesCompleted: 6, approvedCalls: 31, avgScore: 84, examStatus: 'AI-eksamen bestått (84) — ekte samtale booket' },
  { id: 's2', name: 'Emilie K.', cohort: 'Kull 2', modulesCompleted: 6, approvedCalls: 28, avgScore: 81, examStatus: 'Fullført — sertifisert ✓' },
  { id: 's3', name: 'Adrian S.', cohort: 'Kull 2', modulesCompleted: 5, approvedCalls: 26, avgScore: 78, examStatus: 'Teori bestått' },
  { id: 's4', name: 'Jonas B.', cohort: 'Kull 3', modulesCompleted: 1, approvedCalls: 7, avgScore: 74, examStatus: 'Ikke påbegynt' },
  { id: 's5', name: 'Nora F.', cohort: 'Kull 3', modulesCompleted: 2, approvedCalls: 18, avgScore: 72, examStatus: 'Ikke påbegynt' },
];

// ── Eksamens-spørsmål (12 ekte av 40 — resten produseres) ────────────────
export const examQuestions: QuizQuestion[] = [
  q('eksamen', 1, 'Hva er det første du skal etablere i en dørsalgssituasjon?', ['Pris', 'Trygghet', 'Produktfordeler'], 1),
  q('eksamen', 2, 'Hvilke fire steg består referanse-metoden av?', ['Referanse, sosialt bevis, konkret booking, SMS', 'Hei, pitch, pris, close', 'Åpning, rabatt, press, signering'], 0),
  q('eksamen', 3, 'Hva betyr «avvisning er data» i praksis?', ['Hvert nei analyseres og forbedrer neste samtale', 'Man skal ignorere alle nei', 'Avvisning skal rapporteres til sjefen'], 0),
  q('eksamen', 4, 'En kunde sier «jeg må snakke med samboeren». Hva er beste første respons?', ['«Det trenger du ikke, dette er et godt tilbud»', '«Selvfølgelig — hvis det sto på deg alene, hadde du gått for det?»', '«Ok, ha det bra»'], 1),
  q('eksamen', 5, 'Hvor lang er angreretten ved fjernsalg og salg utenfor fast utsalgssted?', ['14 dager', '7 dager', '3 dager'], 0),
  q('eksamen', 6, 'Hva kjennetegner et kjøpssignal?', ['Kunden stiller detaljspørsmål om bindingstid, levering eller pris', 'Kunden legger på', 'Kunden ber deg snakke saktere'], 0),
  q('eksamen', 7, 'Hva er riktig håndtering av «send meg noe på mail»?', ['Sende mail og håpe på det beste', 'Konvertere til konkret oppfølgingsavtale med SMS + ringetid', 'Nekte å sende noe'], 1),
  q('eksamen', 8, 'Når presenteres pris i en strukturert salgssamtale?', ['Så tidlig som mulig', 'Etter at behov er avdekket og verdi etablert', 'Aldri — kunden må gjette'], 1),
  q('eksamen', 9, 'Hva er en alternativ-close?', ['«Passer tirsdag 10 eller torsdag 14?»', '«Vil du kjøpe, ja eller nei?»', '«Skal jeg ringe tilbake en gang?»'], 0),
  q('eksamen', 10, 'Hva gjør falsk scarcity («tilbudet går ut i dag» når det ikke stemmer)?', ['Øker salget uten risiko', 'Bryter markedsføringsloven og ødelegger tilliten', 'Er standard bransjepraksis'], 1),
  q('eksamen', 11, 'Hva er hovedjobben i de første 10 minuttene av en discovery call?', ['Pitche programmet', 'Ramme inn samtalen og forstå kundens nå-situasjon', 'Forhandle pris'], 1),
  q('eksamen', 12, 'Hvorfor sender du alltid SMS-bekreftelse etter booking?', ['Avtalen blir skriftlig, no-shows synker, kunden får trygghet', 'For å bruke opp SMS-kvoten', 'Det er valgfritt og unødvendig'], 0),
];

// ── Standard demo-progresjon for Jonas ────────────────────────────────────
export const defaultProgress: Progress = {
  completedLessons: [
    'hvorfor-salg',
    'mindset-avvisning',
    'etisk-salg',
    'kunsten-a-lytte',
    'apningen-10-sekunder',
    'referanse-metoden',
  ],
  approvedCoachSessions: 7,
  coachSessions: [
    {
      id: 'cs-demo-1',
      personaId: 'o1',
      personaName: 'O1 · TV & strømming',
      difficulty: 1,
      scorecard: {
        opening: 82,
        needs: 74,
        objections: 70,
        closing: 78,
        total: 76,
        approved: true,
        booked: true,
        outcome: 'salg',
        factsRevealed: 4,
        factsTotal: 5,
        feedback: ['God referanse-åpning.', 'Grav dypere før du pitcher.'],
        topCloserExample:
          '«Hvis det sto på deg alene — hadde du gått for det?»',
      },
      date: '2026-07-21',
    },
    {
      id: 'cs-demo-2',
      personaId: 'o4',
      personaName: 'O4 · Fiber & internett',
      difficulty: 2,
      scorecard: {
        opening: 88,
        needs: 79,
        objections: 75,
        closing: 81,
        total: 81,
        approved: true,
        booked: true,
        outcome: 'booket',
        factsRevealed: 4,
        factsTotal: 5,
        feedback: ['Rask og respektfull åpning — perfekt mot en travel kunde.'],
        topCloserExample:
          '«Jeg skal være kjapp: passer tirsdag 17, etter at ungene har lagt seg?»',
      },
      date: '2026-07-22',
    },
  ],
  streakDays: 5,
  examTheoryPassed: false,
  examAiPassed: false,
  examRealCallBooked: false,
  examRealCallPassed: false,
  examPassedDate: null,
};

export const weeklyTips = [
  'Si prisen — og ti stille. Den som snakker først etter pris, taper.',
  'Book konkret: «tirsdag klokka 10», aldri «en gang neste uke».',
  'Bruk kundens egne ord i closingen: «du sa jo selv at …»',
  'Ett nei er ett datapunkt. Noter hva du lærte, ring neste.',
];

export const cohorts = [
  'Kull 3 — september 2026',
  'Kull 4 — november 2026',
  'Venteliste — kull 5 (2027)',
];
