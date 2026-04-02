const cfg = typeof window !== "undefined" ? window.FSSTORE_CONFIG : null;

let _client;

const SUPABASE_JS_URLS = [
  "https://esm.sh/@supabase/supabase-js@2.49.1",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm",
];

async function importSupabase() {
  let lastErr;
  for (const url of SUPABASE_JS_URLS) {
    try {
      return await import(url);
    } catch (e) {
      lastErr = e;
    }
  }
  console.error("fsstore: não foi possível carregar @supabase/supabase-js", lastErr);
  return null;
}

/**
 * Cliente Supabase (lazy). Import estático de CDN quebrava todo o site no mobile
 * se o primeiro request ao esm.sh falhasse — módulos seguintes nem executavam.
 */
export async function getSupabase() {
  if (_client !== undefined) return _client;
  if (!cfg?.supabaseUrl || !cfg?.supabaseAnonKey) {
    _client = null;
    return null;
  }
  const mod = await importSupabase();
  if (!mod?.createClient) {
    _client = null;
    return null;
  }
  _client = mod.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: typeof localStorage !== "undefined" ? localStorage : undefined,
      autoRefreshToken: true,
    },
  });
  return _client;
}
