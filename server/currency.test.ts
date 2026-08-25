import { describe, expect, it } from "vitest";
import { convertMinorUnitsToBase, normalizeInvoiceCurrency } from "./currency";

describe("invoice currency", () => {
  it("uses rate 1 for ALL", () => {
    expect(normalizeInvoiceCurrency("ALL")).toEqual({ currency: "ALL", exchangeRate: 1 });
  });
  it("requires a positive rate for foreign currencies", () => {
    expect(normalizeInvoiceCurrency("EUR", 102.45)).toEqual({ currency: "EUR", exchangeRate: 102.45 });
    expect(normalizeInvoiceCurrency("USD", "95.1")).toEqual({ currency: "USD", exchangeRate: 95.1 });
    expect(() => normalizeInvoiceCurrency("EUR", 0)).toThrow("Kursi i këmbimit");
    expect(() => normalizeInvoiceCurrency("USD", undefined)).toThrow("Kursi i këmbimit");
  });
  it("converts minor document units to base currency units", () => {
    expect(convertMinorUnitsToBase(10000, 102.45)).toBe(1024500);
  });
});
