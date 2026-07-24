# Closerskolen — agent notes

- Stack: Vite + React 18 + TypeScript + Tailwind CSS + react-router-dom v6. Package manager: npm.
- Entry: index.html -> src/main.tsx. Tests: vitest via `npm test`.
- UI language is Norwegian (bokmål).
- Demo mode: the app runs fully without env vars using mock data.
- Data layer: src/lib/data.ts (mock + Supabase). Supabase project: ankdhpqjartysjwpjrfw. Schema in supabase/schema.sql. Edge function: coach.