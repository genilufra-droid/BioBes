import { describe, expect, it } from "vitest";
import { formatManualAttendance, parseManualAttendance } from "./payrollManualAttendance";

describe("Listëprezenca Manuale", () => {
  it("lexon orët normale dhe shtesë në formatin e regjistrit", () => {
    expect(parseManualAttendance("8+2.5")).toEqual({ attendanceCode: "8", normalMinutes: 480, overtimeMinutes: 150 });
  });

  it("mbështet kodet e mungesës dhe formatimin e një qelie", () => {
    expect(parseManualAttendance("M")).toEqual({ attendanceCode: "M", normalMinutes: 0, overtimeMinutes: 0 });
    expect(formatManualAttendance({ attendanceCode: "8", normalMinutes: 480, overtimeMinutes: 60 })).toBe("8\n1");
  });

  it("ndan totalin 12 orë në 8 normale dhe 4 shtesë", () => {
    expect(parseManualAttendance("12")).toEqual({ attendanceCode: "8", normalMinutes: 480, overtimeMinutes: 240 });
  });
});
