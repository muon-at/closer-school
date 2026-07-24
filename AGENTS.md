# Closerskolen — agent notes

- Stack: Vite + React 18 + TypeScript + Tailwind CSS + react-router-dom v6. NOT TanStack Start. Package manager: npm.
- Entry: index.html -> src/main.tsx -> src/App.tsx (react-router routes).
- All UI text is Norwegian (bokmål). Keep it that way.
- Data layer: src/lib/data.ts — uses Supabase when VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) are set, otherwise rich Norwegian mock data (demo mode, localStorage persistence).
- Supabase project: ankdhpqjartysjwpjrfw. Schema: supabase/schema.sql (15 tables, RLS). Seed: supabase/seed.sql. Edge function: supabase/functions/coach (Anthropic API, secret ANTHROPIC_API_KEY).
- AI sales coach: src/lib/coachSimulator.ts is the local demo simulator; production uses the coach edge function.
- Tests: vitest + testing-library, `npm test` (53 tests). Keep them green.
- Do not commit secrets. .env contains only the public Supabase URL + publishable key.
