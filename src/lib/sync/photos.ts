"use client";
import getSupabase from "../supabase";
import { CHANNEL } from "./channel";
import type { PhotoItem as LocalPhoto } from "@/lib/photos";
import * as LocalPhotos from "@/lib/photos";

const BUCKET = "memorias-photos";

function envReady() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

type PhotoRow = {
  id: string;
  channel_slug: string;
  storage_path: string;
  description: string | null;
  created_at: string;
};

async function publicUrlFor(path: string): Promise<string> {
  const supabase = getSupabase();
  const { data } = (supabase as any).storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? "";
}

export async function listPhotos(): Promise<LocalPhoto[]> {
  if (!envReady()) return LocalPhotos.getAllPhotos();
  const supabase = getSupabase();
  const { data, error } = await (supabase as any)
    .from("photos")
    .select("id,storage_path,description,created_at")
    .eq("channel_slug", CHANNEL)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("listPhotos error", error.message);
    return [];
  }
  const rows = (data ?? []) as PhotoRow[];
  const out: LocalPhoto[] = [];
  for (const r of rows) {
    const url = await publicUrlFor(r.storage_path);
    out.push({ id: r.id, dataUrl: url, description: r.description ?? "", createdAt: r.created_at });
  }
  return out;
}

export async function uploadPhoto(file: File, description: string): Promise<void> {
  if (!envReady()) {
    // Fallback: convert to data URL and store locally
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    await LocalPhotos.addPhoto({ dataUrl, description });
    return;
  }
  const supabase = getSupabase();
  const path = `${CHANNEL}/${crypto.randomUUID()}-${file.name}`;
  const { error: upErr } = await (supabase as any).storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
  if (upErr) throw upErr;
  const { error: insErr } = await (supabase as any).from("photos").insert({
    channel_slug: CHANNEL,
    storage_path: path,
    description: description || null,
  });
  if (insErr) throw insErr;
}

export async function deletePhoto(id: string): Promise<void> {
  if (!envReady()) {
    await LocalPhotos.removePhoto(id);
    return;
  }
  const supabase = getSupabase();
  // Need to find path to delete from storage
  const { data, error } = await (supabase as any).from("photos").select("storage_path").eq("id", id).eq("channel_slug", CHANNEL).single();
  if (error) throw error;
  const path = (data?.storage_path ?? "") as string;
  if (path) await (supabase as any).storage.from(BUCKET).remove([path]);
  const { error: delErr } = await (supabase as any).from("photos").delete().eq("id", id).eq("channel_slug", CHANNEL);
  if (delErr) throw delErr;
}

export function subscribePhotos(onAnyChange: (type: "INSERT" | "DELETE", photo: LocalPhoto | null) => void): () => void {
  if (!envReady()) return () => {};
  const supabase = getSupabase();
  const channel = (supabase as any)
    .channel("photos")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "photos", filter: `channel_slug=eq.${CHANNEL}` },
      async (payload: any) => {
        const type = payload.eventType as "INSERT" | "DELETE";
        if (type === "INSERT") {
          const r = payload.new as PhotoRow;
          const url = await publicUrlFor(r.storage_path);
          onAnyChange("INSERT", { id: r.id, dataUrl: url, description: r.description ?? "", createdAt: r.created_at });
        } else if (type === "DELETE") {
          onAnyChange("DELETE", null);
        }
      }
    )
    .subscribe();
  return () => {
    (supabase as any).removeChannel(channel);
  };
}
