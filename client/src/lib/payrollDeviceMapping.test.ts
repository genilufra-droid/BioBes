import { describe, expect, it } from "vitest";
import { activePayrollDeviceLinks } from "./payrollDeviceMapping";

describe("activePayrollDeviceLinks", () => {
  it("keeps only active device-to-employee links", () => {
    expect(activePayrollDeviceLinks([
      { deviceId: "45", payrollEmployeeId: 12, active: 1 },
      { deviceId: "70", payrollEmployeeId: 13, active: 0 },
    ])).toEqual({ 45: 12 });
  });
});
