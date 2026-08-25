import { describe, expect, it } from "vitest";
import { buildExportInvoicePrintHtml, buildPurchaseReferenceInvoiceSource, buildReferenceInvoicePrintHtml, buildReferenceInvoiceRows, buildSalesReferenceInvoiceSource, shouldUseExportInvoiceTemplate } from "./invoiceReference";

const purchase = {
  id: 4319,
  docNumber: "TEST-FG-20260823",
  date: "2026-08-23T09:00:00.000Z",
  supplierId: 7,
  supplierName: "Ferre Geni",
  totalAmount: 10000,
  vatAmount: 2000,
  status: "DRAFT",
  paymentStatus: "UNPAID",
  items: [{ productName: "Ferre", quantity: 25, unit: "Kg", unitPrice: 400, totalPrice: 10000 }],
} as const;

describe("invoice reference format", () => {
  it("chooses the BioBes export template only for EXPORT invoices", () => {
    expect(shouldUseExportInvoiceTemplate("EXPORT")).toBe(true);
    expect(shouldUseExportInvoiceTemplate("DOMESTIC")).toBe(false);
    expect(shouldUseExportInvoiceTemplate(null)).toBe(false);
    expect(shouldUseExportInvoiceTemplate(null, "EUR")).toBe(true);
    expect(shouldUseExportInvoiceTemplate("DOMESTIC", "EUR")).toBe(false);
  });

  it("maps purchase data into seller and buyer blocks", () => {
    const source = buildPurchaseReferenceInvoiceSource(purchase, { name: "Genit SHPK", nipt: "L12345678A" }, { name: "Ferre Geni", nipt: "K12345678B" });
    expect(source.seller?.name).toBe("Genit SHPK");
    expect(source.buyer?.name).toBe("Ferre Geni");
    expect(source.invoiceType).toBe("Faturë e parave të gatshme");
    expect(source.paymentMethod).toBe("Kartëmonedha dhe monedha");
    expect(buildReferenceInvoicePrintHtml({ ...source, warehouseName: "Magazina Kryesore" })).toContain("Magazina Kryesore");
    const preview = buildReferenceInvoicePrintHtml({ ...source, warehouseName: "Magazina Kryesore" }, { autoPrint: false });
    expect(preview).toContain("Magazina Kryesore");
    expect(preview).toContain("TË DHËNAT E PAGESËS");
    expect(preview).not.toContain("window.onload=()=>window.print()");
  });

  it("keeps the line and fiscal totals consistent", () => {
    const rows = buildReferenceInvoiceRows(purchase);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ description: "Ferre", quantity: 25, unitPriceCents: 400, valueBeforeVatCents: 10000, vatCents: 2000, totalCents: 12000 });
  });

  it("uses the same reference shape for sales without inventing QR data", () => {
    const source = buildSalesReferenceInvoiceSource({ ...purchase, customerId: 11, customerName: "Klienti Test", vatAmount: 0 }, { name: "Genit SHPK" }, { name: "Klienti Test" });
    const html = buildReferenceInvoicePrintHtml(source);
    expect(source.buyer?.name).toBe("Klienti Test");
    expect(html).toContain("TË DHËNAT E PAGESËS");
    expect(html).toContain("@page{size:A4 portrait");
    expect(html).toContain("page-break-after:auto");
    expect((html.match(/class=\"page\"/g) ?? [])).toHaveLength(1);
    expect(html).toContain("payment-section");
    expect(html).not.toMatch(/qr|qrcode/i);
  });

  it("renders the export invoice in English with customs and weight details", () => {
    const source = buildSalesReferenceInvoiceSource({ ...purchase, currency: "EUR", exchangeRate: "100.500000", exportDetails: JSON.stringify({ billTo: "Euro Client Ltd", shipTo: "Port of Durres", deliveryPlace: "Durres", meansOfTransport: "Truck", deliveryTerms: "DAP", paymentTerms: "30 days", purchaseOrder: "PO-2026-01", sealNumber: "SEAL-77", cnCodes: ["0709.99"], netWeight: 25, grossWeight: 27, countryOfOrigin: "Albania", bankName: "Banka Test", swiftCode: "TESTALTR", iban: "AL123", additionalCosts: 500 }) }, { name: "Genit SHPK" }, { name: "Klienti Test" });
    const html = buildExportInvoicePrintHtml(source, { autoPrint: false });
    expect(html).toContain("Invoice number :");
    expect(html).toContain("Bill To");
    expect(html).toContain("Ship to company");
    expect(html).toContain("Purchase order");
    expect(html).toContain("PO-2026-01");
    expect(html).toContain("Seal number");
    expect(html).toContain("SEAL-77");
    expect(html).toContain("@page{size:A4 portrait");
    expect(html).toContain("0709.99");
    expect(html).toContain("<td class=\"number\">27</td>");
    expect(html).toContain("<td class=\"number\">25</td>");
    expect(html).toContain("Cost of");
    expect(html).toContain("Loading cost");
    expect(html).toContain("Banka Test");
    expect(html).toContain("TESTALTR");
    expect(html).toContain("AL123");
    expect(html).not.toMatch(/qr|qrcode/i);
  });

  it("keeps export print layout boxed and single-page oriented", () => {
    const source = buildSalesReferenceInvoiceSource({ ...purchase, currency: "EUR", exchangeRate: "100.5", exportDetails: JSON.stringify({ bankName: "Banka Test", swiftCode: "TESTALTR", iban: "AL123" }) }, { name: "Genit SHPK" }, { name: "Klienti Test" });
    const html = buildExportInvoicePrintHtml(source, { autoPrint: false });
    expect(html).toContain("@page{size:A4 portrait");
    expect(html).toContain("class=\"page\"");
    expect(html).toContain("class=\"parties\"");
    expect(html).toContain("class=\"meta\"");
    expect(html).toContain("class=\"totals\"");
    expect(html).toContain("Banka Test");
    expect(html).toContain("TESTALTR");
    expect(html).toContain("AL123");
    expect(html).not.toContain("window.onload=()=>window.print()");
  });
});
