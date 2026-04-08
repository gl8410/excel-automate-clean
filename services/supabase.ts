import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../app.config';

const supabaseUrl = APP_CONFIG.supabase.url;
const supabaseAnonKey = APP_CONFIG.supabase.anonKey;
const supabaseServiceRoleKey = APP_CONFIG.supabase.serviceRoleKey;

let client;
let adminClient;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to create Supabase client:", e);
  }
}

if (supabaseUrl && supabaseServiceRoleKey) {
  try {
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  } catch (e) {
    console.error("Failed to create Supabase admin client:", e);
  }
}

// Fallback mock client if credentials are missing or initialization failed
// This prevents the "White Screen of Death" if configuration is incomplete
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
    rpc: () => Promise.resolve({ error: null })
  } as any;
}

export const supabase = client;
export const supabaseAdmin = adminClient || client;
