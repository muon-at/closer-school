import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Tving DEMO-MODUS i tester, uavhengig av om en .env med Supabase-nøkler
// ligger i prosjektet. Må skje før src/lib/supabase.ts importeres
// (setupFiles kjører før testfilene).
vi.stubEnv('VITE_SUPABASE_URL', '');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
