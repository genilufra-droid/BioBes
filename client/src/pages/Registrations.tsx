import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Archive, BookOpen, ChevronRight, FileText, Package, ReceiptText, RotateCcw, Search, ShoppingCart, WalletCards } from "lucide-react";
import { trpc } from "@/lib/trpc";

type RegisterKey = "sales" | "purchases" | "stock" | "accounting" | "payments" | "archive";
type RegisterRow = Record<string, unknown> & { _id?: number; _path?: string };
type RegisterItem = { key: RegisterKey; group: string; title: string; description: string; icon: typeof ReceiptText; color: string };

const registrationItems: RegisterItem[] = [
  { key: "sales", group: "Shitje", title: "Regjistrime të shitjes", description: "Fatura, kthime, dërgesa dhe arkëtime", icon: ReceiptText, color: "#2d789f" },
  { key: "purchases", group: "Blerje", title: "Regjistrime të blerjes", description: "Fatura, hyrje dhe kthime blerjesh", icon: ShoppingCart, color: "#3c8a62" },
  { key: "stock", group: "Magazinë", title: "Regjistrime magazine", description: "Hyrje, dalje, transferta dhe inventarizime", icon: Package, color: "#a1782b" },
  { key: "accounting", group: "Kontabilitet", title: "Regjistrime kontabël", description: "Ditarë dhe hyrje të dyfishta", icon: BookOpen, color: "#6b5794" },
  { key: "payments", group: "Likuidim", title: "Regjistrime arkë/bankë", description: "Pagesa, arkëtime dhe lëvizje likuiditeti", icon: WalletCards, color: "#9a5d68" },
  { key: "archive", group: "Arkivë", title: "Arkiva e dokumentave", description: "Dokumente operative të arkivuara", icon: Archive, color: "#587a8c" },
];

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return value.toLocaleDateString("sq-AL");
  return String(value);
}

function rowsFor(key: RegisterKey, sources: Record<RegisterKey, unknown[]>): RegisterRow[] {
  const source = key === "sales" || key === "purchases" ? sources[key].filter((item: any, index, items) => {
    const documentKey = item.invoiceId ?? item.docNumber ?? item.id;
    return items.findIndex((candidate: any) => (candidate.invoiceId ?? candidate.docNumber ?? candidate.id) === documentKey) === index;
  }) : sources[key];
  return source.map((item: any) => {
    if (key === "sales") return { Dokumenti: item.docNumber, Data: item.date, Partneri: item.customerName || item.customer?.name, Monedha: item.currency, Vlera: item.invoiceTotalAmount ?? item.totalAmount, Statusi: item.status, _id: item.invoiceId ?? item.id, _path: `/sales-invoices?tab=invoices&openInvoice=${item.invoiceId ?? item.id}` };
    if (key === "purchases") return { Dokumenti: item.docNumber, Data: item.date, Partneri: item.supplierName || item.supplier?.name, Monedha: item.currency, Vlera: item.invoiceTotalAmount ?? item.totalAmount, Statusi: item.status, _id: item.invoiceId ?? item.id, _path: `/purchase-invoices?tab=invoices&openInvoice=${item.invoiceId ?? item.id}` };
    if (key === "stock") return { Dokumenti: item.docNumber, Data: item.movementDate || item.date, Artikulli: item.productName, Drejtimi: item.direction || item.movementType, Sasia: item.quantity, Njësia: item.unit, _id: item.id, _path: `/inventory?openMovement=${item.id}` };
    if (key === "accounting") return { Dokumenti: item.docNumber || `#${item.id}`, Data: item.entryDate || item.date, Përshkrimi: item.description, Vlera: item.totalDebit || item.amount, Statusi: item.status, _id: item.id, _path: `/accounting?tab=entries&openEntry=${item.id}` };
    if (key === "payments") return { Dokumenti: item.docNumber || `#${item.id}`, Data: item.paymentDate || item.date, Partneri: item.partnerName, Metoda: item.method, Vlera: item.amount, Statusi: item.status, _id: item.id, _path: `/accounting?tab=payments&openPayment=${item.id}` };
    return { Dokumenti: item.docNumber || `#${item.id}`, Data: item.date || item.createdAt, Përshkrimi: item.description || item.notes, Statusi: item.status, _id: item.id, _path: item.sourcePath || "/cargo-loads?tab=documents" };
  });
}

export default function Registrations({ companyId }: { companyId: number }) {
  const [location, setLocation] = useLocation();
  const queryRegister = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("register") as RegisterKey | null;
  const [activeKey, setActiveKey] = useState<RegisterKey | null>(queryRegister);
  useEffect(() => { if (queryRegister && registrationItems.some(item => item.key === queryRegister)) setActiveKey(queryRegister); }, [queryRegister]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currency, setCurrency] = useState("all");
  const [sortKey, setSortKey] = useState("Data");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const sales = trpc.salesInvoice.register.useQuery({ companyId });
  const purchases = trpc.purchaseInvoice.register.useQuery({ companyId });
  const stock = trpc.stockMovement.list.useQuery({ companyId });
  const accounting = trpc.journalEntry.list.useQuery({ companyId });
  const payments = trpc.payment.list.useQuery({ companyId });
  const sources: Record<RegisterKey, unknown[]> = { sales: sales.data ?? [], purchases: purchases.data ?? [], stock: stock.data ?? [], accounting: accounting.data ?? [], payments: payments.data ?? [], archive: [] };
  const rows = useMemo(() => activeKey ? rowsFor(activeKey, sources) : [], [activeKey, sales.data, purchases.data, stock.data, accounting.data, payments.data]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    const start = dateFrom ? Date.parse(dateFrom) : Number.NaN;
    const end = dateTo ? Date.parse(`${dateTo}T23:59:59`) : Number.NaN;
    return [...rows].filter(row => {
      const textMatch = !needle || Object.entries(row).some(([key, value]) => !key.startsWith("_") && display(value).toLocaleLowerCase().includes(needle));
      const rowDate = Date.parse(String(row.Data ?? ""));
      const dateMatch = (Number.isNaN(start) || (!Number.isNaN(rowDate) && rowDate >= start)) && (Number.isNaN(end) || (!Number.isNaN(rowDate) && rowDate <= end));
      return textMatch && dateMatch && (currency === "all" || display(row.Monedha).toLowerCase() === currency.toLowerCase());
    }).sort((left, right) => {
      const a = display(left[sortKey]); const b = display(right[sortKey]); const da = Date.parse(a); const db = Date.parse(b);
      const comparison = Number.isNaN(da) || Number.isNaN(db) ? a.localeCompare(b, "sq") : da - db;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rows, search, dateFrom, dateTo, currency, sortKey, sortDirection]);
  const columns = filtered.length ? Object.keys(filtered[0]).filter(key => !key.startsWith("_")) : activeKey === "stock" ? ["Dokumenti", "Data", "Artikulli", "Drejtimi", "Sasia", "Njësia"] : ["Dokumenti", "Data", "Partneri", "Monedha", "Vlera", "Statusi"];
  const total = filtered.reduce((sum, row) => sum + (Number(row.Vlera) || 0), 0);
  const resetFilters = () => { setSearch(""); setDateFrom(""); setDateTo(""); setCurrency("all"); };
  const active = registrationItems.find(item => item.key === activeKey);

  return <div className="alpha-admin-window mx-auto w-full max-w-[1180px] border border-[#8ea2b0] bg-[#edf2f5] shadow-[2px_3px_9px_rgba(37,62,80,0.28)]">
    <div className="flex items-center justify-between border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-1.5"><div><h1 className="text-[13px] font-bold text-[#234b67]">Regjistrime</h1><p className="text-[10px] text-[#587080]">Zgjidh regjistrin që dëshiron të hapësh</p></div><button type="button" onClick={() => setLocation("/")} aria-label="Mbyll Regjistrimet" className="grid h-5 w-5 place-items-center border border-[#a04f4f] bg-gradient-to-b from-[#e76d6d] to-[#b74141] text-xs font-bold text-white">×</button></div>
    <div className="flex flex-wrap items-center gap-1 border-b border-[#afbdc7] bg-[#e9eff3] px-2 py-1.5"><button type="button" onClick={() => setLocation("/")} className="alpha-form-tool">Mbyll</button><button type="button" onClick={() => setLocation("/reports")} className="alpha-form-tool">Raporte</button><button type="button" onClick={resetFilters} className="alpha-form-tool"><RotateCcw className="mr-1 inline h-3 w-3" />Pastro filtrat</button></div>
    <div className="grid min-h-[560px] lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-r border-[#b7c6d0] bg-[#f1f4f6] p-2"><div className="mb-2 border-b border-[#b7c6d0] px-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-[#426277]">Regjistrime Alpha</div><div className="space-y-0.5">{registrationItems.map((item, index) => { const Icon = item.icon; const selected = item.key === activeKey; const newGroup = index === 0 || registrationItems[index - 1].group !== item.group; return <div key={item.key}>{newGroup && <div className="border-t border-[#b7c6d0] px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-[#728694]">{item.group}</div>}<button type="button" onClick={() => { if (item.key === "sales") { setLocation("/sales-invoices?tab=invoices&newInvoice=1"); return; } setActiveKey(item.key); resetFilters(); }} className={`flex w-full items-center gap-2 border px-2 py-2 text-left ${selected ? "border-[#8aaabd] bg-[#d6e7f1] font-bold text-[#234b67]" : "border-transparent text-[#536b7c] hover:border-[#c3d0d8] hover:bg-white"}`}><span className="grid h-6 w-6 place-items-center border border-[#b4c2ca] bg-white" style={{ color: item.color }}><Icon className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1"><span className="block text-xs">{item.title}</span><span className="block text-[10px] font-normal text-[#71818d]">{item.description}</span></span><ChevronRight className="h-3.5 w-3.5" /></button></div>; })}</div></aside>
      <section className="min-w-0 bg-white p-2">{!active ? <div className="grid h-full min-h-[530px] place-items-center border border-dashed border-[#b6c6d0] bg-[#f8fafb] text-center"><div><FileText className="mx-auto mb-2 h-10 w-10 text-[#7892a3]" /><h2 className="text-sm font-bold text-[#315a75]">Zgjidh një regjistër</h2><p className="mt-1 max-w-sm text-xs text-[#687986]">Zgjidh një nga listat majtas për të hapur filtrat dhe dokumentet reale të kompanisë aktive.</p></div></div> : <><div className="flex items-center justify-between border border-[#b5c4ce] bg-[#dce8ef] px-2 py-1.5 text-[11px] font-bold uppercase text-[#315a75]"><span>{active.title}</span><span className="normal-case font-normal text-[#687986]">{filtered.length} dokumente</span></div><div className="grid gap-1 border-x border-b border-[#c1ced6] bg-[#f2f6f8] p-2 sm:grid-cols-[1.2fr_0.7fr_0.7fr_0.6fr_auto]"><label className="relative"><Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#7892a3]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Klient / dokument" className="h-7 w-full border border-[#9fadb7] pl-7 pr-2 text-xs" /></label><input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} className="h-7 border border-[#9fadb7] px-1 text-[10px]" /><input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} className="h-7 border border-[#9fadb7] px-1 text-[10px]" /><select value={currency} onChange={event => setCurrency(event.target.value)} className="h-7 border border-[#9fadb7] bg-white px-1 text-[10px]"><option value="all">Të gjitha</option><option value="ALL">ALL</option><option value="EUR">EUR</option><option value="USD">USD</option></select><button type="button" onClick={resetFilters} className="h-7 border border-[#9fadb7] bg-[#dce8ef] px-2 text-[10px] font-bold text-[#315a75]">Pastro</button></div><div className="max-h-[450px] overflow-auto border-x border-b border-[#c1ced6]"><table className="w-full min-w-[720px] border-collapse text-[11px]"><thead className="sticky top-0 bg-[#edf3f6] text-left text-[#315a75]"><tr>{columns.map(column => <th key={column} className="border-b border-r border-[#c1ced6] px-2 py-1.5 font-bold"><button type="button" onClick={() => { if (sortKey === column) setSortDirection(value => value === "asc" ? "desc" : "asc"); else { setSortKey(column); setSortDirection("asc"); } }} className="hover:underline">{column} {sortKey === column ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</button></th>)}<th className="border-b border-[#c1ced6] px-2 py-1.5">Veprim</th></tr></thead><tbody>{filtered.map((row, index) => <tr key={`${String(row._id ?? "row")}-${index}`} className="odd:bg-white even:bg-[#f5f8fa] hover:bg-[#eaf4fa]">{columns.map(column => <td key={column} className="border-b border-r border-[#d4dde2] px-2 py-1.5">{column === "Dokumenti" ? <button type="button" onClick={() => setLocation(String(row._path))} className="font-bold text-[#315a75] underline">↗ {display(row[column])}</button> : display(row[column])}</td>)}<td className="border-b border-[#d4dde2] px-2 py-1.5"><button type="button" onClick={() => setLocation(String(row._path))} className="text-[#315a75] underline">Hap</button></td></tr>)}</tbody><tfoot><tr className="bg-[#e7f1f6] font-bold text-[#234b67]"><td colSpan={Math.max(1, columns.length - 1)} className="px-2 py-1.5">TOTAL</td><td className="px-2 py-1.5">{total.toLocaleString("sq-AL", { maximumFractionDigits: 2 })}</td><td className="px-2 py-1.5" /></tr></tfoot></table>{!filtered.length && <div className="p-6 text-center text-xs text-[#687986]">Nuk u gjetën dokumente për filtrat aktualë.</div>}</div></>}
      </section>
    </div>
  </div>;
}

export function ProcessTile({ icon: Icon, label, path, color, onClick }: { icon: typeof ReceiptText; label: string; path: string; color: string; onClick: (path: string) => void }) { return <button type="button" onClick={() => onClick(path)} className="flex flex-col items-center gap-1 text-center text-[10px] font-semibold text-[#4a6373]"><span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-white shadow-md" style={{ backgroundColor: color }}><Icon className="h-6 w-6 text-white" /></span><span className="whitespace-pre-line">{label}</span></button>; }
