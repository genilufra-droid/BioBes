import { useMemo, useState } from "react";
import { FileBarChart2, Search } from "lucide-react";
import { REPORTS_BY_MODULE, type ReportModule } from "../../../shared/reportCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OdooControlPanel, OdooToolbar } from "@/components/OdooControlPanel";

export default function ModuleReportMenu({ module }: { module: ReportModule }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const moduleReports = REPORTS_BY_MODULE[module];
  const reports = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("sq-AL");
    return search ? moduleReports.filter(report => `${report.title} ${report.group} ${report.description}`.toLocaleLowerCase("sq-AL").includes(search)) : moduleReports;
  }, [moduleReports, query]);

  return <OdooControlPanel app={module} title={module === "Shitje" ? "Regjistrime · Shitje" : `Raportet e ${module}`} viewMode={viewMode} onViewModeChange={setViewMode} actions={<div className="flex items-center gap-2">{module === "Shitje" && <Button type="button" size="sm" className="bg-[#714b67] text-white hover:bg-[#5f3d58]" onClick={() => { window.location.href = "/sales-invoices?tab=invoices&newInvoice=1"; }}>Faturë e re</Button>}<Button type="button" size="sm" variant={module === "Shitje" ? "outline" : "default"} className={module === "Shitje" ? "border-[#d6ccd5]" : "bg-[#714b67] text-white hover:bg-[#5f3d58]"} onClick={() => setOpen(current => !current)}>{open ? "Mbyll raportet" : "Shfaq raportet"}</Button></div>}>
    {open && <div className="space-y-3"><OdooToolbar><div className="relative w-full max-w-lg"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={query} onChange={event => setQuery(event.target.value)} className="h-9 bg-white pl-9 text-sm" placeholder={`Kërko në raportet e ${module}...`} /></div><span className="text-xs text-[#777]">{reports.length} raporte</span></OdooToolbar>{viewMode === "kanban" ? <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{reports.map(report => <a key={report.key} href={`/reports?module=${encodeURIComponent(module)}&report=${encodeURIComponent(report.key)}`} className="group rounded-md border border-[#dfdade] bg-white p-3 transition hover:border-[#714b67] hover:bg-[#fbf7fa]"><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold text-[#343434]">{report.title}</span><FileBarChart2 className="h-4 w-4 shrink-0 text-[#714b67]" /></div><p className="mt-1 text-xs text-[#777]">{report.group}</p></a>)}</div> : <div className="overflow-hidden rounded-md border border-[#dfdade] bg-white">{reports.map(report => <a key={report.key} href={`/reports?module=${encodeURIComponent(module)}&report=${encodeURIComponent(report.key)}`} className="flex items-center justify-between gap-3 border-b border-[#eee9ee] px-3 py-2.5 last:border-0 hover:bg-[#fbf7fa]"><span><span className="block text-sm font-medium text-[#343434]">{report.title}</span><span className="mt-0.5 block text-xs text-[#777]">{report.group}</span></span><FileBarChart2 className="h-4 w-4 shrink-0 text-[#714b67]" /></a>)}</div>}{reports.length === 0 && <p className="py-6 text-center text-sm text-[#777]">Nuk u gjet raport në këtë modul.</p>}</div>}
  </OdooControlPanel>;
}
