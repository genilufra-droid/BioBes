import type { SalesRegisterRow } from "@/pages/SalesInvoices";

const money = (value: number) => `${(value / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;

export default function SalesRegisterTotals({ rows }: { rows: SalesRegisterRow[] }) {
  const invoiceIds = new Set(rows.map(row => row.invoiceId));
  const documentTotal = Array.from(new Map(rows.map(row => [row.invoiceId, row.invoiceTotalAmount ?? 0])).values()).reduce((sum, value) => sum + value, 0);
  const lekTotal = Array.from(new Map(rows.map(row => [row.invoiceId, Math.round((row.invoiceTotalAmount ?? 0) * Number(row.exchangeRate || 1))])).values()).reduce((sum, value) => sum + value, 0);
  const quantityTotal = rows.reduce((sum, row) => sum + (row.quantity ?? 0), 0);
  return <div className="grid gap-2 border border-[#9eafb9] bg-[#e8eef2] px-4 py-2 text-[11px] sm:grid-cols-4" data-alpha-sales-totals data-testid="sales-register-totals"><div><span className="block text-[10px] uppercase tracking-wide text-[#526b79]">Fatura</span><strong className="text-[#234b67]">{invoiceIds.size}</strong></div><div><span className="block text-[10px] uppercase tracking-wide text-[#526b79]">Sasi</span><strong className="text-[#234b67]">{quantityTotal.toLocaleString("sq-AL")}</strong></div><div><span className="block text-[10px] uppercase tracking-wide text-[#526b79]">Vlera e filtruar</span><strong className="text-[#234b67]">{money(documentTotal)}</strong></div><div><span className="block text-[10px] uppercase tracking-wide text-[#526b79]">Vlera në Lek</span><strong className="text-[#234b67]">{money(lekTotal)}</strong></div></div>;
}
