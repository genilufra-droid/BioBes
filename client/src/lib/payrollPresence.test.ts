import { describe, expect, it } from "vitest";
import { attendanceGrossMinutes, payrollPresenceTotals } from "./payrollPresence";

describe("payroll presence totals", () => {
  it("uses the gross minutes recorded by Logs instead of assuming a lunch deduction", () => {
    const row = { normalMinutes: 480, overtimeMinutes: 241, note: "Logs 78: 06:59 / 20:00 | Bruto 781m | Pagesë 781m | Drekë 0m" };
    expect(attendanceGrossMinutes(row)).toBe(781);
    expect(payrollPresenceTotals([row])).toMatchObject({ grossMinutes: 781, payableMinutes: 721, normalMinutes: 480, overtimeMinutes: 241 });
  });

  it("keeps the legacy lunch fallback for historical attendance rows without a raw Logs note", () => {
    expect(attendanceGrossMinutes({ normalMinutes: 480, overtimeMinutes: 0 })).toBe(540);
  });
});
