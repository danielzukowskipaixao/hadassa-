"use client";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const TZ = "America/Sao_Paulo";
dayjs.tz.setDefault(TZ);

export function getToday(): Dayjs {
  return dayjs().tz(TZ);
}

export function toISODate(d: Dayjs | Date | string): string {
  return dayjs(d).tz(TZ).format("YYYY-MM-DD");
}

export function isSameDate(a: Dayjs | Date | string, b: Dayjs | Date | string): boolean {
  return toISODate(a) === toISODate(b);
}

export function isPast(date: Dayjs | Date | string): boolean {
  const target = toISODate(date);
  const today = toISODate(getToday());
  return target < today;
}

export function isToday(date: Dayjs | Date | string): boolean {
  return isSameDate(date, getToday());
}

export function isFuture(date: Dayjs | Date | string): boolean {
  const target = toISODate(date);
  const today = toISODate(getToday());
  return target > today;
}

export function startOfMonth(year: number, monthIndex0: number): Dayjs {
  const month = String(monthIndex0 + 1).padStart(2, "0");
  return dayjs.tz(`${year}-${month}-01`, TZ);
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return startOfMonth(year, monthIndex0).daysInMonth();
}

export function getMonthMatrix(year: number, monthIndex0: number, weekStartsOnSunday = true) {
  const firstDay = startOfMonth(year, monthIndex0);
  const totalDays = firstDay.daysInMonth();
  const firstWeekday = firstDay.day(); // 0=Sunday ... 6=Saturday
  const leadingBlanks = weekStartsOnSunday ? firstWeekday : (firstWeekday === 0 ? 6 : firstWeekday - 1);

  const cells: (Dayjs | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const month = String(monthIndex0 + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    cells.push(dayjs.tz(`${year}-${month}-${day}`, TZ));
  }
  // Pad to complete weeks (rows of 7)
  while (cells.length % 7 !== 0) cells.push(null);

  // Split into weeks
  const weeks: (Dayjs | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function formatLongDatePtBR(d: Dayjs | Date | string): string {
  const date = dayjs(d).tz(TZ).toDate();
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function greetingForHour(d: Dayjs = getToday()): string {
  const hour = d.hour();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default dayjs;
