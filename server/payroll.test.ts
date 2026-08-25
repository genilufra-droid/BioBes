import { describe, expect, it } from "vitest";
import { calculatePayrollEntry, countPayrollAbsenceDays, parsePayrollBonusSettings, progressiveTaxCents, resolvePayrollBonusCents } from "./payroll";
import { getPayrollTaxBrackets } from "./db";

describe("motori i pagave", () => {
  const brackets = [{ upto: 80, rateBp: 0 }, { upto: 250, rateBp: 400 }, { upto: null, rateBp: 1000 }];

  it("llogarit orët, kontributet, tatimin progresiv dhe neton në cent", () => {
    const result = calculatePayrollEntry({ normalMinutes: 480, overtimeMinutes: 60, regularRateCents: 1_000, overtimeRateCents: 1_500, baseSalaryCents: 0, advanceCents: 5_000, socialEmployeeRateBp: 1_000, socialEmployerRateBp: 1_500, taxBrackets: brackets });
    expect(result.grossCents).toBe(9_500);
    expect(result.socialEmployeeCents).toBe(950);
    expect(result.socialEmployerCents).toBe(1_425);
    expect(result.netCents).toBeGreaterThan(0);
    expect(result.payableCents).toBe(result.netCents - 5_000);
  });

  it("llogarit pagën e huaj me pagë ditore dhe orë shtesë", () => {
    const workDays = 29;
    const result = calculatePayrollEntry({ normalMinutes: 29 * 8 * 60, overtimeMinutes: 23 * 60, regularRateCents: 0, overtimeRateCents: 25_000, baseSalaryCents: resolvePayrollBonusCents({ isForeign: 1, workDays, dailyRateCents: 170_700 }), advanceCents: 0, socialEmployeeRateBp: 0, socialEmployerRateBp: 0, taxBrackets: [{ upto: null, rateBp: 0 }] });
    expect(result.regularPayCents).toBe(0);
    expect(result.overtimePayCents).toBe(575_000);
    expect(result.grossCents).toBe(5_525_300);
  });

  it("nuk lejon tatim negativ ose pagesë negative", () => {
    expect(progressiveTaxCents(0, brackets)).toBe(0);
    const result = calculatePayrollEntry({ normalMinutes: 0, overtimeMinutes: 0, regularRateCents: 0, overtimeRateCents: 0, baseSalaryCents: 1_000, advanceCents: 5_000, socialEmployeeRateBp: 0, socialEmployerRateBp: 0, taxBrackets: brackets });
    expect(result.payableCents).toBe(0);
  });

  it("çaktivizon të gjitha shkallët kur Parametrat kanë tatim 0", () => {
    expect(getPayrollTaxBrackets(JSON.stringify({ taxBand1: 80, taxBand2: 250, taxBand3: 450, taxOverRate: 0 }))).toEqual([{ upto: null, rateBp: 0 }]);
    expect(getPayrollTaxBrackets(JSON.stringify({ taxEnabled: false, taxBand1: 80, taxBand2: 250, taxBand3: 450, taxOverRate: 10 }))).toEqual([{ upto: null, rateBp: 0 }]);
    expect(progressiveTaxCents(5_000_000, getPayrollTaxBrackets(JSON.stringify({ taxOverRate: 0 })))).toBe(0);
  });

  it("e mban bonusin manual vetëm për punonjësin dhe periudhën që e furnizon", () => {
    expect(resolvePayrollBonusCents({ isForeign: 0, workDays: 22, dailyRateCents: 90_000 })).toBe(0);
    expect(resolvePayrollBonusCents({ isForeign: 0, workDays: 22, dailyRateCents: 90_000, periodBonusCents: 500_000 })).toBe(500_000);
    expect(resolvePayrollBonusCents({ isForeign: 1, workDays: 10, dailyRateCents: 90_000, periodBonusCents: 500_000 })).toBe(900_000);
  });

  it("numëron ditët e mungesës vetëm një herë për kodet M dhe NM", () => {
    expect(countPayrollAbsenceDays([{ day: 1, attendanceCode: "M" }, { day: 1, attendanceCode: "M" }, { day: 2, attendanceCode: "NM" }, { day: 3, attendanceCode: "L" }, { day: 4, attendanceCode: "8" }])).toBe(2);
  });

  it("jep bonusin e konfigurueshëm kur mungesat janë nën prag dhe ka orë shtesë", () => {
    const bonusSettings = { enabled: true, amountCents: 750_000, maxAbsences: 3, requiresOvertime: true };
    expect(resolvePayrollBonusCents({ isForeign: 0, workDays: 22, dailyRateCents: 0, absenceCount: 2, overtimeMinutes: 60, bonusSettings })).toBe(750_000);
    expect(resolvePayrollBonusCents({ isForeign: 0, workDays: 22, dailyRateCents: 0, absenceCount: 3, overtimeMinutes: 60, bonusSettings })).toBe(0);
    expect(resolvePayrollBonusCents({ isForeign: 0, workDays: 22, dailyRateCents: 0, absenceCount: 2, overtimeMinutes: 0, bonusSettings })).toBe(0);
  });

  it("respekton konfigurimin pa kusht orësh shtesë dhe çaktivizimin e bonusit", () => {
    expect(resolvePayrollBonusCents({ isForeign: 0, workDays: 22, dailyRateCents: 0, absenceCount: 0, overtimeMinutes: 0, bonusSettings: { enabled: true, amountCents: 500_000, maxAbsences: 3, requiresOvertime: false } })).toBe(500_000);
    expect(resolvePayrollBonusCents({ isForeign: 0, workDays: 22, dailyRateCents: 0, absenceCount: 0, overtimeMinutes: 60, bonusSettings: { enabled: false, amountCents: 500_000, maxAbsences: 3, requiresOvertime: true } })).toBe(0);
  });

  it("lexon dhe normalizon parametrat e bonusit nga JSON", () => {
    expect(parsePayrollBonusSettings(JSON.stringify({ bonusEnabled: true, bonusAmountLek: 7500.49, bonusMaxAbsences: 2.9, bonusRequiresOvertime: false }))).toEqual({ enabled: true, amountCents: 750049, maxAbsences: 2, requiresOvertime: false });
    expect(parsePayrollBonusSettings(JSON.stringify({ bonusAmountLek: -1, bonusMaxAbsences: -2 }))).toEqual({ enabled: false, amountCents: 0, maxAbsences: 0, requiresOvertime: true });
  });

});
