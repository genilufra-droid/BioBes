import type { PurchaseRegisterRow } from "@/pages/PurchaseInvoices";

export function PurchaseRegisterTotals({ rows }: { rows: PurchaseRegisterRow[] }) {
  const itemCounts = rows.reduce<Record<number, number>>((counts, row) => ({ ...counts, [row.invoiceId]: (counts[row.invoiceId] ?? 0) + 1 }), {});
  const totals = rows.reduce((summary, row) => { const net = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0; const vat = Math.round((row.vatAmount ?? 0) / itemCounts[row.invoiceId]); return { net: summary.net + net, vat: summary.vat + vat }; }, { net: 0, vat: 0 });
  const money = (cents: number) => `${(cents / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  return <section className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 rounded-md border border-[#d8d0d2] bg-white px-4 py-3 text-sm"><span className="text-[#777]">Totale sipas filtrave aktivë</span><span><b>Pa TVSH:</b> {money(totals.net)}</span><span><b>TVSH:</b> {money(totals.vat)}</span><span className="font-semibold text-[#714b67]"><b>Me TVSH:</b> {money(totals.net + totals.vat)}</span></section>;
}
