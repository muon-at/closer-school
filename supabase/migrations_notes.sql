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
