import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { validatePayrollTemplate } from "./payrollTemplateContract";

function workbookBuffer(workbook: XLSX.WorkBook) {
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function validWorkbook() {
  const workbook = XLSX.utils.book_new();
  const hours = XLSX.utils.aoa_to_sheet([
    ["ORET E PUNES", "QERSHOR 2026"],
    ["NR", "EMRI", "MBIEMRI", ...Array.from({ length: 30 }, (_, index) => index + 1)],
    ["1", "Kastrioti", "Kaboçi", ...Array.from({ length: 30 }, () => "8")],
  ]);
  const payroll = XLSX.utils.aoa_to_sheet([
    ["PAGAT QERSHOR 2026"],
    ["NR", "EMER", "MBIEMER", "ORE PUNE NORMALE", "KOSTO OPN", "SHUMA (1)", "ORE PUNE SHTESE", "KOSTO OPSH", "SHUMA (2)", "BONUS & PAGAT BAZE (3)", "Bonus 5000 ALL (4)", "SHUMA TOTALE (1+2+3+4)", "PAGESA NE BANK", "PAGESA KESH"],
    ["1", "Kastrioti", "Kaboçi", 240, 200, 48000, 21, 250, 5250, 26050, 0, 79300, 44400, 34900],
  ]);
  const foreign = XLSX.utils.aoa_to_sheet([
    ["TE HUAJT", "QERSHOR 2026"],
    ["NR", "EMER", "MBIEMER", "PAGA/DITE PUNE", "KOSTO OPSH", "PAGESA BANKE", "PAGESA CASH"],
    ["90", "Arben", "Mema", 1707, 250, 44400, 0],
    ["ERSI PETRO(2 RRUGE KAMIONCIN)", "", "2.7.2026", 2, 1000, 2000, "", "", "", "", "", "", ""],
  ]);
  XLSX.utils.book_append_sheet(workbook, hours, "ORET E PUNES");
  XLSX.utils.book_append_sheet(workbook, payroll, "PAGAT QERSHOR 2026");
  XLSX.utils.book_append_sheet(workbook, foreign, "TE HUAJT");
  return workbook;
}

describe("payrollTemplateContract", () => {
  it("accepts the official June template with exactly 30 day columns", () => {
    const result = validatePayrollTemplate(workbookBuffer(validWorkbook()), 30);
    expect(result.valid).toBe(true);
    expect(result.hoursSheetName).toBe("ORET E PUNES");
    expect(result.payrollSheetName).toBe("PAGAT QERSHOR 2026");
    expect(result.hoursRows).toBe(1);
    expect(result.payrollRows).toBe(1);
    expect(result.foreignSheetName).toBe("TE HUAJT");
    expect(result.foreignRows).toBe(1);
  });

  it("pranon dashin si zero dhe pagesën Cash negative të modeleve reale", () => {
    const workbook = validWorkbook();
    const sheet = workbook.Sheets["PAGAT QERSHOR 2026"];
    sheet["J3"] = { t: "s", v: " -   " };
    sheet["N3"] = { t: "s", v: "-6,900" };
    const result = validatePayrollTemplate(workbookBuffer(workbook), 30);
    expect(result.valid).toBe(true);
  });

  it("rejects a currency symbol or text in a monetary field", () => {
    const workbook = validWorkbook();
    workbook.Sheets["PAGAT QERSHOR 2026"]["E3"] = { t: "s", v: "€200" };
    const result = validatePayrollTemplate(workbookBuffer(workbook), 30);
    expect(result.valid).toBe(false);
    expect(result.issues.some(issue => issue.cell === "E3" && issue.message.includes("Vlerë monetare"))).toBe(true);
  });

  it("reports a missing mandatory payroll column", () => {
    const workbook = validWorkbook();
    const sheet = workbook.Sheets["PAGAT QERSHOR 2026"];
    sheet["J2"] = { t: "s", v: "BONUS" };
    const result = validatePayrollTemplate(workbookBuffer(workbook), 30);
    expect(result.valid).toBe(false);
    expect(result.issues.some(issue => issue.message.includes("BONUS & PAGAT BAZE"))).toBe(true);
  });

  it("pranon fletën reale PAGAT ME BANKE me kolonë të vetme page", () => {
    const workbook = validWorkbook();
    delete workbook.Sheets["PAGAT QERSHOR 2026"];
    workbook.SheetNames = workbook.SheetNames.filter(name => name !== "PAGAT QERSHOR 2026");
    const bank = XLSX.utils.aoa_to_sheet([
      ["PAGAT ME BANKE"],
      ["NR", "EMER", "MBIEMER", "PAGA"],
      ["1", "Kastrioti", "Kaboçi", 44400],
    ]);
    XLSX.utils.book_append_sheet(workbook, bank, "PAGAT ME BANKE");
    const result = validatePayrollTemplate(workbookBuffer(workbook), 30);
    expect(result.valid).toBe(true);
    expect(result.payrollSheetName).toBe("PAGAT ME BANKE");
    expect(result.payrollRows).toBe(1);
  });

  it("rejects a currency symbol in a TE HUAJT monetary field", () => {
    const workbook = validWorkbook();
    workbook.Sheets["TE HUAJT"]["D3"] = { t: "s", v: "€1707" };
    const result = validatePayrollTemplate(workbookBuffer(workbook), 30);
    expect(result.valid).toBe(false);
    expect(result.issues.some(issue => issue.sheet === "TE HUAJT" && issue.cell === "D3" && issue.message.includes("Vlerë monetare"))).toBe(true);
  });

  it("rejects an invalid hours cell and identifies its Excel coordinate", () => {
    const workbook = validWorkbook();
    workbook.Sheets["ORET E PUNES"]["D3"] = { t: "s", v: "tetë orë" };
    const result = validatePayrollTemplate(workbookBuffer(workbook), 30);
    expect(result.valid).toBe(false);
    expect(result.issues.some(issue => issue.sheet === "ORET E PUNES" && issue.cell === "D3" && issue.message.includes("Vlerë ore"))).toBe(true);
  });
});
