import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy singleton to avoid creating multiple clients in RSC/CSR boundaries
let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!client) {
    if (!url || !anon) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Supabase env vars missing; running in offline mode.");
      }
    }
    client = createClient(url ?? "", anon ?? "", {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return client;
}

export default getSupabase;
