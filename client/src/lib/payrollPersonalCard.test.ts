import { describe, expect, it } from "vitest";
import { buildPersonalCardAuditSummary, buildPersonalCardSummary, buildPersonalCardTaxRows, buildPersonalCardWarnings, personalCardDetailRows, personalCardRows } from "./payrollPersonalCard";

describe("Kartela Personale", () => {
  it("mbledh orët e evidencës dhe i rendit ditët", () => {
    const records = [{ day: 2, attendanceCode: "8", normalMinutes: 480, overtimeMinutes: 60, note: "Logs 2: 06:58 / 17:04 | Bruto 606m | Pagesë 546m | Drekë 60m" }, { day: 1, attendanceCode: "M", normalMinutes: 0, overtimeMinutes: 0 }];
    expect(buildPersonalCardSummary(records)).toEqual({ days: 2, normalMinutes: 480, overtimeMinutes: 60, payableMinutes: 540 });
    expect(personalCardRows(records).map(row => row.dita)).toEqual([1, 2]);
    expect(personalCardRows(records).map(row => row.ore)).toEqual(["0", "8¹"]);
    expect(personalCardRows(records).map(row => row.shenim)).toEqual(["", "Logs 2"]);
  });

  it("shfaq zero tatim në të gjitha shkallët kur Parametrat e çaktivizojnë", () => {
    const rows = buildPersonalCardTaxRows(5_000_000, { taxEnabled: false, taxBand1: 80, taxBand2: 250, taxBand3: 450, taxOverRate: 10 });
    expect(rows.every(row => row.rate === 0 && row.taxCents === 0)).toBe(true);
  });

  it("ruan provat ditore të Logs, pushimin dhe statusin për dokumentin e plotë", () => {
    const records = [{ day: 18, attendanceCode: "8", normalMinutes: 480, overtimeMinutes: 240, note: "Logs 78: 06:59 / 20:00 | Bruto 781m | Pagesë 781m | Drekë 0m" }, { day: 19, attendanceCode: "K", normalMinutes: 0, overtimeMinutes: 0, note: "Logs 78: 07:00" }];
    const rows = personalCardDetailRows(records, 31, 2026, 8);
    expect(rows[17]).toMatchObject({ dita: 18, ditaJava: "M", oretNgaPajisja: "06:59 → 20:00", ore: "8⁴", pushim: "0 min (pa pushim) ✓", statusi: "+4 h shtesë" });
    expect(rows[18]).toMatchObject({ dita: 19, oretNgaPajisja: "07:00", statusi: "Vetëm një pullim (K)" });
    expect(buildPersonalCardAuditSummary(rows)).toMatchObject({ workDays: 1, normalMinutes: 480, overtimeMinutes: 240, singlePunchCount: 1, lunchConfirmedCount: 1, noDataCount: 29 });
  });

  it("kthen vërejtjet e veprueshme nga të dhënat reale të periudhës", () => {
    const rows = personalCardDetailRows([{ day: 18, attendanceCode: "8", normalMinutes: 540, overtimeMinutes: 0, note: "Logs 78: 07:00 / 17:00" }, { day: 19, attendanceCode: "K", normalMinutes: 0, overtimeMinutes: 0, note: "Logs 78: 07:00" }, { day: 20, attendanceCode: "M", normalMinutes: 0, overtimeMinutes: 0 }], 31, 2026, 8);
    expect(buildPersonalCardWarnings(rows)).toContainEqual({ day: 19, label: "Vetëm një pullim", detail: "Ka vetëm një stampim dhe kërkon kontroll të hyrjes/daljes." });
    expect(buildPersonalCardWarnings(rows, { hasPayrollEntry: false })).toContainEqual({ label: "Mungon rreshti në Bordero", detail: "Punonjësi ka prezencë në periudhë, por nuk ka rresht të gjeneruar në Bordero." });
    expect(buildPersonalCardWarnings(rows)).toContainEqual({ day: 18, label: "Orë normale mbi kufi", detail: "Orët normale të kësaj dite tejkalojnë kufirin prej 8 orësh." });
  });
});
