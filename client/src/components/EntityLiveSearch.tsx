import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useCompany } from "@/contexts/CompanyContext";
import { buildPartnerQuickCreatePayload } from "../../../shared/partnerQuickCreate";

type Entity = { id: number; name: string; code?: string | null; nipt?: string | null; surname?: string | null; currency?: string | null };
type Props = { idName: string; nameName: string; items: Entity[]; defaultId?: number; defaultName?: string; placeholder: string; addLabel?: string; onQuickCreate?: (name: string) => Promise<Entity>; onSelect?: (entity: Entity) => void };

export default function EntityLiveSearch({ idName, nameName, items, defaultId, defaultName = "", placeholder, addLabel, onQuickCreate, onSelect }: Props) {
  const { companyId } = useCompany();
  const utils = trpc.useUtils();
  const supplierCreate = trpc.supplier.create.useMutation();
  const customerCreate = trpc.customer.create.useMutation();
  const [text, setText] = useState(defaultName);
  const [selectedId, setSelectedId] = useState<number | undefined>(defaultId);
  const [focused, setFocused] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [lookupSurname, setLookupSurname] = useState("");
  const [lookupCurrency, setLookupCurrency] = useState("");
  const [lookupNipt, setLookupNipt] = useState("");
  const [lookupSelected, setLookupSelected] = useState<Entity | null>(null);
  useEffect(() => { setText(defaultName); setSelectedId(defaultId); }, [defaultId, defaultName]);
  const results = useMemo(() => {
    const query = text.trim().toLocaleLowerCase("sq-AL");
    return query ? items.filter(item => item.name.toLocaleLowerCase("sq-AL").includes(query)).slice(0, 7) : items.slice(0, 7);
  }, [items, text]);
  const choose = (item: Entity) => { setSelectedId(item.id); setText(item.name); setFocused(false); setLookupOpen(false); setLookupSelected(null); onSelect?.(item); };
  const lookupResults = items.filter(item => {     const haystack = item.name.toLocaleLowerCase("sq-AL"); const surname = String(item.surname || "").toLocaleLowerCase("sq-AL"); const code = String(item.code || item.id); const nipt = String(item.nipt || "").toLocaleLowerCase("sq-AL"); return (!lookupCode || code.toLocaleLowerCase("sq-AL").includes(lookupCode.toLocaleLowerCase("sq-AL"))) && (!lookupName || haystack.includes(lookupName.toLocaleLowerCase("sq-AL"))) && (!lookupSurname || surname.includes(lookupSurname.toLocaleLowerCase("sq-AL"))) && (!lookupNipt || nipt.includes(lookupNipt.toLocaleLowerCase("sq-AL"))) && (!lookupCurrency || String(item.currency || "ALL") === lookupCurrency); });
  const openPartnerLookup = () => { setLookupName(text); setLookupSelected(selectedId ? items.find(item => item.id === selectedId) ?? null : null); setLookupOpen(true); };
  const isSupplier = idName === "supplierId";
  const isCustomer = idName === "customerId";
  const canQuickCreate = Boolean(onQuickCreate || (companyId && (isSupplier || isCustomer)));
  const label = addLabel || (isSupplier ? "Shto furnitorin" : isCustomer ? "Shto klientin" : "Shto");
  const savePartner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return toast.error("Emri është i detyrueshëm.");
    try {
      if (onQuickCreate) { choose(await onQuickCreate(name)); setCreateOpen(false); return; }
      if (!companyId) throw new Error("Nuk u gjet kompania aktive.");
      const payload = buildPartnerQuickCreatePayload(companyId, {
        name,
        code: form.get("code"),
        nipt: form.get("nipt"),
        phone: form.get("phone"),
        email: form.get("email"),
        address: form.get("address"),
        city: form.get("city"),
      });
      const created = isSupplier ? await supplierCreate.mutateAsync(payload) : await customerCreate.mutateAsync(payload);
      if (isSupplier) await utils.supplier.list.invalidate({ companyId }); else await utils.customer.list.invalidate({ companyId });
      choose({ id: created.id, name: created.name });
      setCreateOpen(false);
      toast.success(`${isSupplier ? "Furnitori" : "Klienti"} “${created.name}” u ruajt dhe u zgjodh.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Nuk u ruajt rekordi."); }
  };
  const pending = supplierCreate.isPending || customerCreate.isPending;
  return <div className="relative"><input type="hidden" name={idName} value={selectedId ?? ""} /><input type="hidden" name={nameName} value={selectedId ? "" : text} /><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={text} onFocus={() => setFocused(true)} onChange={event => { setText(event.target.value); setSelectedId(undefined); }} className="h-10 bg-white pl-9 pr-20" placeholder={placeholder} /><button type="button" onClick={openPartnerLookup} className="absolute right-8 top-1 grid h-8 w-8 place-items-center rounded border border-[#9fadb7] bg-[#e9eff3] text-[#315a75] hover:bg-[#d6e4ec]" aria-label={`Kërko ${isSupplier ? "furnitorin" : "klientin"}`}><Search className="h-4 w-4" /></button>{text && <button type="button" onClick={() => { setText(""); setSelectedId(undefined); }} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded text-[#777] hover:bg-[#f0edf0]" aria-label="Pastro zgjedhjen"><X className="h-3.5 w-3.5" /></button>}</div>{focused && <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-[#d9d4da] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.13)]">{results.map(item => <button key={item.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => choose(item)} className="block w-full px-3 py-2.5 text-left text-sm hover:bg-[#faf5f9]">{item.name}</button>)}{results.length === 0 && <div className="p-2">{canQuickCreate && text.trim() ? <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setCreateOpen(true)} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm font-medium text-[#714b67] hover:bg-[#f7eef6]"><Plus className="h-4 w-4" />{label} “{text.trim()}”</button> : <p className="px-2 py-2 text-sm text-[#777]">Nuk u gjet rezultat.</p>}</div>}</div>}<Dialog open={lookupOpen} onOpenChange={setLookupOpen}><DialogContent className="max-w-3xl rounded-sm border-[#8199aa] bg-[#f3f6f8] p-0"><DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-2"><DialogTitle className="text-[13px] text-[#234b67]">Kerkim Kliente/Furnitore</DialogTitle></DialogHeader><div className="space-y-3 p-3"><div className="grid grid-cols-2 gap-2 md:grid-cols-5"><Input aria-label="Kodi" value={lookupCode} onChange={event => setLookupCode(event.target.value)} placeholder="Kodi" /><Input aria-label="Emri" value={lookupName} onChange={event => setLookupName(event.target.value)} placeholder="Emri" /><Input aria-label="Mbiemri" value={lookupSurname} onChange={event => setLookupSurname(event.target.value)} placeholder="Mbiemri" /><select aria-label="Monedha" value={lookupCurrency} onChange={event => setLookupCurrency(event.target.value)} className="h-9 rounded-sm border border-[#9fadb7] bg-white px-2 text-xs"><option value="">Monedha</option><option value="ALL">Lek</option><option value="EUR">EUR</option><option value="USD">USD</option></select><div className="flex gap-1"><Input aria-label="Nipt" value={lookupNipt} onChange={event => setLookupNipt(event.target.value)} placeholder="Nipt" /><Button type="button" size="sm" className="h-9 bg-[#2b6892]" onClick={() => setLookupName(lookupName.trim())}>Kërko</Button></div></div><label className="flex items-center gap-2 text-[11px] text-[#3d5568]"><input type="checkbox" defaultChecked />Kerko sapo shkruaj</label><div className="max-h-64 overflow-auto border border-[#9fadb7] bg-white"><table className="w-full text-xs"><thead className="bg-[#d6e4ec] text-left text-[#264c66]"><tr><th className="p-2">Kodi</th><th className="p-2">Emri</th><th className="p-2">Mbiemri</th><th className="p-2">Nipt</th></tr></thead><tbody>{lookupResults.map(item => <tr key={item.id} onClick={() => setLookupSelected(item)} className={`cursor-pointer border-t border-[#e5e9eb] ${lookupSelected?.id === item.id ? "bg-[#b9d9ec]" : "hover:bg-[#eef6fa]"}`}><td className="p-2">{item.code || item.id}</td><td className="p-2">{item.name}</td><td className="p-2">{item.surname || "—"}</td><td className="p-2">{item.nipt || "—"}</td></tr>)}</tbody></table>{lookupResults.length === 0 && <p className="p-4 text-center text-xs text-slate-500">Nuk u gjet rezultat.</p>}</div><div className="flex justify-end gap-2 border-t border-[#c3d0d8] pt-3"><Button type="button" variant="outline" className="h-8 rounded-sm" onClick={() => { setLookupOpen(false); setLookupSelected(null); }}>Mbyll</Button><Button type="button" className="h-8 rounded-sm bg-[#2b6892]" disabled={!lookupSelected} onClick={() => lookupSelected && choose(lookupSelected)}>Ok</Button><Button type="button" variant="outline" className="h-8 rounded-sm border-[#8199aa]" onClick={() => { setLookupOpen(false); setCreateOpen(true); }}>Cil Llogari te re</Button></div></div></DialogContent></Dialog><Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>{isSupplier ? "Shto furnitor të ri" : "Shto klient të ri"}</DialogTitle><DialogDescription>Plotëso të dhënat e partnerit. Pas ruajtjes ai do të zgjidhet automatikisht në dokument.</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={savePartner}><div><Label>Emri *</Label><Input name="name" defaultValue={text} required /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>Kodi</Label><Input name="code" placeholder="OPS-001" /></div><div><Label>NIPT</Label><Input name="nipt" placeholder="L12345678A" /></div><div><Label>Telefoni</Label><Input name="phone" placeholder="+355..." /></div><div><Label>Email</Label><Input name="email" type="email" placeholder="email@kompania.al" /></div></div><div><Label>Adresa</Label><Input name="address" placeholder="Rruga, numri" /></div><div><Label>Qyteti</Label><Input name="city" placeholder="Tiranë" /></div><div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Anulo</Button><Button type="submit" className="bg-[#714b67] text-white hover:bg-[#5f3d58]" disabled={pending}><Check className="mr-1.5 h-4 w-4" />{pending ? "Po ruhet…" : "Ruaj dhe zgjidh"}</Button></div></form></DialogContent></Dialog></div>;
}
