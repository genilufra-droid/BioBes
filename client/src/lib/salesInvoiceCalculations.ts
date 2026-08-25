export const SALES_VAT_RATE = 0.2;

export type SalesLineAmount = {
  net: number;
  vat: number;
  gross: number;
};

export function calculateSalesLineAmounts(quantity: number, unitPrice: number, vatRate = SALES_VAT_RATE): SalesLineAmount {
  const safeQuantity = Math.max(0, Number(quantity) || 0);
  const safeUnitPrice = Math.max(0, Number(unitPrice) || 0);
  const net = safeQuantity * safeUnitPrice;
  const vat = net * vatRate;
  return { net, vat, gross: net + vat };
}

export function calculateSalesTotals(lines: Array<{ quantity: number; unitPrice: number }>, vatRate = SALES_VAT_RATE): SalesLineAmount {
  return lines.reduce<SalesLineAmount>((totals, line) => {
    const amount = calculateSalesLineAmounts(line.quantity, line.unitPrice, vatRate);
    return { net: totals.net + amount.net, vat: totals.vat + amount.vat, gross: totals.gross + amount.gross };
  }, { net: 0, vat: 0, gross: 0 });
}

export function formatStockLabel(stock: number | null | undefined, unit: string | null | undefined): string {
  return `Stok: ${Number(stock ?? 0).toLocaleString("sq-AL")} ${unit || "copë"}`;
}

export function getDefaultWarehouseId(warehouses: Array<{ id: number }> | undefined): string {
  return warehouses?.[0]?.id ? String(warehouses[0].id) : "";
}
