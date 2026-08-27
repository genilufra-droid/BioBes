import type { ChangeEvent } from "react";
import { ArrowLeft, BarChart3, Eye, FileText, Home, Search, SlidersHorizontal, X } from "lucide-react";
import type { ReportModule } from "../../../shared/reportCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AlphaReportInlineFiltersProps = {
  selectedTitle: string;
  moduleLabel?: ReportModule;
  filterVisibility?: Partial<{
    amount: boolean;
    documentNumber: boolean;
    documentType: boolean;
    currency: boolean;
    partner: boolean;
    product: boolean;
    warehouse: boolean;
    status: boolean;
  }>;
  partnerLabel?: string;
  partnerLookupKind?: "supplier" | "customer";
  showPartner?: boolean;
  dateFrom: string;
  dateTo: string;
  documentFilter: string;
  documentFilterEnd: string;
  partnerFilter: string;
  categoryFilter: string;
  statusFilter: string;
  currencyFilter: string;
  documentTypeFilter: string;
  warehouseFilter: string;
  amountMin: string;
  amountMax: string;
  isLoading: boolean;
  hasExecuted: boolean;
  columns: string[];
  rows: Record<string, unknown>[];
  metrics: { label: string; value: number }[];
  onOpenDocument: (row: Record<string, unknown>) => void;
  formatCell: (value: unknown) => string;
  onDateFromChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDateToChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDocumentFilterChange: (value: string) => void;
  onDocumentFilterEndChange: (value: string) => void;
  onPartnerFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCurrencyFilterChange: (value: string) => void;
  onDocumentTypeFilterChange: (value: string) => void;
  onWarehouseFilterChange: (value: string) => void;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
  onLookup: (kind: "supplier" | "customer" | "product" | "warehouse") => void;
  onView: () => void;
  onClear: () => void;
  onNewPage: () => void;
  onList: () => void;
  onHome: () => void;
  onDelta: () => void;
};

export default function AlphaReportInlineFilters({
  selectedTitle,
  moduleLabel = "Blerje",
  filterVisibility,
  partnerLabel = "FURNITORI",
  partnerLookupKind,
  showPartner = true,
  dateFrom,
  dateTo,
  documentFilter,
  documentFilterEnd,
  partnerFilter,
  categoryFilter,
  statusFilter,
  currencyFilter,
  documentTypeFilter,
  warehouseFilter,
  amountMin,
  amountMax,
  isLoading,
  hasExecuted,
  columns,
  rows,
  metrics,
  onOpenDocument,
  formatCell,
  onDateFromChange,
  onDateToChange,
  onDocumentFilterChange,
  onDocumentFilterEndChange,
  onPartnerFilterChange,
  onCategoryFilterChange,
  onStatusFilterChange,
  onCurrencyFilterChange,
  onDocumentTypeFilterChange,
  onWarehouseFilterChange,
  onAmountMinChange,
  onAmountMaxChange,
  onLookup,
  onView,
  onClear,
  onNewPage,
  onList,
  onHome,
  onDelta,
}: AlphaReportInlineFiltersProps) {
  const resolvedPartnerLookupKind = partnerLookupKind ?? (moduleLabel === "Shitje" ? "customer" : "supplier");
  const visible = { amount: true, documentNumber: true, documentType: true, currency: true, partner: true, product: true, warehouse: true, status: false, ...filterVisibility };

  return <section data-alpha-inline-filters data-report-module={moduleLabel} className="bg-[#f7f7f7] text-[#202020]">
    <div data-report-exit-toolbar className="sticky top-0 z-40 flex min-h-11 flex-wrap items-center justify-between gap-2 border-y border-[#b8b8b8] bg-white px-3 py-1.5 shadow-[0_2px_5px_rgba(0,0,0,0.12)]">
      <div className="min-w-0"><p className="text-[10px] text-[#666]">Raporte / {moduleLabel}</p><h1 className="truncate text-sm font-semibold">{selectedTitle}</h1></div>
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onList} aria-label="Kthehu te Raportet"><ArrowLeft className="mr-1 h-4 w-4" />Raportet</Button>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onHome} aria-label="Shko në faqen kryesore"><Home className="mr-1 h-4 w-4" />Faqja kryesore</Button>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onList}><X className="mr-1 h-4 w-4" />Mbyll</Button>
        <Button type="button" size="sm" className="h-8 rounded-none bg-[#0878c9] text-white hover:bg-[#05659f]" onClick={onView} disabled={isLoading}><Eye className="mr-1 h-4 w-4" />{isLoading ? "Po ngarkohet..." : "Shiko"}</Button>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onNewPage}><FileText className="mr-1 h-4 w-4" />Faqe Re</Button>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onClear}><SlidersHorizontal className="mr-1 h-4 w-4" />Pastro</Button>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onList}><Search className="mr-1 h-4 w-4" />Lista</Button>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onDelta}><BarChart3 className="mr-1 h-4 w-4" />Vizualizo ne Delta</Button>
      </div>
    </div>
    <div className={`grid gap-3 p-3 ${visible.amount ? "lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]" : "lg:grid-cols-2"}`}>
      {visible.amount && <fieldset className="rounded-sm border border-[#a9a9a9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">Shuma</legend><div className="grid grid-cols-3 gap-1 text-[11px] text-[#444]"><label className="flex items-center gap-1"><input type="radio" name="alpha-inline-amount-mode" defaultChecked={false} />Sasia</label><label className="flex items-center gap-1"><input type="radio" name="alpha-inline-amount-mode" />Cmimi</label><label className="flex items-center gap-1"><input type="radio" name="alpha-inline-amount-mode" defaultChecked />Vlefta</label></div><div className="mt-2 grid grid-cols-2 gap-2"><label className="text-[11px] text-[#555]">Min<Input aria-label="Shuma minimale" type="number" value={amountMin} onChange={event => onAmountMinChange(event.target.value)} className="mt-1 h-7 rounded-none border-[#999] bg-white px-1 text-[11px]" /></label><label className="text-[11px] text-[#555]">Max<Input aria-label="Shuma maksimale" type="number" value={amountMax} onChange={event => onAmountMaxChange(event.target.value)} className="mt-1 h-7 rounded-none border-[#999] bg-white px-1 text-[11px]" /></label></div></fieldset>}
      <div className="space-y-3">{(visible.documentNumber || visible.documentType || visible.currency || visible.status) && <fieldset className="rounded-sm border border-[#a9a9a9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">REGJISTRI I FATURAVE</legend>{visible.documentNumber && <label className="block text-[11px] text-[#555]">Numër dokumenti<div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1"><Input aria-label="Numër dokumenti nga" value={documentFilter} onChange={event => onDocumentFilterChange(event.target.value)} className="h-7 rounded-none border-[#999] bg-white text-[11px]" /><span className="text-[11px] text-[#555]">deri</span><Input aria-label="Numër dokumenti deri" value={documentFilterEnd} onChange={event => onDocumentFilterEndChange(event.target.value)} className="h-7 rounded-none border-[#999] bg-white text-[11px]" /></div></label>}{visible.documentType && <label className="mt-2 block text-[11px] text-[#555]">Lloj Dokumenti<select aria-label="Lloj dokumenti" value={documentTypeFilter} onChange={event => onDocumentTypeFilterChange(event.target.value)} className="mt-1 h-7 w-full border border-[#999] bg-white px-1 text-[11px]"><option value="">Të gjithë</option><option value="Faturë">Faturë</option><option value="Porosi">Porosi</option><option value="Pranim">Pranim</option><option value="Kthim">Kthim</option></select></label>}{visible.status && <label className="mt-2 block text-[11px] text-[#555]">Statusi<select aria-label="Statusi i faturës" value={statusFilter} onChange={event => onStatusFilterChange(event.target.value)} className="mt-1 h-7 w-full border border-[#999] bg-white px-1 text-[11px]"><option value="">Të gjithë</option><option value="DRAFT">Draft</option><option value="POSTED">Postuar</option><option value="PARTIAL">Pjesërisht e paguar</option><option value="PAID">E paguar</option><option value="CANCELLED">Anuluar</option></select></label>}{visible.currency && <label className="mt-2 block text-[11px] text-[#555]">Monedha<select aria-label="Monedha" value={currencyFilter} onChange={event => onCurrencyFilterChange(event.target.value)} className="mt-1 h-7 w-full border border-[#999] bg-white px-1 text-[11px]"><option value="">Të gjitha</option><option value="ALL">ALL</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></label>}</fieldset>}<fieldset className="rounded-sm border border-[#a9a9a9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">DATA E REGJISTRIMIT</legend><div className="flex gap-3 text-[11px] text-[#444]"><label className="flex items-center gap-1"><input type="radio" name="alpha-inline-date-mode" defaultChecked />Të gjitha datat</label><label className="flex items-center gap-1"><input type="radio" name="alpha-inline-date-mode" />Intervali</label></div><p className="mt-1 text-[10px] text-[#666]">Pa interval shfaqet historiku i plotë i kompanisë aktive.</p><div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-1"><Input aria-label="Data nga" type="date" value={dateFrom} onChange={onDateFromChange} className="h-7 rounded-none border-[#999] bg-white text-[11px]" /><span className="text-[11px] text-[#555]">deri</span><Input aria-label="Data deri" type="date" value={dateTo} onChange={onDateToChange} className="h-7 rounded-none border-[#999] bg-white text-[11px]" /></div></fieldset></div>
      <div className="space-y-3">{(visible.product || (showPartner && visible.partner)) && <fieldset className="rounded-sm border border-[#a9a9a9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">Identifikues</legend>{visible.product && <label className="block text-[11px] text-[#555]">Kartela / Artikulli<div className="mt-1 flex gap-1"><Input aria-label="Kartela" value={categoryFilter} onChange={event => onCategoryFilterChange(event.target.value)} className="h-7 rounded-none border-[#999] bg-white text-[11px]" /><button type="button" className="flex h-7 w-7 items-center justify-center border border-[#999] bg-white text-[#0878c9]" aria-label="Kërko kartelën" onClick={() => onLookup("product")}><Search className="h-3.5 w-3.5" /></button></div></label>}{showPartner && visible.partner && <label className="mt-2 block text-[11px] text-[#555]">{partnerLabel}<div className="mt-1 flex gap-1"><Input aria-label={partnerLabel} value={partnerFilter} onChange={event => onPartnerFilterChange(event.target.value)} className="h-7 rounded-none border-[#999] bg-white text-[11px]" /><button type="button" className="flex h-7 w-7 items-center justify-center border border-[#999] bg-white text-[#0878c9]" aria-label={`Kërko ${partnerLabel.toLocaleLowerCase("sq-AL")}`} onClick={() => onLookup(resolvedPartnerLookupKind)}><Search className="h-3.5 w-3.5" /></button></div></label>}</fieldset>}{visible.warehouse && <fieldset className="min-h-[100px] rounded-sm border border-[#a9a9a9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">MAGAZINA</legend><div className="flex gap-1"><Input aria-label="Magazina" value={warehouseFilter} onChange={event => onWarehouseFilterChange(event.target.value)} className="h-7 rounded-none border-[#999] bg-white text-[11px]" /><button type="button" className="flex h-7 w-7 items-center justify-center border border-[#999] bg-white text-[#0878c9]" aria-label="Kërko magazinën" onClick={() => onLookup("warehouse")}><Search className="h-3.5 w-3.5" /></button></div></fieldset>}</div>
    </div>
    <div className="flex justify-end gap-1 border-t border-[#b8b8b8] bg-white px-3 py-2"><Button type="button" size="sm" className="h-8 rounded-none bg-[#0878c9] text-white hover:bg-[#05659f]" onClick={onView} disabled={isLoading}><Eye className="mr-1 h-4 w-4" />ENTER - Shiko</Button><Button type="button" variant="outline" size="sm" className="h-8 rounded-none border-[#777] bg-[#efefef] text-[#202020] hover:bg-white" onClick={onList}><X className="mr-1 h-4 w-4" />ESC - Dil</Button></div>
    {hasExecuted && <section data-purchase-inline-result className="border-t-2 border-[#858585] bg-white p-3"><div className="mb-2 flex items-center justify-between gap-2"><div><h2 className="text-sm font-semibold text-[#333]">{selectedTitle}</h2><p className="text-[11px] text-[#666]">Rezultati i filtruar · {rows.length} rreshta</p></div><div className="flex gap-3 text-[11px] text-[#555]">{metrics.slice(0, 3).map(metric => <span key={metric.label}><strong>{metric.label}:</strong> {formatCell(metric.value)}</span>)}</div></div><div className="overflow-x-auto border border-[#b8b8b8]"><table className="w-full min-w-[820px] border-collapse text-[11px]"><thead className="bg-[#e6e5b5] text-left"><tr>{columns.map(column => <th key={column} className="border border-[#8a8a63] px-2 py-1.5 font-semibold">{column}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={Math.max(columns.length, 1)} className="p-6 text-center text-[#666]">Nuk ka të dhëna.</td></tr> : rows.map((row, rowIndex) => <tr key={rowIndex} className="even:bg-[#fffef1]"><td className="hidden" />{columns.map(column => <td key={column} className="border border-[#cfcfcf] px-2 py-1.5">{row.__documentId && (column === "Dokumenti" || column === "Nr." || column === "Nr Dok" || column === "Fatura") ? <button type="button" className="font-semibold text-[#0878c9] underline" onClick={() => onOpenDocument(row)}>{formatCell(row[column])}</button> : formatCell(row[column])}</td>)}</tr>)}</tbody></table></div></section>}
  </section>;
}
