# Closerskolen

Norges eneste salgsutdanning med jobbgaranti. Fra null til closer på 8 uker.

Komplett webapp: selgende landingsside, søknadsskjema, kursportal med 6 moduler
(24 leksjoner med ekte innhold + quiz), AI-salgscoach med norske kundepersonas
og scorecards, eksamensflyt (teori + AI + ekte kundesamtale), community,
jobbtavle, leaderboard og admin.

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + react-router v6 +
Supabase (valgfritt). Tester med Vitest + Testing Library.

## Kom i gang

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # typecheck + produksjonsbygg
```

## Demo-modus (ingen oppsett nødvendig)

Uten `.env` kjører appen i **demo-modus**: all data kommer fra rik norsk
mock-data (`src/lib/mockData.ts`), og AI-coachen bruker en lokal regelbasert
kundesimulator (`src/lib/coachSimulator.ts`) som faktisk oppfører seg som en
norsk kunde — skeptisk åpning, innvendinger fra banken, mykner ved godt
håndverk og aksepterer booking etter håndterte innvendinger.

Logg inn via **«Fortsett som demo-student Jonas (18)»** på `/logg-inn`.

Ruter: `/` (landingsside), `/pamelding`, `/garanti`, `/vilkar`, `/logg-inn`,
`/portal/*` (dashbord, kurs, ai-coach, eksamen, community, jobber,
leaderboard, profil) og `/admin`.

## Produksjon med Supabase

Sett `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` i `.env` (se
`.env.example`), kjør `supabase/schema.sql` + `supabase/seed.sql`, og deploy
edge-funksjonen `coach` (ekte AI-kunde via Anthropic). Full guide:
**[docs/SETUP.md](docs/SETUP.md)**. Forretningsplanen ligger i
**[docs/FORRETNINGSPLAN.md](docs/FORRETNINGSPLAN.md)**.

## Struktur

```
src/
  lib/          supabase.ts (klient|null), data.ts (datalag med demo-fallback),
                mockData.ts, lessonContent.ts, coachSimulator.ts, types.ts
  components/   Button, Card, Badge, ProgressBar, StatCard, SectionHeading,
                Navbar, Footer, PortalLayout, RichText, VideoPlaceholder
  pages/        Landing, Pamelding, Garanti, Vilkar, LoggInn, Admin, portal/*
  __tests__/    routes.test.tsx, coach.test.ts, data.test.ts
supabase/
  schema.sql    tabeller + RLS (studenter ser eget, admin alt)
  seed.sql      kursstruktur, quiz og demo-jobber
  functions/coach/  edge function (Anthropic) + systemprompt.md (Coach Muon)
```
