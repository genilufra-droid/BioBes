import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseManualPresenceWorkbook } from "./payrollManualImport";

describe("parseManualPresenceWorkbook", () => {
  it("gjen ORET E PUNES edhe kur nuk është sheet-i i parë dhe ruan ditët me zero", async () => {
    const workbook = XLSX.utils.book_new();
    const summary = XLSX.utils.aoa_to_sheet([["Përmbledhje"], ["Korrik 2026"]]);
    const hours = XLSX.utils.aoa_to_sheet([
      ["ORET E PUNES MUAJI KORRIK 2026"],
      [],
      ["NR.", "EMRI", "MBIEMRI", 1, 2, 3, 4, 5],
      ["7", "MARIGLEN", "MYFTARI", 8, 0, 12, "M", ""],
    ]);
    XLSX.utils.book_append_sheet(workbook, summary, "Përmbledhje");
    XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = await parseManualPresenceWorkbook(data, [{ id: 42, employeeNumber: "7", firstName: "Mariglen", lastName: "Myftari" }], 5);

    expect(result.sheetName).toBe("ORET E PUNES");
    expect(result.headerRow).toBe(3);
    expect(result.matchedEmployees).toBe(1);
    expect(result.importedCells).toBe(4);
    expect(result.errors).toHaveLength(0);
    expect(result.values).toMatchObject({ "7-1": "8", "7-2": "0", "7-3": "8+4", "7-4": "M" });
  });

  it("lidh sipas emrit kur numri mungon dhe raporton qelizat e pavlefshme", async () => {
    const workbook = XLSX.utils.book_new();
    const hours = XLSX.utils.aoa_to_sheet([
      ["Titull"],
      ["NR.", "EMRI", "MBIEMRI", 1, 2],
      ["", "Ardian", "Hoxha", "8", "abc123"],
    ]);
    XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = await parseManualPresenceWorkbook(data, [{ id: 9, employeeNumber: "100", firstName: "Ardian", lastName: "Hoxha" }], 2);

    expect(result.matchedEmployees).toBe(1);
    expect(result.values["100-1"]).toBe("8");
    expect(result.values["100-2"]).toBeUndefined();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("dita 2");
  });

  it("kthen vlerat me numrin burim dhe listën e punonjësve të rinj pa ID negative", async () => {
    const workbook = XLSX.utils.book_new();
    const hours = XLSX.utils.aoa_to_sheet([
      ["Titull"],
      ["NR.", "EMRI", "MBIEMRI", 1, 2],
      ["7", "Mariglen", "Myftari", "8", "8+2"],
    ]);
    XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = await parseManualPresenceWorkbook(data, [], 2);

    expect(result.matchedEmployees).toBe(1);
    expect(result.newEmployees).toEqual([{ employeeNumber: "7", firstName: "Mariglen", lastName: "Myftari" }]);
    expect(result.values).toMatchObject({ "7-1": "8", "7-2": "8+2" });
    expect(Object.keys(result.values).some(key => key.startsWith("-") || key.includes("new:"))).toBe(false);
  });
});

  it("lexon kostot, bonusin dhe Bankë/Cash nga PAGAT KORRIK 2026 duke lidhur punonjësin sipas emrit", async () => {
    const workbook = XLSX.utils.book_new();
    const hours = XLSX.utils.aoa_to_sheet([
      ["Titull"],
      ["NR.", "EMRI", "MBIEMRI", 1],
      ["23", "KASTRIOT", "KABOÇI", "8"],
    ]);
    const payroll = XLSX.utils.aoa_to_sheet([
      ["PAGAT KORRIK 2026"],
      ["NR", "EMER ", "MBIEMER", "ORE PUNE NORMALE", "KOSTO OPN", "SHUMA (1)", "ORE PUNE SHTESE", "KOSTO OPSH", "SHUMA (2)", "BONUS & PAGAT BAZE (3)", "Bonus 5000 ALL (4)", "SHUMA TOTALE (1+2+3+4)", "PAGESA NE BANK", "PAGESA KESH"],
      ["28", "KASTRIOT", "KABOÇI", 240, 250, 60000, 21, 300, 6300, 8000, 5000, 79300, 44400, 34900],
    ]);
    XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
    XLSX.utils.book_append_sheet(workbook, payroll, "PAGAT KORRIK 2026");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = await parseManualPresenceWorkbook(data, [{ id: 42, employeeNumber: "23", firstName: "Kastriot", lastName: "Kaboçi" }], 1);

    expect(result.payrollData).toEqual([{
      employeeNumber: "28",
      firstName: "KASTRIOT",
      lastName: "KABOÇI",
      regularRateCents: 25000,
      overtimeRateCents: 30000,
      baseSalaryCents: 1300000,
      bankPaymentCents: 4440000,
      cashPaymentCents: 3490000,
      paymentMethod: "BANK",
    }]);
  });

  it("lexon normën ditore, OPSH dhe pagesat e punonjësve të huaj nga TE HUAJT", async () => {
    const workbook = XLSX.utils.book_new();
    const hours = XLSX.utils.aoa_to_sheet([
      ["Titull"],
      ["NR.", "EMRI", "MBIEMRI", 1],
      ["64", "AREBU", "SEID", "8"],
    ]);
    const foreign = XLSX.utils.aoa_to_sheet([
      ["PAGAT KORRIK 2026 PUNONJESIT E HUAJ"],
      ["NR", "EMER", "MBIEMER", "DITE PUNE", "PAGA/DITE PUNE", "SHUMA (1)", "ORE PUNE SHTESE", "KOSTO OPSH", "SHUMA (2)", "SHUMA TOTALE (1+2)", "PAGESA BANKE", "PAGESA CASH", "BONUS MUJOR"],
      ["1", "AREBU", "SEID", 29, 1707, 49503, 23, 250, 5750, 55253, 44400, 18000, 5000],
      ["ERSI PETRO(2 RRUGE KAMIONCIN)", "", "2.7.2026", 2, 1000, 2000, "", "", "", "", "", "", ""],
    ]);
    XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
    XLSX.utils.book_append_sheet(workbook, foreign, "TE HUAJT");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = await parseManualPresenceWorkbook(data, [], 1);

    expect(result.foreignPayrollData).toEqual([{
      employeeNumber: "1",
      firstName: "AREBU",
      lastName: "SEID",
      regularRateCents: 0,
      overtimeRateCents: 25000,
      baseSalaryCents: 0,
      bankPaymentCents: 4440000,
      cashPaymentCents: 1800000,
      paymentMethod: "BANK",
      dailyRateCents: 170700,
      isForeign: 1,
    }]);
  });

  it("lexon fletën e ndarë PAGAT ME BANKE me një kolonë PAGA", async () => {
    const workbook = XLSX.utils.book_new();
    const hours = XLSX.utils.aoa_to_sheet([
      ["Titull"],
      ["NR.", "EMRI", "MBIEMRI", 1],
      ["23", "KASTRIOT", "KABOÇI", "8"],
    ]);
    const bank = XLSX.utils.aoa_to_sheet([
      ["PAGAT ME BANKE"],
      ["NR", "EMER", "MBIEMER", "PAGA"],
      ["23", "KASTRIOT", "KABOÇI", 44400],
    ]);
    XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
    XLSX.utils.book_append_sheet(workbook, bank, "PAGAT ME BANKE");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = await parseManualPresenceWorkbook(data, [], 1);

    expect(result.payrollData).toEqual([{
      employeeNumber: "23",
      firstName: "KASTRIOT",
      lastName: "KABOÇI",
      regularRateCents: 0,
      overtimeRateCents: 0,
      baseSalaryCents: 0,
      bankPaymentCents: 4440000,
      cashPaymentCents: 0,
      paymentMethod: "BANK",
    }]);
  });

  it("injoron rreshtat përmbledhës të huajve dhe nuk krijon punonjës fiktivë", async () => {
    const workbook = XLSX.utils.book_new();
    const hours = XLSX.utils.aoa_to_sheet([
      ["Titull"],
      ["NR.", "EMRI", "MBIEMRI", 1],
      ["", "PUNETORET", "TE HUAJ", 8],
    ]);
    const payroll = XLSX.utils.aoa_to_sheet([
      ["PAGAT KORRIK 2026"],
      ["NR", "EMER", "MBIEMER", "ORE PUNE NORMALE", "KOSTO OPN", "SHUMA (1)", "ORE PUNE SHTESE", "KOSTO OPSH", "SHUMA (2)", "BONUS & PAGAT BAZE (3)", "Bonus 5000 ALL (4)", "SHUMA TOTALE (1+2+3+4)", "PAGESA NE BANK", "PAGESA KESH"],
      ["", "PUNETORET", "TE HUAJ", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
    XLSX.utils.book_append_sheet(workbook, payroll, "PAGAT KORRIK 2026");
    const data = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const result = await parseManualPresenceWorkbook(data, [], 1);

    expect(result.importedCells).toBe(0);
    expect(result.presenceEmployees).toEqual([]);
    expect(result.newEmployees).toEqual([]);
    expect(result.payrollData).toEqual([]);
  });
