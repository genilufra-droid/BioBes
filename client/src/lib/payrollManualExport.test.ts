import { describe, expect, it } from "vitest";
import { buildManualPresencePdfData } from "./payrollManualExport";

describe("Eksportet e Listëprezencës Manuale", () => {
  it("ndërton grid A4 me 31 ditë dhe ruan orët e qelizës", () => {
    const result = buildManualPresencePdfData(
      [{ id: 7, employeeNumber: "7", firstName: "Mariglen", lastName: "Myftari" }],
      [{ payrollEmployeeId: 7, day: 10, attendanceCode: "8", normalMinutes: 480, overtimeMinutes: 120 }],
      { year: 2026, month: 7 },
    );

    expect(result.days).toBe(31);
    expect(result.headers).toHaveLength(38);
    expect(result.headers.slice(0, 3)).toEqual(["Nr.", "Emër Mbiemër", "1"]);
    expect(result.headers.slice(-5)).toEqual(["O.Bruto", "O.Pagesë", "Normale", "Shtesë", "Total orë"]);
    expect(result.body[0].slice(0, 2)).toEqual(["7", "Mariglen Myftari"]);
    expect(result.body[0][11]).toBe("8\n2");
    expect(result.body[0].slice(-5)).toEqual([11, 10, 8, 2, 12]);
  });

  it("përdor vetëm kodin e prezencës kur qeliza ka kod manual", () => {
    const result = buildManualPresencePdfData(
      [{ id: 7, employeeNumber: "7", firstName: "Mariglen", lastName: "Myftari" }],
      [{ payrollEmployeeId: 7, day: 1, attendanceCode: "K", normalMinutes: 0, overtimeMinutes: 0 }],
      { year: 2026, month: 2 },
    );

    expect(result.days).toBe(28);
    expect(result.body[0][2]).toBe("K");
    expect(result.body[0][3]).toBe("");
  });
});
