import { describe, expect, it } from "vitest";
import { calculateProfitAndLoss, canCancelAccountingDraft, canDeleteAccountingDraft, canPostJournalEntry, getPaymentPostingLines, summarizeJournalLines } from "./accounting";
import { getDefaultAccountingSetupBlueprint } from "./db";

describe("accounting workflow helpers", () => {
  it("summarizes and balances double-entry journal lines", () => {
    expect(summarizeJournalLines([{ debit: 100, credit: 0 }, { debit: 0, credit: 100 }])).toEqual({ totalDebit: 100, totalCredit: 100, isBalanced: true });
    expect(summarizeJournalLines([{ debit: 90, credit: 0 }, { debit: 0, credit: 100 }]).isBalanced).toBe(false);
  });

  it("posts only balanced draft journal entries", () => {
    const lines = [{ debit: 50, credit: 0 }, { debit: 0, credit: 50 }];
    expect(canPostJournalEntry("DRAFT", lines)).toBe(true);
    expect(canPostJournalEntry("POSTED", lines)).toBe(false);
    expect(canPostJournalEntry("DRAFT", [{ debit: 40, credit: 0 }, { debit: 0, credit: 50 }])).toBe(false);
  });

  it("permits cancellation and deletion only while the accounting document is draft", () => {
    expect(canCancelAccountingDraft("DRAFT")).toBe(true);
    expect(canCancelAccountingDraft("POSTED")).toBe(false);
    expect(canCancelAccountingDraft("CANCELLED")).toBe(false);
    expect(canDeleteAccountingDraft("DRAFT")).toBe(true);
    expect(canDeleteAccountingDraft("POSTED")).toBe(false);
  });

  it("calculates the net profit from revenue and expenses", () => {
    expect(calculateProfitAndLoss(1000, 650)).toBe(350);
    expect(calculateProfitAndLoss(200, 300)).toBe(-100);
  });

  it("creates balanced accounting lines for inbound and outbound payments", () => {
    expect(getPaymentPostingLines("INBOUND", 125, 1, 2)).toEqual([{ accountId: 1, debit: 125, credit: 0 }, { accountId: 2, debit: 0, credit: 125 }]);
    expect(getPaymentPostingLines("OUTBOUND", 125, 1, 3)).toEqual([{ accountId: 3, debit: 125, credit: 0 }, { accountId: 1, debit: 0, credit: 125 }]);
  });

  it("keeps the required account codes for cash, bank, receivables and payables", () => {
    const setup = getDefaultAccountingSetupBlueprint();
    expect(setup.accounts.map(account => account.code)).toEqual(expect.arrayContaining(["1000", "1100", "1200", "2000"]));
    expect(setup.journals.map(journal => journal.journalType)).toEqual(expect.arrayContaining(["CASH", "BANK", "GENERAL"]));
  });
});
