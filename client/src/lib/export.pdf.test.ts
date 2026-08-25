import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { buildSourceDocumentUrl, isSourceDocumentColumnLabel } from "@/lib/export";

describe("PDF table export", () => {
  it("creates an autoTable through the supported jspdf-autotable API", () => {
    const doc = new jsPDF();

    expect(() => autoTable(doc, {
      head: [["Dokumenti", "Vlera"]],
      body: [["BL-01", "120,00 L"]],
    })).not.toThrow();
    expect((doc as any).lastAutoTable.finalY).toBeGreaterThan(0);
  });

  it("builds clickable source URLs for real purchase and sales documents", () => {
    expect(buildSourceDocumentUrl(180001, "purchase-invoice", "https://genit.example")).toBe("https://genit.example/purchase-invoices?openInvoice=180001");
    expect(buildSourceDocumentUrl(181, "purchase-receipt", "https://genit.example")).toBe("https://genit.example/purchase-invoices?tab=receipts&openReceipt=181");
    expect(buildSourceDocumentUrl(182, "purchase-return", "https://genit.example")).toBe("https://genit.example/purchase-invoices?tab=returns&openReturn=182");
    expect(buildSourceDocumentUrl(105, "sales-invoice", "https://genit.example")).toBe("https://genit.example/sales-invoices?openInvoice=105");
    expect(buildSourceDocumentUrl(106, "sales-return", "https://genit.example")).toBe("https://genit.example/sales-invoices?openReturn=106");
    expect(buildSourceDocumentUrl(107, "stock-movement", "https://genit.example")).toBe("https://genit.example/inventory?openMovement=107");
    expect(buildSourceDocumentUrl(108, "inventory-transfer", "https://genit.example")).toBe("https://genit.example/inventory?openTransfer=108");
    expect(buildSourceDocumentUrl(109, "inventory-adjustment", "https://genit.example")).toBe("https://genit.example/inventory?openAdjustment=109");
    expect(buildSourceDocumentUrl(42, "product", "https://genit.example")).toBe("https://genit.example/products?openProduct=42");
    expect(buildSourceDocumentUrl(0, "purchase-invoice", "https://genit.example")).toBe("");
    expect(buildSourceDocumentUrl(180001, "unknown", "https://genit.example")).toBe("");
  });

  it("recognizes aggregate report columns that should carry source arrows", () => {
    expect(isSourceDocumentColumnLabel("Kod Klienti")).toBe(true);
    expect(isSourceDocumentColumnLabel("Kartelë")).toBe(true);
    expect(isSourceDocumentColumnLabel("Emërtimi")).toBe(true);
    expect(isSourceDocumentColumnLabel("Emri")).toBe(true);
    expect(isSourceDocumentColumnLabel("Furnitori")).toBe(true);
    expect(isSourceDocumentColumnLabel("Qyteti")).toBe(true);
    expect(isSourceDocumentColumnLabel("Klientë")).toBe(true);
    expect(isSourceDocumentColumnLabel("Numer")).toBe(true);
    expect(isSourceDocumentColumnLabel("Koha e Maturimit")).toBe(false);
  });
});
