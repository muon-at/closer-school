-- ============================================================
-- CLOSERSKOLEN — seed-data
-- Kjøres ETTER schema.sql. Matcher mock-dataene i src/lib/mockData.ts.
--
-- MERK om leksjonstekster: fulltekstene (300–600 ord per leksjon) ligger i
-- src/lib/lessonContent.ts som er "single source of truth". Her seedes
-- struktur + ingress; lim inn fulltekstene i content-feltet ved lansering
-- (eller kjør en enkel sync — se docs/SETUP.md steg 4).
-- ============================================================

-- ── Opptak ────────────────────────────────────────────────────
insert into public.cohorts (name, starts_at, max_seats, is_open) values
  ('Opptak 3 — september 2026', '2026-09-07', 23, true),
  ('Opptak 4 — november 2026', '2026-11-02', 23, true),
  ('Venteliste — opptak 5 (2027)', null, 23, true)
on conflict (name) do nothing;

-- ── Moduler ─────────────────────────────────────────────────
-- Gate-summen (4+5+5+6+5 = 25) matcher kravet om 25 godkjente AI-samtaler.
insert into public.modules (slug, title, week, description, gate, ai_gate_required, sort_order) values
  ('fundamentet', 'Fundamentet', 1, 'Hvorfor salg er verdens beste startjobb, mindset rundt avvisning, etisk ryggrad og kunsten å lytte.', 'Quiz på alle leksjoner (80 %)', 0, 1),
  ('telefonsalg-1', 'Telefonsalg I', 2, 'Åpningen som vinner de første 10 sekundene, referanse-metoden, pitch-strukturen og konkret booking med SMS-bekreftelse.', 'Quiz + 4 godkjente AI-samtaler', 0, 2),
  ('telefonsalg-2', 'Telefonsalg II', 3, 'Behovsavdekking, spørreteknikk, tonalitet og tempo — og kunsten å høre kjøpssignalene.', '5 AI-samtaler med score ≥70', 4, 3),
  ('dorsalg', 'Dørsalg', 4, 'D2D-psykologi, 10-sekunders døråpning, territorium og rutiner — og hvordan du håndterer «nei takk» på døra.', 'Quiz + 5 godkjente AI-samtaler', 9, 4),
  ('innvendinger-closing', 'Innvendinger & closing', 5, 'Innvendingsbanken med de norske klassikerne, 8 closing-teknikker, prisforhandling og etterarbeid.', '6 AI-samtaler med score ≥75', 14, 5),
  ('high-ticket-karriere', 'High ticket & karriere', 6, 'Remote closing, discovery calls, karriereveien TM → D2D → high ticket og planen for dine første 30 dager i ny jobb.', '5 AI-samtaler med score ≥80', 20, 6)
on conflict (slug) do update set
  title = excluded.title,
  week = excluded.week,
  description = excluded.description,
  gate = excluded.gate,
  ai_gate_required = excluded.ai_gate_required,
  sort_order = excluded.sort_order;

-- ── Leksjoner (fulltekst: se src/lib/lessonContent.ts) ──────
insert into public.lessons (module_slug, slug, title, duration_min, content, sort_order) values
  ('fundamentet', 'hvorfor-salg', 'Hvorfor salg er verdens beste startjobb', 12, 'Salg betaler for resultater — ikke vitnemål. [Fulltekst: lessonContent.ts]', 1),
  ('fundamentet', 'mindset-avvisning', 'Mindset: avvisning er data', 14, 'Et nei er et datapunkt, ikke en dom. [Fulltekst: lessonContent.ts]', 2),
  ('fundamentet', 'etisk-salg', 'Etisk salg', 11, 'Selg som om kunden er naboen din. [Fulltekst: lessonContent.ts]', 3),
  ('fundamentet', 'kunsten-a-lytte', 'Kunsten å lytte', 13, 'Samtalen vinnes med ørene: 70/30-regelen. [Fulltekst: lessonContent.ts]', 4),
  ('telefonsalg-1', 'apningen-10-sekunder', 'Åpningen — de første 10 sekundene', 15, 'Vinn de ti sekundene der kunden bestemmer seg. [Fulltekst: lessonContent.ts]', 1),
  ('telefonsalg-1', 'referanse-metoden', 'Referanse-metoden', 18, 'Felles referanse → sosialt bevis → konkret booking → SMS. [Fulltekst: lessonContent.ts]', 2),
  ('telefonsalg-1', 'pitch-strukturen', 'Pitch-strukturen', 14, 'Situasjon, problem, løsning, bevis, spørsmål. [Fulltekst: lessonContent.ts]', 3),
  ('telefonsalg-1', 'book-motet', 'Book møtet', 12, 'Alltid konkret neste steg + SMS-bekreftelse. [Fulltekst: lessonContent.ts]', 4),
  ('telefonsalg-2', 'behovsavdekking', 'Behovsavdekking', 16, 'Ikke pitch før kunden har sagt problemet høyt. [Fulltekst: lessonContent.ts]', 1),
  ('telefonsalg-2', 'sporreteknikk', 'Spørreteknikk: åpne vs. lukkede spørsmål', 13, 'Åpne tidlig (utforske), lukkede sent (lande). [Fulltekst: lessonContent.ts]', 2),
  ('telefonsalg-2', 'tonalitet-og-tempo', 'Tonalitet og tempo', 12, 'Stemmen er hele kroppsspråket ditt på telefon. [Fulltekst: lessonContent.ts]', 3),
  ('telefonsalg-2', 'kjopssignaler', 'Lytt etter kjøpssignaler', 11, 'Ved kjøpssignal: slutt å pitche, gå til neste steg. [Fulltekst: lessonContent.ts]', 4),
  ('dorsalg', 'd2d-psykologi', 'D2D-psykologi', 14, 'Trygghet først — alt annet er bortkastet før den er på plass. [Fulltekst: lessonContent.ts]', 1),
  ('dorsalg', 'ti-sekunders-dorapning', '10-sekunders døråpning', 15, 'Hils → ærend → referanse → spørsmål. [Fulltekst: lessonContent.ts]', 2),
  ('dorsalg', 'territorium-og-rutiner', 'Territorium og rutiner', 13, 'Feltet er butikken din — jobb det som en proff. [Fulltekst: lessonContent.ts]', 3),
  ('dorsalg', 'nei-takk-pa-dora', 'Håndter «nei takk» på døra', 12, 'Refleks-nei, informert nei og skjult innvending-nei. [Fulltekst: lessonContent.ts]', 4),
  ('innvendinger-closing', 'innvendingsbanken', 'Innvendingsbanken', 20, 'De fem norske klassikerne med ordrette svarforslag. [Fulltekst: lessonContent.ts]', 1),
  ('innvendinger-closing', 'closing-teknikker', '8 closing-teknikker', 18, 'Fra alternativ-close til angrerett-closen. [Fulltekst: lessonContent.ts]', 2),
  ('innvendinger-closing', 'prisforhandling', 'Prisforhandling', 14, 'Verdi før pris — og stillhet etter. [Fulltekst: lessonContent.ts]', 3),
  ('innvendinger-closing', 'etterarbeid-oppfolging', 'Etterarbeid og oppfølging', 12, 'Salget er ikke ferdig når kunden sier ja. [Fulltekst: lessonContent.ts]', 4),
  ('high-ticket-karriere', 'hva-er-remote-closing', 'Hva er remote closing?', 13, 'Toppdivisjonen — uten Instagram-glansbildet. [Fulltekst: lessonContent.ts]', 1),
  ('high-ticket-karriere', 'discovery-calls', 'Discovery calls', 17, 'Diagnostiser før du foreskriver. [Fulltekst: lessonContent.ts]', 2),
  ('high-ticket-karriere', 'karriereveien', 'Din karrierevei: TM → D2D → high ticket', 14, 'Trappa med tre trinn — med ærlige tall. [Fulltekst: lessonContent.ts]', 3),
  ('high-ticket-karriere', 'forste-30-dager', 'Første 30 dager i ny jobb', 12, 'Uke for uke-planen som setter standarden din. [Fulltekst: lessonContent.ts]', 4)
on conflict (slug) do nothing;

-- ── Quiz (samme spørsmål som src/lib/mockData.ts) ───────────
-- Idempotent: slett eksisterende quiz-spørsmål før innsetting, slik at
-- seed.sql trygt kan kjøres flere ganger uten duplikater.
delete from public.quiz_questions;

insert into public.quiz_questions (lesson_slug, question, options, correct_index) values
  ('hvorfor-salg', 'Hva betaler salg for, i motsetning til de fleste andre jobber?', '["Ansiennitet","Resultater","Utdanning"]', 1),
  ('hvorfor-salg', 'Hva er forskjellen på en god og en dårlig selger, ifølge leksjonen?', '["Gode selgere snakker fortere","Gode selgere hjelper folk å ta en beslutning de egentlig vil ta","Gode selgere gir alltid rabatt"]', 1),
  ('hvorfor-salg', 'Hvorfor gir 20 % forbedring i to ledd av trakten mer enn 40 % økning totalt?', '["Fordi forbedringene ganges med hverandre","Fordi kundene blir snillere","Det stemmer ikke"]', 0),
  ('mindset-avvisning', 'Hva er et «nei» fra en kunde, ifølge leksjonen?', '["En dom over deg som person","Et datapunkt du kan lære av","Et tegn på at du bør bytte yrke"]', 1),
  ('mindset-avvisning', 'Hva går 30-sekundersregelen ut på?', '["Bruk maks 30 sekunder på åpningen","Pust, noter læringen og ring neste innen 30 sekunder","Vent 30 sekunder før du svarer"]', 1),
  ('mindset-avvisning', 'Hvorfor kan det fungere å sette seg et NEI-mål?', '["Det tvinger frem høy aktivitet og gjør nei til fremgang","Fordi nei er bedre enn ja","Det senker lønna"]', 0),
  ('etisk-salg', 'Hva er testen du alltid kan bruke før du closer?', '["Ville jeg anbefalt dette til mora mi?","Tjener jeg nok provisjon?","Er kunden lett å overtale?"]', 0),
  ('etisk-salg', 'Hvor lang er angreretten ved telefon- og dørsalg i Norge?', '["7 dager","14 dager","30 dager"]', 1),
  ('etisk-salg', 'Hva er forskjellen på ekte og falsk scarcity?', '["Ingen","Ekte er sann og lovlig, falsk er løgn og ulovlig","Falsk fungerer bedre"]', 1),
  ('kunsten-a-lytte', 'Hvor stor andel av samtalen bør kunden snakke?', '["10–20 %","60–70 %","50/50 nøyaktig"]', 1),
  ('kunsten-a-lytte', 'Hva er «speiling» i lytteteknikk?', '["Å etterligne dialekt","Å gjenta kundens siste nøkkelord som spørsmål","Å se seg i speilet"]', 1),
  ('kunsten-a-lytte', 'Hva bør du gjøre rett etter et godt spørsmål?', '["Fylle stillheten","Ti stille og la kunden tenke","Stille to spørsmål til"]', 1),
  ('apningen-10-sekunder', 'Hvorfor ikke åpne med «har du tid til en kort prat?»', '["Det er ulovlig","Du ber kunden om et nei","Det tar for lang tid"]', 1),
  ('apningen-10-sekunder', 'Hva er nøkkelen i en åpning som fungerer?', '["Et fantastisk tilbud","En konkret grunn til at du ringer akkurat denne kunden","Å snakke fort"]', 1),
  ('apningen-10-sekunder', 'Hva bør tempoet være i åpningen?', '["Cirka 20 % saktere enn du tror du må","Så raskt som mulig","Spiller ingen rolle"]', 0),
  ('referanse-metoden', 'Hva er de fire stegene i referanse-metoden?', '["Pitch, pris, press, close","Felles referanse, sosialt bevis, konkret booking, SMS-bekreftelse","Hei, tilbud, rabatt, takk"]', 1),
  ('referanse-metoden', 'Godt eksempel på sosialt bevis med tall?', '["«Vi er best i Norge»","«Flere gikk sammen, og da fikk vi prisen ned til 2 500 i stedet for 4 000»","«Alle kjøper dette»"]', 1),
  ('referanse-metoden', 'Hvorfor SMS-bekreftelse umiddelbart etter booking?', '["For å selge mer","Avtalen blir virkelig, no-shows synker, kunden får trygghet","Sjefen krever det"]', 1),
  ('pitch-strukturen', 'Riktig rekkefølge i pitch-strukturen?', '["Løsning, pris, situasjon","Situasjon, problem, løsning, bevis, spørsmål","Bevis, problem, close"]', 1),
  ('pitch-strukturen', 'Forskjellen på funksjon og fordel?', '["Ingen","Funksjonen er hva produktet har, fordelen er hva det gjør for kunden","Fordelen er alltid prisen"]', 1),
  ('pitch-strukturen', 'Hvordan avsluttes en pitch alltid?', '["Med et spørsmål","Med prisen","Med en lang pause"]', 0),
  ('book-motet', 'Hva er en alternativ-close på tidspunkt?', '["«Passer det en gang neste uke?»","«Passer tirsdag klokka 10, eller er 14 bedre?»","«Skal jeg ringe en dag?»"]', 1),
  ('book-motet', 'Hva gjør du med «ring tilbake senere»?', '["Ringer på måfå","Konverterer til konkret avtale med dag og klokkeslett + SMS","Gir opp"]', 1),
  ('book-motet', 'Hva skal du aldri gjøre før du legger på?', '["Avslutte uten konkret neste steg","Takke for samtalen","Oppsummere avtalen"]', 0),
  ('behovsavdekking', 'Når har du «lov» til å pitche løsningen?', '["Umiddelbart","Etter at kunden har sagt problemet høyt med egne ord","Etter maks 30 sekunder"]', 1),
  ('behovsavdekking', 'Riktig rekkefølge i forenklet SPIN?', '["Situasjon, problem, innvirkning, nytteverdi","Nytteverdi, pris, situasjon, close","Problem, løsning, pris, SMS"]', 0),
  ('behovsavdekking', 'Avdekkingens kraftigste oppfølgingsspørsmål?', '["«Skal vi avslutte?»","«Hva mer?» og «hvorfor det?»","«Er du sikker?»"]', 1),
  ('sporreteknikk', 'Når bruker du åpne vs. lukkede spørsmål?', '["Åpne tidlig (utforske), lukkede sent (lande)","Lukkede tidlig, åpne sent","Kun åpne"]', 0),
  ('sporreteknikk', 'Hva er galt med doble spørsmål?', '["For lange","Kunden svarer på det letteste og hopper over det viktigste","Ingenting"]', 1),
  ('sporreteknikk', 'Hva gjemmer «vi er egentlig ganske fornøyde» ofte på?', '["Et «bortsett fra» du kan grave frem","At kunden lyver","Ingenting"]', 0),
  ('tonalitet-og-tempo', 'Hva signaliserer lavt tempo og rolig stemme?', '["Uinteresse","Trygghet og status","At du er ny"]', 1),
  ('tonalitet-og-tempo', 'Hvem «taper» etter at prisen er sagt?', '["Den som snakker først","Den som tier","Kunden, alltid"]', 0),
  ('tonalitet-og-tempo', 'Hva er speiling på telefon?', '["Å møte kundens tempo, ordvalg og energinivå","Å herme dialekt","Å gjenta alt ordrett"]', 0),
  ('kjopssignaler', '«Hvor lang bindingstid er det?» er et eksempel på …', '["En innvending","Et kjøpssignal","Et avslag"]', 1),
  ('kjopssignaler', 'Hva gjør du når kjøpssignalet kommer?', '["Fortsetter pitchen","Svarer kort og går rett til neste steg","Senker prisen"]', 1),
  ('kjopssignaler', 'Hva er en prøveclose?', '["Et lavterskel-spørsmål som måler temperaturen","En rabatt","Å legge på først"]', 0),
  ('d2d-psykologi', 'Hvilke tre spørsmål stiller kundens hjerne når det ringer på?', '["Er dette farlig? Hva vil han? Hvor lang tid tar det?","Hvem, hva, hvor mye rabatt?","Skal jeg åpne? Kjøpe? Klage?"]', 0),
  ('d2d-psykologi', 'Hva gjør du fysisk idet døra åpnes?', '["Tar et halvt skritt tilbake og gir kunden rom","Setter foten i døra","Rekker frem hånda umiddelbart"]', 0),
  ('d2d-psykologi', 'Hvorfor er naboeffekten sterkere på dør?', '["Beviset er synlig — kunden ser huset til naboen som kjøpte","Den er ikke sterkere","Naboer kjøper alltid likt"]', 0),
  ('ti-sekunders-dorapning', 'Strukturen i døråpningen?', '["Hils → Ærend → Referanse → Spørsmål","Pitch → Pris → Press","Unnskyldning → Tilbud → Rabatt"]', 0),
  ('ti-sekunders-dorapning', 'Hvorfor aldri si «jeg skal ikke selge deg noe»?', '["Det oppleves uærlig — du skal jo selge","Det er for langt","Det er fint å si"]', 0),
  ('ti-sekunders-dorapning', 'Hva betyr «ikke interessert» i sekund én?', '["Kunden hater produktet","«Jeg trodde du var nok en tilfeldig selger»","At du bør ringe i stedet"]', 1),
  ('territorium-og-rutiner', 'Hvorfor jobbe feltet gate for gate?', '["Ekte naboreferanser + kjent fjes","Kortere å gå","Sjefen ser deg"]', 0),
  ('territorium-og-rutiner', 'Gullvinduet for dørsalg på hverdager?', '["08–11","16:30–20:30","21–23"]', 1),
  ('territorium-og-rutiner', 'Hva gjør du med «ikke hjemme»-husene?', '["Glemmer dem","Noterer status og tar dem i et annet tidsvindu","Ringer på tre ganger samme kveld"]', 1),
  ('nei-takk-pa-dora', 'Hva er et refleks-nei?', '["Avvisning av kategorien selger før ærendet er hørt","Et gjennomtenkt avslag","Et ja i forkledning"]', 0),
  ('nei-takk-pa-dora', 'Hvor mange ganger gjenåpner du etter refleks-nei?', '["Så mange som trengs","Én gang — rolig og med informasjonen som manglet","Aldri"]', 1),
  ('nei-takk-pa-dora', 'Hvorfor er hyggelig exit god business?', '["Naboene snakker sammen — ryktet påvirker feltet","Det er det ikke","Fordi du får tips"]', 0),
  ('innvendingsbanken', 'Grunnformelen for innvendingshåndtering?', '["Anerkjenn → Utforsk → Svar → Fremdrift","Avbryt → Argumenter → Press","Ignorer → Gjenta → Rabatt"]', 0),
  ('innvendingsbanken', 'Hvorfor er «vi har allerede leverandør» en god innvending?', '["Kunden har bekreftet behov og betalingsvilje","Den er ikke god","Da slipper du å selge"]', 0),
  ('innvendingsbanken', 'Hva betyr «jeg må tenke på det» som regel?', '["Kunden trenger kalkulator","Det finnes en usagt innvending","Salget er i boks"]', 1),
  ('closing-teknikker', 'Hva er alternativ-closen?', '["To positive valg i stedet for ja/nei","Et alternativt produkt","La kunden velge selger"]', 0),
  ('closing-teknikker', 'Regelen om knapphet i closing?', '["Alltid bruk knapphet","Kun ekte knapphet — falsk er ulovlig og ødeleggende","Knapphet virker ikke i Norge"]', 1),
  ('closing-teknikker', 'Etter closingspørsmålet skal du …', '["Tie stille til kunden svarer","Utdype med tre nye argumenter","Senke prisen uoppfordret"]', 0),
  ('prisforhandling', 'Når presenteres prisen?', '["Først i samtalen","Oppå verdi kunden allerede har sagt ja til","Aldri"]', 1),
  ('prisforhandling', 'Hva gjør du FØR du vurderer rabatt?', '["Lytter, normaliserer, argumenterer verdi, justerer pakken","Gir rabatt umiddelbart","Avslutter"]', 0),
  ('prisforhandling', 'Regelen for rabatt?', '["Rabatt kun mot noe — f.eks. signering i dag","Rabatt til alle som spør","Rabatt er forbudt"]', 0),
  ('etterarbeid-oppfolging', 'De første 10 minuttene etter et ja?', '["Bekreft skriftlig og forsterk beslutningen","Ring neste uten å notere","Ta fri"]', 0),
  ('etterarbeid-oppfolging', 'Når stilles referansespørsmålet?', '["Mens kunden er varm — rett etter kjøpet","Etter tre måneder","Aldri"]', 0),
  ('etterarbeid-oppfolging', 'Hvordan håndteres en kunde som angrer?', '["Raskt, hyggelig og uten press","Med tre nye salgsforsøk","Ignoreres"]', 0),
  ('hva-er-remote-closing', 'Hva gjør en setter?', '["Kvalifiserer leads og booker salgssamtaler","Skriver kontrakter","Lager markedsføringen"]', 0),
  ('hva-er-remote-closing', 'Hva avgjør mest for en closers resultater?', '["Tilbudet/selskapet hen selger for","Antall følgere","Dress og klokke"]', 0),
  ('hva-er-remote-closing', 'Hovedforskjellen på TM og discovery call?', '["Lengre samtale = mer avdekking, ikke mer pitch","Discovery har ingen struktur","TM er vanskeligere"]', 0),
  ('discovery-calls', 'Rammen for en discovery call?', '["Rådgiver som diagnostiserer før hen foreskriver","Pitch i minutt fem","Snakk 80 % selv"]', 0),
  ('discovery-calls', 'Hva følger etter at kunden svarer «7» på skalaen?', '["«Hva skal til for at det blir en 9?»","«Det holder»","«Sikker på at det ikke er 6?»"]', 0),
  ('discovery-calls', 'Hva gjør toppclosere med leads som ikke passer?', '["Disker dem høflig og raskt","Closer dem uansett","Sender dem til konkurrenten"]', 0),
  ('karriereveien', 'Den typiske karrieretrappen?', '["TM → D2D/feltsalg → setter → closer","Closer → TM → pensjon","D2D → TM → butikk"]', 0),
  ('karriereveien', 'Hva gir TM-trinnet mest av?', '["Volumtrening","Fast høy lønn uten krav","Reiseerfaring"]', 0),
  ('karriereveien', 'Hva ansetter salgssjefer?', '["Folk som kan demonstrere faget på sparket","Kun mastergrader","De med lengst CV"]', 0),
  ('forste-30-dager', 'Målet i uke 2 i ny jobb?', '["Aktivitet — slå aktivitetsmålene hver dag","Bli topp 3","Be om lønnsforhøyelse"]', 0),
  ('forste-30-dager', 'Hvordan finner du «lekkasjen» i uke 3?', '["Ser på egne tall og finner hvor trakten lekker","Spør kundene","Gjetter"]', 0),
  ('forste-30-dager', 'Hva slår motivasjon i lengden?', '["Standarder og rutiner","Flaks","Energidrikk"]', 0);

-- ── Teorieksamens-spørsmål (12 av 40 — resten produseres) ───
-- is_exam = true; lesson_slug refererer til nærmeste relevante leksjon
insert into public.quiz_questions (lesson_slug, question, options, correct_index, is_exam) values
  ('d2d-psykologi', 'Hva er det første du skal etablere i en dørsalgssituasjon?', '["Pris","Trygghet","Produktfordeler"]', 1, true),
  ('referanse-metoden', 'Hvilke fire steg består referanse-metoden av?', '["Referanse, sosialt bevis, konkret booking, SMS","Hei, pitch, pris, close","Åpning, rabatt, press, signering"]', 0, true),
  ('mindset-avvisning', 'Hva betyr «avvisning er data» i praksis?', '["Hvert nei analyseres og forbedrer neste samtale","Ignorer alle nei","Rapporter avvisning til sjefen"]', 0, true),
  ('innvendingsbanken', 'Kunden sier «jeg må snakke med samboeren». Beste første respons?', '["«Det trenger du ikke»","«Selvfølgelig — hvis det sto på deg alene, hadde du gått for det?»","«Ok, ha det bra»"]', 1, true),
  ('etisk-salg', 'Hvor lang er angreretten ved fjernsalg?', '["14 dager","7 dager","3 dager"]', 0, true),
  ('kjopssignaler', 'Hva kjennetegner et kjøpssignal?', '["Detaljspørsmål om bindingstid, levering eller pris","Kunden legger på","Kunden ber deg snakke saktere"]', 0, true),
  ('innvendingsbanken', 'Riktig håndtering av «send meg noe på mail»?', '["Sende mail og håpe","Konvertere til konkret oppfølgingsavtale med SMS + ringetid","Nekte å sende"]', 1, true),
  ('prisforhandling', 'Når presenteres pris i en strukturert samtale?', '["Så tidlig som mulig","Etter at behov er avdekket og verdi etablert","Aldri"]', 1, true),
  ('closing-teknikker', 'Hva er en alternativ-close?', '["«Passer tirsdag 10 eller torsdag 14?»","«Vil du kjøpe, ja eller nei?»","«Skal jeg ringe en gang?»"]', 0, true),
  ('etisk-salg', 'Hva gjør falsk scarcity?', '["Øker salget uten risiko","Bryter markedsføringsloven og ødelegger tilliten","Standard bransjepraksis"]', 1, true),
  ('discovery-calls', 'Hovedjobben i de første 10 minuttene av en discovery call?', '["Pitche programmet","Ramme inn samtalen og forstå nå-situasjonen","Forhandle pris"]', 1, true),
  ('book-motet', 'Hvorfor alltid SMS-bekreftelse etter booking?', '["Skriftlig avtale, færre no-shows, trygghet","Bruke opp SMS-kvoten","Valgfritt og unødvendig"]', 0, true);

-- ── Demo-jobber (matcher mockData.ts) ───────────────────────
-- Idempotent: jobs har ingen naturlig nøkkel, så vi sletter demo-radene før insert.
delete from public.jobs;
insert into public.jobs (title, company, location, pay, type, description, tags) values
  ('TM-selger — TV & strømming', 'Nordic Salgspartner AS', 'Oslo (kontor) / hybrid', 'Fastlønn 220 000 + provisjon. Realistisk år 1: 420 000–550 000 kr', 'Fulltid', 'Ring varme og kalde lister for en av Nordens største TV- og strømmeaktører. Full opplæring, ung kultur, tydelig karrierevei mot teamleder.', '["Telefonsalg","B2C","Garanti-partner"]'),
  ('D2D-selger — boligalarm', 'TryggHjem Sikkerhet AS', 'Østlandet (felt)', 'Provisjonsbasert. Snitt team: 45 000/mnd, topp: 90 000+/mnd', 'Fulltid', 'Dørsalg av alarmpakker i etablerte felt. Firmabil etter prøvetid. Passer deg som vil ha høy provisjon og rask utvikling.', '["Dørsalg","Høy provisjon","Garanti-partner"]'),
  ('SDR — SaaS-selskap', 'Fjord Software AS', 'Bergen / remote i Norge', 'Fastlønn 480 000 + bonus (OTE 600 000)', 'Fulltid', 'Book møter for salgsteamet i et voksende norsk SaaS-selskap. B2B-erfaring fra dag én — springbrettet til Account Executive.', '["B2B","SaaS","Remote-mulig"]'),
  ('Remote closer — high ticket', 'Vekstakademiet (kursaktør)', '100 % remote', '10–15 % provisjon per salg. Etablerte closere: 60 000–150 000/mnd', 'Engasjement / provisjon', 'Discovery calls for et norsk kursprogram med varme leads. Krever dokumenterte resultater — Closerskolen-sertifikat med topp AI-scores kvalifiserer til intervju.', '["High ticket","Remote","Kun erfarne"]');

-- Ferdig! Opprett en admin ved å sette role='admin' på din egen profil:
--   update public.profiles set role = 'admin' where id = '<din-auth-uid>';
