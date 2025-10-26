"use client";
import getSupabase from "../supabase";
import { CHANNEL } from "./channel";
import { toISODate } from "../date";

type DailyNoteRow = {
  channel_slug: string;
  date_iso: string;
  text: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchNotes(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Offline fallback from localStorage
    const out: Record<string, string> = {};
    try {
      const raw = localStorage.getItem("memorias:v1:all");
      if (raw) Object.assign(out, JSON.parse(raw));
    } catch {}
    return out;
  }
  const { data, error } = await (supabase as any)
    .from("daily_notes")
    .select("date_iso,text")
    .eq("channel_slug", CHANNEL);
  if (error) {
    console.warn("fetchNotes error", error.message);
    return {};
  }
  const result: Record<string, string> = {};
  for (const row of (data as DailyNoteRow[] | null) ?? []) {
    result[toISODate(row.date_iso)] = String(row.text ?? "");
  }
  // Cache for fast reloads
  try {
    localStorage.setItem("memorias:v1:all", JSON.stringify(result));
  } catch {}
  return result;
}

export async function upsertNote(dateISO: string, text: string): Promise<void> {
  const supabase = getSupabase();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Queue offline upsert
    try {
      const queueKey = "memorias:v1:queue:notes";
      const q = JSON.parse(localStorage.getItem(queueKey) || "[]");
      q.push({ type: "upsert", dateISO, text, ts: Date.now() });
      localStorage.setItem(queueKey, JSON.stringify(q));
      // Update cache immediately for UX
      const allKey = "memorias:v1:all";
      const current = JSON.parse(localStorage.getItem(allKey) || "{}");
      current[dateISO] = text;
      localStorage.setItem(allKey, JSON.stringify(current));
    } catch {}
    return;
  }
  const { error } = await (supabase as any).from("daily_notes").upsert({
    channel_slug: CHANNEL,
    date_iso: dateISO,
    text,
  });
  if (error) throw error;
}

export function subscribeNotes(onChange: (dateISO: string, text: string) => void): () => void {
  const supabase = getSupabase();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // No realtime offline
    return () => {};
  }
  const channel = supabase
    .channel("notes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "daily_notes", filter: `channel_slug=eq.${CHANNEL}` },
      (payload: any) => {
        const row = (payload.new ?? payload.old) as { date_iso: string; text?: string };
        if (row?.date_iso) onChange(toISODate(row.date_iso), String(row.text ?? ""));
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// Simple retry for queued ops when env present and online
export async function flushNotesQueue(): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
  const queueKey = "memorias:v1:queue:notes";
  try {
    const q = JSON.parse(localStorage.getItem(queueKey) || "[]") as Array<{ dateISO: string; text: string }>;
    if (!q.length) return;
    for (const item of q) {
      // eslint-disable-next-line no-await-in-loop
      await upsertNote(item.dateISO, item.text);
    }
    localStorage.removeItem(queueKey);
  } catch {}
}
