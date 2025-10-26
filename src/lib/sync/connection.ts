"use client";
import { useEffect, useState } from "react";
import getSupabase from "../supabase";

export function useRealtimeConnection() {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = getSupabase();
    const ch = (supabase as any).channel("conn-indicator");
    ch.subscribe((status: string) => {
      setConnected(status === "SUBSCRIBED");
    });
    return () => {
      (supabase as any).removeChannel(ch);
    };
  }, []);
  return connected;
}
