import { describe, expect, it } from "vitest";
import { buildManualPresencePdfData } from "./payrollManualExport";

describe("Testet e template-ve dhe eksporteve të përmbledhura", () => {
  it("llogarit saktë totalin e orëve dhe numrin e punonjësve në eksportin e Listëprezencës Manuale", () => {
    const employees = [
      { id: 1, employeeNumber: "1", firstName: "Mariglen", lastName: "Myftari" },
      { id: 2, employeeNumber: "2", firstName: "Jon", lastName: "Lleshi" },
    ];
    const attendance = [
      { payrollEmployeeId: 1, day: 10, normalMinutes: 480, overtimeMinutes: 120 },
      { payrollEmployeeId: 2, day: 12, attendanceCode: "K", normalMinutes: 0, overtimeMinutes: 0 },
    ];
    const period = { year: 2026, month: 7 };

    const data = buildManualPresencePdfData(employees, attendance, period);
    expect(data.totalEmployees).toBe(2);
    expect(data.days).toBe(31);
    expect(data.headers).toHaveLength(38);
    expect(data.headers.slice(-5)).toEqual(["O.Bruto", "O.Pagesë", "Normale", "Shtesë", "Total orë"]);
    expect(data.body).toHaveLength(2);
    expect(data.body[0].slice(-5)).toEqual([11, 10, 8, 2, 12]);
  });
});
