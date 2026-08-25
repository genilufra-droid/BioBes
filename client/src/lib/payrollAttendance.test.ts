import { describe, expect, it } from "vitest";
import { calculateAttendanceDay, formatPayrollAttendanceCell, getPayrollPeriodDays, payrollAttendanceTotals } from "./payrollAttendance";

describe("formati i listëprezencës", () => {
  it("ruan ditët e muajit, kodet dhe ndarjen e orëve shtesë", () => {
    expect(getPayrollPeriodDays(2026, 2)).toBe(28);
    expect(formatPayrollAttendanceCell({ attendanceCode: "L", normalMinutes: 0, overtimeMinutes: 0 })).toBe("L");
    expect(formatPayrollAttendanceCell({ attendanceCode: "8", normalMinutes: 480, overtimeMinutes: 120 })).toBe("8+2");
  });

  it("mbledh totalet normale dhe shtesë për kolonat e referencës", () => {
    expect(payrollAttendanceTotals([{ normalMinutes: 480, overtimeMinutes: 60 }, { normalMinutes: 240, overtimeMinutes: 0 }])).toEqual({ normalHours: 12, overtimeHours: 1 });
  });

  it("zbaton rastet detyruese Abacus për drekën dhe orët shtesë", () => {
    const shift = { code: "A", start: "07:00", end: "16:00", lunchMin: 60, opGrace: 30 };
    expect(calculateAttendanceDay(["07:00", "16:00"], shift)).toMatchObject({ grossMin: 540, lunchMin: 60, workedMin: 480, normalMinutes: 480, overtimeMinutes: 0 });
    expect(calculateAttendanceDay(["07:00", "19:00"], shift)).toMatchObject({ grossMin: 720, lunchMin: 60, workedMin: 660, normalMinutes: 480, overtimeMinutes: 150 });
    expect(calculateAttendanceDay(["07:00", "12:00", "13:00", "17:00"], shift)).toMatchObject({ grossMin: 540, lunchMin: 0, workedMin: 540, normalMinutes: 480, overtimeMinutes: 30 });
    expect(calculateAttendanceDay(["07:10", "16:50"], shift)).toMatchObject({ normalMinutes: 480, overtimeMinutes: 20 });
    expect(calculateAttendanceDay(["07:00", "12:00"], shift)).toMatchObject({ grossMin: 300, lunchMin: 0, workedMin: 300, normalMinutes: 300, overtimeMinutes: 0 });
    expect(calculateAttendanceDay(["07:00", "16:00"], shift, {}, 0)).toMatchObject({ lunchMin: 0, workedMin: 540, normalMinutes: 480 });
  });

  it("nuk zbrit drekë kur përdoruesi konfirmon se nuk ka pasur pushim", () => {
    const shift = { code: "A", start: "07:00", end: "17:00", lunchMin: 60, opGrace: 20 };
    expect(calculateAttendanceDay(["06:59", "20:00"], shift, {}, 0)).toMatchObject({
      grossMin: 781,
      lunchMin: 0,
      workedMin: 781,
      normalMinutes: 480,
      overtimeMinutes: 160,
      assumedLunch: false,
      lunchConfirmed: true,
    });
  });

  it("ruan 8 orë të plota për turnin C 12:00–20:00 pa drekë", () => {
    const shift = { code: "C", start: "12:00", end: "20:00", lunchMin: 0, opGrace: 20 };
    expect(calculateAttendanceDay(["12:00", "20:00"], shift)).toMatchObject({ grossMin: 480, lunchMin: 0, workedMin: 480, normalMinutes: 480, overtimeMinutes: 0, assumedLunch: false });
  });

  it("ndan orarin CUSTOM 06:00–17:00 me drekë në 8 normale dhe 2 shtesë", () => {
    const shift = { code: "CUSTOM", start: "06:00", end: "17:00", lunchMin: 60, opGrace: 20 };
    expect(calculateAttendanceDay(["06:00", "17:00"], shift)).toMatchObject({ grossMin: 660, lunchMin: 60, workedMin: 600, normalMinutes: 480, overtimeMinutes: 120, assumedLunch: true });
  });
});
