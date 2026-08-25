import { describe, expect, it } from "vitest";
import { buildPurchaseInvoiceDocumentRows, buildPurchaseOrderModelRows, buildPurchaseRegisterExportRows } from "./export";

describe("buildPurchaseRegisterExportRows", () => {
  it("ruan kolonat dhe ndan TVSH-në sipas rreshtave të së njëjtës faturë", () => {
    const rows = buildPurchaseRegisterExportRows([
      { invoiceId: 7, docNumber: "BL-0007", date: "2026-01-04T00:00:00.000Z", supplierId: 12, supplierName: "Furnitori Test", invoiceTotalAmount: 30000, vatAmount: 6000, carrierName: "Transporti Test", vehiclePlate: "AA 123 AA", inventoryReference: "INV-007", status: "PAID", paymentStatus: "UNPAID", itemId: 1, productId: 101, productName: "Artikulli A", quantity: 10, unit: "KG", unitPrice: 1000, lineTotalAmount: 10000 },
      { invoiceId: 7, docNumber: "BL-0007", date: "2026-01-04T00:00:00.000Z", supplierId: 12, supplierName: "Furnitori Test", invoiceTotalAmount: 30000, vatAmount: 6000, carrierName: "Transporti Test", vehiclePlate: "AA 123 AA", inventoryReference: "INV-007", status: "PAID", paymentStatus: "UNPAID", itemId: 2, productId: 102, productName: "Artikulli B", quantity: 20, unit: "KG", unitPrice: 1000, lineTotalAmount: 20000 },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ docNumber: "BL-0007", paymentStatus: "E paguar", supplierCode: "012", supplierName: "Furnitori Test", productCode: "101", carrierName: "Transporti Test", vehiclePlate: "AA 123 AA", inventoryReference: "INV-007" });
    expect(rows[0]?.vat).toBe("30,00 L");
    expect(rows[1]?.vat).toBe("30,00 L");
    expect(rows[1]?.valueWithVat).toBe("230,00 L");
  });

  it("shfaq monedhën e huaj dhe llogarit ekuivalentin në Lek", () => {
    const rows = buildPurchaseRegisterExportRows([{
      invoiceId: 8, docNumber: "BL-EUR-0008", date: "2026-01-04T00:00:00.000Z", supplierId: 13, supplierName: "Furnitori EUR", invoiceTotalAmount: 12500, currency: "EUR", exchangeRate: 100.5, vatAmount: 0, carrierName: null, vehiclePlate: null, inventoryReference: null, status: "DRAFT", paymentStatus: "UNPAID", itemId: 3, productId: 103, productName: "Artikulli EUR", quantity: 1, unit: "copë", unitPrice: 12500, lineTotalAmount: 12500,
    }]);

    expect(rows[0]).toMatchObject({ currency: "EUR", exchangeRate: "100.500000", unitPrice: "125,00 EUR", valueWithVat: "125,00 EUR" });
    expect(rows[0]?.valueInLek?.replace(/\u00a0/g, " ")).toBe("12 562,50 L");
  });
});

describe("buildPurchaseInvoiceDocumentRows", () => {
  it("përdor të njëjtët rreshta të artikujve për çdo dalje të dokumentit", () => {
    const rows = buildPurchaseInvoiceDocumentRows({ id: 9, docNumber: "BL-0009", date: "2026-01-04T00:00:00.000Z", supplierName: "Furnitori Test", totalAmount: 25000, vatAmount: 5000, carrierName: null, vehiclePlate: null, inventoryReference: null, status: "DRAFT", items: [{ productName: "Artikulli A", quantity: 25, unit: "KG", unitPrice: 1000, totalPrice: 25000 }] });
    expect(rows).toEqual([["Artikulli A", "25", "KG", "10,00 L", "250,00 L"]]);
  });
});

describe("buildPurchaseOrderModelRows", () => {
  it("ruan dhjetë kolonat e modelit me peshat dhe sasitë", () => {
    const rows = buildPurchaseOrderModelRows({ docNumber: "69", orderDate: "2026-08-14", customerReference: "7013", supplierName: "BioBes", preparationResponsible: "Ardit", loadingResponsible: "Blerim", documentationResponsible: "Drita", verifierName: "Ema", notes: "Mostër", items: [{ productName: "Murriz", plantType: "Lule", productCode: "MR-01", sackCount: 8, grossWeightKg: 550, netWeightKg: 500, quantity: 5000, loadedQuantity: 2500, notes: "Kontrolluar" }] });
    expect(rows).toEqual([["1", "Murriz", "Lule", "MR-01", "8", "550 kg", "500 kg", "5000 kg", "2500 kg", "Kontrolluar"]]);
  });
});
