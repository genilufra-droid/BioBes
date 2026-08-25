import { describe, expect, it } from "vitest";
import type { PurchaseRegisterRow } from "@/pages/PurchaseInvoices";
import { summarizePurchaseRegisterRows } from "./PurchaseSupplierSummary";

const row = (patch: Partial<PurchaseRegisterRow>): PurchaseRegisterRow => ({
  invoiceId: 1,
  docNumber: "BL-1",
  date: "2026-08-23",
  supplierId: 7,
  supplierName: "Ferre Geni",
  invoiceTotalAmount: 10000,
  vatAmount: 0,
  carrierName: null,
  vehiclePlate: null,
  inventoryReference: null,
  status: "PAID",
  paymentStatus: "PAID",
  itemId: 1,
  productId: 10,
  productName: "Ferre",
  quantity: 25,
  unit: "Kg",
  unitPrice: 400,
  lineTotalAmount: 10000,
  ...patch,
});

describe("purchase supplier summary", () => {
  it("counts an invoice once while aggregating its item rows", () => {
    const summary = summarizePurchaseRegisterRows([
      row({}),
      row({ itemId: 2, productId: 11, productName: "Murriz", quantity: 5, unitPrice: 200, lineTotalAmount: 1000 }),
    ]);
    expect(summary.invoiceCount).toBe(1);
    expect(summary.supplierCount).toBe(1);
    expect(summary.billed).toBe(10000);
    expect(summary.paid).toBe(10000);
    expect(summary.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ productName: "Ferre", quantity: 25, value: 10000 }),
      expect.objectContaining({ productName: "Murriz", quantity: 5, value: 1000 }),
    ]));
  });

  it("separates paid, unpaid and later invoices using real statuses", () => {
    const summary = summarizePurchaseRegisterRows([
      row({ invoiceId: 1, docNumber: "BL-PAID", invoiceTotalAmount: 10000, status: "PAID", paymentStatus: "PAID" }),
      row({ invoiceId: 2, docNumber: "BL-OPEN", invoiceTotalAmount: 20000, status: "DRAFT", paymentStatus: "UNPAID" }),
      row({ invoiceId: 3, docNumber: "BL-LATER", invoiceTotalAmount: 30000, status: "DRAFT", paymentStatus: "LATER" }),
    ]);
    expect(summary.billed).toBe(60000);
    expect(summary.paid).toBe(10000);
    expect(summary.unpaid).toBe(20000);
    expect(summary.later).toBe(30000);
  });

  it("converts foreign-currency invoice totals to Lek using the exchange rate", () => {
    const summary = summarizePurchaseRegisterRows([row({ invoiceId: 9, invoiceTotalAmount: 12500, lineTotalAmount: 12500, currency: "EUR", exchangeRate: 100.5, status: "DRAFT", paymentStatus: "UNPAID" })]);
    expect(summary.billed).toBe(1256250);
    expect(summary.unpaid).toBe(1256250);
    expect(summary.items[0]).toEqual(expect.objectContaining({ value: 1256250 }));
  });

  it("returns a clean empty summary without inventing values", () => {
    expect(summarizePurchaseRegisterRows([])).toEqual({ invoiceCount: 0, supplierCount: 0, billed: 0, paid: 0, unpaid: 0, later: 0, items: [] });
  });
});
