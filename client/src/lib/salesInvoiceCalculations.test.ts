import { describe, expect, it } from "vitest";
import { calculateSalesLineAmounts, calculateSalesTotals, formatStockLabel, getDefaultWarehouseId } from "./salesInvoiceCalculations";

describe("sales invoice calculations", () => {
  it("recalculates net, VAT and gross when quantity or price changes", () => {
    expect(calculateSalesLineAmounts(3, 100)).toEqual({ net: 300, vat: 60, gross: 360 });
    expect(calculateSalesLineAmounts(5, 125)).toEqual({ net: 625, vat: 125, gross: 750 });
  });

  it("aggregates invoice line totals", () => {
    expect(calculateSalesTotals([{ quantity: 2, unitPrice: 100 }, { quantity: 1, unitPrice: 50 }])).toEqual({ net: 250, vat: 50, gross: 300 });
  });

  it("formats the real stock label with unit", () => {
    expect(formatStockLabel(1250, "koli")).toMatch(/^Stok:\s*1[. ]?250 koli$/);
    expect(formatStockLabel(null, null)).toBe("Stok: 0 copë");
  });

  it("selects the first real warehouse after the async list loads", () => {
    expect(getDefaultWarehouseId([{ id: 1 }, { id: 30001 }])).toBe("1");
    expect(getDefaultWarehouseId([])).toBe("");
    expect(getDefaultWarehouseId(undefined)).toBe("");
  });
});
