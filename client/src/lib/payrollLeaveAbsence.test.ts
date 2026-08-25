import { describe, expect, it } from "vitest";
import { leaveDaysInPeriod } from "./payrollLeaveAbsence";

describe("Leje / Mungesa", () => {
  it("përfshin vetëm ditët që bien në periudhën aktive", () => {
    const leaves = leaveDaysInPeriod([{ payrollEmployeeId: 7, leaveType: "Leje", startDate: "2026-06-30", endDate: "2026-07-02" }], 2026, 7);
    expect([...leaves.keys()]).toEqual(["7-1", "7-2"]);
  });
});
