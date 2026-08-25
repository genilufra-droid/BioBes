import { describe, expect, it } from "vitest";
import { defaultPayrollAttendanceSettings, parsePayrollAttendanceSettings } from "./payrollSettings";

describe("parsePayrollAttendanceSettings", () => {
  it("lexon parametrat Abacus dhe ruan parazgjedhjet e sigurta", () => {
    expect(parsePayrollAttendanceSettings('{"lunch":45,"shiftAStart":"06:30","overtimeGrace":20,"shiftCStart":"12:00","shiftCEnd":"20:00","sundayMaxNormal":7.5}')).toMatchObject({ lunchMin: 45, shiftAStart: "06:30", shiftAEnd: "17:00", overtimeGraceMin: 20, shiftCStart: "12:00", shiftCEnd: "20:00", sundayMaxNormal: 7.5, lunchThreshold: 6 });
  });

  it("siguron konfigurimin e plotë për Rikthe parazgjedhjet", () => {
    expect(defaultPayrollAttendanceSettings).toMatchObject({ shiftAStart: "07:00", shiftAEnd: "17:00", shiftBStart: "08:00", shiftBEnd: "17:00", shiftCStart: "12:00", shiftCEnd: "20:00", lunchMin: 60, sundayMaxNormal: 7.5, overtimeGraceMin: 20, paymentDescription: "Pagë" });
  });

  it("ruan vetëm oraret e përkohshme të vlefshme", () => {
    expect(parsePayrollAttendanceSettings(JSON.stringify({ shiftOverrides: [{ payrollEmployeeId: 12, shiftCode: "C", dayFrom: 10, dayTo: 18, note: "fluks" }, { payrollEmployeeId: 0, shiftCode: "X", dayFrom: 0, dayTo: 40 }] })).shiftOverrides).toEqual([{ payrollEmployeeId: 12, shiftCode: "C", dayFrom: 10, dayTo: 18, note: "fluks" }]);
  });

  it("lexon konfigurimin e bonusit sipas parametrave të userit", () => {
    expect(parsePayrollAttendanceSettings(JSON.stringify({ bonusEnabled: true, bonusAmountLek: 7500, bonusMaxAbsences: 2, bonusRequiresOvertime: false })).bonusEnabled).toBe(true);
    expect(parsePayrollAttendanceSettings(JSON.stringify({ bonusEnabled: true, bonusAmountLek: 7500, bonusMaxAbsences: 2, bonusRequiresOvertime: false })).bonusAmountLek).toBe(7500);
    expect(parsePayrollAttendanceSettings(JSON.stringify({ bonusMaxAbsences: 2 })).bonusMaxAbsences).toBe(2);
    expect(parsePayrollAttendanceSettings(JSON.stringify({ bonusRequiresOvertime: false })).bonusRequiresOvertime).toBe(false);
  });

  it("normalizon vlera jo negative të bonusit dhe ruan pragun si numër të plotë", () => {
    expect(parsePayrollAttendanceSettings(JSON.stringify({ bonusAmountLek: -100, bonusMaxAbsences: 2.9 })).bonusAmountLek).toBe(0);
    expect(parsePayrollAttendanceSettings(JSON.stringify({ bonusAmountLek: 1250.6, bonusMaxAbsences: 2.9 })).bonusAmountLek).toBe(1250.6);
    expect(parsePayrollAttendanceSettings(JSON.stringify({ bonusAmountLek: 1250.6, bonusMaxAbsences: 2.9 })).bonusMaxAbsences).toBe(2);
  });
});
