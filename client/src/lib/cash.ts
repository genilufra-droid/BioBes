export type CashAccount = { id: number; accountName: string; accountType: "BANK" | "CASH"; currentBalance: number | null; openingBalance: number | null };
export type CashPayment = { id: number; paymentNumber: string; paymentDate: Date | string; paymentType: "INBOUND" | "OUTBOUND"; method: "CASH" | "BANK" | "CARD" | "OTHER"; partnerName: string | null; amount: number; currency?: "ALL" | "EUR" | "USD" | "GBP" | string | null; exchangeRate?: number | string | null; status: "DRAFT" | "POSTED" | "CANCELLED"; reference: string | null };
export type CashSortField = "date" | "number" | "amount";
export type CashSortDirection = "asc" | "desc";

export function cashSummary(accounts: CashAccount[], payments: CashPayment[]) {
  const cashAccounts = accounts.filter(account => account.accountType === "CASH");
  const postedCashPayments = payments.filter(payment => payment.method === "CASH" && payment.status === "POSTED");
  const paymentInLek = (payment: CashPayment) => Math.round(payment.amount * (payment.currency === "ALL" ? 1 : Number(payment.exchangeRate || 1)));
  return {
    accountCount: cashAccounts.length,
    balance: cashAccounts.reduce((sum, account) => sum + (account.currentBalance || 0), 0),
    incoming: postedCashPayments.filter(payment => payment.paymentType === "INBOUND").reduce((sum, payment) => sum + paymentInLek(payment), 0),
    outgoing: postedCashPayments.filter(payment => payment.paymentType === "OUTBOUND").reduce((sum, payment) => sum + paymentInLek(payment), 0),
  };
}

export function filterCashPayments<T extends CashPayment>(payments: T[], search: string) {
  const term = search.trim().toLocaleLowerCase("sq-AL");
  return payments.filter(payment => payment.method === "CASH" && (!term || [payment.paymentNumber, payment.partnerName, payment.reference, payment.paymentType, payment.status].some(value => value?.toLocaleLowerCase("sq-AL").includes(term))));
}

export function sortCashPayments<T extends CashPayment>(payments: T[], field: CashSortField, direction: CashSortDirection) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...payments].sort((left, right) => {
    const leftValue = field === "date" ? new Date(left.paymentDate).getTime() : field === "amount" ? left.amount : left.paymentNumber.toLocaleLowerCase("sq-AL");
    const rightValue = field === "date" ? new Date(right.paymentDate).getTime() : field === "amount" ? right.amount : right.paymentNumber.toLocaleLowerCase("sq-AL");
    return (leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0) * multiplier;
  });
}
