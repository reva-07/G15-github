import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Check if valid credentials have been provided (not empty and not default placeholders)
export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("your-project-id") &&
  !supabaseAnonKey.includes("your-anon-key")
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

if (!isConfigured) {
  console.info(
    "%c[Google Docs Lite] Supabase credentials not detected in .env. Running in resilient Offline / Development Database mode with full authentication, user isolation, and RLS emulation.",
    "color: #0f6b5c; font-weight: bold; background: #e8f4f1; padding: 4px 8px; border-radius: 4px;"
  );
}
