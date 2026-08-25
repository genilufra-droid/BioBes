import { describe, expect, it } from "vitest";
import { getSalesInvoiceRouteId } from "./salesInvoiceRoute";

describe("sales invoice route", () => {
  it("reads the report source invoice id", () => {
    expect(getSalesInvoiceRouteId("?openInvoice=30068")).toBe(30068);
  });

  it("supports the legacy invoice alias", () => {
    expect(getSalesInvoiceRouteId("invoice=30068")).toBe(30068);
  });

  it("rejects missing, zero and invalid ids", () => {
    expect(getSalesInvoiceRouteId("")).toBeNull();
    expect(getSalesInvoiceRouteId("?openInvoice=0")).toBeNull();
    expect(getSalesInvoiceRouteId("?openInvoice=abc")).toBeNull();
  });
});
