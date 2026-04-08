import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../app.config';

const supabaseUrl = APP_CONFIG.supabase.url;
const supabaseAnonKey = APP_CONFIG.supabase.anonKey;

let client;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to create Supabase client:", e);
  }
}

// Fallback mock client if credentials are missing or initialization failed
if (!client) {
  console.warn("Supabase configuration invalid or missing. Auth initialized in fallback mode.");
  client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signInWithPassword: () => Promise.resolve({ error: { message: "Supabase configuration missing (SUPABASE_URL/KEY)" } }),
      signUp: () => Promise.resolve({ error: { message: "Supabase configuration missing" } }),
      signOut: () => Promise.resolve({ error: null })
    },
    rpc: () => Promise.resolve({ error: null }),
    from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) })
  } as any;
}

export const supabase = client;
