import { describe, expect, it } from "vitest";
import { buildPayrollReconciliation } from "./payrollReconciliation";

describe("buildPayrollReconciliation", () => {
  it("kthen 14 kontrolle të gjelbra për një periudhë të rakorduar", () => {
    const entries = [{ payrollEmployeeId: 1, employeeNumber: "001", normalMinutes: 480, overtimeMinutes: 60, grossCents: 10000, netCents: 9500, advanceCents: 500, payableCents: 9000, paymentMethod: "BANK" as const }];
    const attendance = [{ payrollEmployeeId: 1, day: 1, normalMinutes: 480, overtimeMinutes: 60 }];
    const employees = [{ id: 1, employeeNumber: "001", active: 1, isForeign: 0 }];
    expect(buildPayrollReconciliation(entries, attendance, employees)).toHaveLength(14);
    expect(buildPayrollReconciliation(entries, attendance, employees).every(row => row.statusi === "OK")).toBe(true);
  });

  it("sinjalizon kur Bankë dhe Cash nuk rakordojnë me për pagesë", () => {
    const entries = [{ payrollEmployeeId: 1, employeeNumber: "001", normalMinutes: 0, overtimeMinutes: 0, grossCents: 10000, netCents: 9000, advanceCents: 0, payableCents: 8000, paymentMethod: "BANK" as const }];
    const checks = buildPayrollReconciliation(entries, [], [{ id: 1, employeeNumber: "001", active: 1, isForeign: 0 }]);
    expect(checks.find(row => row.id === 5)?.statusi).toBe("GABIM");
  });
});
