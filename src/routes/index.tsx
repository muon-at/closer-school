import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Closerskolen – Bli en toppselger på telefon" },
      {
        name: "description",
        content:
          "Closerskolen lærer deg å lukke salg med selvtillit. Praktisk trening, ekte samtaler og mentorship fra Norges beste closere.",
      },
      { property: "og:title", content: "Closerskolen – Bli en toppselger på telefon" },
      {
        property: "og:description",
        content:
          "Praktisk closer-trening, ekte samtaler og mentorship. Start reisen mot en karriere som high-ticket closer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 antialiased">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
          Closerskolen
        </a>
        <nav className="hidden gap-8 text-sm text-neutral-400 md:flex">
          <a href="#om" className="hover:text-white">Om</a>
          <a href="#program" className="hover:text-white">Program</a>
          <a href="#resultater" className="hover:text-white">Resultater</a>
          <a href="#kontakt" className="hover:text-white">Kontakt</a>
        </nav>
        <a
          href="#kontakt"
          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-neutral-950 transition hover:bg-amber-300"
        >
          Søk nå
        </a>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-400">Norges closer-akademi</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Bli en high-ticket closer på 90 dager.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-400">
          Closerskolen trener deg til å lukke samtaler med selvtillit, struktur og
          empati — og hjelper deg inn i en av Norges best betalte remote-karrierer.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#kontakt"
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-amber-300"
          >
            Søk om plass
          </a>
          <a
            href="#program"
            className="rounded-full border border-neutral-800 px-6 py-3 text-sm font-medium text-neutral-200 transition hover:border-neutral-600"
          >
            Se programmet
          </a>
        </div>
      </section>

      {/* Om */}
      <section id="om" className="border-t border-neutral-900 bg-neutral-950/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-3">
          {[
            { t: "Praktisk trening", d: "Rollespill, ekte samtaler og live-coaching fra dag én." },
            { t: "1-til-1 mentorship", d: "Ukentlige sesjoner med aktive closere som lukker hver dag." },
            { t: "Jobbtilkobling", d: "Vi kobler de beste studentene direkte til partnerselskaper." },
          ].map((f) => (
            <div key={t(f.t)}>
              <h3 className="text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-neutral-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Program */}
      <section id="program" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Et program bygget på ekte samtaler — ikke teori.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Fundament", d: "Salgspsykologi, tonalitet og innvendingsbehandling." },
            { n: "02", t: "Simulasjon", d: "Daglig rollespill og opptaksanalyse med mentor." },
            { n: "03", t: "Placement", d: "Intervjuer og oppstart hos et partnerselskap." },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6"
            >
              <div className="text-sm text-amber-400">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-neutral-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Resultater */}
      <section id="resultater" className="border-t border-neutral-900">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-24 md:grid-cols-3">
          {[
            { k: "500+", v: "studenter trent" },
            { k: "45k kr", v: "snittinntekt per måned" },
            { k: "90 dager", v: "fra start til første lukk" },
          ].map((r) => (
            <div key={r.k}>
              <div className="text-4xl font-semibold text-amber-400">{r.k}</div>
              <div className="mt-2 text-sm text-neutral-400">{r.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl border border-neutral-900 bg-gradient-to-br from-neutral-950 to-neutral-900 p-10 md:p-16">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Klar til å bli en av Norges beste closere?
          </h2>
          <p className="mt-4 max-w-xl text-neutral-400">
            Vi tar inn et begrenset antall studenter hver måned. Søk nå for en
            uforpliktende samtale.
          </p>
          <a
            href="mailto:hei@closerskolen.no"
            className="mt-8 inline-flex rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-amber-300"
          >
            Søk om plass
          </a>
        </div>
      </section>

      <footer className="border-t border-neutral-900">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-neutral-500 md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Closerskolen</div>
          <div>hei@closerskolen.no</div>
        </div>
      </footer>
    </div>
  );
}

function t(s: string) {
  return s;
}
