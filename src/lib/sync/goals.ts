"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import getSupabase from "../supabase";
import { CHANNEL } from "./channel";
import type { Goal as UILocalGoal } from "@/lib/goals";
import * as LocalGoals from "@/lib/goals";

type GoalRow = {
  id: string;
  channel_slug: string;
  category: "daily" | "lifetime";
  description: string;
  target: string | null;
  done: boolean;
  created_at: string;
  updated_at: string;
};

function envReady() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function toUI(r: GoalRow): UILocalGoal {
  return {
    id: r.id,
    description: r.description,
    target: r.target ?? undefined,
    done: r.done,
    createdAt: r.created_at,
    category: r.category,
  };
}

export async function fetchGoals(): Promise<UILocalGoal[]> {
  if (!envReady()) {
    return [
      ...LocalGoals.getGoals("daily"),
      ...LocalGoals.getGoals("lifetime"),
    ];
  }
  const supabase = getSupabase();
  const { data, error } = await (supabase as any)
    .from("goals")
    .select("id,category,description,target,done,created_at,updated_at")
    .eq("channel_slug", CHANNEL)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("fetchGoals error", error.message);
    return [];
  }
  return ((data ?? []) as GoalRow[]).map(toUI);
}

export async function addGoal(goal: Omit<UILocalGoal, "id" | "createdAt">): Promise<void> {
  if (!envReady()) {
    LocalGoals.addGoal(goal.category, { description: goal.description, target: goal.target });
    return;
  }
  const supabase = getSupabase();
  const { error } = await (supabase as any).from("goals").insert({
    channel_slug: CHANNEL,
    category: goal.category,
    description: goal.description,
    target: goal.target ?? null,
    done: !!goal.done,
  });
  if (error) throw error;
}

export async function toggleGoal(id: string, done: boolean): Promise<void> {
  if (!envReady()) {
    // Best effort local toggle
    const c: UILocalGoal["category"][] = ["daily", "lifetime"];
    for (const cat of c) {
      const list = LocalGoals.getGoals(cat);
      const g = list.find((x) => x.id === id);
      if (g) {
        LocalGoals.toggleGoal(cat, id);
        break;
      }
    }
    return;
  }
  const supabase = getSupabase();
  const { error } = await (supabase as any).from("goals").update({ done }).eq("id", id).eq("channel_slug", CHANNEL);
  if (error) throw error;
}

export async function removeGoal(id: string): Promise<void> {
  if (!envReady()) {
    const cats: UILocalGoal["category"][] = ["daily", "lifetime"];
    for (const cat of cats) LocalGoals.removeGoal(cat, id);
    return;
  }
  const supabase = getSupabase();
  const { error } = await (supabase as any).from("goals").delete().eq("id", id).eq("channel_slug", CHANNEL);
  if (error) throw error;
}

export function subscribeGoals(onAnyChange: (type: "INSERT" | "UPDATE" | "DELETE", goal: UILocalGoal) => void): () => void {
  if (!envReady()) return () => {};
  const supabase = getSupabase();
  const channel = (supabase as any)
    .channel("goals")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "goals", filter: `channel_slug=eq.${CHANNEL}` },
      (payload: any) => {
        const type = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
        const row = (payload.new ?? payload.old) as GoalRow;
        if (row) onAnyChange(type, toUI(row));
      }
    )
    .subscribe();
  return () => {
    (supabase as any).removeChannel(channel);
  };
}
