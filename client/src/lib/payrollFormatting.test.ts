import { describe, expect, it } from "vitest";
import { roundedWholeHours, roundedWholeMinutes } from "./payrollFormatting";
import { formatManualAttendance } from "./payrollManualAttendance";

describe("Formatimi i orëve dhe minutave të Pagave", () => {
  it("rrumbullakos orët në numër të plotë pa presje", () => {
    expect(roundedWholeHours(8 * 60)).toBe(8);
    expect(roundedWholeHours(103.6)).toBe(2);
    expect(roundedWholeHours(90)).toBe(2);
  });

  it("rrumbullakos pushimin si minuta të plota", () => {
    expect(roundedWholeMinutes(60)).toBe(60);
    expect(roundedWholeMinutes(103.6)).toBe(104);
  });

  it("shfaq orët manuale pa vlera dhjetore", () => {
    expect(formatManualAttendance({ normalMinutes: 480, overtimeMinutes: 34 })).toBe("8\n1");
    expect(formatManualAttendance({ normalMinutes: 480, overtimeMinutes: 0 })).toBe("8");
  });
});
