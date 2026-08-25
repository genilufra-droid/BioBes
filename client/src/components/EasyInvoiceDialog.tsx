import { useEffect, useMemo, useRef, useState } from "react";
import { FilePlus2, Minus, PackageCheck, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import EntityLiveSearch from "@/components/EntityLiveSearch";
import ProductLiveSearch from "@/components/ProductLiveSearch";
import AlphaDocumentToolbar from "@/components/AlphaDocumentToolbar";

type InvoiceLine = { productId?: number; productName: string; quantity: number; unit: string; unitPrice: number };

const emptyLine = (): InvoiceLine => ({ productName: "", quantity: 1, unit: "copë", unitPrice: 0 });
const today = () => new Date().toISOString().slice(0, 10);
const displayMoney = (value: number, currency: string) => `${(value / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

export default function EasyInvoiceDialog({ companyId }: { companyId: number }) {
  const utils = trpc.useUtils();
  const customerFieldRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [productSearch, setProductSearch] = useState("");
  const [currency, setCurrency] = useState("ALL");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [invoiceFormat, setInvoiceFormat] = useState<"DOMESTIC" | "EXPORT">("DOMESTIC");
  const [lines, setLines] = useState<InvoiceLine[]>([emptyLine()]);
  const { data: customers = [] } = trpc.customer.list.useQuery({ companyId }, { enabled: open });
  const { data: products = [] } = trpc.product.list.useQuery({ companyId }, { enabled: open });
  const { data: warehouses = [] } = trpc.warehouse.list.useQuery({ companyId }, { enabled: open });
  const createInvoice = trpc.salesInvoice.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.salesInvoice.list.invalidate({ companyId }),
        utils.salesInvoice.register.invalidate({ companyId }),
      ]);
      toast.success("Fatura e shitjes u ruajt dhe u reflektua në stok.");
      closeInvoice();
    },
    onError: error => toast.error(error.message),
  });

  const productResults = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase("sq-AL");
    return query ? products.filter(item => `${item.name} ${item.code || ""}`.toLocaleLowerCase("sq-AL").includes(query)).slice(0, 10) : products.slice(0, 10);
  }, [products, productSearch]);
  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const totalInLek = Math.round(total * Number(exchangeRate || 1));

  const resetDraft = () => {
    setInvoiceNumber("");
    setInvoiceDate(today());
    setProductSearch("");
    setCurrency("ALL");
    setExchangeRate("1");
    setInvoiceFormat("DOMESTIC");
    setLines([emptyLine()]);
  };
  const closeInvoice = () => { setOpen(false); resetDraft(); };
  const patchLine = (index: number, patch: Partial<InvoiceLine>) => setLines(current => current.map((line, currentIndex) => currentIndex === index ? { ...line, ...patch } : line));
  const removeLine = (index: number) => setLines(current => current.length === 1 ? [emptyLine()] : current.filter((_, currentIndex) => currentIndex !== index));
  const addProduct = (product: typeof products[number]) => {
    setLines(current => {
      const found = current.findIndex(line => line.productId === product.id);
      if (found >= 0) return current.map((line, index) => index === found ? { ...line, quantity: line.quantity + 1 } : line);
      const base = current.length === 1 && !current[0].productName ? [] : current;
      return [...base, { productId: product.id, productName: product.name, quantity: 1, unit: product.baseUnit || "copë", unitPrice: product.lastPrice ?? 0 }];
    });
    setProductSearch("");
  };
  const focusCustomer = () => customerFieldRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  const clearDraft = () => {
    if (window.confirm("Të pastrohet dokumenti draft që po plotëson?")) resetDraft();
  };
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("genit:open-easy-invoice", handleOpen);
    return () => window.removeEventListener("genit:open-easy-invoice", handleOpen);
  }, []);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customerId = Number(form.get("customerId")) || undefined;
    const customerName = String(form.get("customerName") || "").trim();
    const validLines = lines.filter(line => line.productName.trim() && line.quantity > 0);
    if (!customerId && !customerName) return toast.error("Zgjidh ose krijo klientin.");
    if (!validLines.length) return toast.error("Shto së paku një artikull.");
    const warehouseId = Number(form.get("warehouseId"));
    if (!warehouseId) return toast.error("Zgjidh magazinën e daljes.");
    createInvoice.mutate({
      companyId,
      docNumber: invoiceNumber.trim() || `SH-${Date.now().toString().slice(-6)}`,
      date: new Date(invoiceDate),
      customerId,
      customerName: customerId ? undefined : customerName,
      warehouseId,
      currency,
      exchangeRate: Number(exchangeRate || 1),
      invoiceFormat,
      exportDetails: invoiceFormat === "EXPORT" ? JSON.stringify({ source: "Alpha sales document editor" }) : undefined,
      items: validLines,
    });
  };

  return (
    <Dialog open={open} onOpenChange={nextOpen => nextOpen ? setOpen(true) : closeInvoice()}>
      <Button onClick={() => setOpen(true)} className="m-3 flex h-11 w-[calc(100%-1.5rem)] items-center justify-center rounded-md bg-[#714b67] px-4 text-white shadow-[0_5px_18px_rgba(77,47,71,0.35)] hover:bg-[#5f3d58] md:fixed md:bottom-5 md:right-5 md:z-40 md:m-0 md:w-auto">
        <FilePlus2 className="mr-2 h-4 w-4" />Faturë e re
      </Button>
      <DialogContent className="!left-0 !top-0 !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 overflow-hidden rounded-none border-0 bg-[#e7edf3] p-0">
        <form onSubmit={submit} className="flex h-full flex-col">
          <header className="flex min-h-[50px] shrink-0 items-center border-b border-[#aeb7c2] bg-white px-3 sm:px-5">
            <div className="min-w-0">
              <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#62707c]">Regjistrime / Shitje me artikuj</div>
              <DialogTitle className="mt-0.5 truncate text-base font-bold text-[#263746]">Faturë Shitje</DialogTitle>
            </div>
            <div className="ml-auto flex items-center gap-2 text-[11px] text-[#5f6d79]">
              <span className="rounded border border-[#c2ccd5] bg-[#f8fafc] px-2 py-1">DRAFT</span>
              <span className="hidden sm:inline">Dokumenti krijon dalje stoku</span>
            </div>
          </header>
          <AlphaDocumentToolbar onClose={closeInvoice} onNew={resetDraft} onFind={focusCustomer} onClear={clearDraft} savePending={createInvoice.isPending} />
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
            <div className="mx-auto max-w-6xl space-y-3">
              <section className="border border-[#9eabb8] bg-[#f8fbfe] shadow-sm">
                <div className="border-b border-[#b9c4ce] bg-[#d8e4ee] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#30495d]">Koka e dokumentit</div>
                <div className="grid gap-x-3 gap-y-2 p-3 md:grid-cols-12">
                  <label className="md:col-span-3"><span className="alpha-label">Pika / Magazina</span><select name="warehouseId" required className="alpha-input"><option value="">Zgjidh magazinën</option>{warehouses.map(warehouse => <option key={warehouse.id} value={warehouse.id}>{warehouse.code ? `${warehouse.code} — ` : ""}{warehouse.name}</option>)}</select></label>
                  <label className="md:col-span-2"><span className="alpha-label">Nr. dokumenti</span><Input value={invoiceNumber} onChange={event => setInvoiceNumber(event.target.value)} className="alpha-input" placeholder="Automatik" /></label>
                  <label className="md:col-span-2"><span className="alpha-label">Data dokumentit</span><Input type="date" value={invoiceDate} onChange={event => setInvoiceDate(event.target.value)} className="alpha-input" /></label>
                  <label className="md:col-span-2"><span className="alpha-label">Monedha</span><select value={currency} onChange={event => setCurrency(event.target.value)} className="alpha-input"><option value="ALL">ALL</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></label>
                  <label className="md:col-span-3"><span className="alpha-label">Kursi</span><Input type="number" min="0.000001" step="0.000001" value={exchangeRate} onChange={event => setExchangeRate(event.target.value)} className="alpha-input text-right" /></label>
                </div>
              </section>

              <section className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="border border-[#9eabb8] bg-white shadow-sm">
                  <div className="border-b border-[#b9c4ce] bg-[#d8e4ee] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#30495d]">Subjekti blerës</div>
                  <div ref={customerFieldRef} className="p-3"><span className="alpha-label">Klienti</span><EntityLiveSearch idName="customerId" nameName="customerName" items={customers} placeholder="Kliko lupën ose kërko klientin" addLabel="Shto klientin" /></div>
                </div>
                <div className="border border-[#9eabb8] bg-white shadow-sm">
                  <div className="border-b border-[#b9c4ce] bg-[#d8e4ee] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#30495d]">Veprime dhe lidhje</div>
                  <div className="grid gap-2 p-3 sm:grid-cols-2">
                    <label><span className="alpha-label">Lloji i faturës</span><select value={invoiceFormat} onChange={event => setInvoiceFormat(event.target.value as "DOMESTIC" | "EXPORT")} className="alpha-input"><option value="DOMESTIC">Vendase</option><option value="EXPORT">Eksport</option></select></label>
                    <div className="rounded border border-[#ccd6df] bg-[#f8fbfe] px-3 py-2 text-xs text-[#405463]"><span className="flex items-center gap-2 font-semibold"><PackageCheck className="h-4 w-4 text-[#1b5f38]" />Dalje nga magazina</span><span className="mt-1 block text-[11px]">Krijohet automatikisht një herë për faturën.</span></div>
                    <label className="flex items-center gap-2 text-xs font-medium text-[#334b5c]"><input type="checkbox" checked={invoiceFormat === "EXPORT"} onChange={event => setInvoiceFormat(event.target.checked ? "EXPORT" : "DOMESTIC")} />Fletë doganimi / Eksport</label>
                    <div className="text-xs text-[#62707c]">TVSH llogaritet sipas artikujve dhe politikës së dokumentit.</div>
                  </div>
                </div>
              </section>

              <section className="border border-[#8798a8] bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#aebbc7] bg-[#d8e4ee] px-3 py-1.5"><div><h2 className="text-xs font-bold uppercase tracking-wide text-[#30495d]">Artikujt e faturës</h2><p className="text-[10px] text-[#5d6e7c]">Përdor lupën për artikullin; sasia dhe çmimi formojnë vlerën e rreshtit.</p></div><Button type="button" size="sm" variant="outline" className="h-7 rounded-sm border-[#8ea0b0] text-xs" onClick={() => setLines(current => [...current, emptyLine()])}><Plus className="mr-1 h-3.5 w-3.5" />Shto rresht</Button></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-xs"><thead className="bg-[#eff4f8] text-[#334b5c]"><tr className="border-b border-[#aebbc7]"><th className="w-10 px-2 py-2 text-center">Nr.</th><th className="min-w-72 px-2 py-2 text-left">Kodi / Përshkrimi artikullit</th><th className="w-20 px-2 py-2 text-left">Njësia</th><th className="w-24 px-2 py-2 text-right">Sasia</th><th className="w-28 px-2 py-2 text-right">Çmimi</th><th className="w-20 px-2 py-2 text-right">TVSH</th><th className="w-32 px-2 py-2 text-right">Vlera</th><th className="w-10 px-1 py-2" /></tr></thead><tbody>{lines.map((line, index) => <tr key={`${line.productId || "manual"}-${index}`} className="border-b border-[#d6e0e8] hover:bg-[#f8fbfe]"><td className="px-2 py-1 text-center text-[#637382]">{index + 1}</td><td className="px-2 py-1"><ProductLiveSearch companyId={companyId} products={products} value={line} onSelect={patch => patchLine(index, patch)} /></td><td className="px-2 py-1"><Input value={line.unit} onChange={event => patchLine(index, { unit: event.target.value })} className="h-8 rounded-sm text-xs" /></td><td className="px-2 py-1"><div className="flex items-center border border-[#c2ced8]"><button type="button" onClick={() => patchLine(index, { quantity: Math.max(1, line.quantity - 1) })} className="grid h-7 w-7 place-items-center hover:bg-[#e7eff5]"><Minus className="h-3 w-3" /></button><input aria-label="Sasia" type="number" min="1" value={line.quantity} onChange={event => patchLine(index, { quantity: Math.max(1, Number(event.target.value) || 1) })} className="h-7 min-w-0 flex-1 border-x border-[#c2ced8] text-center outline-none" /><button type="button" onClick={() => patchLine(index, { quantity: line.quantity + 1 })} className="grid h-7 w-7 place-items-center hover:bg-[#e7eff5]"><Plus className="h-3 w-3" /></button></div></td><td className="px-2 py-1"><Input type="number" min="0" value={line.unitPrice} onChange={event => patchLine(index, { unitPrice: Math.max(0, Number(event.target.value) || 0) })} className="h-8 rounded-sm text-right text-xs" /></td><td className="px-2 py-1 text-right text-[#637382]">0.00%</td><td className="px-2 py-1 text-right font-semibold">{displayMoney(line.quantity * line.unitPrice, currency)}</td><td className="px-1 py-1"><button type="button" aria-label={`Hiq rreshtin ${index + 1}`} onClick={() => removeLine(index)} className="grid h-7 w-7 place-items-center text-[#9d3d3d] hover:bg-[#fff0f0]"><Trash2 className="h-3.5 w-3.5" /></button></td></tr>)}</tbody></table></div>
                <div className="flex justify-end border-t border-[#aebbc7] bg-[#f3f7fa] p-3"><div className="w-full max-w-sm border border-[#aebbc7] bg-white text-xs"><div className="flex justify-between border-b border-[#d4dde5] px-3 py-1.5"><span>Vlera pa TVSH</span><b>{displayMoney(total, currency)}</b></div><div className="flex justify-between border-b border-[#d4dde5] px-3 py-1.5"><span>TVSH</span><b>{displayMoney(0, currency)}</b></div><div className="flex justify-between bg-[#d8e4ee] px-3 py-2 text-sm font-bold text-[#263f52]"><span>Totali i faturës</span><span>{displayMoney(total, currency)}</span></div><div className="flex justify-between px-3 py-1.5 text-[#536575]"><span>Ekuivalent në Lek</span><b>{displayMoney(totalInLek, "ALL")}</b></div></div></div>
              </section>
            </div>
          </div>
          <aside className="hidden shrink-0 border-t border-[#aeb7c2] bg-white px-4 py-2 lg:block"><div className="mx-auto flex max-w-6xl items-center gap-3"><Search className="h-4 w-4 text-[#647483]" /><Input value={productSearch} onChange={event => setProductSearch(event.target.value)} className="h-8 max-w-sm rounded-sm" placeholder="Kërkim i shpejtë artikulli…" /><div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">{productResults.map(product => <button type="button" key={product.id} onClick={() => addProduct(product)} className="shrink-0 rounded border border-[#cad5de] px-2 py-1 text-[11px] hover:bg-[#edf4f8]">{product.code || "—"} · {product.name}</button>)}</div></div></aside>
        </form>
      </DialogContent>
    </Dialog>
  );
}
