import { describe, expect, it } from "vitest";
import { calculatePurchaseTotal, canApplyStockReduction, summarizeDocumentStatuses } from "./purchase";

describe("purchase workflow calculations", () => {
  it("calculates an order total in cents", () => {
    expect(calculatePurchaseTotal([
      { quantity: 3, unitPrice: 1250 },
      { quantity: 2, unitPrice: 499 },
    ])).toBe(4748);
  });

  it("does not accept empty or invalid order lines", () => {
    expect(() => calculatePurchaseTotal([])).toThrow("të paktën një artikull");
    expect(() => calculatePurchaseTotal([{ quantity: 0, unitPrice: 100 }])).toThrow("Sasia");
    expect(() => calculatePurchaseTotal([{ quantity: 1, unitPrice: -1 }])).toThrow("Çmimi");
  });

  it("prevents a validated supplier return from creating negative stock", () => {
    expect(canApplyStockReduction(10, 3)).toBe(true);
    expect(canApplyStockReduction(2, 3)).toBe(false);
  });

  it("groups report documents by their workflow status", () => {
    expect(summarizeDocumentStatuses([
      { status: "DRAFT", totalAmount: 1000 },
      { status: "DRAFT", totalAmount: 2500 },
      { status: "PAID", totalAmount: 3000 },
      { status: null },
    ])).toEqual({
      DRAFT: { count: 3, totalAmount: 3500 },
      PAID: { count: 1, totalAmount: 3000 },
    });
  });
});
