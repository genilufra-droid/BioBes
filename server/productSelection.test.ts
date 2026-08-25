import { describe, expect, it } from "vitest";
import { linkCreatedProductToInvoiceLine } from "../shared/productSelection";

describe("quick product creation for invoice lines", () => {
  it("links the saved product ID to the active invoice line", () => {
    expect(linkCreatedProductToInvoiceLine({ id: 42, name: "Artikull i ri", baseUnit: "kuti" }, 1750)).toEqual({
      productId: 42,
      productName: "Artikull i ri",
      unit: "kuti",
      unitPrice: 1750,
    });
  });

  it("keeps the active line values normalized after quick creation", () => {
    expect(linkCreatedProductToInvoiceLine({ id: 43, name: "  Ferre e re  ", baseUnit: null }, -25)).toEqual({
      productId: 43,
      productName: "Ferre e re",
      unit: "copë",
      unitPrice: 0,
    });
  });

  it("does not accept an invalid saved product ID", () => {
    expect(() => linkCreatedProductToInvoiceLine({ id: 0, name: "Gabim" }, 0)).toThrow("ID-ja e artikullit");
  });
});
