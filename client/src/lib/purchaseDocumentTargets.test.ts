import { describe, expect, it } from "vitest";
import { getPurchaseDocumentTarget } from "./purchaseDocumentTargets";

describe("purchase document navigation targets", () => {
  it("routes each purchase document type to its source workspace", () => {
    expect(getPurchaseDocumentTarget("Faturë", 11)).toEqual({ tab: "bills", query: { openInvoice: 11 } });
    expect(getPurchaseDocumentTarget("Porosi", 22)).toEqual({ tab: "orders", query: { openOrder: 22 } });
    expect(getPurchaseDocumentTarget("Pranim", 33)).toEqual({ tab: "receipts", query: {} });
    expect(getPurchaseDocumentTarget("Kthim", 44)).toEqual({ tab: "returns", query: {} });
  });
});
