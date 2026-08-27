import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/contexts/CompanyContext";
import EasyInvoiceDialog from "@/components/EasyInvoiceDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import AlphaFileMenu from "@/components/AlphaFileMenu";
import type { FileAction } from "@/components/AlphaFileMenu";
import AlphaConfigMenu from "@/components/AlphaConfigMenu";
import AlphaRegistrationMenu from "@/components/AlphaRegistrationMenu";
import type { ConfigAction } from "@/components/AlphaConfigMenu";
import FileImportExportDialog from "@/components/FileImportExportDialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, Building2, CircleHelp, Menu, X } from "lucide-react";
import { alphaModuleItems, resolveAlphaModule } from "@/lib/alphaNavigation";
import { toast } from "sonner";

function GenitMark() {
  return <span className="grid h-7 w-7 place-items-center rounded-sm border border-[#8ba2b5] bg-gradient-to-b from-[#f4f8fb] to-[#d4e1eb] text-[10px] font-black tracking-tight text-[#1d537c] shadow-sm">SG</span>;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyPanelOpen, setCompanyPanelOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [yearCloseOpen, setYearCloseOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [postYear, setPostYear] = useState(true);
  const [updateAccounts, setUpdateAccounts] = useState(true);
  const { companies, companyId: activeCompanyId, selectCompany } = useCompany();
  const activeCompany = companies.find(company => company.id === activeCompanyId);
  const visibleCompanies = useMemo(() => companies.filter(company => company.name.toLocaleLowerCase().includes(companySearch.trim().toLocaleLowerCase())), [companies, companySearch]);
  const navigate = (path: string) => { setLocation(path); setMobileOpen(false); };
  const chooseCompany = (companyId: number) => { selectCompany(companyId); setCompanyPanelOpen(false); setCompanySearch(""); };
  const activeModule = resolveAlphaModule(location);
  const handleConfigAction = (action: ConfigAction) => {
    if (action === "company") return navigate("/settings?section=company");
    if (action === "articles") return navigate("/products");
    if (action === "salesPrices") return navigate("/config-pricing?mode=prices");
    if (action === "discounts") return navigate("/config-pricing?mode=discounts");
    if (action === "customers") return navigate("/customers");
    if (action === "suppliers") return navigate("/suppliers");
    if (action === "issuers") return navigate("/reference-catalog?type=issuers");
    if (action === "costCenters") return navigate("/reference-catalog?type=cost-centers");
    if (action === "documentGroups") return navigate("/reference-catalog?type=document-groups");
    if (action === "backup") return navigate("/settings?section=backup");
    navigate("/settings?section=fields");
  };
  const handleFileAction = (action: FileAction) => {
    if (action === "editCompany" || action === "selectCompany") return setCompanyPanelOpen(true);
    if (action === "backup") return navigate("/settings?section=backup");
    if (action === "administrativeStructure") return navigate("/administrative-units?mode=structure");
    if (["administrativeSales", "administrativeSupply", "administrativeWarehouse", "administrativeProduction", "administrativeOther"].includes(action)) return navigate(`/administrative-units?kind=${action}`);
    if (action === "liquidityCash") return navigate("/liquidity-units?type=CASH");
    if (action === "liquidityBank") return navigate("/liquidity-units?type=BANK");
    if (action === "fieldsConfig") return navigate("/settings?section=fields");
    if (action === "itemUnits") return navigate("/measurement-units");
    if (["itemGroups", "itemCoding", "itemDetails", "vatLevels", "stockLimit"].includes(action)) return navigate(`/products?mode=${action}`);
    if (["cities", "partnerCategories", "dueDates", "discountCategories"].includes(action)) return navigate(`/reference-catalog?type=${action}`);
    if (["postIrreversible", "postReversible", "postReverse"].includes(action)) return navigate(`/posting?mode=${action}`);
    if (action === "archive") return navigate("/cargo-loads?tab=documents");
    if (["importStandard", "importSheet", "importFormat", "importGroups", "importRun"].includes(action)) return setImportExportOpen(true);
    if (action === "yearClose") return setYearCloseOpen(true);
    logout();
  };
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = event.key.toLocaleLowerCase();
      const accelerator = event.ctrlKey || event.metaKey;
      if (event.altKey && !accelerator && key === "f") { event.preventDefault(); window.dispatchEvent(new Event("genit:open-file-menu")); return; }
      if (!accelerator || !event.altKey) return;
      if (key === "c") { event.preventDefault(); setCompanyPanelOpen(true); }
      if (key === "i" || key === "e") { event.preventDefault(); setImportExportOpen(true); }
      if (key === "y") { event.preventDefault(); setYearCloseOpen(true); }
    };
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, []);

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#eef1f3]"><div className="flex items-center gap-3 text-sm text-[#526170]"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2b6892] border-t-transparent" />Po ngarkohet workspace-i...</div></div>;
  if (!user) return <div className="grid min-h-screen place-items-center bg-[#e9edf0] p-5"><div className="w-full max-w-sm border border-[#9baab7] bg-white shadow-xl"><div className="flex items-center gap-3 border-b border-[#aebbc6] bg-[#d9e6ef] px-5 py-4"><GenitMark /><div><h1 className="text-sm font-bold text-[#244861]">Sistemi Genit Cloud</h1><p className="text-[11px] text-[#667684]">Hyrje me llogari lokale</p></div></div><div className="p-6"><h2 className="text-lg font-semibold text-[#2b3c49]">Mirë se vini</h2><p className="mt-2 text-sm leading-6 text-[#667684]">Hyni me email dhe fjalëkalim lokal për të hapur ambientin e punës.</p><Button onClick={() => navigate("/login")} className="mt-5 h-9 w-full rounded-sm bg-[#2b6892] text-white hover:bg-[#205474]">Hyr në sistem</Button></div></div></div>;

  const sidebar = <aside className="alpha-app-sidebar w-[218px] shrink-0 border-r border-[#aab7c2] bg-[#eef2f5] text-[#2f4658]"><div className="border-b border-[#bdc8d1] bg-[#dce6ed] px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[#4d6576]">Ambientet e punës</p><button onClick={() => setCompanyPanelOpen(true)} className="mt-1 flex w-full items-center gap-2 rounded-sm px-1 py-1 text-left text-xs font-semibold hover:bg-white/60"><Building2 className="h-4 w-4 text-[#2b6892]" /><span className="truncate">{activeCompany?.name || "Zgjidh ndërmarrje"}</span></button></div><div className="border-b border-[#c4ced6] bg-[#f8fafb] py-1 text-[11px]"><button onClick={() => navigate("/")} className="alpha-side-link"><BookOpen className="h-3.5 w-3.5" />Guida për fillimin e punës</button><button onClick={() => navigate("/reports")} className="alpha-side-link"><CircleHelp className="h-3.5 w-3.5" />Manual online &amp; Ndihmë</button><button onClick={() => setCompanyPanelOpen(true)} className="alpha-side-link"><Building2 className="h-3.5 w-3.5" />Zgjidh ndërmarrje</button></div><div className="py-1">{alphaModuleItems.map(item => { const Icon = item.icon; const active = activeModule.id === item.id; return <button key={item.id} onClick={() => navigate(item.path)} className={`flex w-full items-center gap-2 border-l-4 px-3 py-2 text-left text-[12px] font-semibold transition-colors ${active ? "border-[#2b78b5] bg-[#cfe3f2] text-[#194d75]" : "border-transparent hover:bg-white hover:text-[#194d75]"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div><div className="mt-auto border-t border-[#c4ced6] px-3 py-2 text-[10px] text-[#6b7a86]"><p>Cloud workspace</p><p className="mt-0.5">Periudha aktive: 2026</p></div></aside>;

  return <div className="min-h-screen bg-[#e7ecef] font-sans text-[#263b4b]"><header className="fixed inset-x-0 top-0 z-50 border-b border-[#7d96a8] bg-gradient-to-b from-[#f8fafb] to-[#cbdbe6] shadow-[0_1px_2px_rgba(31,54,72,0.18)]"><div className="flex h-[34px] items-center px-2"><button onClick={() => navigate("/")} className="flex items-center gap-2 pr-4"><GenitMark /><span className="hidden text-xs font-bold text-[#244861] sm:block">Sistemi Genit Cloud</span></button><nav className="flex h-full items-stretch" aria-label="Menuja Alpha"><AlphaFileMenu onAction={handleFileAction} /><AlphaConfigMenu onAction={handleConfigAction} /><AlphaRegistrationMenu />{[["Raporte", () => navigate("/reports")], ["Instrumenta", () => navigate("/actions")], ["Ndihmë", () => navigate("/")]].map(([label, action]) => <button key={String(label)} onClick={action as () => void} className="border-x border-transparent px-2.5 text-[12px] font-medium text-[#253f53] hover:border-[#a1b2c0] hover:bg-white/75">{String(label)}</button>)}</nav><div className="ml-auto flex h-full items-center gap-1"><span className="hidden max-w-52 truncate px-2 text-[11px] text-[#405a6d] lg:block">{activeCompany?.name || "Kompania aktive"}</span><button onClick={() => setCompanyPanelOpen(true)} className="grid h-7 w-7 place-items-center rounded-sm hover:bg-white/75" aria-label="Ndrysho kompaninë"><Building2 className="h-4 w-4" /></button><button onClick={() => setMobileOpen(value => !value)} className="grid h-7 w-7 place-items-center rounded-sm hover:bg-white/75 lg:hidden" aria-label="Hap navigimin">{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button><span className="hidden px-1 text-[11px] sm:block">{user.name || "Përdorues"}</span><button onClick={() => navigate("/change-password")} className="hidden px-2 text-[11px] text-[#4b5e6c] hover:underline sm:block">Fjalëkalimi</button><button onClick={() => logout()} className="px-2 text-[11px] text-[#4b5e6c] hover:underline">Dil</button></div></div><div className="flex h-[20px] items-center border-t border-white/60 bg-[#e6eef3] px-3 text-[10px] text-[#526a7b]"><span>Alpha Business / {location.startsWith("/settings") ? "Konfigurime" : activeModule.label}</span><span className="mx-2 text-[#a3b0b9]">|</span><span>{location === "/" ? "Ambient kryesor" : location.startsWith("/settings") ? "Konfigurime dhe katalogë" : "Regjistrime dhe kërkesa"}</span><span className="ml-auto">Përdorues: {user.name || "Administrator"}</span></div></header>
    <div className="flex min-h-screen pt-[54px]">{sidebar}<main className="min-w-0 flex-1 p-2 sm:p-3"><div className="mx-auto w-full max-w-[1800px]">{location !== "/" && activeCompanyId && <div className="mb-2 border border-[#aebbc6] bg-white p-1.5 shadow-sm"><GlobalSearch companyId={activeCompanyId} placeholder={`Kërko në ${activeModule.label}: dokument, partner ose artikull...`} /></div>}{children}</div></main></div>
    <footer className="fixed inset-x-0 bottom-0 z-40 flex h-[20px] items-center border-t border-[#97a8b5] bg-[#d7e1e8] px-3 text-[10px] text-[#536a7a]"><span>Genit Cloud · Alpha workspace</span><span className="ml-auto">{activeCompany?.name || "Pa ndërmarrje"} · 2026</span></footer>
    {location === "/sales-invoices" && activeCompanyId && <EasyInvoiceDialog companyId={activeCompanyId} />}
    {companyPanelOpen && <div className="fixed inset-0 z-[70] bg-slate-950/20 p-3 pt-[62px]" onClick={() => setCompanyPanelOpen(false)}><section className="ml-auto w-full max-w-sm border border-[#8fa3b2] bg-white p-3 shadow-2xl" onClick={event => event.stopPropagation()}><div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold text-[#2b4c63]">Zgjidh ndërmarrje</span><button onClick={() => setCompanyPanelOpen(false)} aria-label="Mbyll"><X className="h-4 w-4" /></button></div><input autoFocus value={companySearch} onChange={event => setCompanySearch(event.target.value)} placeholder="Kërko ndërmarrjen..." className="h-8 w-full border border-[#aebbc6] px-2 text-sm outline-none focus:border-[#2b78b5]" /><div className="mt-2 max-h-72 overflow-y-auto">{visibleCompanies.map(company => <button key={company.id} onClick={() => chooseCompany(company.id)} className={`flex w-full items-center justify-between px-2 py-2 text-left text-sm ${company.id === activeCompanyId ? "bg-[#d7eafa] font-semibold text-[#194d75]" : "hover:bg-[#edf3f7]"}`}><span>{company.name}</span>{company.id === activeCompanyId && <span className="text-[10px]">Aktive</span>}</button>)}</div></section></div>}
    <Dialog open={yearCloseOpen} onOpenChange={setYearCloseOpen}><DialogContent className="max-w-md rounded-sm border-[#8fa3b2] p-0"><div className="border-b border-[#aebbc6] bg-[#dbe7ef] px-4 py-2"><DialogTitle className="text-sm font-bold text-[#294d65]">Mbyllje e Vitit Ushtrimor</DialogTitle></div><div className="space-y-3 p-4 text-sm text-[#3e5667]"><p className="font-semibold">Viti 2026</p><label className="flex items-center gap-2"><input type="checkbox" checked={postYear} onChange={event => setPostYear(event.target.checked)} />Posto Vitin</label><label className="flex items-center gap-2"><input type="checkbox" checked={updateAccounts} onChange={event => setUpdateAccounts(event.target.checked)} />Azhornim Llogarish</label><p className="border-y border-[#cfe0d1] bg-[#f3fbf4] px-2 py-2 text-xs leading-5 text-[#397044]">Përdor butonin Kontrollo përpara mbylljes. Mbyllja e vitit krijon ushtrimin pasues vetëm pasi dokumentet të jenë verifikuar.</p><div className="flex justify-end gap-2 pt-1"><Button type="button" variant="outline" className="h-8 rounded-sm" onClick={() => toast.info("Ndihmë: kontrollo dokumentet dhe raportet para mbylljes së vitit.")}>Ndihmë</Button><Button type="button" variant="outline" className="h-8 rounded-sm" onClick={() => toast.info("Kontrolli i mbylljes së vitit kërkon auditin e dokumenteve dhe nuk ndryshoi të dhëna.")}>Kontrollo</Button><Button type="button" className="h-8 rounded-sm bg-[#2b6892]" onClick={() => toast.warning("Mbyllja e vitit nuk aktivizohet ende në cloud pa audit dhe migrim kontabël të verifikuar.")}>Mbyll Vitin Ushtrimor</Button></div></div></DialogContent></Dialog>
    {activeCompanyId && <FileImportExportDialog companyId={activeCompanyId} open={importExportOpen} onOpenChange={setImportExportOpen} onGoToActions={() => navigate("/actions")} />}
    {mobileOpen && <div className="fixed inset-x-0 top-[54px] z-40 border-b border-[#aab7c2] bg-white p-2 shadow-lg lg:hidden"><div className="grid grid-cols-2">{alphaModuleItems.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.path)} className="flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[#eaf3f9]"><Icon className="h-4 w-4" />{item.label}</button>; })}</div></div>}
  </div>;
}
