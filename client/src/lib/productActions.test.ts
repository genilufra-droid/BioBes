import { describe, expect, it } from "vitest";
import { canDeleteProduct, getOpenProductId } from "./productActions";

describe("product actions", () => {
  it("parses only positive integer openProduct ids", () => {
    expect(getOpenProductId("?openProduct=105")).toBe(105);
    expect(getOpenProductId("?openProduct=0")).toBe(0);
    expect(getOpenProductId("?openProduct=abc")).toBe(0);
    expect(getOpenProductId("")).toBe(0);
  });

  it("allows deletion only for an unused zero-stock product", () => {
    expect(canDeleteProduct({ stock: 0 }, false)).toBe(true);
    expect(canDeleteProduct({ stock: null }, false)).toBe(true);
    expect(canDeleteProduct({ stock: 1 }, false)).toBe(false);
    expect(canDeleteProduct({ stock: 0 }, true)).toBe(false);
  });
});
