import { describe, expect, it } from "vitest";
import { calculateSalesLineAmounts, formatSalesCustomerLabel, getSalesCustomerAggregationKey } from "./salesReportMath";

describe("sales report monetary calculations", () => {
  it("keeps the customer code and customer name in the customer column", () => {
    expect(formatSalesCustomerLabel("WALDLAND", "WALDLAND GmbH")).toBe("WALDLAND · WALDLAND GmbH");
    expect(formatSalesCustomerLabel(null, "NUTRECO")).toBe("NUTRECO");
    expect(formatSalesCustomerLabel(null, null)).toBe("Pa klient");
  });

  it("groups customer reports by stable customer identity", () => {
    expect(getSalesCustomerAggregationKey(12, "ANA")).toBe("12");
    expect(getSalesCustomerAggregationKey(13, "ANA")).toBe("13");
    expect(getSalesCustomerAggregationKey(null, "ANA")).toBe("ANA");
    expect(getSalesCustomerAggregationKey(null, null)).toBe("Pa klient");
  });

  it("separates domestic gross, VAT and net values from imported line VAT", () => {
    const amounts = calculateSalesLineAmounts(
      { invoiceFormat: "DOMESTIC", currency: "ALL", totalAmount: 12000, vatAmount: 2000 },
      { totalPrice: 12000, vatAmount: 2000 },
    );
    expect(amounts).toEqual({ gross: 12000, vat: 2000, net: 10000, baseGross: 12000, baseNet: 10000, baseVat: 2000, rate: 1 });
  });

  it("allocates invoice VAT proportionally when a legacy row has no line VAT", () => {
    const amounts = calculateSalesLineAmounts(
      { invoiceFormat: "DOMESTIC", currency: "ALL", totalAmount: 12000, vatAmount: 2000 },
      { totalPrice: 6000, vatAmount: 0 },
    );
    expect(amounts.net).toBe(5000);
    expect(amounts.vat).toBe(1000);
  });

  it("keeps export invoices VAT-free and converts EUR totals to base currency", () => {
    const amounts = calculateSalesLineAmounts(
      { invoiceFormat: "EXPORT", currency: "EUR", exchangeRate: "100.5", totalAmount: 9413750, vatAmount: 0 },
      { totalPrice: 9413750, vatAmount: 0 },
    );
    expect(amounts.vat).toBe(0);
    expect(amounts.net).toBe(9413750);
    expect(amounts.baseGross).toBe(Math.round(9413750 * 100.5));
    expect(amounts.baseVat).toBe(0);
  });
});
