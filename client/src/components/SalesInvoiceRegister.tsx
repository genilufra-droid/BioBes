import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SourceDocumentLink from "@/components/SourceDocumentLink";
import type { SalesRegisterRow } from "@/pages/SalesInvoices";

const currencyLabel = (currency: string | null | undefined) => !currency || currency === "ALL" ? "L" : currency;
const money = (value: number | null | undefined, currency: string | null | undefined) => `${((value ?? 0) / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel(currency)}`;
const lek = (value: number | null | undefined, rate: number | string | null | undefined) => `${(((value ?? 0) * Number(rate || 1)) / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
const dateText = (value: Date | string | null | undefined) => value ? new Date(value).toLocaleDateString("sq-AL") : "—";

export default function SalesInvoiceRegister({
  companyId: _companyId,
  rows,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onOpenInvoice,
  onOpenActions,
}: {
  companyId: number;
  rows: SalesRegisterRow[];
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onOpenInvoice: (id: number) => void;
  onOpenActions: (id: number) => void;
}) {
  const filters = [{ value: "ALL", label: "Të gjitha" }, { value: "UNPAID", label: "E papaguar" }, { value: "LATER", label: "Më vonë" }, { value: "PAID", label: "E paguar" }];
  const headers = ["Data", "Nr. dokumentit", "Veprime", "Statusi", "Pagesa", "Kodi klientit", "Klienti", "Formati", "Monedha", "Kursi", "Kodi artikullit", "Artikulli", "Sasia / Njësia", "Çmimi", "Pa TVSH", "TVSH", "Me TVSH", "Në Lek", "Magazina", "Porosia", "Fletë-dalja"];
  const itemCounts = rows.reduce<Record<number, number>>((counts, row) => ({ ...counts, [row.invoiceId]: (counts[row.invoiceId] ?? 0) + 1 }), {});

  return <section className="overflow-hidden border border-[#879eac] bg-[#eef3f6] shadow-[1px_2px_5px_rgba(37,62,80,0.2)]" data-testid="sales-invoice-register">
    <div className="flex items-center justify-between border-b border-[#7f98a8] bg-gradient-to-b from-[#e8f2f7] to-[#c5d8e3] px-3 py-1.5">
      <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-[#56788b] bg-[#759caf]" /><p className="text-[12px] font-bold text-[#234b67]">Regjistri i faturave të shitjes</p></div>
      <span className="text-[11px] text-[#526b79]">{rows.length} rreshta · të dhëna reale të kompanisë</span>
    </div>
    <div className="flex flex-wrap items-center gap-1 border-b border-[#bdcbd2] bg-[#f7fafb] px-2 py-1.5">
      <Button type="button" size="sm" variant="outline" className="h-7 rounded-sm border-[#9eb0ba] bg-white px-2 text-[11px] text-[#315a75]" onClick={() => onSearchChange("")}><Search className="mr-1 h-3.5 w-3.5" />Kërko</Button>
      <span className="mx-1 h-5 border-l border-[#c7d2d8]" />
      <span className="mr-1 text-[11px] font-semibold text-[#526b79]">Gjendja:</span>
      {filters.map(filter => <button type="button" key={filter.value} onClick={() => onStatusChange(filter.value)} className={`h-7 rounded-sm border px-2 text-[11px] ${status === filter.value ? "border-[#5d7787] bg-[#6d8ea1] text-white" : "border-[#c0ccd2] bg-white text-[#526b79] hover:bg-[#eaf2f6]"}`}>{filter.label}</button>)}
      <div className="relative ml-auto w-full sm:w-72"><Search className="pointer-events-none absolute left-2 top-1.5 h-3.5 w-3.5 text-[#71818a]" /><Input aria-label="Kërko në regjistrin e Shitjeve" value={search} onChange={event => onSearchChange(event.target.value)} className="h-7 rounded-sm border-[#aebdc5] bg-white pl-7 text-[11px]" placeholder="Nr., klient ose artikull…" /></div>
      <SlidersHorizontal className="ml-1 h-4 w-4 text-[#71818a]" aria-hidden="true" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[2200px] border-collapse text-[11px]">
        <thead className="bg-[#cbdde6] text-[#234b67]"><tr>{headers.map(header => <th key={header} className="sticky top-0 h-9 whitespace-nowrap border border-[#9bb0bb] px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wide">{header}</th>)}</tr></thead>
        <tbody>{rows.length === 0 ? <tr><td colSpan={headers.length} className="h-32 border-b border-[#c7d3d9] bg-white text-center text-sm text-[#687982]">Nuk u gjet rresht në regjistrin e faturave të shitjes.</td></tr> : rows.map((row, index) => {
          const lineGross = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0;
          const vatShare = Math.round((row.vatAmount ?? 0) / (itemCounts[row.invoiceId] || 1));
          const lineNet = Math.max(0, lineGross - vatShare);
          const paymentStatus = row.status === "PAID" ? "PAID" : row.paymentStatus ?? "UNPAID";
          const paymentLabel = paymentStatus === "PAID" ? "E paguar" : paymentStatus === "LATER" ? "Më vonë" : "E papaguar";
          const rowClass = paymentStatus === "PAID" ? "bg-[#edf7df]" : paymentStatus === "LATER" ? "bg-[#fff8dc]" : "bg-white";
          return <tr key={`${row.invoiceId}-${row.itemId ?? "pa-artikull"}-${index}`} className={`${rowClass} border-b border-[#d4dde1] hover:bg-[#fff8e5]`}>
            <td className="whitespace-nowrap border-r border-[#d4dde1] px-2 py-1.5 text-center">{dateText(row.date)}</td>
            <td className="border-r border-[#d4dde1] px-2 py-1.5 text-center font-semibold"><SourceDocumentLink label={row.docNumber} onOpen={() => onOpenInvoice(row.invoiceId)} ariaLabel={`Hap faturën ${row.docNumber}`} className="rounded-sm border border-[#9a7772] bg-white px-1.5 py-0.5 no-underline shadow-sm hover:bg-[#6d4b64] hover:text-white" /></td>
            <td className="border-r border-[#d4dde1] px-2 py-1 text-center"><Button type="button" size="sm" variant="outline" className="h-6 rounded-sm border-[#b6c5cc] px-1.5 text-[10px]" onClick={() => onOpenActions(row.invoiceId)}>Veprime</Button></td>
            <td className="border-r border-[#d4dde1] px-2 py-1 text-center"><span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${row.status === "POSTED" || row.status === "PAID" ? "bg-[#dbeaf4] text-[#315f78]" : row.status === "CANCELLED" ? "bg-[#f9dddd] text-[#8b3a3a]" : "bg-[#f0ecef] text-[#625c62]"}`}>{row.status === "POSTED" ? "Postuar" : row.status === "PAID" ? "E paguar" : row.status === "CANCELLED" ? "Anuluar" : "Draft"}</span></td><td className="border-r border-[#d4dde1] px-2 py-1 text-center"><span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${paymentStatus === "PAID" ? "bg-[#519e57] text-white" : paymentStatus === "LATER" ? "bg-[#eabf43] text-[#4f3a00]" : "bg-[#e8e4e6] text-[#625c62]"}`}>{paymentLabel}</span></td>
            <td className="border-r border-[#d4dde1] px-2 py-1 text-center">{row.customerId ? String(row.customerId).padStart(3, "0") : "—"}</td><td className="border-r border-[#d4dde1] px-2 py-1 font-medium uppercase">{row.customerName || "—"}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-center font-semibold">{row.invoiceFormat === "EXPORT" ? "EXPORT" : "VENDASE"}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-center font-semibold">{currencyLabel(row.currency)}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-right">{Number(row.exchangeRate || 1).toFixed(6)}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-center">{row.productId ?? "—"}</td><td className="border-r border-[#d4dde1] px-2 py-1">{row.productName || "—"}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-right font-semibold">{row.quantity?.toLocaleString("sq-AL") ?? "—"} {row.unit || ""}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-right">{row.unitPrice === null ? "—" : money(row.unitPrice, row.currency)}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-right">{money(lineNet, row.currency)}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-right">{money(vatShare, row.currency)}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-right font-semibold">{money(lineGross, row.currency)}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-right font-semibold">{lek(lineGross, row.exchangeRate)}</td><td className="border-r border-[#d4dde1] px-2 py-1">{row.warehouseName || "—"}</td><td className="border-r border-[#d4dde1] px-2 py-1 text-center">{row.salesOrderId ?? "—"}</td><td className="px-2 py-1 text-center">{row.deliveryNoteId ?? "—"}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    <footer className="flex items-center justify-between border-t border-[#9eb0ba] bg-[#e6eef2] px-3 py-1.5 text-[11px] text-[#526b79]"><span>Dokumente: {new Set(rows.map(row => row.invoiceId)).size} · Rreshta artikujsh: {rows.length}</span><span>Nr. dokumentit është lidhja e hapjes ↗</span></footer>
  </section>;
}
