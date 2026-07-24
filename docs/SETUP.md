# SETUP — fra kode til produksjon

Steg-for-steg for å ta Closerskolen fra demo-modus til live produkt.
Estimert tid: 1–2 timer (uten juridisk gjennomgang og videoinnspilling).

## 0. Forutsetninger

- Node 20+ og npm
- En [Supabase](https://supabase.com)-konto (gratis tier holder til kull 1)
- [Supabase CLI](https://supabase.com/docs/guides/cli) for edge-funksjonen
- En Anthropic API-nøkkel (console.anthropic.com) til AI-coachen

## 1. Opprett Supabase-prosjekt

1. supabase.com → **New project** → navn `closerskolen`, region `eu-north-1`
   (Stockholm — nærmest Norge), sterkt DB-passord (lagre det).
2. Vent til prosjektet er klart, og noter fra **Settings → API**:
   - `Project URL` → blir `VITE_SUPABASE_URL`
   - `anon public`-nøkkelen → blir `VITE_SUPABASE_ANON_KEY`

## 2. Kjør skjema og seed

1. Dashboard → **SQL Editor** → lim inn hele `supabase/schema.sql` → **Run**.
   (Kjørbar i ett stykke: tabeller, trigger for auto-profil og alle RLS-policies.)
2. Ny fane i SQL Editor → lim inn `supabase/seed.sql` → **Run**.
   (Kull, moduler, leksjoner, quiz + eksamensspørsmål og demo-jobber.)
3. Gjør deg selv til admin: opprett bruker via appen/Auth, finn din
   `auth.uid()` under **Authentication → Users**, og kjør:
   ```sql
   update public.profiles set role = 'admin' where id = '<din-uid>';
   ```

## 3. Miljøvariabler i frontend

```bash
cp .env.example .env
# Fyll inn:
# VITE_SUPABASE_URL=https://<prosjekt>.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
npm run dev   # appen går nå mot Supabase i stedet for demo-data
```

## 4. Leksjonstekster (viktig)

`seed.sql` seeder kursstrukturen med ingresser. Fulltekstene (300–600 ord per
leksjon) ligger i `src/lib/lessonContent.ts` som «single source of truth».
Ved lansering: lim fulltekstene inn i `lessons.content` (SQL Editor →
`update public.lessons set content = '...' where slug = '...';`) — eller
behold demo-fallbacken i `data.ts`, som automatisk bruker lokal fulltekst når
databasens `content` er en stub.

## 5. Deploy AI-coachen (edge function)

```bash
supabase login
supabase link --project-ref <prosjekt-ref>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy coach
```

Test:
```bash
curl -s -X POST "https://<prosjekt>.supabase.co/functions/v1/coach" \
  -H "Authorization: Bearer <anon-key>" -H "Content-Type: application/json" \
  -d '{"persona":"kari","difficulty":1,"messages":[],"latest":"Hei, det er Jonas fra Closerskolen. Vi har en avtale med velforeningen der du bor — har dere TV-pakke fra før?","mode":"chat"}'
```
Forventet: `{"reply":"..."}` med et norsk kundesvar.

## 6. Mate inn ekte Allente-transkripsjoner i coach-prompten

Coach Muon blir dramatisk bedre med ekte few-shot-eksempler:

1. Ta opp 10–20 ekte salgssamtaler med Plaud → de havner i
   Transkripsjonsbanken (Supabase-prosjekt `Transkripsjonsbank`,
   tabell `public.transcripts`).
2. Finn kandidater:
   ```sql
   select id, summary, created_at from public.transcripts
   where summary ilike '%salg%' or summary ilike '%allente%'
   order by created_at desc;
   ```
3. Velg samtaler med tydelig åpning/innvending/booking. **Anonymiser** navn,
   adresser og numre.
4. Lim inn som nye eksempler i
   `supabase/functions/coach/systemprompt.md` (seksjonen «FEW-SHOT EKSEMPLER»,
   følg formatet til Eksempel 1).
5. Re-deploy: `supabase functions deploy coach`.

## 7. Deploy frontend

### Alternativ A: Vercel/Netlify (anbefalt)

1. Push repoet til GitHub.
2. Vercel/Netlify → **Import project** → velg repoet.
3. Build command: `npm run build`, output: `dist`.
4. Sett miljøvariablene `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY`.
5. SPA-routing: Netlify trenger `_redirects` med `/* /index.html 200`
   (Vercel håndterer det automatisk for Vite).

### Alternativ B: GitHub → Lovable-import

1. Push repoet til GitHub.
2. I Lovable: **Import from GitHub** → velg repoet → Lovable bygger og hoster.
3. Legg inn de samme `VITE_`-variablene i Lovable-prosjektets miljøoppsett,
   og koble Supabase-integrasjonen mot det eksisterende prosjektet.

## 8. Før lansering (sjekkliste)

- [ ] Juridisk gjennomgang av `/vilkar` og `/garanti` (advokat, ~1 dag).
      Se kommentaren øverst i `src/pages/Vilkar.tsx`.
- [ ] Org.nr og kontaktinfo inn i Footer + vilkår.
- [ ] Spill inn modulvideoene (manus = leksjonstekstene). Bytt
      `VideoPlaceholder` mot ekte spiller (f.eks. Vimeo/Mux embed).
- [ ] Bytt placeholder-testimonials på landingssiden mot ekte fra kull 1
      (kommentert i `src/pages/Landing.tsx` — markedsføringsloven krever ekte).
- [ ] Signer 3–5 arbeidsgiverpartnere (garanti-backstop) og legg dem inn i
      `jobs`-tabellen via /admin.
- [ ] Sett opp betaling (Stripe/Vipps) — bevisst utenfor scope i denne
      versjonen; søknad + manuell fakturering fungerer for kull 1.
