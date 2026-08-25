import { describe, expect, it } from "vitest";
import { buildCreditNoteExportRows, filterCreditNotes, type CreditNoteRecord } from "./creditNotes";

const notes: CreditNoteRecord[] = [
  { creditNoteNumber: "NK-001", noteDate: "2026-08-20T12:00:00.000Z", sourceType: "PURCHASE", sourceInvoiceNumber: "FB-100", partnerName: "Furnitori Genit", amount: 125000, vatAmount: 25000, reason: "Kthim malli", status: "DRAFT" },
  { creditNoteNumber: "NK-002", noteDate: "2026-08-20T12:00:00.000Z", sourceType: "SALE", sourceInvoiceNumber: "FS-200", partnerName: "Klienti Alba", amount: 50000, vatAmount: 10000, reason: null, status: "POSTED" },
];

describe("creditNotes helpers", () => {
  it("filtron sipas faturës burimore, partnerit dhe statusit", () => {
    expect(filterCreditNotes(notes, "fs-200")).toHaveLength(1);
    expect(filterCreditNotes(notes, "klienti")[0]?.creditNoteNumber).toBe("NK-002");
    expect(filterCreditNotes(notes, "postuar")).toHaveLength(1);
  });

  it("përgatit kolonat e regjistrit për eksport", () => {
    const [row] = buildCreditNoteExportRows(notes.slice(0, 1), cents => `L ${cents / 100}`);
    expect(row).toMatchObject({ "Nr.": "NK-001", Lloji: "Blerje", "Fatura Burimore": "FB-100", Partneri: "Furnitori Genit", Shuma: "L 1250", TVSH: "L 250", Arsyeja: "Kthim malli", Statusi: "Draft" });
  });
});
