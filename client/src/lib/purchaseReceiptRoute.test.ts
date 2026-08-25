import { describe, expect, it } from "vitest";
import { purchaseReceiptPath } from "./purchaseReceiptRoute";

describe("purchase receipt route", () => {
  it("opens the receipt tab with the selected purchase order", () => {
    expect(purchaseReceiptPath(42)).toBe("/purchase-invoices?tab=receipts&orderId=42");
  });
});
