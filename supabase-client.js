import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cfg = typeof window !== "undefined" ? window.FSSTORE_CONFIG : null;

export const supabase =
  cfg?.supabaseUrl && cfg?.supabaseAnonKey
    ? createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          persistSession: true,
          storage: typeof localStorage !== "undefined" ? localStorage : undefined,
          autoRefreshToken: true,
        },
      })
    : null;
