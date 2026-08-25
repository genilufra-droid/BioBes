export type SalesLineAmounts = {
  gross: number;
  vat: number;
  net: number;
  baseGross: number;
  baseNet: number;
  baseVat: number;
  rate: number;
};

export function formatSalesCustomerLabel(code: string | null | undefined, name: string | null | undefined, fallback = "Pa klient") {
  const values = [code?.trim(), name?.trim()].filter(Boolean) as string[];
  return values.length > 0 ? Array.from(new Set(values)).join(" · ") : fallback;
}

export function getSalesCustomerAggregationKey(customerId: number | null | undefined, customerName: string | null | undefined) {
  if (customerId != null) return String(customerId);
  const normalizedName = String(customerName || "").trim();
  return normalizedName || "Pa klient";
}

export function calculateSalesLineAmounts(invoice: {
  invoiceFormat?: string | null;
  currency?: string | null;
  exchangeRate?: number | string | null;
  totalAmount?: number | null;
  vatAmount?: number | null;
}, item: { totalPrice?: number | null; vatAmount?: number | null }): SalesLineAmounts {
  const gross = Number(item.totalPrice || 0);
  const lineVat = Number(item.vatAmount || 0);
  const invoiceVat = Number(invoice.vatAmount || 0);
  const invoiceTotal = Math.max(Number(invoice.totalAmount || 0), 1);
  const vat = lineVat > 0 ? lineVat : invoice.invoiceFormat === "EXPORT" ? 0 : invoiceVat > 0 ? Math.round(gross * invoiceVat / invoiceTotal) : 0;
  const net = Math.max(0, gross - vat);
  const rate = invoice.currency === "ALL" || !invoice.currency ? 1 : Number(invoice.exchangeRate || 1);
  return { gross, vat, net, baseGross: Math.round(gross * rate), baseNet: Math.round(net * rate), baseVat: Math.round(vat * rate), rate };
}
