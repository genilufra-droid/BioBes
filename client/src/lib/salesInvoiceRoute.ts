export function getSalesInvoiceRouteId(search: string): number | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const value = Number(params.get("openInvoice") || params.get("invoice") || 0);
  return Number.isInteger(value) && value > 0 ? value : null;
}
