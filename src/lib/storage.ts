"use client";
import { DayMessage, DayMessageSchema } from "./schema";

const NS = "memorias:v1";

function key(dateISO?: string) {
  return dateISO ? `${NS}:${dateISO}` : NS;
}

export function getMessage(dateISO: string): DayMessage | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key(dateISO));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const msg = DayMessageSchema.parse(parsed);
    return msg;
  } catch {
    return null;
  }
}

export function saveMessage(msg: DayMessage) {
  if (typeof window === "undefined") return;
  const safe = DayMessageSchema.parse(msg);
  localStorage.setItem(key(safe.dateISO), JSON.stringify(safe));
}

export function removeMessage(dateISO: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key(dateISO));
}

export function exportAll(): string {
  if (typeof window === "undefined") return "[]";
  const items: DayMessage[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(`${NS}:`)) continue;
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const msg = DayMessageSchema.parse(parsed);
      items.push(msg);
    } catch {
      // ignore invalid
    }
  }
  return JSON.stringify(items, null, 2);
}

export function importAll(json: string): { imported: number; total: number } {
  if (typeof window === "undefined") return { imported: 0, total: 0 };
  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    return { imported: 0, total: 0 };
  }
  const arr = Array.isArray(payload) ? payload : [];
  let imported = 0;
  let total = 0;
  for (const item of arr) {
    try {
      const safe = DayMessageSchema.parse(item);
      localStorage.setItem(key(safe.dateISO), JSON.stringify(safe));
      imported++;
      total++;
    } catch {
      // ignore invalid entries entirely
    }
  }
  return { imported, total };
}

export { NS as STORAGE_NAMESPACE };
