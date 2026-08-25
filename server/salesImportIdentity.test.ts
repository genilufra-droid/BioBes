import { describe, expect, it } from "vitest";
import { allocateSalesImportDocNumber, salesImportRowsOverlap, salesInvoiceImportIdentity } from "./salesImportIdentity";

describe("sales import identity", () => {
  it("distinguishes same document number on different dates and formats", () => {
    const first = salesInvoiceImportIdentity({ docNumber: "140", date: new Date("2026-02-11"), invoiceFormat: "EXPORT", customerName: "KLENK" });
    const second = salesInvoiceImportIdentity({ docNumber: "140", date: new Date("2026-02-12"), invoiceFormat: "EXPORT", customerName: "KLENK" });
    const third = salesInvoiceImportIdentity({ docNumber: "140", date: new Date("2026-02-11"), invoiceFormat: "DOMESTIC", customerName: "KLENK" });
    expect(new Set([first, second, third]).size).toBe(3);
  });

  it("detects a partial import by overlapping source rows", () => {
    expect(salesImportRowsOverlap([93], [93, 94, 95])).toBe(true);
    expect(salesImportRowsOverlap([92], [93, 94, 95])).toBe(false);
    expect(salesImportRowsOverlap(null, [93])).toBe(false);
  });

  it("allocates a deterministic suffix instead of dropping a duplicate number", () => {
    const used = new Set(["140"]);
    expect(allocateSalesImportDocNumber("140", new Date("2026-02-11"), used)).toBe("140-20260211");
    expect(allocateSalesImportDocNumber("140", new Date("2026-02-11"), used)).toBe("140-20260211-2");
  });
});
