import { describe, expect, test } from "vitest";
import { TZ, getToday, isPast, isToday, isFuture, toISODate } from "@/lib/date";
import dayjs from "@/lib/date";

// These tests check date-only comparisons respecting America/Sao_Paulo timezone

describe("date helpers (America/Sao_Paulo)", () => {
  test("today is not past nor future", () => {
    const today = getToday();
    expect(isToday(today)).toBe(true);
    expect(isPast(today)).toBe(false);
    expect(isFuture(today)).toBe(false);
  });

  test("yesterday is past and not today/future", () => {
    const y = dayjs().tz(TZ).subtract(1, "day");
    expect(isPast(y)).toBe(true);
    expect(isToday(y)).toBe(false);
    expect(isFuture(y)).toBe(false);
  });

  test("tomorrow is future and not today/past", () => {
    const t = dayjs().tz(TZ).add(1, "day");
    expect(isFuture(t)).toBe(true);
    expect(isToday(t)).toBe(false);
    expect(isPast(t)).toBe(false);
  });

  test("toISODate normalizes to YYYY-MM-DD", () => {
    const d = dayjs().tz(TZ);
    expect(toISODate(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
