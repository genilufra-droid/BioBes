export type JournalLineInput = { debit: number; credit: number };

export function summarizeJournalLines(lines: JournalLineInput[]) {
  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  return { totalDebit, totalCredit, isBalanced: totalDebit > 0 && totalDebit === totalCredit };
}

export function canPostJournalEntry(status: string | null, lines: JournalLineInput[]): boolean {
  return status === "DRAFT" && summarizeJournalLines(lines).isBalanced;
}

export function canCancelAccountingDraft(status: string | null): boolean {
  return status === "DRAFT";
}

export function canDeleteAccountingDraft(status: string | null): boolean {
  return status === "DRAFT";
}

export function calculateProfitAndLoss(revenue: number, expenses: number): number {
  return revenue - expenses;
}

export function getPaymentPostingLines(paymentType: "INBOUND" | "OUTBOUND", amount: number, cashAccountId: number, counterpartAccountId: number) {
  if (amount <= 0) throw new Error("Vlera e pagesës duhet të jetë pozitive");
  return paymentType === "INBOUND"
    ? [{ accountId: cashAccountId, debit: amount, credit: 0 }, { accountId: counterpartAccountId, debit: 0, credit: amount }]
    : [{ accountId: counterpartAccountId, debit: amount, credit: 0 }, { accountId: cashAccountId, debit: 0, credit: amount }];
}
