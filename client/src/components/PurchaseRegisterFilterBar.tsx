import { useState } from "react";
import { Eye, EyeOff, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type PurchaseRegisterFilters = {
  dateFrom: string; dateTo: string; docNumber: string; status: string; supplierId: string; supplier: string;
  productId: string; product: string; quantity: string; unitPrice: string; netValue: string; vat: string;
  grossValue: string; carrier: string; plate: string; inventoryReference: string;
};

export const emptyPurchaseRegisterFilters: PurchaseRegisterFilters = {
  dateFrom: "", dateTo: "", docNumber: "", status: "", supplierId: "", supplier: "", productId: "", product: "",
  quantity: "", unitPrice: "", netValue: "", vat: "", grossValue: "", carrier: "", plate: "", inventoryReference: "",
};

export function PurchaseRegisterFilterBar({ filters, onChange }: { filters: PurchaseRegisterFilters; onChange: (filters: PurchaseRegisterFilters) => void }) {
  const update = (key: keyof PurchaseRegisterFilters, value: string) => onChange({ ...filters, [key]: value });
  const hasFilters = Object.values(filters).some(Boolean);
  const fields: Array<[keyof PurchaseRegisterFilters, string, string, string?]> = [
    ["dateFrom", "Nga data", "date"], ["dateTo", "Deri në datë", "date"], ["docNumber", "Nr. dokumentit", "text"],
    ["status", "Statusi", "text"], ["supplierId", "Kodi furnitorit", "text"], ["supplier", "Furnitori", "text"],
    ["productId", "Kodi artikullit", "text"], ["product", "Artikulli", "text"], ["quantity", "Sasia", "number"],
    ["unitPrice", "Çmimi", "number"], ["netValue", "Vlera pa TVSH", "number"], ["vat", "TVSH", "number"],
    ["grossValue", "Vlera me TVSH", "number"], ["carrier", "Transportuesi", "text"], ["plate", "Targa", "text"],
    ["inventoryReference", "Inventari", "text"],
  ];
  const [isExpanded, setIsExpanded] = useState(true);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const activeFilterSummary = fields.filter(([key]) => filters[key]).map(([key, label]) => `${label}: ${filters[key]}`).join(" · ");
  return <section className="rounded-md border border-[#d8d0d2] bg-[#faf8fa] px-4 py-3" data-testid="purchase-register-column-filters">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#714b67]">Filtra sipas kolonave</p><p className="mt-0.5 text-xs text-[#777]">Plotëso një ose disa fusha si në Excel; filtrat kombinohen menjëherë.</p></div><div className="flex flex-wrap items-center gap-2">{hasFilters && <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...emptyPurchaseRegisterFilters })}><FilterX className="mr-1.5 h-4 w-4" />Pastro filtrat</Button>}<Button type="button" variant="outline" size="sm" aria-expanded={isExpanded} aria-controls="purchase-register-column-filter-fields" data-testid="toggle-purchase-register-filters" onClick={() => setIsExpanded(current => !current)}>{isExpanded ? <><EyeOff className="mr-1.5 h-4 w-4" />Fshih filtrat</> : <><Eye className="mr-1.5 h-4 w-4" />Shfaq filtrat{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</>}</Button></div></div>
    {isExpanded ? <div id="purchase-register-column-filter-fields" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">{fields.map(([key, label, type]) => <label key={key} className="space-y-1"><span className="text-[11px] font-semibold text-[#625c62]">{label}</span><Input aria-label={label} type={type} value={filters[key]} onChange={event => update(key, event.target.value)} placeholder={type === "date" ? undefined : label} className="h-9 bg-white text-xs" /></label>)}<div className="sm:col-span-2 lg:col-span-4 xl:col-span-6 flex justify-end border-t border-[#e6dfe4] pt-2"><Button type="button" size="sm" className="bg-[#714b67] text-white hover:bg-[#5e3d58]" data-testid="apply-purchase-register-filters" onClick={() => setIsExpanded(false)}><Eye className="mr-1.5 h-4 w-4" />Shfaq rezultatet</Button></div></div> : <div className="rounded border border-dashed border-[#d8cbd5] bg-white/70 px-3 py-2 text-xs text-[#625c62]" data-testid="purchase-register-filter-summary">{activeFilterSummary || "Nuk ka filtra aktive."}</div>}
  </section>;
}
