import { describe, expect, it } from "vitest";
import { calculateBankBalanceDelta, calculateTransferBalances, canAddBankTransaction, canCancelBankDraft, canCancelCrmActivity, canCancelCrmLead, canConvertLead, canCreateBankStatement, canDeleteBankDraft, canDeleteCrmActivity, canDeleteCrmLead, canFinalizeBankStatement, canPostBankTransfer, canReconcileBankTransaction, crmStageProbabilities } from "./crmBanking";

describe("CRM and banking workflow helpers", () => {
  it("converts only open leads and provides stage probabilities", () => {
    expect(canConvertLead("LEAD", "QUALIFIED")).toBe(true);
    expect(canConvertLead("LEAD", "LOST")).toBe(false);
    expect(canConvertLead("OPPORTUNITY", "QUALIFIED")).toBe(false);
    expect(crmStageProbabilities.WON).toBe(100);
  });

  it("calculates signed bank balance movements", () => {
    expect(calculateBankBalanceDelta("CREDIT", 125)).toBe(125);
    expect(calculateBankBalanceDelta("DEBIT", 125)).toBe(-125);
    expect(() => calculateBankBalanceDelta("CREDIT", 0)).toThrow();
  });

  it("closes a bank statement only after all transactions are reconciled", () => {
    expect(canFinalizeBankStatement(["RECONCILED", "RECONCILED"])).toBe(true);
    expect(canFinalizeBankStatement(["RECONCILED", "UNRECONCILED"])).toBe(false);
    expect(canFinalizeBankStatement([])).toBe(false);
  });

  it("posts bank transfers only between distinct accounts with sufficient balance", () => {
    expect(canPostBankTransfer(500, 120, 1, 2)).toBe(true);
    expect(canPostBankTransfer(100, 120, 1, 2)).toBe(false);
    expect(canPostBankTransfer(500, 120, 1, 1)).toBe(false);
    expect(calculateTransferBalances(500, 75, 120)).toEqual({ source: 380, destination: 195 });
    expect(() => calculateTransferBalances(100, 75, 120)).toThrow();
  });

  it("covers the statement, transaction, reconciliation and transfer banking workflow", () => {
    expect(canCreateBankStatement(new Date("2026-01-01"), new Date("2026-01-31"))).toBe(true);
    expect(canCreateBankStatement(new Date("2026-02-01"), new Date("2026-01-31"))).toBe(false);
    expect(canAddBankTransaction("DRAFT", 85)).toBe(true);
    expect(canAddBankTransaction("RECONCILED", 85)).toBe(false);
    expect(canReconcileBankTransaction("DRAFT", "POSTED")).toBe(true);
    expect(canReconcileBankTransaction("DRAFT", "DRAFT")).toBe(false);
    expect(canFinalizeBankStatement(["RECONCILED"])).toBe(true);
    expect(calculateTransferBalances(300, 100, 75)).toEqual({ source: 225, destination: 175 });
  });

  it("permits cancellation and deletion only for draft bank documents without transactions", () => {
    expect(canCancelBankDraft("DRAFT")).toBe(true);
    expect(canCancelBankDraft("POSTED")).toBe(false);
    expect(canCancelBankDraft("DRAFT", true)).toBe(false);
    expect(canDeleteBankDraft("DRAFT")).toBe(true);
    expect(canDeleteBankDraft("RECONCILED")).toBe(false);
    expect(canDeleteBankDraft("DRAFT", true)).toBe(false);
  });

  it("protects CRM history during cancellation and deletion", () => {
    expect(canCancelCrmLead("NEW")).toBe(true);
    expect(canCancelCrmLead("LOST")).toBe(false);
    expect(canDeleteCrmLead("NEW", false)).toBe(true);
    expect(canDeleteCrmLead("QUALIFIED", false)).toBe(false);
    expect(canDeleteCrmLead("NEW", true)).toBe(false);
    expect(canCancelCrmActivity("PLANNED")).toBe(true);
    expect(canCancelCrmActivity("DONE")).toBe(false);
    expect(canDeleteCrmActivity("PLANNED")).toBe(true);
    expect(canDeleteCrmActivity("CANCELLED")).toBe(false);
  });
});
