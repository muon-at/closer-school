-- ── Manuelle oppdateringer som skal kjøres mot Supabase ─────────────────
-- (Kjøres av hovedagenten — IKKE kjørt automatisk.)

-- 2026-07-25: Fjern gammel partner-branding fra jobbtavla.
-- Matcher endringen i src/lib/mockData.ts og supabase/seed.sql.
-- Idempotent: treffer både gammel og ny tittel på TM-jobben.
update public.jobs
set
  title = 'TM-selger — TV & strømming',
  description = 'Ring varme og kalde lister for en av Nordens største TV- og strømmeaktører. Full opplæring, ung kultur, tydelig karrierevei mot teamleder.'
where title like 'TM-selger — %';

-- 2026-07-25: «Kull» → «Opptak» i alt brukervendt innhold.
-- Matcher endringene i src/, docs/ og supabase/seed.sql.
-- Idempotente: where-klausulene treffer kun rader som fortsatt har gammelt navn.

-- Kull-navn i cohorts-tabellen
update public.cohorts
set name = 'Opptak 3 — september 2026'
where name = 'Kull 3 — september 2026';

update public.cohorts
set name = 'Opptak 4 — november 2026'
where name = 'Kull 4 — november 2026';

update public.cohorts
set name = 'Venteliste — opptak 5 (2027)'
where name = 'Venteliste — kull 5 (2027)';

-- Innsendte søknader: cohort_name-tekst («Kull 3 — …», «Venteliste — kull 5 …»)
update public.applications
set cohort_name = replace(cohort_name, 'Kull', 'Opptak')
where cohort_name like 'Kull%';

-- Stipend-søknader («STIPEND — kull 3») og ev. andre med liten forbokstav
update public.applications
set cohort_name = replace(cohort_name, 'kull', 'opptak')
where cohort_name like '%kull%';
