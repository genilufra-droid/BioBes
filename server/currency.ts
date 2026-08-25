export const BASE_CURRENCY = "ALL";

export type InvoiceCurrency = { currency: string; exchangeRate: number };

export function normalizeInvoiceCurrency(currency?: string, exchangeRate?: number | string): InvoiceCurrency {
  const normalized = (currency || BASE_CURRENCY).trim().toUpperCase();
  if (!/^[A-Z]{3,10}$/.test(normalized)) throw new Error("Monedha duhet të jetë kod i vlefshëm, p.sh. ALL, EUR ose USD.");
  const rate = normalized === BASE_CURRENCY ? 1 : Number(exchangeRate);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`Kursi i këmbimit është i detyrueshëm për ${normalized} dhe duhet të jetë më i madh se 0.`);
  return { currency: normalized, exchangeRate: Number(rate.toFixed(6)) };
}

export function convertMinorUnitsToBase(amountMinorUnits: number, exchangeRate: number): number {
  if (!Number.isFinite(amountMinorUnits) || !Number.isFinite(exchangeRate) || exchangeRate <= 0) throw new Error("Shuma dhe kursi duhet të jenë të vlefshëm.");
  return Math.round(amountMinorUnits * exchangeRate);
}
