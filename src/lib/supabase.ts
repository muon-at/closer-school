// Supabase-klient. Eksporterer `null` hvis miljøvariablene ikke er satt —
// da kjører hele appen i DEMO-MODUS med mock-data (se src/lib/data.ts).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Lovable skriver nøkkelen som VITE_SUPABASE_PUBLISHABLE_KEY; lokalt bruker vi
// VITE_SUPABASE_ANON_KEY. Begge er samme type offentlige nøkkel — godta begge.
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

/** True når appen kjører uten Supabase-konfigurasjon. */
export const isDemoMode = supabase === null;