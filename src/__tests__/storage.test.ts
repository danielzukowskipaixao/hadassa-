import { describe, expect, test, beforeEach } from "vitest";
import { exportAll, importAll } from "@/lib/storage";
import { DayMessage } from "@/lib/schema";

// Use a simple in-memory mock of localStorage if needed; Vitest provides a JSDOM-like env when configured.

declare global {
  // eslint-disable-next-line no-var
  var localStorage: Storage;
}

beforeEach(() => {
  localStorage.clear();
});

describe("export/import", () => {
  test("imports valid items and ignores invalid", () => {
    const items: DayMessage[] = [
      {
        dateISO: "2025-10-26",
        text: "Mensagem",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const invalid = [{ foo: "bar" }];

    const resValid = importAll(JSON.stringify(items));
    expect(resValid.imported).toBe(1);
    expect(resValid.total).toBe(1);

    const resInvalid = importAll(JSON.stringify(invalid));
    expect(resInvalid.imported).toBe(0);
    expect(resInvalid.total).toBe(0);

    const exported = exportAll();
    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].dateISO).toBe("2025-10-26");
  });
});
