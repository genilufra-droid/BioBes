import type { PurchaseRegisterRow } from "@/pages/PurchaseInvoices";

export type PurchaseSupplierSummaryData = {
  invoiceCount: number;
  supplierCount: number;
  billed: number;
  paid: number;
  unpaid: number;
  later: number;
  items: Array<{ productName: string; unit: string; quantity: number; value: number }>;
};

type InvoiceSummary = {
  supplierName: string;
  total: number;
  vat: number;
  paymentStatus: "PAID" | "UNPAID" | "LATER";
};

function toLek(cents: number, exchangeRate: number | string | null | undefined) {
  return Math.round(cents * Number(exchangeRate || 1));
}

function money(cents: number) {
  return `${(cents / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
}

function getPaymentStatus(row: PurchaseRegisterRow): InvoiceSummary["paymentStatus"] {
  if (row.status === "PAID" || row.paymentStatus === "PAID") return "PAID";
  if (row.paymentStatus === "LATER") return "LATER";
  return "UNPAID";
}

export function summarizePurchaseRegisterRows(rows: PurchaseRegisterRow[]): PurchaseSupplierSummaryData {
  const invoices = new Map<number, InvoiceSummary>();
  const items = new Map<string, { productName: string; unit: string; quantity: number; value: number }>();

  rows.forEach(row => {
    if (!invoices.has(row.invoiceId)) {
      invoices.set(row.invoiceId, {
        supplierName: row.supplierName || "Pa furnitor",
        total: toLek(row.invoiceTotalAmount ?? 0, row.exchangeRate),
        vat: toLek(row.vatAmount ?? 0, row.exchangeRate),
        paymentStatus: getPaymentStatus(row),
      });
    }
    const key = `${row.productId ?? "none"}:${row.productName ?? "Pa artikull"}`;
    const existing = items.get(key) ?? { productName: row.productName || "Pa artikull", unit: row.unit || "—", quantity: 0, value: 0 };
    existing.quantity += row.quantity ?? 0;
    existing.value += toLek(row.lineTotalAmount ?? 0, row.exchangeRate);
    items.set(key, existing);
  });

  const invoiceValues = Array.from(invoices.values());
  const gross = (invoice: InvoiceSummary) => invoice.total + invoice.vat;
  const totals = {
    billed: invoiceValues.reduce((sum, invoice) => sum + gross(invoice), 0),
    paid: invoiceValues.filter(invoice => invoice.paymentStatus === "PAID").reduce((sum, invoice) => sum + gross(invoice), 0),
    unpaid: invoiceValues.filter(invoice => invoice.paymentStatus === "UNPAID").reduce((sum, invoice) => sum + gross(invoice), 0),
    later: invoiceValues.filter(invoice => invoice.paymentStatus === "LATER").reduce((sum, invoice) => sum + gross(invoice), 0),
  };
  const supplierNames = Array.from(new Set(invoiceValues.map(invoice => invoice.supplierName)));
  return { invoiceCount: invoiceValues.length, supplierCount: supplierNames.length, billed: totals.billed, paid: totals.paid, unpaid: totals.unpaid, later: totals.later, items: Array.from(items.values()) };
}

export function PurchaseSupplierSummary({ rows, supplierQuery }: { rows: PurchaseRegisterRow[]; supplierQuery: string }) {
  const summary = summarizePurchaseRegisterRows(rows);
  const quantityByUnit = Array.from(summary.items.reduce((map, item) => map.set(item.unit, (map.get(item.unit) ?? 0) + item.quantity), new Map<string, number>()).entries());
  const quantityText = quantityByUnit.length ? quantityByUnit.map(([unit, quantity]) => `${quantity.toLocaleString("sq-AL")} ${unit}`).join(" · ") : "0";
  const title = supplierQuery.trim() ? `Përmbledhje për furnitorin “${supplierQuery.trim()}”` : "Përmbledhje sipas furnitorit";

  return <section className="space-y-4 rounded-md border border-[#d8d0d2] bg-white p-4" aria-label="Përmbledhje sipas furnitorit">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-sm font-semibold text-[#343434]">{title}</h2><p className="mt-1 text-xs text-[#777]">Përmbledhja ndjek filtrat aktivë të regjistrit dhe llogarit çdo faturë vetëm një herë.</p></div>
      <div className="text-right text-xs text-[#777]"><span className="font-semibold text-[#343434]">{summary.supplierCount}</span> furnitorë · <span className="font-semibold text-[#343434]">{summary.invoiceCount}</span> fatura</div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-md border border-violet-200 bg-violet-50 p-3"><p className="text-xs text-violet-700">Sasia totale e blerë</p><p className="mt-1 text-lg font-semibold text-violet-900">{quantityText}</p></div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-[#777]">Vlera e faturave</p><p className="mt-1 text-lg font-semibold text-[#343434]">{money(summary.billed)}</p><p className="mt-1 text-[11px] text-[#777]">Ekuivalent në Lek</p></div>
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs text-emerald-700">Paguar</p><p className="mt-1 text-lg font-semibold text-emerald-800">{money(summary.paid)}</p><p className="mt-1 text-[11px] text-[#777]">Ekuivalent në Lek</p></div>
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3"><p className="text-xs text-amber-700">Papaguar</p><p className="mt-1 text-lg font-semibold text-amber-800">{money(summary.unpaid)}</p><p className="mt-1 text-[11px] text-[#777]">Ekuivalent në Lek</p></div>
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3"><p className="text-xs text-blue-700">Pagesë më vonë</p><p className="mt-1 text-lg font-semibold text-blue-800">{money(summary.later)}</p><p className="mt-1 text-[11px] text-[#777]">Ekuivalent në Lek</p></div>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="border-b text-left text-[#777]"><tr><th className="p-2">Artikulli i blerë</th><th className="p-2">Njësia</th><th className="p-2 text-right">Sasia</th><th className="p-2 text-right">Çmimi mesatar</th><th className="p-2 text-right">Vlera</th></tr></thead><tbody>{summary.items.length === 0 ? <tr><td colSpan={5} className="p-5 text-center text-[#777]">Nuk ka artikuj për filtrat aktivë.</td></tr> : summary.items.map(item => <tr key={`${item.productName}-${item.unit}`} className="border-b last:border-0"><td className="p-2 font-medium">{item.productName}</td><td className="p-2">{item.unit}</td><td className="p-2 text-right">{item.quantity}</td><td className="p-2 text-right">{money(item.quantity ? Math.round(item.value / item.quantity) : 0)}</td><td className="p-2 text-right font-medium">{money(item.value)}</td></tr>)}</tbody></table></div>
  </section>;
}
