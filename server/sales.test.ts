import { describe, expect, it } from "vitest";
import { canCancelSalesOrder, canCancelSalesQuotation, canCancelSalesStockDocument, canConvertQuotation, canDeleteSalesDraft, canInvoiceDelivery, canInvoiceSalesOrder } from "./sales";

describe("sales workflow transitions", () => {
  it("allows a valid quotation to become one sales order only", () => {
    expect(canConvertQuotation("ACCEPTED", false)).toBe(true);
    expect(canConvertQuotation("ACCEPTED", true)).toBe(false);
    expect(canConvertQuotation("CANCELLED", false)).toBe(false);
  });

  it("allows a validated delivery to become one invoice only", () => {
    expect(canInvoiceDelivery("VALIDATED", false)).toBe(true);
    expect(canInvoiceDelivery("DRAFT", false)).toBe(false);
    expect(canInvoiceDelivery("VALIDATED", true)).toBe(false);
  });

  it("allows a confirmed sales order to become one invoice", () => {
    expect(canInvoiceSalesOrder("CONFIRMED", false)).toBe(true);
    expect(canInvoiceSalesOrder("DELIVERED", false)).toBe(true);
    expect(canInvoiceSalesOrder("DRAFT", false)).toBe(false);
    expect(canInvoiceSalesOrder("CONFIRMED", true)).toBe(false);
  });

  it("allows cancellation only before a quotation or order gains linked documents", () => {
    expect(canCancelSalesQuotation("DRAFT", false)).toBe(true);
    expect(canCancelSalesQuotation("SENT", false)).toBe(true);
    expect(canCancelSalesQuotation("ACCEPTED", false)).toBe(false);
    expect(canCancelSalesQuotation("DRAFT", true)).toBe(false);
    expect(canCancelSalesOrder("DRAFT", false)).toBe(true);
    expect(canCancelSalesOrder("CONFIRMED", false)).toBe(true);
    expect(canCancelSalesOrder("DELIVERED", false)).toBe(false);
    expect(canCancelSalesOrder("CONFIRMED", true)).toBe(false);
  });

  it("protects validated stock documents and non-draft records from destructive actions", () => {
    expect(canCancelSalesStockDocument("DRAFT")).toBe(true);
    expect(canCancelSalesStockDocument("VALIDATED")).toBe(false);
    expect(canDeleteSalesDraft("DRAFT")).toBe(true);
    expect(canDeleteSalesDraft("DRAFT", true)).toBe(false);
    expect(canDeleteSalesDraft("CONFIRMED")).toBe(false);
  });
});
