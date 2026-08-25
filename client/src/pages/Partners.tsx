import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Download, Search } from "lucide-react";
import { exportPartnersToExcel, exportPartnersToPDF } from "@/lib/export";
import AlphaCatalogWindow from "@/components/AlphaCatalogWindow";

export function parsePartnerProfile(raw?: string | null) { try { const parsed = raw ? JSON.parse(raw) : {}; return parsed && typeof parsed === "object" ? parsed as Record<string, string | number | boolean> : {}; } catch { return {}; } }

export function serializePartnerProfile(formData: FormData, kind: "Klient" | "Furnitor") {
  return JSON.stringify({
    kind, title: String(formData.get("title") || ""), companyName: String(formData.get("companyName") || ""), surname: String(formData.get("surname") || ""),
    modifiable: formData.get("modifiable") === "on", categories: [1, 2, 3].map(index => String(formData.get(`category${index}`) || "")),
    priceLevel: String(formData.get("priceLevel") || ""), maturityCategory: String(formData.get("maturityCategory") || ""), dueDays: Number(formData.get("dueDays") || 0),
    discountCategory: String(formData.get("discountCategory") || ""), discountPercent: Number(formData.get("discountPercent") || 0), analyticalDiscount: String(formData.get("analyticalDiscount") || ""),
    maturityBlock: formData.get("maturityBlock") === "on", creditWarning: Number(formData.get("creditWarning") || 0), creditBlock: Number(formData.get("creditBlock") || 0),
    active: formData.get("active") !== "off", authorization: String(formData.get("authorization") || ""), zone: String(formData.get("zone") || ""), fax: String(formData.get("fax") || ""),
    chassis: String(formData.get("chassis") || ""), plate: String(formData.get("plate") || ""),     bank: String(formData.get("bank") || ""), bankAccount: String(formData.get("bankAccount") || ""), agent: String(formData.get("agent") || ""),
    accountCode: String(formData.get("accountCode") || ""), accountName: String(formData.get("accountName") || ""), accountCurrency: String(formData.get("accountCurrency") || "LEK"), discountAccountCode: String(formData.get("discountAccountCode") || ""), discountAccountName: String(formData.get("discountAccountName") || ""), openingComment: String(formData.get("openingComment") || ""), openingValue: Number(formData.get("openingValue") || 0), openingRate: Number(formData.get("openingRate") || 1), openingBaseValue: Number(formData.get("openingBaseValue") || 0), openingDate: String(formData.get("openingDate") || ""),

  });
}

function AccountLookup({ accounts, name, value, descriptionName, description, onSelect }: { accounts: any[]; name: string; value?: string; descriptionName: string; description?: string; onSelect: (account: any) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const matches = accounts.filter(account => `${account.code} ${account.name}`.toLocaleLowerCase("sq-AL").includes(query.toLocaleLowerCase("sq-AL"))).slice(0, 20);
  return <div className="grid grid-cols-[minmax(0,1fr)_32px_minmax(0,2fr)] gap-1"><Input name={name} value={query} onChange={event => { setQuery(event.target.value); onSelect({ id: 0, code: event.target.value, name: "", currency: "LEK" }); }} className="h-8 rounded-none text-xs" placeholder="411" /><Button type="button" variant="outline" className="h-8 rounded-none px-1" onClick={() => setOpen(true)} aria-label="Kërko llogarinë">⌕</Button><Input name={descriptionName} value={description || ""} readOnly className="h-8 rounded-none bg-[#8bd9ed] text-xs" />
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-2xl rounded-sm border-[#8199aa] bg-[#f3f6f8] p-0"><DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-2"><DialogTitle className="text-[13px] text-[#234b67]">Zgjidhni Llogarinë</DialogTitle></DialogHeader><div className="p-3"><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Kërko sipas kodit ose përshkrimit" className="mb-2 h-8 rounded-none text-xs" /><div className="max-h-64 overflow-auto border border-[#9fadb7] bg-white"><div className="grid grid-cols-[120px_1fr_80px] bg-[#d6e6ef] px-2 py-1 text-[10px] font-bold"><span>Llogaria</span><span>Përshkrimi</span><span>Monedha</span></div>{matches.map(account => <button type="button" key={account.id} className="grid w-full grid-cols-[120px_1fr_80px] border-b px-2 py-1 text-left text-xs hover:bg-[#dff2f8]" onClick={() => { onSelect(account); setQuery(account.code); setOpen(false); }}><span>{account.code}</span><span>{account.name}</span><span>{account.currency || "LEK"}</span></button>)}{matches.length === 0 && <p className="p-3 text-xs text-muted-foreground">Nuk u gjet llogari.</p>}</div></div></DialogContent></Dialog>
  </div>;
}

function AlphaPartnerFields({ kind, values = {}, accounts = [] }: { kind: "Klient" | "Furnitor"; values?: Record<string, string | number | boolean>; accounts?: any[] }) {
  const [tab, setTab] = useState<"general" | "contact" | "accounting" | "extra">("general");
  const tabClass = (value: typeof tab) => `border px-2 py-1 text-[10px] ${tab === value ? "border-[#6f8fa4] bg-white font-bold text-[#234b67]" : "border-transparent text-[#587080] hover:bg-white"}`;
  const [account, setAccount] = useState({ code: String(values.accountCode || ""), name: String(values.accountName || ""), currency: String(values.accountCurrency || "LEK") });
  const [discountAccount, setDiscountAccount] = useState({ code: String(values.discountAccountCode || ""), name: String(values.discountAccountName || ""), currency: "LEK" });
  return <>
    <div className="col-span-2 flex items-center gap-1 border-b border-[#9fb2bf] bg-[#e8f0f5] px-1 py-1">
      <button type="button" className={tabClass("general")} onClick={() => setTab("general")}>Të përgjithshme</button>
      <button type="button" className={tabClass("contact")} onClick={() => setTab("contact")}>Kontakti</button>
      <button type="button" className={tabClass("accounting")} onClick={() => setTab("accounting")}>Kontabiliteti</button>
      <button type="button" className={tabClass("extra")} onClick={() => setTab("extra")}>Fusha shtesë</button>
    </div>
    <div hidden={tab !== "general"} className="contents">
      <label className="text-[11px] font-semibold text-[#3d5568]">Lloji<select name="partnerType" defaultValue={kind} className="mt-1 h-8 w-full rounded-none border border-[#9fadb7] bg-white px-2 text-xs"><option>Klient</option><option>Furnitor</option></select></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Titulli<select name="title" defaultValue={String(values.title || "Shoqëri")} className="mt-1 h-8 w-full rounded-none border border-[#9fadb7] bg-white px-2 text-xs"><option>Person fizik</option><option>Shoqëri</option><option>Sh.p.k.</option><option>Shoqëri anonime</option></select></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Ndërmarrja<Input name="companyName" defaultValue={String(values.companyName || "")} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">NIPT<Input name="nipt" defaultValue={String(values.nipt || "")} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Emri *<Input name="name" defaultValue={String(values.name || "")} className="mt-1 h-8 rounded-none text-xs" required /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Mbiemri<Input name="surname" defaultValue={String(values.surname || "")} className="mt-1 h-8 rounded-none text-xs" /></label>
      {[1, 2, 3].map(index => <label key={index} className="text-[11px] font-semibold text-[#3d5568]">Kategoria {index}<Input name={`category${index}`} defaultValue={String(values[`category${index}`] || "")} className="mt-1 h-8 rounded-none text-xs" /></label>)}
      {kind === "Klient" && <label className="text-[11px] font-semibold text-[#3d5568]">Nivel çmimi<select name="priceLevel" defaultValue={String(values.priceLevel || "1")} className="mt-1 h-8 w-full rounded-none border border-[#9fadb7] bg-white px-2 text-xs"><option>1</option><option>2</option><option>3</option></select></label>}
      <label className="col-span-2 flex items-center gap-2 text-[11px] font-semibold text-[#3d5568]"><input name="active" type="checkbox" defaultChecked={values.active !== false} />Aktiv <input name="modifiable" type="checkbox" defaultChecked={values.modifiable === true} />I modifikueshëm</label>
    </div>
    <div hidden={tab !== "contact"} className="contents">
      {[["city","Qyteti"],["zone","Zona"],["address","Adresa"],["phone","Telefon"],["fax","Fax"],["email","Email"],["chassis","Nr. shasisë"],["plate","Targa"],["bank","Banka"],["bankAccount","Llogari bankare"]].map(([name, label]) => <label key={name} className="text-[11px] font-semibold text-[#3d5568]">{label}<Input name={name} defaultValue={String(values[name] || "")} className="mt-1 h-8 rounded-none text-xs" /></label>)}
      <label className="text-[11px] font-semibold text-[#3d5568]">Agjenti<Input name="agent" defaultValue={String(values.agent || "")} disabled={kind === "Furnitor"} className="mt-1 h-8 rounded-none text-xs" /></label>
    </div>
    <div hidden={tab !== "accounting"} className="contents">
      <label className="col-span-2 text-[11px] font-semibold text-[#3d5568]">* Llogaria Kontabel<AccountLookup accounts={accounts} name="accountCode" value={account.code} descriptionName="accountName" description={account.name} onSelect={selected => setAccount({ code: selected.code || "", name: selected.name || "", currency: selected.currency || "LEK" })} /></label>
      <label className="col-span-2 text-[11px] font-semibold text-[#3d5568]">* Llogari Zbritje<AccountLookup accounts={accounts} name="discountAccountCode" value={discountAccount.code} descriptionName="discountAccountName" description={discountAccount.name} onSelect={selected => setDiscountAccount({ code: selected.code || "", name: selected.name || "", currency: selected.currency || "LEK" })} /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Monedha<Input name="accountCurrency" value={account.currency} readOnly className="mt-1 h-8 rounded-none bg-[#8bd9ed] text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Kategori maturimi<Input name="maturityCategory" defaultValue={String(values.maturityCategory || "")} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Ditë maturimi<Input name="dueDays" type="number" min="0" defaultValue={String(values.dueDays || "0")} className="mt-1 h-8 rounded-none text-xs" /></label>
      {kind === "Klient" && <><label className="text-[11px] font-semibold text-[#3d5568]">Kategori zbritje<Input name="discountCategory" defaultValue={String(values.discountCategory || "")} className="mt-1 h-8 rounded-none text-xs" /></label><label className="text-[11px] font-semibold text-[#3d5568]">Zbritja në %<Input name="discountPercent" type="number" min="0" step="0.01" defaultValue={String(values.discountPercent || "0")} className="mt-1 h-8 rounded-none text-xs" /></label><label className="text-[11px] font-semibold text-[#3d5568]">Zbritje analitike artikulli<Input name="analyticalDiscount" defaultValue={String(values.analyticalDiscount || "")} className="mt-1 h-8 rounded-none text-xs" /></label></>}
      <label className="text-[11px] font-semibold text-[#3d5568]">Limit paralajmërim<Input name="creditWarning" type="number" min="0" step="0.01" defaultValue={String(values.creditWarning || "0")} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Limit blloko<Input name="creditBlock" type="number" min="0" step="0.01" defaultValue={String(values.creditBlock || "0")} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="col-span-2 flex items-center gap-2 text-[11px] font-semibold text-[#3d5568]"><input name="maturityBlock" type="checkbox" defaultChecked={values.maturityBlock === true} />Maturim bllokues</label>
      <label className="col-span-2 flex items-center gap-2 text-[11px] font-semibold text-[#3d5568]"><input name="openingEnabled" type="checkbox" defaultChecked={Boolean(values.openingValue)} />Me gjendje fillestare</label>
      <label className="col-span-2 text-[11px] font-semibold text-[#3d5568]">Koment<Input name="openingComment" defaultValue={String(values.openingComment || "Gjendje fillestare")} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Vlera Fillestare<Input name="openingValue" type="number" defaultValue={String(values.openingValue || 0)} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Kursi<Input name="openingRate" type="number" step="0.0001" defaultValue={String(values.openingRate || 1)} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">V. në Mon Bazë<Input name="openingBaseValue" type="number" defaultValue={String(values.openingBaseValue || 0)} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="text-[11px] font-semibold text-[#3d5568]">Data<Input name="openingDate" type="date" defaultValue={String(values.openingDate || new Date().toISOString().slice(0, 10))} className="mt-1 h-8 rounded-none text-xs" /></label>
    </div>
    <div hidden={tab !== "extra"} className="contents">
      <label className="text-[11px] font-semibold text-[#3d5568]">Autorizimi<Input name="authorization" defaultValue={String(values.authorization || "")} className="mt-1 h-8 rounded-none text-xs" /></label>
      <label className="col-span-2 text-[11px] text-[#587080]">Fusha shtesë ruhet në profilin Alpha të partnerit dhe përdoret nga modulet e dokumenteve.</label>
    </div>
  </>;
}

export default function Partners({ companyId, defaultTab = "suppliers" }: { companyId: number; defaultTab?: "suppliers" | "customers" }) {
  const utils = trpc.useUtils();
  const initialForm = new URLSearchParams(window.location.search).get("new");
  const [newSupplierOpen, setNewSupplierOpen] = useState(initialForm === "supplier");
  const [newCustomerOpen, setNewCustomerOpen] = useState(initialForm === "customer");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [editingPartner, setEditingPartner] = useState<{ kind: "supplier" | "customer"; id: number } | null>(null);
  const [partnerForm, setPartnerForm] = useState({ code: "", name: "", nipt: "", phone: "", email: "", address: "", city: "", profile: {} as Record<string, string | number | boolean> });

  // Fetch data
  const { data: suppliers } = trpc.supplier.list.useQuery({ companyId });
  const { data: customers } = trpc.customer.list.useQuery({ companyId });
  const { data: accounts } = trpc.chartOfAccount.list.useQuery({ companyId });

  // Mutations
  const createSupplier = trpc.supplier.create.useMutation({ onSuccess: () => utils.supplier.list.invalidate({ companyId }) });
  const createCustomer = trpc.customer.create.useMutation({ onSuccess: () => utils.customer.list.invalidate({ companyId }) });
  const updateSupplier = trpc.supplier.update.useMutation({ onSuccess: () => utils.supplier.list.invalidate({ companyId }) });
  const deleteSupplier = trpc.supplier.delete.useMutation({ onSuccess: () => utils.supplier.list.invalidate({ companyId }) });
  const updateCustomer = trpc.customer.update.useMutation({ onSuccess: () => utils.customer.list.invalidate({ companyId }) });
  const deleteCustomer = trpc.customer.delete.useMutation({ onSuccess: () => utils.customer.list.invalidate({ companyId }) });
  const visibleSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLocaleLowerCase("sq-AL");
    return query ? (suppliers || []).filter(supplier => [supplier.code, supplier.name, supplier.nipt, supplier.phone, supplier.email, supplier.city].some(value => value?.toLocaleLowerCase("sq-AL").includes(query))) : suppliers || [];
  }, [suppliers, supplierSearch]);
  const visibleCustomers = useMemo(() => {
    const query = customerSearch.trim().toLocaleLowerCase("sq-AL");
    return query ? (customers || []).filter(customer => [customer.code, customer.name, customer.nipt, customer.phone, customer.email, customer.city].some(value => value?.toLocaleLowerCase("sq-AL").includes(query))) : customers || [];
  }, [customers, customerSearch]);

  const handleAddSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createSupplier.mutateAsync({
      companyId,
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      nipt: formData.get("nipt") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      profileData: serializePartnerProfile(formData, "Furnitor"),
    });

    setNewSupplierOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createCustomer.mutateAsync({
      companyId,
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      nipt: formData.get("nipt") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      profileData: serializePartnerProfile(formData, "Klient"),
    });

    setNewCustomerOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const refreshPartners = () => { void utils.supplier.list.invalidate({ companyId }); void utils.customer.list.invalidate({ companyId }); };
  const printPartners = () => window.print();
  const exportCurrent = () => defaultTab === "suppliers" ? exportPartnersToExcel(visibleSuppliers, "suppliers") : exportPartnersToExcel(visibleCustomers, "customers");
  const editSupplier = (supplier: NonNullable<typeof suppliers>[number]) => { setEditingPartner({ kind: "supplier", id: supplier.id }); setPartnerForm({ code: supplier.code ?? "", name: supplier.name, nipt: supplier.nipt ?? "", phone: supplier.phone ?? "", email: supplier.email ?? "", address: supplier.address ?? "", city: supplier.city ?? "", profile: parsePartnerProfile(supplier.profileData) }); };
  const removeSupplier = (supplier: NonNullable<typeof suppliers>[number]) => { if (window.confirm(`Fshi furnitorin ${supplier.name}?`)) deleteSupplier.mutate({ companyId, id: supplier.id }); };
  const editCustomer = (customer: NonNullable<typeof customers>[number]) => { setEditingPartner({ kind: "customer", id: customer.id }); setPartnerForm({ code: customer.code ?? "", name: customer.name, nipt: customer.nipt ?? "", phone: customer.phone ?? "", email: customer.email ?? "", address: customer.address ?? "", city: customer.city ?? "", profile: parsePartnerProfile(customer.profileData) }); };
  const removeCustomer = (customer: NonNullable<typeof customers>[number]) => { if (window.confirm(`Fshi klientin ${customer.name}?`)) deleteCustomer.mutate({ companyId, id: customer.id }); };
  const handleEditPartner = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!editingPartner) return; const formData = new FormData(event.currentTarget); const payload = { companyId, id: editingPartner.id, code: partnerForm.code.trim() || undefined, name: partnerForm.name.trim(), nipt: partnerForm.nipt.trim() || undefined, phone: partnerForm.phone.trim() || undefined, email: partnerForm.email.trim() || undefined, address: partnerForm.address.trim() || undefined, city: partnerForm.city.trim() || undefined, profileData: serializePartnerProfile(formData, editingPartner.kind === "supplier" ? "Furnitor" : "Klient") }; if (editingPartner.kind === "supplier") await updateSupplier.mutateAsync(payload); else await updateCustomer.mutateAsync(payload); setEditingPartner(null); };

  return (
    <AlphaCatalogWindow title={defaultTab === "suppliers" ? "Lista e Furnitorëve" : "Lista e Klientëve"} subtitle="Katalogu i partnerëve — kompania aktive" count={defaultTab === "suppliers" ? (suppliers?.length || 0) : (customers?.length || 0)} onClose={() => window.history.back()} onRefresh={refreshPartners} onPrint={printPartners} onExport={exportCurrent} onNew={() => defaultTab === "suppliers" ? setNewSupplierOpen(true) : setNewCustomerOpen(true)}>
      <div className="space-y-4 p-2">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suppliers">Furnitorët ({suppliers?.length || 0})</TabsTrigger>
          <TabsTrigger value="customers">Klientët ({customers?.length || 0})</TabsTrigger>
        </TabsList>

        {/* SUPPLIERS TAB */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">Furnitorët</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-52"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={supplierSearch} onChange={event => setSupplierSearch(event.target.value)} className="h-9 bg-white pl-9" placeholder="Kërko furnitor…" /></div>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportPartnersToExcel(visibleSuppliers, "suppliers")}><Download className="h-4 w-4" />Excel</Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportPartnersToPDF(visibleSuppliers, "suppliers")}><Download className="h-4 w-4" />PDF</Button>
              <Dialog open={newSupplierOpen} onOpenChange={setNewSupplierOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-8 gap-2 rounded-sm border-[#8fa3b2] bg-[#e8f0f5] text-[#294d65]">
                    <Plus className="w-4 h-4" />
                    Furnitor i Ri
                  </Button>
                </DialogTrigger>
              <DialogContent className="!fixed !inset-0 !left-0 !top-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 border-[#8199aa] bg-[#f3f6f8] p-0">
                <DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-2">
                  <DialogTitle className="text-[13px] text-[#234b67]">Ndrysho Klient/Furnitor</DialogTitle>
                </DialogHeader>
                <><div className="flex items-center gap-1 border-b border-[#aabac4] bg-[#e7edf1] px-2 py-1 print:hidden"><button type="button" className="alpha-form-tool" onClick={() => setNewSupplierOpen(false)}>Mbyll</button><button type="submit" form="new-supplier-form" className="alpha-form-tool">Ruaj</button><button type="button" className="alpha-form-tool">Dok</button><button type="button" className="alpha-form-tool">Ndihmë</button></div><form id="new-supplier-form" onSubmit={handleAddSupplier} className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto p-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3d5568]">Kodi</label>
                    <Input name="code" placeholder="SUP-001" />
                  </div>
                  <AlphaPartnerFields kind="Furnitor" accounts={accounts ?? []} />
                  <Button type="submit" className="col-span-2 h-8 rounded-sm bg-[#2b6892]" disabled={createSupplier.isPending}>
                    {createSupplier.isPending ? "Po ruhet..." : "Ruaj Furnitorin"}
                  </Button>
                </form></>
              </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="rounded-none border border-[#aebdc7] shadow-none">
            <CardContent className="pt-6">
              {visibleSuppliers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{supplierSearch ? "Nuk u gjet furnitor që përputhet me kërkimin." : "Nuk ka furnitorë të regjistruar."}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-xs">
                    <thead>
                      <tr className="bg-gradient-to-b from-[#e8f0f5] to-[#ccdbe5] text-left text-[#264c66]">
                        <th className="text-left py-2 px-2 font-semibold">Kodi</th>
                        <th className="text-left py-2 px-2 font-semibold">Emri</th>
                        <th className="text-left py-2 px-2 font-semibold">NIPT</th>
                        <th className="text-left py-2 px-2 font-semibold">Telefoni</th>
                        <th className="text-left py-2 px-2 font-semibold">Bilansa</th>
                        <th className="text-left py-2 px-2 font-semibold">Aksione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-2">{supplier.code}</td>
                          <td className="py-2 px-2 font-medium">{supplier.name}</td>
                          <td className="py-2 px-2">{supplier.nipt}</td>
                          <td className="py-2 px-2">{supplier.phone}</td>
                          <td className="py-2 px-2 text-right">{((supplier.balance ?? 0) / 100).toFixed(2)} L</td>
                          <td className="py-2 px-2 flex gap-2">
                            <button type="button" onClick={() => editSupplier(supplier)} className="p-1 hover:bg-gray-100 rounded" aria-label={`Ndrysho ${supplier.name}`}>
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button type="button" onClick={() => removeSupplier(supplier)} className="p-1 hover:bg-gray-100 rounded" aria-label={`Fshi ${supplier.name}`}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">Klientët</h2>
            <div className="flex flex-wrap gap-2"><div className="relative min-w-52"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={customerSearch} onChange={event => setCustomerSearch(event.target.value)} className="h-9 bg-white pl-9" placeholder="Kërko klient…" /></div><Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportPartnersToExcel(visibleCustomers, "customers")}><Download className="h-4 w-4" />Excel</Button><Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => exportPartnersToPDF(visibleCustomers, "customers")}><Download className="h-4 w-4" />PDF</Button><Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-8 gap-2 rounded-sm border-[#8fa3b2] bg-[#e8f0f5] text-[#294d65]">
                  <Plus className="w-4 h-4" />
                  Klient i Ri
                </Button>
              </DialogTrigger>
              <DialogContent className="!fixed !inset-0 !left-0 !top-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 border-[#8199aa] bg-[#f3f6f8] p-0">
                <DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-2">
                  <DialogTitle className="text-[13px] text-[#234b67]">Ndrysho Klient/Furnitor</DialogTitle>
                </DialogHeader>
                <><div className="flex items-center gap-1 border-b border-[#aabac4] bg-[#e7edf1] px-2 py-1 print:hidden"><button type="button" className="alpha-form-tool" onClick={() => setNewCustomerOpen(false)}>Mbyll</button><button type="submit" form="new-customer-form" className="alpha-form-tool">Ruaj</button><button type="button" className="alpha-form-tool">Dok</button><button type="button" className="alpha-form-tool">Ndihmë</button></div><form id="new-customer-form" onSubmit={handleAddCustomer} className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto p-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3d5568]">Kodi</label>
                    <Input name="code" placeholder="CUS-001" />
                  </div>
                  <AlphaPartnerFields kind="Klient" accounts={accounts ?? []} />
                  <Button type="submit" className="col-span-2 h-8 rounded-sm bg-[#2b6892]" disabled={createCustomer.isPending}>
                    {createCustomer.isPending ? "Po ruhet..." : "Ruaj Klientin"}
                  </Button>
                </form></>
              </DialogContent>
            </Dialog></div>
          </div>

          <Card className="rounded-none border border-[#aebdc7] shadow-none">
            <CardContent className="pt-6">
              {visibleCustomers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{customerSearch ? "Nuk u gjet klient që përputhet me kërkimin." : "Nuk ka klientë të regjistruar."}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-xs">
                    <thead>
                      <tr className="bg-gradient-to-b from-[#e8f0f5] to-[#ccdbe5] text-left text-[#264c66]">
                        <th className="text-left py-2 px-2 font-semibold">Kodi</th>
                        <th className="text-left py-2 px-2 font-semibold">Emri</th>
                        <th className="text-left py-2 px-2 font-semibold">NIPT</th>
                        <th className="text-left py-2 px-2 font-semibold">Telefoni</th>
                        <th className="text-left py-2 px-2 font-semibold">Bilansa</th>
                        <th className="text-left py-2 px-2 font-semibold">Aksione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-2">{customer.code}</td>
                          <td className="py-2 px-2 font-medium">{customer.name}</td>
                          <td className="py-2 px-2">{customer.nipt}</td>
                          <td className="py-2 px-2">{customer.phone}</td>
<td className="py-2 px-2 text-right">{((customer.balance ?? 0) / 100).toFixed(2)} L</td>
                              <td className="py-2 px-2 flex gap-2">
                                <button type="button" onClick={() => editCustomer(customer)} className="p-1 hover:bg-gray-100 rounded" aria-label={`Ndrysho ${customer.name}`}>
                                  <Edit2 className="w-4 h-4 text-blue-600" />
                                </button>
                                <button type="button" onClick={() => removeCustomer(customer)} className="p-1 hover:bg-gray-100 rounded" aria-label={`Fshi ${customer.name}`}>
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={editingPartner !== null} onOpenChange={open => { if (!open) setEditingPartner(null); }}>
        <DialogContent className="!fixed !inset-0 !left-0 !top-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 border-[#8199aa] bg-[#f3f6f8] p-0">
          <DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-2"><DialogTitle className="text-[13px] text-[#234b67]">Ndrysho Klient/Furnitor</DialogTitle></DialogHeader>
          <div className="flex items-center gap-1 border-b border-[#aabac4] bg-[#e7edf1] px-2 py-1 print:hidden"><button type="button" className="alpha-form-tool" onClick={() => setEditingPartner(null)}>Mbyll</button><button type="submit" form="edit-partner-form" className="alpha-form-tool">Ruaj</button><button type="button" className="alpha-form-tool">Dok</button><button type="button" className="alpha-form-tool">Ndihmë</button></div>
          <form id="edit-partner-form" onSubmit={handleEditPartner} className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto p-4">{([['code','Kodi'],['name','Emri *'],['nipt','NIPT'],['phone','Telefoni'],['email','Email'],['address','Adresa'],['city','Qyteti']] as const).map(([key,label]) => <label key={key} className="text-[11px] font-semibold text-[#3d5568]">{label}<Input name={key} type={key === "email" ? "email" : "text"} value={partnerForm[key]} onChange={event => setPartnerForm(current => ({ ...current, [key]: event.target.value }))} required={key === "name"} className="mt-1 h-8 rounded-none border-[#9fadb7] text-xs" /></label>)}<AlphaPartnerFields kind={editingPartner?.kind === "supplier" ? "Furnitor" : "Klient"} values={partnerForm.profile} accounts={accounts ?? []} /><div className="col-span-2 flex justify-end gap-2 border-t border-[#c3d0d8] pt-3"><Button type="button" variant="outline" className="h-8 rounded-sm" onClick={() => setEditingPartner(null)}>Anullo</Button><Button type="submit" className="h-8 rounded-sm bg-[#2b6892]" disabled={updateSupplier.isPending || updateCustomer.isPending}>Ruaj ndryshimet</Button></div></form>
        </DialogContent>
      </Dialog>
      </div>
    </AlphaCatalogWindow>
  );
}
