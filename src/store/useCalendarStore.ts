"use client";
import { create } from "zustand";
import dayjs from "@/lib/date";

export type CalendarState = {
  year: number;
  monthIndex: number; // 0-11
  selectedDateISO: string | null;
  setYear: (year: number) => void;
  setMonthIndex: (monthIndex: number) => void;
  setSelectedDateISO: (iso: string | null) => void;
};

export const useCalendarStore = create<CalendarState>((set) => {
  const initialYear = dayjs().year();
  const initialMonth = ((): number => {
    if (typeof window === "undefined") return dayjs().month();
    const raw = window.localStorage.getItem("memorias:v1:lastMonth");
    const parsed = raw ? parseInt(raw) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 11 ? parsed : dayjs().month();
  })();
  return {
    year: initialYear,
    monthIndex: initialMonth,
    selectedDateISO: null,
    setYear: (year) => set({ year }),
    setMonthIndex: (monthIndex) => {
      if (typeof window !== "undefined") window.localStorage.setItem("memorias:v1:lastMonth", String(monthIndex));
      set({ monthIndex });
    },
    setSelectedDateISO: (iso) => set({ selectedDateISO: iso }),
  };
});
