import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Icon from '../components/Icon';
import MediaPlaceholder from '../components/MediaPlaceholder';
import SectionDivider, { StripeSpacer } from '../components/SectionDivider';
import { useState } from 'react';

// MERK: Kortene nedenfor er ILLUSTRATIVE EKSEMPLER (fiktive navn/sitater) på
// reisen programmet er bygget for — tydelig merket i UI-et. Byttes ut med
// ekte, dokumenterbare student-testimonials fra kull 1 så snart de finnes —
// markedsføringsloven krever at publiserte kundeuttalelser er reelle.
const testimonials = [
  {
    name: 'Emilie (21), Drammen',
    before: 'Butikkmedarbeider',
    after: 'D2D-selger, alarm',
    quote:
      'Jeg hadde aldri solgt noe før. Etter 30 AI-samtaler var jeg trygg på innvendingene før jeg møtte min første ekte kunde — det var hele forskjellen.',
  },
  {
    name: 'Adrian (19), Skien',
    before: 'Lagerarbeider',
    after: 'TM-selger, TV & strømming',
    quote:
      'Referanse-metoden forandret alt for meg. Jeg gikk fra å grue meg til hver samtale til å faktisk glede meg til åpningen.',
  },
  {
    name: 'Sara (23), Trondheim',
    before: 'Arbeidsledig',
    after: 'SDR i SaaS-selskap',
    quote:
      'Den ekte kundesamtalen på eksamen var skummel — og akkurat derfor funket det. I jobbintervjuet rollespilte de en innvending, og jeg bare smilte.',
  },
];

const faq = [
  {
    q: 'Koster det noe å søke?',
    a: 'Nei. Søknaden er gratis og uforpliktende. Vi tar en kort samtale med alle aktuelle kandidater før opptak — vi vil ha sultne folk, ikke flest mulig folk.',
  },
  {
    q: 'Må jeg ha erfaring eller utdanning?',
    a: 'Nei. Programmet er bygget for deg som starter fra null. Det eneste vi krever er at du er over 18, bor i Norge og faktisk gjør jobben: moduler, AI-treningssamtaler og eksamen.',
  },
  {
    q: 'Hva skjer hvis jeg stryker på eksamen?',
    a: 'Du får ett nytt forsøk uten ekstra kostnad, med konkret tilbakemelding på hva du må trene på. Består du ikke, gjelder ikke jobbgarantien — men du beholder tilgangen til kursmateriellet og AI-coachen ut perioden.',
  },
  {
    q: 'Hvordan fungerer jobbgarantien i praksis?',
    a: 'Består du eksamen (inkludert den ekte kundesamtalen) og oppfyller vilkårene, garanterer vi at du får minst ett jobbtilbud innen 90 dager. Får du ikke det, refunderer vi hele kursavgiften. Alle vilkår ligger åpent på garantisiden.',
  },
  {
    q: 'Har jeg angrerett?',
    a: 'Ja, 14 dagers angrerett etter angrerettloven fra du melder deg på. Starter du kurset før fristen, samtykker du uttrykkelig til oppstart — da betaler du kun for det du har brukt hvis du angrer.',
  },
  {
    q: 'Hvorfor er kull 3 så mye billigere?',
    a: 'Kull 3 er grunnleggerkullet. Du blir tett fulgt opp av oss mens vi ferdigstiller videoene, og vi bruker resultatene deres (med samtykke) som bevis for neste kull. Derfor er prisen 9 990 kr for kull 3 og 4 — fra kull 5 koster programmet 29 900 kr. Ingen rabattriks, bare en ærlig byttehandel: du er tidlig ute, vi får bevisene.',
  },
  {
    q: 'Hvordan fungerer delbetalingen?',
    a: '3 månedlige trekk à 3 330 kr — samme totalpris som ved engangsbetaling (9 990 kr for kull 3), helt uten renter og gebyrer. Vi tjener ikke penger på gjelden din, kun på at du fullfører og kommer i jobb.',
  },
  {
    q: 'Hva slags jobber er det snakk om?',
    a: 'Telefonsalg (TM), dørsalg/feltsalg og SDR-roller hos våre partnerbedrifter — inkludert salgsselskaper i vårt eget konsern. Dette er reelle ansettelser med fastlønn og/eller provisjon, ikke praksisplasser.',
  },
  {
    q: 'Hvor mye kan jeg tjene som selger?',
    a: 'Det avhenger helt av innsats og rolle. Vanlig førsteårsinntekt i TM med fastlønn og provisjon ligger typisk mellom 400 000 og 600 000 kr — men ingen seriøs aktør kan garantere inntekt, og det gjør ikke vi heller. Det vi garanterer, er jobbmuligheten.',
  },
];

const timeline = [
  { week: '01', title: 'Fundamentet', text: 'Hvorfor salg, mindset, etikk og lytting.', gate: 'GATE: QUIZ 80 %' },
  { week: '02', title: 'Telefonsalg I', text: 'Åpningen, referanse-metoden, pitch og booking.', gate: 'GATE: + 4 AI-SAMTALER' },
  { week: '03', title: 'Telefonsalg II', text: 'Behovsavdekking, spørreteknikk, tonalitet.', gate: 'GATE: 5 AI-SAMTALER ≥70' },
  { week: '04', title: 'Dørsalg', text: 'D2D-psykologi, døråpning, territorium.', gate: 'GATE: + 5 AI-SAMTALER' },
  { week: '05', title: 'Innvendinger & closing', text: 'Innvendingsbanken og 8 closing-teknikker.', gate: 'GATE: 6 AI-SAMTALER ≥75' },
  { week: '06', title: 'High ticket & karriere', text: 'Remote closing, discovery calls, karriereplan.', gate: 'GATE: 5 AI-SAMTALER ≥80' },
  { week: '07', title: 'Eksamensuke', text: 'Teorieksamen (40 spørsmål) + AI-eksamenssamtale.', gate: 'GATE: SCORE ≥80' },
  { week: '08', title: 'Finalen: ekte kundesamtale', text: 'Du tar en reell samtale med ekte kunde — med sensor på linja. Består du, starter jobbgarantien.', gate: 'EKTE KUNDESAMTALE — SENSOR PÅ LINJA' },
];

const offerStack = [
  { item: '6 kursmoduler: video + tekst + quiz', value: '15 000 kr' },
  { item: 'Ubegrenset AI-salgscoach med scorede samtaler', value: '10 000 kr' },
  { item: 'Eksamen + sertifikat (teori, AI og ekte kundesamtale)', value: '5 000 kr' },
  { item: 'Jobbgaranti: tilbud innen 90 dager — eller pengene tilbake', value: 'Uvurderlig' },
  { item: '3 måneder Closerskolen Community inkludert', value: '1 197 kr' },
  { item: 'Bonus: script-bibliotek, innvendingsbank og «første 30 dager»-plan', value: '2 500 kr' },
];

// Strammet inn ~20 % — kortere setninger, samme budskap.
const pains = [
  {
    n: '01',
    title: 'Lager, butikk, kasse — og null vei videre',
    text: 'Timelønna er lik uansett hvor hardt du jobber. Om fem år står du samme sted — bare eldre.',
  },
  {
    n: '02',
    title: 'Du ser andre tjene penger på TikTok',
    text: '«Remote closing», «55k denne måneden». Mye er tull — men faget bak er ekte. Forskjellen er trening og en fot innenfor.',
  },
  {
    n: '03',
    title: 'Du vet ikke hva du «skal bli» — og alle maser',
    text: 'Du trenger ikke en tiårsplan. Du trenger én ferdighet som betaler seg nå og åpner dører senere. Salg er den ferdigheten.',
  },
];

const garantiVilkar = [
  'Bestått avsluttende eksamen (teori, AI-samtale og ekte kundesamtale)',
  'Fullført program og minst 25 godkjente AI-treningssamtaler',
  'Delta i formidlingen: still opp på intervjuer og prøvedager',
  'Grunnkrav: fylt 18 år, bosatt i Norge, arbeidsfør i perioden',
  'Kvalifiserte jobbtilbud teller — takker du nei, bortfaller garantien',
  'Refusjonskrav fremmes skriftlig innen 30 dager etter perioden',
];

const marqueeItems = [
  'Jobbgaranti',
  'AI-coach',
  'Ekte kundesamtale',
  '8 uker',
  '23 plasser',
  'Sertifikat',
  'Kull 3',
];

function FaqItem({ q, a, n }: { q: string; a: string; n: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        className="flex w-full items-center gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="label-mono w-8 shrink-0 text-signal">
          {String(n).padStart(2, '0')}
        </span>
        <span className="flex-1 font-semibold text-bone">{q}</span>
        <span className="text-signal" aria-hidden>
          <Icon name={open ? 'x' : 'arrow-right'} size={16} />
        </span>
      </button>
      {open && (
        <p className="pb-5 pl-12 pr-8 text-sm leading-relaxed text-bone/60">{a}</p>
      )}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-ink">
      <Navbar />

      {/* HERO — S.01 (ink). Kompakt på small: hero + CTA på én mobilskjerm. */}
      <section className="border-b border-line">
        <SectionDivider index={1} name="Fra null til closer" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-6 sm:pt-10 lg:grid-cols-5 lg:gap-14 lg:pb-24 lg:pt-10">
          <div className="lg:col-span-3">
            <p className="label-mono text-signal">
              — Norges eneste salgsutdanning med jobbgaranti
            </p>
            <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:mt-6 sm:text-6xl lg:text-8xl">
              Fra null til closer på <span className="text-signal">8 uker</span>.
            </h1>
            <p className="mt-4 max-w-lg leading-relaxed text-bone/70 sm:mt-6 sm:text-lg">
              Ingen utdanning? Ingen erfaring? Bra.{' '}
              <span className="font-semibold text-bone">
                Vi trenger bare at du er sulten.
              </span>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Button to="/pamelding" size="lg">
                Se om du kvalifiserer — gratis søknad <Icon name="arrow-right" size={16} />
              </Button>
              <Button to="#slik-funker-det" variant="secondary" size="lg">
                Se hvordan det funker
              </Button>
            </div>
            <div className="label-mono mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-4 text-bone/50 sm:mt-10 sm:pt-5">
              <span>Gratis søknad</span>
              <span className="text-signal">·</span>
              <span>23 plasser</span>
              <span className="text-signal">·</span>
              <span>Jobbgaranti</span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="relative">
              <MediaPlaceholder
                kind="video"
                ratio="4/5"
                label="Sebastian på salgsgulvet — hype-reel 30 sek"
              />
              <span className="label-mono absolute left-0 top-0 flex items-center gap-1.5 bg-signal px-2.5 py-1 text-[10px] text-ink">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
                LIVE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-b border-line bg-signal py-2.5" aria-hidden>
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center font-mono text-[13px] font-semibold uppercase tracking-[0.15em] text-ink"
            >
              {marqueeItems.map((item) => (
                <span key={item} className="flex items-center">
                  <span className="px-4">{item}</span>
                  <span>✕</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM — S.02 (bone) */}
      <section className="bg-bone text-ink">
        <SectionDivider index={2} name="Kjenner du deg igjen?" tone="bone" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <p className="label-mono text-signal">— Kjenner du deg igjen?</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Du vet du kan mer enn jobben din krever
          </h2>
          <div className="mt-12 border-t border-line-ink">
            {pains.map((p) => (
              <div
                key={p.n}
                className="grid gap-4 border-b border-line-ink py-8 sm:grid-cols-12 sm:gap-8"
              >
                <span className="font-mono text-4xl font-semibold text-signal sm:col-span-2 sm:text-5xl">
                  {p.n}
                </span>
                <h3 className="font-display text-xl uppercase leading-tight tracking-tight sm:col-span-5 sm:text-2xl">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink/70 sm:col-span-5">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HVA DU FÅR — S.03 (ink). Verdi før prosess — uten pris-tall. */}
      <section>
        <SectionDivider index={3} name="Hva du får" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <p className="label-mono text-signal">— Hva du får</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-6xl">
            Alt som skal til — i én pakke
          </h2>
          <div className="mx-auto mt-12 max-w-2xl border border-line">
            <p className="label-mono border-b border-line px-5 py-3 text-bone/60">
              Closerskolen — kvittering
            </p>
            <div className="p-5 font-mono text-[13px]">
              {offerStack.map((o) => (
                <div
                  key={o.item}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed border-line py-3"
                >
                  <span className="text-bone/80">{o.item}</span>
                  <span className="shrink-0 text-bone/50">{o.value}</span>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 py-4">
                <span className="uppercase tracking-[0.1em] text-bone/60">Totalverdi</span>
                <span className="font-semibold text-bone">33 697 kr</span>
              </div>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Button to="/pamelding" size="lg">
              Se om du kvalifiserer — gratis søknad <Icon name="arrow-right" size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* SLIK FUNKER DET — S.04 (ink), KOMPAKT TIDSLINJE I TO KOLONNER */}
      <StripeSpacer />
      <section id="slik-funker-det">
        <SectionDivider index={4} name="Slik funker det" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <p className="label-mono text-signal">— Slik funker det</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-6xl">
            8 uker. 6 moduler. Én ekte kundesamtale.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-bone/60">
            Hver modul har en gate: quiz og godkjente AI-samtaler. Du kommer
            ikke videre før du kan det — og akkurat derfor tør vi garantere
            jobb.
          </p>
          <ol className="mt-10 grid gap-x-8 md:grid-cols-2">
            {timeline.map((t) => {
              const isFinal = t.week === '08';
              return (
                <li
                  key={t.week}
                  className={`flex gap-4 py-5 ${
                    isFinal
                      ? 'border-2 border-signal bg-signal/5 px-4 md:col-span-2 md:px-6'
                      : 'border-b border-line'
                  }`}
                >
                  <span
                    className={`shrink-0 font-mono text-4xl font-semibold tracking-tight ${
                      isFinal ? 'text-signal' : 'text-bone/25'
                    }`}
                  >
                    {t.week}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base uppercase tracking-tight text-bone sm:text-lg">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-bone/60">{t.text}</p>
                    <p
                      className={`label-mono mt-2 ${
                        isFinal ? 'text-signal' : 'text-bone/40'
                      }`}
                    >
                      {t.gate}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* AI-COACHEN — S.05 (ink), KORT VERSJON */}
      <StripeSpacer />
      <section>
        <SectionDivider index={5} name="AI-salgscoachen" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="label-mono text-signal">— AI-salgscoachen</p>
              <h2 className="mt-4 font-display text-3xl uppercase leading-[0.95] tracking-tight text-bone sm:text-5xl">
                Øv ubegrenset mot Norges tøffeste AI-kunde
              </h2>
              <p className="mt-5 leading-relaxed text-bone/60">
                Skjulte kundeoppdrag på telefon og dør. Kunden sier «jeg må
                snakke med samboeren» og «send meg noe på mail» — helt til du
                lærer å svare. Hver samtale scores 0–100 med konkret feedback.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-bone/80">
                {[
                  '5 skjulte kundeoppdrag + eksamensoppdrag, 3 vanskelighetsgrader',
                  '«Hva en topp-closer ville sagt» etter hver samtale',
                  'Du dummer deg ut foran en robot — ikke foran en kunde',
                ].map((li) => (
                  <li key={li} className="flex gap-3 border-b border-line pb-4">
                    <span className="mt-0.5 shrink-0 text-signal">
                      <Icon name="check" size={16} />
                    </span>
                    {li}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat-mockup */}
            <div className="border border-line">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="label-mono flex items-center gap-2 text-bone">
                  <Icon name="phone" size={14} className="text-signal" />
                  O1 — TV & strømming · skjult kunde
                </p>
                <span className="label-mono text-signal">Nivå 2</span>
              </div>
              <div className="space-y-4 p-4 font-mono text-[13px] leading-relaxed">
                <div className="max-w-[90%] border border-line bg-bone/5 p-3 text-bone/90">
                  <p className="label-mono mb-1.5 text-[10px] text-bone/40">— Kunde</p>
                  Jeg må nesten snakke med mannen min først, vi bestemmer sånt
                  sammen.
                </div>
                <div className="ml-auto max-w-[90%] border-l-2 border-signal bg-signal/5 p-3 text-bone">
                  <p className="label-mono mb-1.5 text-[10px] text-signal">— Deg</p>
                  Selvfølgelig — sånt bestemmer man sammen. Bare så jeg vet det:
                  hvis det sto på deg alene, hadde du gått for det?
                </div>
                <div className="max-w-[90%] border border-line bg-bone/5 p-3 text-bone/90">
                  <p className="label-mono mb-1.5 text-[10px] text-bone/40">— Kunde</p>
                  Ja … det er jo egentlig mest jeg som styrer sånt, da.
                </div>
              </div>
              <p className="label-mono flex items-center justify-between border-t border-line px-4 py-3 text-bone/60">
                Score: <span className="text-signal">81/100</span>
                <span className="flex items-center gap-1.5 text-win">
                  <Icon name="check" size={13} /> Godkjent
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* JOBBGARANTIEN — S.06 (bone) */}
      <section className="bg-bone text-ink">
        <SectionDivider index={6} name="Jobbgarantien" tone="bone" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <p className="label-mono text-signal">— Jobbgarantien</p>
          <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Får du ikke jobb, får du hver krone tilbake.
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-ink/70">
            Ikke «hjelp på veien». Ikke «karriereveiledning». Et jobbtilbud
            innen 90 dager etter bestått eksamen — eller 100 % refusjon. Vi kan
            love det fordi eksamen faktisk beviser at du kan selge, og fordi vi
            har arbeidsgiverpartnere som venter på kandidatene våre.
          </p>
          <ol className="mt-10 grid gap-x-10 border-t border-line-ink sm:grid-cols-2">
            {garantiVilkar.map((v, i) => (
              <li
                key={v}
                className="flex items-start gap-4 border-b border-line-ink py-4 font-mono text-[13px] leading-relaxed text-ink/80"
              >
                <span className="label-mono mt-0.5 shrink-0 text-ink/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">{v}</span>
                <span className="mt-0.5 shrink-0 text-win">
                  <Icon name="check" size={15} />
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Button to="/garanti" variant="green">
              Les de fulle garantivilkårene <Icon name="arrow-right" size={15} />
            </Button>
          </div>
        </div>
      </section>

      {/* PRIS — S.07 (ink). Grunnleggerpris kull 3 — ærlig begrunnelse, ingen «rabatt». */}
      <section>
        <SectionDivider index={7} name="Grunnleggerpris" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="label-mono text-signal">— Grunnleggerpris kull 3</p>
              <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-6xl">
                Hvorfor så billig?
              </h2>
              <p className="mt-5 leading-relaxed text-bone/70">
                Kull 3 er grunnleggerkullet: du blir tett fulgt opp av oss mens
                vi ferdigstiller videoene, og vi bruker resultatene deres (med
                samtykke) som bevis for neste kull. Fra kull 5 koster programmet
                29 900 kr.
              </p>
              <p className="mt-5 border-l-2 border-signal pl-4 text-sm font-medium text-bone/80">
                «Vi tjener ikke penger på gjelden din.» Ingen renter, ingen
                gebyrer, ingen Klarna-triks — heller ikke på delbetaling.
              </p>
            </div>
            <div className="flex flex-col justify-between border-2 border-signal p-6 sm:p-8">
              <div>
                <p className="label-mono text-bone/60">
                  Ordinær pris fra kull 5: 29 900 kr
                </p>
                <p className="label-mono mt-5 text-signal">Grunnleggerpris kull 3</p>
                <p className="mt-2 font-display text-6xl uppercase tracking-tight text-signal sm:text-7xl">
                  9 990 kr
                </p>
                <div className="label-mono mt-6 border-t border-line pt-5 text-bone/60">
                  Eller delbetaling
                </div>
                <p className="mt-2 font-mono text-xl text-bone">3 × 3 330 kr</p>
                <p className="mt-1 text-sm text-bone/60">
                  3 månedlige trekk à 3 330 kr — rentefritt og gebyrfritt, samme
                  totalpris.
                </p>
              </div>
              <div className="mt-8">
                <Button to="/pamelding" size="lg" className="w-full">
                  Se om du kvalifiserer — gratis søknad <Icon name="arrow-right" size={16} />
                </Button>
                <p className="label-mono mt-4 text-center leading-relaxed text-bone/50">
                  Grunnleggerprisen låses til søknaden din når du søker i dag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REISEN / ILLUSTRATIVE EKSEMPLER — S.08 (bone) (se kommentar øverst i fila) */}
      <section className="bg-bone text-ink">
        <SectionDivider index={8} name="Illustrative eksempler" tone="bone" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <p className="label-mono text-signal">— Illustrative eksempler</p>
          <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Slik kan reisen se ut
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-ink/70">
            Fiktive eksempler på reisen vi bygger programmet for — ikke ekte
            kundeuttalelser. Ekte historier fra kull 1 publiseres fortløpende.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col border border-line-ink bg-bone">
                <MediaPlaceholder
                  kind="image"
                  ratio="1/1"
                  size="sm"
                  tone="bone"
                  label={`Portrett — ${t.name.split(' ')[0]} (byttes til ekte student)`}
                  className="border-0 border-b border-dashed"
                />
                <div className="flex flex-1 flex-col p-5">
                  <span className="label-mono mb-4 inline-flex items-center gap-1.5 self-start border border-line-ink px-2.5 py-1 text-ink/60">
                    Illustrative eksempler — kull 1 pågår
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-ink/70">
                    «{t.quote}»
                  </p>
                  <div className="mt-5 border-t border-line-ink pt-4">
                    <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-ink">
                      {t.name}
                    </p>
                    <p className="label-mono mt-1.5 text-ink/50">
                      {t.before} <span className="text-signal">→</span>{' '}
                      <span className="text-win">{t.after}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — S.09 (ink) */}
      <section>
        <SectionDivider index={9} name="FAQ" />
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 lg:pb-28 lg:pt-14">
          <p className="label-mono text-signal">— FAQ</p>
          <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-5xl">
            Ofte stilte spørsmål
          </h2>
          <div className="mt-10 border-t border-line">
            {faq.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} n={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Spacer-stripe: to mørke seksjoner etter hverandre */}
      <StripeSpacer />

      {/* SISTE CTA — S.10 (ink + stripes) */}
      <section className="stripes-soft">
        <SectionDivider index={10} name="Gratis søknad" />
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-14 text-center lg:pb-32 lg:pt-16">
          <h2 className="mx-auto font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            23 plasser. Ett spørsmål:{' '}
            <span className="text-signal">er du sulten nok?</span>
          </h2>
          <p className="label-mono mt-8 text-bone/60">
            Søknaden er gratis og tar tre minutter · Vi svarer alle innen 48 timer
          </p>
          <div className="mt-10">
            <Button to="/pamelding" size="lg">
              Se om du kvalifiserer — gratis søknad <Icon name="arrow-right" size={16} />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
