import { describe, expect, it } from "vitest";
import {
  buildReportInvoicePaymentTotals,
  getReportPaymentStatus,
  resolveReportInvoicePayment,
  type ReportInvoicePaymentRecord,
  type ReportPaymentRecord,
} from "./db";

const invoice = (overrides: Partial<ReportInvoicePaymentRecord> = {}): ReportInvoicePaymentRecord => ({
  id: 1,
  docNumber: "BL-01",
  totalAmount: 10_000,
  vatAmount: 2_000,
  currency: "ALL",
  exchangeRate: 1,
  status: "POSTED",
  paymentStatus: "UNPAID",
  ...overrides,
});

const payment = (overrides: Partial<ReportPaymentRecord> = {}): ReportPaymentRecord => ({
  reference: "BL-01",
  paymentType: "OUTBOUND",
  partnerType: "SUPPLIER",
  amount: 0,
  currency: "ALL",
  exchangeRate: 1,
  status: "POSTED",
  ...overrides,
});

describe("report invoice payment aggregation", () => {
  it("matches a full payment case-insensitively and includes VAT in the billed amount", () => {
    const source = invoice();
    const totals = buildReportInvoicePaymentTotals([source], [payment({ reference: " bl-01 ", amount: 12_000 })], "OUTBOUND", "SUPPLIER");
    const resolved = resolveReportInvoicePayment(source, totals);

    expect(resolved).toMatchObject({ billed: 12_000, paid: 12_000, remaining: 0, billedBase: 12_000, paidBase: 12_000 });
    expect(getReportPaymentStatus(source, resolved.remaining)).toBe("E paguar");
  });

  it("sums partial payments, ignores cancelled payments, and reports the remaining amount", () => {
    const source = invoice({ totalAmount: 20_000, vatAmount: 0 });
    const totals = buildReportInvoicePaymentTotals(
      [source],
      [payment({ amount: 7_000 }), payment({ amount: 3_000 }), payment({ amount: 99_000, status: "CANCELLED" })],
      "OUTBOUND",
      "SUPPLIER",
    );
    const resolved = resolveReportInvoicePayment(source, totals);

    expect(resolved).toMatchObject({ billed: 20_000, paid: 10_000, remaining: 10_000 });
    expect(getReportPaymentStatus(source, resolved.remaining)).toBe("Pjesërisht");
  });

  it("does not allocate an unmatched payment to an invoice report row", () => {
    const source = invoice({ totalAmount: 20_000, vatAmount: 0 });
    const totals = buildReportInvoicePaymentTotals(
      [source],
      [payment({ reference: "BL-OTHER", amount: 20_000 })],
      "OUTBOUND",
      "SUPPLIER",
    );
    const resolved = resolveReportInvoicePayment(source, totals);

    expect(resolved).toMatchObject({ billed: 20_000, paid: 0, remaining: 20_000 });
    expect(getReportPaymentStatus(source, resolved.remaining)).toBe("E papaguar");
  });

  it("converts a payment to the invoice currency while retaining the base amount", () => {
    const source = invoice({ currency: "EUR", exchangeRate: 100 });
    const totals = buildReportInvoicePaymentTotals([source], [payment({ amount: 5_000, exchangeRate: 1 })], "OUTBOUND", "SUPPLIER");
    const resolved = resolveReportInvoicePayment(source, totals);

    expect(resolved).toMatchObject({ paid: 50, paidBase: 5_000, remaining: 11_950 });
  });

  it("uses the persisted PAID flag as a safe fallback when a legacy payment row is missing", () => {
    const source = invoice({ status: "PAID", paymentStatus: "PAID" });
    const resolved = resolveReportInvoicePayment(source, new Map());

    expect(resolved).toMatchObject({ billed: 12_000, paid: 12_000, remaining: 0 });
    expect(getReportPaymentStatus(source, resolved.remaining)).toBe("E paguar");
  });
});
