import { useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CatalogItem = { id: number; code?: string | null; name: string; kind?: string | null };
type Props = { items: CatalogItem[]; value?: number; inputName?: string; placeholder: string; addLabel: string; createTitle: string; createDescription?: string; onChange: (id: number) => void; onCreate: (payload: { code: string; name: string; kind: string }) => Promise<CatalogItem | void> | CatalogItem | void; kindOptions?: { value: string; label: string }[] };

export default function CatalogLiveSearch({ items, value, inputName, placeholder, addLabel, createTitle, createDescription, onChange, onCreate, kindOptions = [] }: Props) {
  const selected = items.find(item => item.id === value);
  const [query, setQuery] = useState(selected ? `${selected.code ? `${selected.code} — ` : ""}${selected.name}` : "");
  const [focused, setFocused] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const results = useMemo(() => { const needle = query.trim().toLocaleLowerCase(); return needle ? items.filter(item => `${item.code ?? ""} ${item.name}`.toLocaleLowerCase().includes(needle)).slice(0, 12) : items.slice(0, 12); }, [items, query]);
  const choose = (item: CatalogItem) => { onChange(item.id); setQuery(`${item.code ? `${item.code} — ` : ""}${item.name}`); setFocused(false); };
  const clear = () => { onChange(0); setQuery(""); };
  return <div className="relative">
    {inputName && <input type="hidden" name={inputName} value={value || ""} required />}
    <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#718391]" /><Input value={query} onFocus={() => setFocused(true)} onChange={event => { setQuery(event.target.value); onChange(0); setFocused(true); }} placeholder={placeholder} className="h-10 bg-white pl-8 pr-8" />{query && <button type="button" onClick={clear} aria-label="Pastro zgjedhjen" className="absolute right-2 top-2.5 text-[#718391]"><X className="h-4 w-4" /></button>}</div>
    {focused && <div className="absolute z-40 mt-1 max-h-64 w-full overflow-auto border border-[#94a9b8] bg-white shadow-lg">{results.map(item => <button type="button" key={item.id} onMouseDown={event => event.preventDefault()} onClick={() => choose(item)} className="block w-full border-b border-[#e5ebef] px-2 py-2 text-left text-xs hover:bg-[#e9f2f7]">{item.code ? `${item.code} — ` : ""}{item.name}</button>)}{results.length === 0 && query.trim() && <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => setCreateOpen(true)} className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs font-semibold text-[#245b7c] hover:bg-[#edf6fb]"><Plus className="h-4 w-4" />{addLabel} “{query.trim()}”</button>}{results.length === 0 && !query.trim() && <p className="p-2 text-xs text-[#718391]">Nuk ka rezultate.</p>}</div>}
    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-w-md rounded-sm"><DialogHeader><DialogTitle>{createTitle}</DialogTitle><DialogDescription>{createDescription}</DialogDescription></DialogHeader><form className="space-y-3" onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const created = await onCreate({ code: String(form.get("code") || "").trim(), name: String(form.get("name") || "").trim(), kind: String(form.get("kind") || kindOptions[0]?.value || "GENERAL") }); if (created?.id) choose(created); setCreateOpen(false); }}><div><Label>Kodi</Label><Input name="code" required autoFocus /></div><div><Label>Emri</Label><Input name="name" required defaultValue={query.trim()} /></div>{kindOptions.length > 0 && <div><Label>Lloji</Label><select name="kind" defaultValue={kindOptions[0].value} className="mt-1 h-10 w-full rounded-sm border border-input bg-background px-3 text-sm">{kindOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>}<div className="flex justify-end gap-2 border-t pt-3"><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Anulo</Button><Button type="submit" className="bg-[#2b6892] text-white"><Check className="mr-1.5 h-4 w-4" />Ruaj dhe zgjidh</Button></div></form></DialogContent></Dialog>
  </div>;
}

export type { CatalogItem };
