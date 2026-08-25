export type CreditNoteStatus = "DRAFT" | "POSTED" | "CANCELLED";
export type CreditNoteActionStatus = "POSTED" | "CANCELLED";

export function canSetCreditNoteStatus(current: CreditNoteStatus, next: CreditNoteActionStatus) {
  return current === "DRAFT" && (next === "POSTED" || next === "CANCELLED");
}

export function canDeleteCreditNote(current: CreditNoteStatus) {
  return current === "DRAFT";
}
