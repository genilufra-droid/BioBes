import { describe, expect, it } from "vitest";
import { canDeleteCreditNote, canSetCreditNoteStatus } from "./creditNotes";

describe("credit note status workflow", () => {
  it("lejon postimin ose anulimin vetëm nga Draft", () => {
    expect(canSetCreditNoteStatus("DRAFT", "POSTED")).toBe(true);
    expect(canSetCreditNoteStatus("DRAFT", "CANCELLED")).toBe(true);
  });

  it("bllokon ndryshimin e një note të postuar ose anuluar", () => {
    expect(canSetCreditNoteStatus("POSTED", "CANCELLED")).toBe(false);
    expect(canSetCreditNoteStatus("CANCELLED", "POSTED")).toBe(false);
  });

  it("lejon fshirjen vetëm të një note Draft", () => {
    expect(canDeleteCreditNote("DRAFT")).toBe(true);
    expect(canDeleteCreditNote("POSTED")).toBe(false);
    expect(canDeleteCreditNote("CANCELLED")).toBe(false);
  });
});
