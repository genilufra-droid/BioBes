export type SalesImportIdentityInput = {
  docNumber: string;
  date: Date | string | number;
  invoiceFormat: string;
  customerName?: string | null;
};

export const normalizeSalesImportValue = (value: unknown) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("sq-AL")
  .replace(/[^a-z0-9]+/g, "");

export const salesImportDateKey = (value: Date | string | number) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "invalid-date" : date.toISOString().slice(0, 10).replace(/-/g, "");
};

export const salesInvoiceImportIdentity = (invoice: SalesImportIdentityInput) => [
  normalizeSalesImportValue(invoice.docNumber),
  salesImportDateKey(invoice.date),
  normalizeSalesImportValue(invoice.invoiceFormat),
  normalizeSalesImportValue(invoice.customerName),
].join("::");

export const salesImportRowsOverlap = (existingRows: unknown, incomingRows: number[]) => {
  if (!Array.isArray(existingRows) || incomingRows.length === 0) return false;
  const incoming = new Set(incomingRows.map(row => Number(row)).filter(Number.isFinite));
  return existingRows.some(row => incoming.has(Number(row)));
};

export const allocateSalesImportDocNumber = (baseNumber: string, date: Date | string | number, usedNumbers: Set<string>) => {
  const base = String(baseNumber).trim();
  const normalized = normalizeSalesImportValue(base);
  if (!usedNumbers.has(normalized)) {
    usedNumbers.add(normalized);
    return base;
  }
  const dateSuffix = salesImportDateKey(date);
  let candidate = `${base}-${dateSuffix}`;
  let serial = 2;
  while (usedNumbers.has(normalizeSalesImportValue(candidate))) {
    candidate = `${base}-${dateSuffix}-${serial}`;
    serial += 1;
  }
  usedNumbers.add(normalizeSalesImportValue(candidate));
  return candidate;
};
