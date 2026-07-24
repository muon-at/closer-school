-- ============================================================
-- CLOSERSKOLEN — Supabase-skjema
-- Kjørbart i ett stykke: SQL Editor → lim inn → Run.
-- Tabeller + RLS-policies. Seed-data ligger i seed.sql.
-- ============================================================

-- Utvidelser
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES: kobles til auth.users. role = 'student' | 'admin'
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  age int,
  role text not null default 'student' check (role in ('student', 'admin')),
  cohort_id uuid,
  streak_days int not null default 0,
  created_at timestamptz not null default now()
);

-- Hjelpefunksjon: er innlogget bruker admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-opprett profil ved ny bruker
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- COHORTS: kull med maks antall plasser
-- ------------------------------------------------------------
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_at date,
  max_seats int not null default 23,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_cohort_fk
  foreign key (cohort_id) references public.cohorts (id) on delete set null;

-- ------------------------------------------------------------
-- APPLICATIONS: søknader fra /pamelding (kan sendes anonymt)
-- ------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  email text not null,
  phone text not null,
  motivation text not null default '',
  cohort_name text not null default '',
  status text not null default 'ny' check (status in ('ny', 'intervju', 'akseptert', 'avslått')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- MODULES / LESSONS / QUIZ_QUESTIONS: kursinnholdet
-- ------------------------------------------------------------
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  week int not null,
  description text not null default '',
  gate text not null default '',
  ai_gate_required int not null default 0,
  sort_order int not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_slug text not null references public.modules (slug) on delete cascade,
  slug text not null unique,
  title text not null,
  duration_min int not null default 10,
  content text not null default '',
  sort_order int not null default 0
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_slug text not null references public.lessons (slug) on delete cascade,
  question text not null,
  options jsonb not null,           -- ["alternativ A", "alternativ B", ...]
  correct_index int not null,
  is_exam boolean not null default false  -- true = del av teorieksamen
);

-- ------------------------------------------------------------
-- PROGRESS: én rad per bruker × leksjon
-- ------------------------------------------------------------
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_slug text not null references public.lessons (slug) on delete cascade,
  completed boolean not null default false,
  quiz_score numeric,
  completed_at timestamptz,
  unique (user_id, lesson_slug)
);

-- ------------------------------------------------------------
-- COACH_SESSIONS: AI-treningssamtaler med transcript + scorecard
-- ------------------------------------------------------------
create table if not exists public.coach_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  persona text not null,
  difficulty int not null default 1 check (difficulty between 1 and 3),
  transcript jsonb not null default '[]'::jsonb,  -- [{role:'seller'|'customer', text:'...'}]
  scores jsonb,                                    -- {opening, needs, objections, closing, total, ...}
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EXAM_ATTEMPTS: teori / AI-eksamen / ekte samtale
-- ------------------------------------------------------------
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('teori', 'ai', 'ekte')),
  score numeric,
  passed boolean not null default false,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- REAL_CALL_BOOKINGS: booking av ekte kundesamtale med sensor
-- ------------------------------------------------------------
create table if not exists public.real_call_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slot timestamptz not null,
  sensor text not null default 'Sebastian',
  status text not null default 'booket' check (status in ('booket', 'gjennomført', 'bestått', 'ikke_bestått', 'avlyst')),
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- JOBS / JOB_APPLICATIONS: jobbtavla
-- ------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text not null default '',
  pay text not null default '',
  type text not null default 'Fulltid',
  description text not null default '',
  tags jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'sendt' check (status in ('sendt', 'videresendt', 'intervju', 'tilbud', 'avslått')),
  created_at timestamptz not null default now(),
  unique (job_id, user_id)
);

-- ------------------------------------------------------------
-- POSTS / REACTIONS: community-feed
-- ------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('win', 'tips', 'sporsmal')),
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (emoji in ('fire', 'clap', 'money')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, emoji)
);

-- ------------------------------------------------------------
-- GUARANTEE_CLAIMS: garantikrav (90-dagers jobbgaranti)
-- ------------------------------------------------------------
create table if not exists public.guarantee_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  exam_passed_at date not null,
  claim_text text not null default '',
  status text not null default 'mottatt' check (status in ('mottatt', 'under_behandling', 'godkjent', 'avvist')),
  resolution_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS-POLICIES
-- Prinsipp: studenter ser/endrer sitt eget; admin ser/endrer alt.
-- Kursinnhold og jobber er lesbare for alle innloggede.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.cohorts enable row level security;
alter table public.applications enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.progress enable row level security;
alter table public.coach_sessions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.real_call_bookings enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;
alter table public.guarantee_claims enable row level security;

-- PROFILES: egen rad + admin
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = 'student');
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- COHORTS: åpne kull er synlige for alle (også utlogget, for søknadsskjemaet)
create policy "cohorts_select_all" on public.cohorts
  for select using (true);
create policy "cohorts_admin_write" on public.cohorts
  for all using (public.is_admin()) with check (public.is_admin());

-- APPLICATIONS: hvem som helst kan sende inn (anon insert); kun admin leser/behandler
create policy "applications_insert_anyone" on public.applications
  for insert with check (true);
create policy "applications_admin_read" on public.applications
  for select using (public.is_admin());
create policy "applications_admin_update" on public.applications
  for update using (public.is_admin()) with check (public.is_admin());

-- KURSINNHOLD: lesbart for alle innloggede; kun admin skriver
create policy "modules_select_authed" on public.modules
  for select using (auth.uid() is not null);
create policy "modules_admin_write" on public.modules
  for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons_select_authed" on public.lessons
  for select using (auth.uid() is not null);
create policy "lessons_admin_write" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

create policy "quiz_select_authed" on public.quiz_questions
  for select using (auth.uid() is not null);
create policy "quiz_admin_write" on public.quiz_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- PROGRESS: eget + admin
create policy "progress_own" on public.progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progress_admin_read" on public.progress
  for select using (public.is_admin());

-- COACH_SESSIONS: eget + admin
create policy "coach_sessions_own" on public.coach_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "coach_sessions_admin_read" on public.coach_sessions
  for select using (public.is_admin());

-- EXAM_ATTEMPTS: student leser/oppretter egne; kun admin setter passed på 'ekte'
create policy "exam_attempts_own_select" on public.exam_attempts
  for select using (user_id = auth.uid() or public.is_admin());
create policy "exam_attempts_own_insert" on public.exam_attempts
  for insert with check (user_id = auth.uid() and kind in ('teori', 'ai'));
create policy "exam_attempts_admin_all" on public.exam_attempts
  for all using (public.is_admin()) with check (public.is_admin());

-- REAL_CALL_BOOKINGS: eget + admin
create policy "bookings_own" on public.real_call_bookings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bookings_admin_all" on public.real_call_bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- JOBS: lesbare for innloggede; admin skriver
create policy "jobs_select_authed" on public.jobs
  for select using (auth.uid() is not null and is_active);
create policy "jobs_admin_write" on public.jobs
  for all using (public.is_admin()) with check (public.is_admin());

-- JOB_APPLICATIONS: egne + admin
create policy "job_apps_own" on public.job_applications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "job_apps_admin_read" on public.job_applications
  for select using (public.is_admin());

-- POSTS: lesbare for innloggede; egne kan opprettes/slettes; admin alt
create policy "posts_select_authed" on public.posts
  for select using (auth.uid() is not null);
create policy "posts_insert_own" on public.posts
  for insert with check (user_id = auth.uid());
create policy "posts_delete_own_or_admin" on public.posts
  for delete using (user_id = auth.uid() or public.is_admin());

-- REACTIONS: lesbare for innloggede; egne kan opprettes/slettes
create policy "reactions_select_authed" on public.reactions
  for select using (auth.uid() is not null);
create policy "reactions_insert_own" on public.reactions
  for insert with check (user_id = auth.uid());
create policy "reactions_delete_own" on public.reactions
  for delete using (user_id = auth.uid());

-- GUARANTEE_CLAIMS: student oppretter/leser egne; admin behandler
create policy "claims_own_select" on public.guarantee_claims
  for select using (user_id = auth.uid() or public.is_admin());
create policy "claims_own_insert" on public.guarantee_claims
  for insert with check (user_id = auth.uid());
create policy "claims_admin_update" on public.guarantee_claims
  for update using (public.is_admin()) with check (public.is_admin());

-- Ferdig. Kjør deretter seed.sql for kursinnhold og demo-jobber.
