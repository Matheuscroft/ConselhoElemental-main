import { createClient } from '@supabase/supabase-js';
import { isRestoredLocalDocument } from './backup/progress-mode';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// This decision is made in a fresh document BEFORE importing App/auth/services.
// Local restoration never constructs a client or reads an existing auth session.
const restoredLocal = isRestoredLocalDocument();
export const isSupabaseConfigured = !restoredLocal && Boolean(supabaseUrl && supabaseAnonKey);
export const isSupabaseAuthEnabled =
  (import.meta.env.VITE_ENABLE_SUPABASE_AUTH as string | undefined) === 'true' && isSupabaseConfigured;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
