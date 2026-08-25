import { describe, expect, it } from "vitest";
import { validatePayrollBackup } from "./payrollBackup";

describe("Backup i Pagave", () => {
  it("pranon strukturën e plotë të backup-it", () => {
    expect(validatePayrollBackup({ payroll: { employees: [], periods: [], attendance: [], entries: [] } })).toMatchObject({ employees: [], periods: [] });
  });

  it("refuzon backup-in pa tabelat e detyrueshme", () => {
    expect(() => validatePayrollBackup({ payroll: { employees: [] } })).toThrow("backup i vlefshëm");
  });
});
