import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import SectionHeading from '../components/SectionHeading';
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
    after: 'TM-selger, Allente-partner',
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
    q: 'Hvordan fungerer delbetalingen?',
    a: '6 månedlige trekk (5 × 4 983 kr + siste trekk 4 985 kr) — samme totalpris som ved engangsbetaling (29 900 kr), helt uten renter og gebyrer. Vi tjener ikke penger på gjelden din, kun på at du fullfører og kommer i jobb.',
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
  { week: 'Uke 1', title: 'Fundamentet', text: 'Hvorfor salg, mindset, etikk og lytting. Quiz-gate: 80 %.' },
  { week: 'Uke 2', title: 'Telefonsalg I', text: 'Åpningen, referanse-metoden, pitch og booking. + 4 AI-samtaler.' },
  { week: 'Uke 3', title: 'Telefonsalg II', text: 'Behovsavdekking, spørreteknikk, tonalitet. 5 AI-samtaler ≥70.' },
  { week: 'Uke 4', title: 'Dørsalg', text: 'D2D-psykologi, døråpning, territorium. + 5 AI-samtaler.' },
  { week: 'Uke 5', title: 'Innvendinger & closing', text: 'Innvendingsbanken og 8 closing-teknikker. 6 AI-samtaler ≥75.' },
  { week: 'Uke 6', title: 'High ticket & karriere', text: 'Remote closing, discovery calls, karriereplan. 5 AI-samtaler ≥80.' },
  { week: 'Uke 7', title: 'Eksamensuke', text: 'Teorieksamen (40 spørsmål) + AI-eksamenssamtale med score ≥80.' },
  { week: 'Uke 8', title: 'Finalen: ekte kundesamtale', text: 'Du tar en reell samtale med ekte kunde — med sensor på linja. Består du, starter jobbgarantien.' },
];

const offerStack = [
  { item: '6 kursmoduler: video + tekst + quiz', value: '15 000 kr' },
  { item: 'Ubegrenset AI-salgscoach med scorede samtaler', value: '10 000 kr' },
  { item: 'Eksamen + sertifikat (teori, AI og ekte kundesamtale)', value: '5 000 kr' },
  { item: 'Jobbgaranti: tilbud innen 90 dager — eller pengene tilbake', value: 'Uvurderlig' },
  { item: '3 måneder Closerskolen Community inkludert', value: '1 197 kr' },
  { item: 'Bonus: script-bibliotek, innvendingsbank og «første 30 dager»-plan', value: '2 500 kr' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-white">{q}</h3>
        <span className="text-amber-500" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </div>
      {open && <p className="mt-3 text-sm leading-relaxed text-zinc-300">{a}</p>}
    </Card>
  );
}

export default function Landing() {
  return (
    <div className="bg-zinc-950">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:pt-28">
          <Badge tone="amber" className="mb-6">
            ⚡ Norges eneste salgsutdanning med jobbgaranti
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Fra null til closer på{' '}
            <span className="text-amber-500">8 uker</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-300">
            Ingen utdanning? Ingen erfaring? Bra.{' '}
            <span className="font-semibold text-white">
              Vi trenger bare at du er sulten.
            </span>
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/pamelding" size="lg">
              Søk plass på kull 3 →
            </Button>
            <Button to="#slik-funker-det" variant="secondary" size="lg">
              Se hvordan det funker
            </Button>
          </div>
          <p className="mt-8 text-sm text-zinc-500">
            23 plasser per kull — opptak til kull 3 pågår · mål: 97 % i jobb
            innen 90 dager
          </p>
        </div>
      </section>

      {/* PAIN */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Kjenner du deg igjen?"
          title="Du vet du kan mer enn jobben din krever"
          center
        />
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <span className="text-3xl" aria-hidden>📦</span>
            <h3 className="mt-3 text-lg font-bold text-white">
              Lager, butikk, kasse — og null vei videre
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Timelønna er lik uansett hvor hardt du jobber. Om fem år står du
              samme sted, bare eldre. Innsatsen din fortjener en jobb som
              betaler for den.
            </p>
          </Card>
          <Card>
            <span className="text-3xl" aria-hidden>📱</span>
            <h3 className="mt-3 text-lg font-bold text-white">
              Du ser andre tjene penger på TikTok
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              «Remote closing», «high ticket», «55k denne måneden». Noe av det
              er tull — men faget bak er ekte. Forskjellen på dem og deg er
              trening og en fot innenfor.
            </p>
          </Card>
          <Card>
            <span className="text-3xl" aria-hidden>🧭</span>
            <h3 className="mt-3 text-lg font-bold text-white">
              Du vet ikke hva du «skal bli» — og alle maser
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Du trenger ikke en tiårsplan. Du trenger én ferdighet som betaler
              seg nå, og som åpner dører uansett hva du velger senere. Salg er
              den ferdigheten.
            </p>
          </Card>
        </div>
      </section>

      {/* LØSNINGEN / TIDSLINJE */}
      <section id="slik-funker-det" className="border-y border-white/10 bg-zinc-900/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Slik funker det"
            title="8 uker. 6 moduler. Én ekte kundesamtale."
            sub="Hver modul har en gate: quiz og godkjente AI-samtaler. Du kommer ikke videre før du kan det — og akkurat derfor tør vi garantere jobb."
          />
          <ol className="grid gap-4 md:grid-cols-2">
            {timeline.map((t, i) => (
              <li key={t.week}>
                <Card className={i === 7 ? 'border-emerald-500/40 bg-emerald-500/5' : ''}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-bold text-amber-500">{t.week}</span>
                    <h3 className="font-bold text-white">{t.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{t.text}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AI-COACHEN */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="AI-salgscoachen"
              title="Øv deg ubegrenset mot Norges tøffeste AI-kunde — før du møter en ekte"
              sub="Kari (54) vurderer å si opp TV-pakken. Bjørn (47) har allerede Verisure. Rune (41) presser deg på pris. De sier «jeg må snakke med samboeren» og «send meg noe på mail» — helt til du lærer å svare. Hver samtale scores 0–100 med konkret feedback."
            />
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="text-amber-500">✓</span> 5 norske kundepersonas + eksamenskunde, 3 vanskelighetsgrader
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500">✓</span> Scorecard: åpning, behov, innvendinger, closing
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500">✓</span> «Hva en topp-closer ville sagt» etter hver samtale
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500">✓</span> Du dummer deg ut foran en robot — ikke foran en kunde
              </li>
            </ul>
          </div>
          {/* Chat-mockup */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-sm font-semibold text-white">📺 Kari (54) — Allente-kunden</p>
              <Badge tone="amber">Vanskelighetsgrad 2</Badge>
            </div>
            <div className="space-y-3 text-sm">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 p-3 text-zinc-200">
                Jeg må nesten snakke med mannen min først, vi bestemmer sånt sammen.
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-amber-500/20 p-3 text-amber-50">
                Selvfølgelig — sånt bestemmer man sammen. Bare så jeg vet det: hvis det sto på deg alene, hadde du gått for det?
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 p-3 text-zinc-200">
                Ja … det er jo egentlig mest jeg som styrer sånt, da.
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
              <p className="mb-1 font-bold text-emerald-400">SCORECARD — Godkjent ✓</p>
              <p className="text-zinc-300">
                Åpning 82 · Behov 74 · Innvendinger 88 · Closing 78 —{' '}
                <span className="font-semibold text-white">Totalt 81/100</span>
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* JOBBGARANTIEN */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 p-8 text-center sm:p-14">
          <Badge tone="green" className="mb-5">🛡️ Jobbgarantien</Badge>
          <h2 className="mx-auto max-w-2xl text-3xl font-black text-white sm:text-4xl">
            Får du ikke jobbtilbud innen 90 dager etter bestått eksamen, får du{' '}
            <span className="text-emerald-400">hver krone tilbake.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-300">
            Ikke «hjelp på veien». Ikke «karriereveiledning». Et jobbtilbud —
            eller 100 % refusjon. Vi kan love det fordi eksamen faktisk beviser
            at du kan selge, og fordi vi har arbeidsgiverpartnere som venter på
            kandidatene våre.
          </p>
          <div className="mt-6">
            <Button to="/garanti" variant="green">
              Les de fulle garantivilkårene →
            </Button>
          </div>
        </div>
      </section>

      {/* OFFER STACK + PRIS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Det du får"
          title="Alt som skal til — i én pakke"
          center
        />
        <div className="mx-auto max-w-2xl">
          <Card className="divide-y divide-white/10">
            {offerStack.map((o) => (
              <div key={o.item} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-zinc-200">{o.item}</span>
                <span className="shrink-0 text-sm font-semibold text-zinc-400">{o.value}</span>
              </div>
            ))}
          </Card>
          <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-8 text-center">
            <p className="text-sm uppercase tracking-widest text-amber-400">Din investering</p>
            <p className="mt-2 text-5xl font-black text-white">29 900 kr</p>
            <p className="mt-2 text-zinc-300">
              eller <span className="font-bold text-white">6 månedlige trekk à ~4 983 kr</span> — helt rentefritt, samme totalpris
            </p>
            <p className="mt-3 text-sm font-medium text-amber-400">
              «Vi tjener ikke penger på gjelden din.» Ingen renter, ingen
              gebyrer, ingen Klarna-triks.
            </p>
            <div className="mt-6">
              <Button to="/pamelding" size="lg">Søk plass på kull 3 →</Button>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="border-y border-white/10 bg-zinc-900/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Closerskolen Inside"
            title="Du blir ikke ferdig — du blir med videre"
            sub="Etter eksamen åpnes communityet: der jobbene, vanene og nettverket bor. 3 måneder inkludert, deretter 399 kr/mnd hvis du vil bli."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <span className="text-2xl" aria-hidden>💼</span>
              <h3 className="mt-2 font-bold text-white">Jobbtavla</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Stillinger fra partnerbedrifter — TM, D2D, SDR og remote
                closing. Søk med sertifikatet ditt vedlagt.
              </p>
            </Card>
            <Card>
              <span className="text-2xl" aria-hidden>🏆</span>
              <h3 className="mt-2 font-bold text-white">Wins Wednesday</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Hver onsdag deler alle ukas seire — første salg, beste uke, ny
                jobb. Momentum smitter.
              </p>
            </Card>
            <Card>
              <span className="text-2xl" aria-hidden>🎧</span>
              <h3 className="mt-2 font-bold text-white">Live call reviews</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Hver torsdag: ekte samtaler gjennomgås live. Du hører hva som
                funker — ikke bare teorien om det.
              </p>
            </Card>
            <Card>
              <span className="text-2xl" aria-hidden>📈</span>
              <h3 className="mt-2 font-bold text-white">Leaderboard</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Poeng for AI-scores og aktivitet. Topp 3 hver måned vinner 1:1
                med Sebastian.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ILLUSTRATIVE EKSEMPLER (se kommentar øverst i fila) */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Illustrative eksempler"
          title="Slik kan reisen se ut"
          sub="Fiktive eksempler på reisen vi bygger programmet for — ikke ekte kundeuttalelser. Ekte historier fra kull 1 publiseres fortløpende."
          center
        />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <Badge tone="zinc" className="mb-3">
                Illustrative eksempler — kull 1 pågår
              </Badge>
              <p className="text-sm italic leading-relaxed text-zinc-300">«{t.quote}»</p>
              <div className="mt-4 border-t border-white/10 pt-3">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-zinc-500">
                  {t.before} → <span className="text-emerald-400">{t.after}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <SectionHeading eyebrow="FAQ" title="Ofte stilte spørsmål" center />
        <div className="space-y-3">
          {faq.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* SISTE CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900 py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            23 plasser. Ett spørsmål:{' '}
            <span className="text-amber-500">er du sulten nok?</span>
          </h2>
          <p className="mt-4 text-zinc-400">
            Søknaden er gratis og tar tre minutter. Vi svarer alle innen 48
            timer.
          </p>
          <div className="mt-8">
            <Button to="/pamelding" size="lg">Søk plass på kull 3 →</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
