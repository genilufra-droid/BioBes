import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseSalesWorkbook } from "./salesWorkbookImport";

function workbookBuffer() {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ["SHITJE BRENDA VENDIT NE LEKE VITI 2026"],
    ["Data", "Nr. Fature", "kodi", "Produkti", "Sasia (kg)", "Cmimi (LEK)", "Vlera PA TVSH", "TVSH", "SHUMA", "Kompania"],
    [new Date("2026-03-16T00:00:00Z"), "208", 125, "Eukalipt", 200, 200, 40000, 8000, 48000, "NATYRAL ATC"],
    [new Date("2026-03-16T00:00:00Z"), "208", 104, "Luiza C2", 200, 550, 110000, 22000, 132000, "NATYRAL ATC"],
    ["Data", "Nr. Fature", "kodi", "Produkti", "Sasia (kg)", "Cmimi (LEK)", "Vlera PA TVSH", "TVSH", "SHUMA", "Kompania"],
    [new Date("2026-03-17T00:00:00Z"), "209", 125, "Eukalipt", 100, 300, 30000, 6000, 36000, "NATYRAL ATC"],
  ]), "SHITJET B V NE LEKE & EURO");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ["Nr", "Nr. Fature", "Data", "Kodi / Code", "PRODUKTI", "Sasia (kg)", "Cmimi (EUR)", "SHUMA", "Kompania", "SHTETI", "STATUSI", "KURSI", "VLERA NE LEKE/ DD"],
    [1, "EXP-1", new Date("2026-01-05T00:00:00Z"), 103, "Rozmarine", 610, 3, 1830, "DARY NATURE", "POLONI", "KO", 96.7, 176961],
    [1, "EXP-1", new Date("2026-01-05T00:00:00Z"), 302, "Cian Blu", 210, 71.75, 15067.5, "DARY NATURE", "POLONI", "KO", 96.7, 1457027.25],
  ]), "EKSPORTI");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ["Data / Date", "NR", "KODI I FERMEREVE", "Kodi / Code", "Produkti (Anglisht) / Product (English)", "SASIA NE KG", "CMIMI", "VLERA PA TVSH", "TVSH", "VLERA ME TVSH"],
    [new Date("2026-01-04T00:00:00Z"), 1, 112, 102, "Dafinë", 1000, 920, 920000, 0, 920000],
  ]), "FATURAT 2026");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}

describe("sales workbook import", () => {
  it("groups domestic rows into one invoice and preserves VAT totals", () => {
    const result = parseSalesWorkbook(workbookBuffer());
    const domestic = result.invoices.find(invoice => invoice.invoiceFormat === "DOMESTIC");
    expect(domestic).toBeDefined();
    expect(domestic?.docNumber).toBe("208");
    expect(domestic?.items).toHaveLength(2);
    expect(domestic?.totalAmount).toBe(18000000);
    expect(domestic?.totalVat).toBe(3000000);
  });

  it("keeps export currency, exchange rate, metadata and lek equivalent", () => {
    const result = parseSalesWorkbook(workbookBuffer());
    const exportInvoice = result.invoices.find(invoice => invoice.invoiceFormat === "EXPORT");
    expect(exportInvoice?.docNumber).toBe("EXP-1");
    expect(exportInvoice?.currency).toBe("EUR");
    expect(exportInvoice?.exchangeRate).toBe(96.7);
    expect(exportInvoice?.items).toHaveLength(2);
    expect(exportInvoice?.totalAmountLek).toBe(163398825);
    expect(exportInvoice?.exportDetails).toContain("DARY NATURE");
  });

  it("groups repeated export invoice rows despite inconsistent source dates", () => {
    const result = parseSalesWorkbook(workbookBuffer());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Nr", "Nr. Fature", "Data", "Kodi / Code", "PRODUKTI", "Sasia (kg)", "Cmimi (EUR)", "SHUMA", "Kompania", "SHTETI", "KURSI", "VLERA NE LEKE/ DD"],
      [1, "540", "15.7.2026", 105, "GJETHE FERRE", 6750, 3.2, 21600, "NUTRECO", "POLONI", 94.14, 2032344],
      [1, "540", "15.7.2027", 105, "GJETHE FERRE", 6750, 3.2, 21600, "NUTRECO", "POLONI", 94.14, 2032344],
      [1, "540", "15.7.2028", 105, "GJETHE FERRE", 4250, 3.2, 13600, "NUTRECO", "POLONI", 94.14, 1282704],
      [1, "540", "15.7.2029", 105, "GJETHE FERRE", 2500, 3.8, 9500, "NUTRECO", "POLONI", 94.14, 894330],
      [1, "540", "15.7.2030", "", "PALETA", 30, 50, 1500, "NUTRECO", "POLONI", 94.14, 141210],
      [1, "540", "15.7.2031", "", "KOSTO NGARKIMI", 1, 500, 500, "NUTRECO", "POLONI", 94.14, 47070],
    ]), "EKSPORTI");
    const parsed = parseSalesWorkbook(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
    const invoice = parsed.invoices.find(item => item.docNumber === "540");
    expect(invoice).toBeDefined();
    expect(invoice?.items).toHaveLength(6);
    expect(invoice?.date.toISOString().slice(0, 10)).toBe("2026-07-15");
    expect(invoice?.warnings.some(warning => warning.includes("data të ndryshme"))).toBe(true);
    expect(result.invoices.length).toBeGreaterThan(0);
  });

  it("ignores repeated section headers instead of reporting invalid dates", () => {
    const result = parseSalesWorkbook(workbookBuffer());
    expect(result.issues.filter(issue => issue.severity === "error")).toHaveLength(0);
    expect(result.invoices.some(invoice => invoice.docNumber === "209")).toBe(true);
  });

  it("does not import the purchase sheet as sales and reports its presence", () => {
    const result = parseSalesWorkbook(workbookBuffer());
    expect(result.skippedPurchaseRows).toBeGreaterThan(0);
    expect(result.issues).toContainEqual(expect.objectContaining({ sourceSheet: "FATURAT 2026", severity: "warning" }));
    expect(result.invoices.every(invoice => invoice.sourceSheet !== "FATURAT 2026")).toBe(true);
  });
});
