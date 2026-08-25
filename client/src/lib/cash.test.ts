import { describe, expect, it } from "vitest";
import { cashSummary, filterCashPayments, sortCashPayments } from "./cash";

describe("cash panel helpers", () => {
  const accounts = [{ id: 1, accountName: "Arka Qendrore", accountType: "CASH" as const, currentBalance: 550, openingBalance: 100 }, { id: 2, accountName: "Banka", accountType: "BANK" as const, currentBalance: 1200, openingBalance: 0 }];
  const payments = [{ id: 1, paymentNumber: "P-1", paymentDate: "2026-08-20", paymentType: "INBOUND" as const, method: "CASH" as const, partnerName: "Klienti", amount: 120, status: "POSTED" as const, reference: "F-1" }, { id: 2, paymentNumber: "P-2", paymentDate: "2026-08-20", paymentType: "OUTBOUND" as const, method: "CASH" as const, partnerName: "Furnitori", amount: 40, status: "POSTED" as const, reference: null }, { id: 3, paymentNumber: "P-3", paymentDate: "2026-08-20", paymentType: "INBOUND" as const, method: "BANK" as const, partnerName: "Klienti", amount: 500, status: "POSTED" as const, reference: null }];

  it("përmbledh vetëm llogaritë dhe pagesat CASH të postuara", () => {
    expect(cashSummary(accounts, payments)).toEqual({ accountCount: 1, balance: 550, incoming: 120, outgoing: 40 });
  });

  it("konverton pagesat në valutë të huaj në përmbledhje sipas kursit", () => {
    const foreignPayments = [{ ...payments[0], amount: 100, currency: "EUR", exchangeRate: "100.500000" }];
    expect(cashSummary(accounts, foreignPayments).incoming).toBe(10050);
  });

  it("filtron vetëm pagesat CASH sipas kërkimit", () => {
    expect(filterCashPayments(payments, "furnitori")).toHaveLength(1);
    expect(filterCashPayments(payments, "p-3")).toHaveLength(0);
  });

  it("rendit regjistrin pa ndryshuar listën burimore", () => {
    const sorted = sortCashPayments(payments, "amount", "desc");
    expect(sorted.map(payment => payment.paymentNumber)).toEqual(["P-3", "P-1", "P-2"]);
    expect(payments[0].paymentNumber).toBe("P-1");
  });
});
