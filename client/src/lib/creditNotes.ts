export type CreditNoteSourceType = "PURCHASE" | "SALE";
export type CreditNoteStatus = "DRAFT" | "POSTED" | "CANCELLED";

export type CreditNoteRecord = {
  creditNoteNumber: string;
  noteDate: Date | string;
  sourceType: CreditNoteSourceType;
  sourceInvoiceNumber: string | null;
  partnerName: string | null;
  amount: number;
  vatAmount: number;
  reason: string | null;
  status: CreditNoteStatus;
};

export type CreditNoteExportRow = { "Nr.": string; Data: string; Lloji: string; "Fatura Burimore": string; Partneri: string; Shuma: string; TVSH: string; Arsyeja: string; Statusi: string };

export const creditNoteStatusLabel: Record<CreditNoteStatus, string> = { DRAFT: "Draft", POSTED: "Postuar", CANCELLED: "Anuluar" };
export const creditNoteSourceLabel: Record<CreditNoteSourceType, string> = { PURCHASE: "Blerje", SALE: "Shitje" };

export function filterCreditNotes<T extends CreditNoteRecord>(notes: T[], search: string) {
  const term = search.trim().toLocaleLowerCase("sq-AL");
  if (!term) return notes;
  return notes.filter(note => [note.creditNoteNumber, note.sourceInvoiceNumber, note.partnerName, note.reason, creditNoteSourceLabel[note.sourceType], creditNoteStatusLabel[note.status]].some(value => value?.toLocaleLowerCase("sq-AL").includes(term)));
}

export function buildCreditNoteExportRows(notes: CreditNoteRecord[], formatMoney: (cents: number) => string): CreditNoteExportRow[] {
  return notes.map(note => ({
    "Nr.": note.creditNoteNumber,
    Data: new Date(note.noteDate).toLocaleDateString("sq-AL"),
    Lloji: creditNoteSourceLabel[note.sourceType],
    "Fatura Burimore": note.sourceInvoiceNumber || "—",
    Partneri: note.partnerName || "—",
    Shuma: formatMoney(note.amount),
    TVSH: formatMoney(note.vatAmount),
    Arsyeja: note.reason || "—",
    Statusi: creditNoteStatusLabel[note.status],
  }));
}
