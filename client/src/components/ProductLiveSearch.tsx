import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { linkCreatedProductToInvoiceLine } from "../../../shared/productSelection";

type ProductOption = { id: number; name: string; baseUnit: string | null; lastPrice: number | null; stock?: number | null };
type SelectedProduct = { productId?: number; productName: string; unit: string; unitPrice: number };

export default function ProductLiveSearch({ companyId, products, value, onSelect, inputName }: { companyId: number; products: ProductOption[]; value: SelectedProduct; onSelect: (product: SelectedProduct) => void; inputName?: string }) {
  const utils = trpc.useUtils();
  const [query, setQuery] = useState(value.productName);
  const [focused, setFocused] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const createProduct = trpc.product.create.useMutation({
    onSuccess: async (created, variables) => {
      await utils.product.list.invalidate({ companyId });
      onSelect(linkCreatedProductToInvoiceLine({ id: created.id, name: variables.name, baseUnit: variables.baseUnit || "copë" }, variables.lastPrice ?? (value.unitPrice || 0)));
      setQuery(variables.name);
      setFocused(false);
      setCreateOpen(false);
      toast.success(`Artikulli “${variables.name}” u ruajt dhe u zgjodh.`);
    },
    onError: error => toast.error(error.message),
  });
  useEffect(() => { setQuery(value.productName); }, [value.productName]);
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("sq-AL");
    return term ? products.filter(product => product.name.toLocaleLowerCase("sq-AL").includes(term)).slice(0, 7) : products.slice(0, 6);
  }, [products, query]);
  const exactMatch = products.some(product => product.name.trim().toLocaleLowerCase("sq-AL") === query.trim().toLocaleLowerCase("sq-AL"));
  const choose = (product: ProductOption) => { onSelect({ productId: product.id, productName: product.name, unit: product.baseUnit || "copë", unitPrice: product.lastPrice ?? 0 }); setQuery(product.name); setFocused(false); };
  const clear = () => { onSelect({ productId: undefined, productName: "", unit: value.unit || "copë", unitPrice: value.unitPrice || 0 }); setQuery(""); };
  const saveProduct = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name") || "").trim(); if (!name) return toast.error("Emri i artikullit është i detyrueshëm."); createProduct.mutate({ companyId, name, code: String(form.get("code") || "").trim() || undefined, barcode: String(form.get("barcode") || "").trim() || undefined, baseUnit: String(form.get("baseUnit") || "").trim() || "copë", lastPrice: Math.max(0, Number(form.get("lastPrice")) || 0) }); };
  return <div className="relative">{inputName && <input type="hidden" name={inputName} value={value.productId ?? ""} />}<div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={query} onFocus={() => setFocused(true)} onChange={event => { setQuery(event.target.value); onSelect({ productId: undefined, productName: event.target.value, unit: value.unit || "copë", unitPrice: value.unitPrice || 0 }); }} className="h-9 bg-white pl-9 pr-9" placeholder="Kërko artikull..." />{query && <button type="button" onClick={clear} className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded text-[#777] hover:bg-[#eee9ee]" aria-label="Pastro artikullin"><X className="h-3.5 w-3.5" /></button>}</div>{focused && <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-[#d9d4da] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.13)]"><div className="max-h-48 overflow-y-auto">{results.map(product => <button key={product.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => choose(product)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-[#faf5f9]"><span className="min-w-0 truncate font-medium text-[#343434]"><span>{product.name}</span><span className="ml-2 text-[11px] font-normal text-[#6b7280]">Stok: {Number(product.stock ?? 0).toLocaleString("sq-AL")} {product.baseUnit || "copë"}</span></span><span className="shrink-0 text-xs text-[#777]">{product.baseUnit || "copë"}</span></button>)}{results.length === 0 && !query.trim() && <p className="px-3 py-3 text-sm text-[#777]">Nuk ka artikuj të regjistruar.</p>}</div>{query.trim() && !exactMatch && <div className="border-t border-[#ebe6ea] p-2"><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setCreateOpen(true)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-medium text-[#714b67] hover:bg-[#f7eef6]"><Plus className="h-4 w-4" />Shto artikull “{query.trim()}”</button></div>}</div>}<Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Shto artikull të ri</DialogTitle><DialogDescription>Plotëso të dhënat e artikullit. Pas ruajtjes artikulli do të shtohet automatikisht në rreshtin aktiv.</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={saveProduct}><div><Label>Emri i artikullit *</Label><Input name="name" defaultValue={query} required /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>Kodi</Label><Input name="code" placeholder="ART-001" /></div><div><Label>Barkodi</Label><Input name="barcode" placeholder="Opsionale" /></div><div><Label>Njësia</Label><Input name="baseUnit" defaultValue={value.unit || "copë"} /></div><div><Label>Çmimi bazë (qindarka)</Label><Input name="lastPrice" type="number" min="0" defaultValue={value.unitPrice || 0} /></div></div><div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Anulo</Button><Button type="submit" className="bg-[#714b67] text-white hover:bg-[#5f3d58]" disabled={createProduct.isPending}><Check className="mr-1.5 h-4 w-4" />{createProduct.isPending ? "Po ruhet…" : "Ruaj dhe shto"}</Button></div></form></DialogContent></Dialog></div>;
}
