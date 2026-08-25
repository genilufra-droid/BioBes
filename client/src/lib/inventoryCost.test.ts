import { describe, expect, it } from "vitest";
import { getProductCostCents, getStockValueCents } from "./inventoryCost";

describe("inventory cost", () => {
  it("uses average purchase cost when available", () => {
    expect(getProductCostCents({ avgPrice: 1250, lastPrice: 1400 })).toBe(1250);
    expect(getStockValueCents({ avgPrice: 1250 }, 8)).toBe(10000);
  });

  it("falls back to the last recorded purchase cost", () => {
    expect(getProductCostCents({ avgPrice: 0, lastPrice: 875 })).toBe(875);
  });

  it("rounds minor-unit stock value deterministically", () => {
    expect(getStockValueCents({ avgPrice: 333 }, 2.5)).toBe(833);
  });
});
