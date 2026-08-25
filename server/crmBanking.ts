export const crmStageProbabilities: Record<string, number> = {
  NEW: 10,
  QUALIFIED: 35,
  PROPOSAL: 60,
  WON: 100,
  LOST: 0,
};

export function canConvertLead(leadType: string, stage: string): boolean {
  return leadType === "LEAD" && stage !== "LOST";
}

export function canCancelCrmLead(stage: string | null): boolean {
  return stage !== "LOST";
}

export function canDeleteCrmLead(stage: string | null, hasActivities: boolean): boolean {
  return stage === "NEW" && !hasActivities;
}

export function canCancelCrmActivity(status: string | null): boolean {
  return status === "PLANNED";
}

export function canDeleteCrmActivity(status: string | null): boolean {
  return status === "PLANNED";
}

export function calculateBankBalanceDelta(transactionType: "CREDIT" | "DEBIT", amount: number): number {
  if (amount <= 0) throw new Error("Vlera e transaksionit duhet të jetë pozitive");
  return transactionType === "CREDIT" ? amount : -amount;
}

export function canFinalizeBankStatement(transactionStatuses: string[]): boolean {
  return transactionStatuses.length > 0 && transactionStatuses.every(status => status === "RECONCILED");
}

export function canPostBankTransfer(sourceBalance: number, amount: number, sourceAccountId: number, destinationAccountId: number): boolean {
  return amount > 0 && sourceAccountId !== destinationAccountId && sourceBalance >= amount;
}

export function calculateTransferBalances(sourceBalance: number, destinationBalance: number, amount: number): { source: number; destination: number } {
  if (amount <= 0 || sourceBalance < amount) throw new Error("Transferi nuk mund të postohet");
  return { source: sourceBalance - amount, destination: destinationBalance + amount };
}

export function canCreateBankStatement(dateFrom: Date, dateTo: Date): boolean {
  return dateFrom.getTime() <= dateTo.getTime();
}

export function canAddBankTransaction(statementStatus: string, amount: number): boolean {
  return statementStatus === "DRAFT" && amount > 0;
}

export function canCancelBankDraft(status: string | null, hasTransactions = false): boolean {
  return status === "DRAFT" && !hasTransactions;
}

export function canDeleteBankDraft(status: string | null, hasTransactions = false): boolean {
  return status === "DRAFT" && !hasTransactions;
}

export function canReconcileBankTransaction(statementStatus: string, paymentStatus?: string): boolean {
  return statementStatus === "DRAFT" && (paymentStatus === undefined || paymentStatus === "POSTED");
}
