import { describe, expect, it } from "vitest";
import { buildSalesRegisterExportRows, type SalesRegisterExportSource } from "../client/src/lib/export";

const source = (overrides: Partial<SalesRegisterExportSource> = {}): SalesRegisterExportSource => ({
  invoiceId: 10,
  docNumber: "SH-001",
  date: new Date("2026-08-01T00:00:00.000Z"),
  customerId: 7,
  customerName: "Klient Test",
  invoiceTotalAmount: 12000,
  currency: "ALL",
  exchangeRate: "1.000000",
  invoiceFormat: "DOMESTIC",
  vatAmount: 2000,
  warehouseName: "Magazina Test ERP",
  status: "POSTED",
  paymentStatus: "UNPAID",
  itemId: 20,
  productId: 30,
  productName: "Produkt Test",
  quantity: 5,
  unit: "Kg",
  unitPrice: 2400,
  lineTotalAmount: 12000,
  ...overrides,
});

describe("sales register export rows", () => {
  it("splits invoice VAT across item rows and keeps gross total", () => {
    const rows = buildSalesRegisterExportRows([source(), source({ itemId: 21, productId: 31, productName: "Produkt 2", lineTotalAmount: 8000, invoiceTotalAmount: 20000 })]);
    expect(rows[0].valueBeforeVat).toContain("110,00");
    expect(rows[0].vat).toContain("10,00");
    expect(rows[0].valueWithVat).toContain("120,00");
    expect(rows[1].valueWithVat).toContain("80,00");
    expect(rows[0].customerName).toBe("Klient Test");
    expect(rows[0].warehouseName).toBe("Magazina Test ERP");
  });

  it("preserves export currency and calculates lek equivalent", () => {
    const rows = buildSalesRegisterExportRows([source({ invoiceId: 11, docNumber: "EXP-001", currency: "EUR", exchangeRate: 100, invoiceFormat: "EXPORT", vatAmount: 0, invoiceTotalAmount: 250000, lineTotalAmount: 250000 })]);
    expect(rows[0].invoiceFormat).toBe("EXPORT");
    expect(rows[0].currency).toBe("EUR");
    expect(rows[0].exchangeRate).toBe("100.000000");
    expect(rows[0].valueWithVat).toContain("2500,00");
    expect(rows[0].valueInLek.replace(/\u00a0/g, " ")).toContain("250 000,00");
  });

  it("maps payment state to the legacy row colors/status labels", () => {
    expect(buildSalesRegisterExportRows([source({ status: "PAID", paymentStatus: "UNPAID" })])[0].paymentStatus).toBe("E paguar");
    expect(buildSalesRegisterExportRows([source({ status: "POSTED", paymentStatus: "LATER" })])[0].paymentStatus).toBe("Më vonë");
  });

  it("keeps repeated product lines as one invoice's legitimate item rows", () => {
    const rows = buildSalesRegisterExportRows([
      source({ invoiceId: 540, docNumber: "540", itemId: 1, productId: 90028, quantity: 6750, lineTotalAmount: 675000 }),
      source({ invoiceId: 540, docNumber: "540", itemId: 2, productId: 90028, quantity: 6750, lineTotalAmount: 675000 }),
      source({ invoiceId: 540, docNumber: "540", itemId: 3, productId: 90028, quantity: 4250, lineTotalAmount: 425000 }),
    ]);
    expect(rows).toHaveLength(3);
    expect(rows.map(row => row.productName)).toEqual(["Produkt Test", "Produkt Test", "Produkt Test"]);
    expect(new Set(rows.map(row => row.invoiceId)).size).toBe(1);
  });
});
