import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpRight, BarChart3, Bookmark, CircleHelp, Eye, FileSpreadsheet, FileText, LoaderCircle, Printer, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { buildSourceDocumentUrl, exportToExcel, exportToPDF } from "@/lib/export";
import { REPORT_CATALOG, type ReportCatalogItem, type ReportModule } from "../../../shared/reportCatalog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getReferenceColumnLabel, getReferenceGroups, getReferenceTitle, getReferenceTotalLabel, ReferenceReportView } from "@/components/ReferenceReportView";
import SourceDocumentLink from "@/components/SourceDocumentLink";
import AlphaReportInlineFilters from "@/components/AlphaReportInlineFilters";
import { activeReportFilters, filterReportRows, filterReportRowsByColumns, reportMetricValue, searchReportRows, sortReportRows, sumNumericColumn, type ReportColumnFilters, type ReportSort } from "@/lib/reportFiltering";
import { getAlphaReportFilterVisibility, getLegacyReportFilterVisibility } from "@/lib/reportFilterProfile";
import { filterReportCustomers, type CustomerLookupRecord } from "@/lib/reportCustomerLookup";
import { ALPHA_PRIMARY_REPORT_MODULES as alphaPrimaryModules, ALPHA_SECONDARY_REPORT_MODULES as alphaSecondaryModules, ALPHA_REPORT_MODULE_LABELS as alphaModuleLabels, ALPHA_REPORT_NAV_ITEMS as alphaReportNavItems, alphaReportWorkspaceUrl } from "@/lib/reportsMenu";

const reportModules: ReportModule[] = ["Blerje", "Shitje", "Magazina", "Kontabilitet", "CRM", "Banka"];
const modules: (ReportModule | "Të gjitha")[] = ["Të gjitha", ...reportModules];
const moduleColors: Record<ReportModule, string> = {
  Blerje: "bg-violet-100 text-violet-800",
  Shitje: "bg-blue-100 text-blue-800",
  Magazina: "bg-amber-100 text-amber-800",
  Kontabilitet: "bg-emerald-100 text-emerald-800",
  CRM: "bg-pink-100 text-pink-800",
  Banka: "bg-cyan-100 text-cyan-800",
};

const isModule = (value: string | null): value is ReportModule => Boolean(value && modules.includes(value as ReportModule));
const reportFromUrl = () => new URLSearchParams(window.location.search).get("report");
const moduleFromUrl = () => new URLSearchParams(window.location.search).get("module");

function cellValue(value: unknown) {
  if (value instanceof Date) return value.toLocaleDateString("sq-AL");
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString("sq-AL");
  if (typeof value === "number") return value.toLocaleString("sq-AL");
  return String(value ?? "—");
}

function reportUrl(module: ReportModule | "Të gjitha", key: string) {
  const parameters = new URLSearchParams();
  if (module !== "Të gjitha") parameters.set("module", module);
  parameters.set("report", key);
  return `/reports?${parameters.toString()}`;
}

type SavedReportFilter = {
  id: string;
  companyId: number;
  reportKey: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  documentFilter: string;
  documentFilterEnd?: string;
  partnerFilter: string;
  categoryFilter: string;
  statusFilter: string;
  currencyFilter?: string;
  documentTypeFilter?: string;
  warehouseFilter?: string;
  unitFilter?: string;
  amountMin: string;
  amountMax: string;
};

export default function ReportsCenter({ companyId }: { companyId: number }) {
  const [location, setLocation] = useLocation();
  const detailsRef = useRef<HTMLDivElement>(null);
  const [moduleFilter, setModuleFilter] = useState<ReportModule | "Të gjitha">(() => {
    const requestedModule = moduleFromUrl();
    if (isModule(requestedModule)) return requestedModule;
    const requestedReport = REPORT_CATALOG.find(item => item.key === reportFromUrl());
    return requestedReport?.module ?? "Të gjitha";
  });
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState(() => REPORT_CATALOG.some(item => item.key === reportFromUrl()) ? reportFromUrl()! : REPORT_CATALOG[0].key);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [openedReportDocument, setOpenedReportDocument] = useState<Record<string, unknown> | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [documentFilter, setDocumentFilter] = useState("");
  const [documentFilterEnd, setDocumentFilterEnd] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [amountMode, setAmountMode] = useState<"Sasia" | "Cmimi" | "Vlefta">("Vlefta");
  const [groupByOne, setGroupByOne] = useState("");
  const [groupByTwo, setGroupByTwo] = useState("");
  const [groupByThree, setGroupByThree] = useState("");
  const [favoriteName, setFavoriteName] = useState("");
  const [savedFilters, setSavedFilters] = useState<SavedReportFilter[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("sistemi-genit-report-filters") ?? "[]") as SavedReportFilter[]; } catch { return []; }
  });
  const [isViewing, setIsViewing] = useState(false);
  const [hasExecutedReport, setHasExecutedReport] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ReportColumnFilters>({});
  const [tableSort, setTableSort] = useState<ReportSort>(null);
  const [lookupKind, setLookupKind] = useState<"supplier" | "customer" | "product" | "warehouse" | "document" | null>(null);
  const [lookupTerm, setLookupTerm] = useState("");

  useEffect(() => {
    const requestedModule = moduleFromUrl();
    const requestedReport = reportFromUrl();
    if (isModule(requestedModule)) setModuleFilter(requestedModule);
    else if (requestedReport) setModuleFilter(REPORT_CATALOG.find(item => item.key === requestedReport)?.module ?? "Të gjitha");
    if (requestedReport && REPORT_CATALOG.some(item => item.key === requestedReport)) {
      setSelectedKey(requestedReport);
      setHasExecutedReport(false);
      setIsReportOpen(true);
    }
  }, [location]);

  const selected = REPORT_CATALOG.find(item => item.key === selectedKey) ?? REPORT_CATALOG[0];
  const legacyFilterVisibility = getLegacyReportFilterVisibility(selected.module, selected.key);
  const showLegacyDocumentNumberFilter = legacyFilterVisibility.documentNumber;
  const effectiveDocumentFilter = showLegacyDocumentNumberFilter ? documentFilter : "";
  const reportInput = useMemo(() => ({
    companyId,
    reportKey: selectedKey,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
    documentFilter: effectiveDocumentFilter || undefined,
    documentFilterEnd: showLegacyDocumentNumberFilter ? documentFilterEnd || undefined : undefined,
    partnerFilter: partnerFilter || undefined,
    categoryFilter: categoryFilter || undefined,
    statusFilter: statusFilter || undefined,
    currencyFilter: currencyFilter || undefined,
    documentTypeFilter: documentTypeFilter || undefined,
    warehouseFilter: warehouseFilter || undefined,
    unitFilter: unitFilter || undefined,
    amountMin: amountMin || undefined,
    amountMax: amountMax || undefined,
  }), [companyId, selectedKey, dateFrom, dateTo, effectiveDocumentFilter, documentFilterEnd, showLegacyDocumentNumberFilter, partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax]);
  const reportQuery = trpc.reportCenter.get.useQuery(reportInput, { enabled: hasExecutedReport });
  const lookupQuery = trpc.globalSearch.query.useQuery({ companyId, term: lookupTerm }, { enabled: Boolean(lookupKind && lookupKind !== "customer" && lookupTerm.trim().length >= 2) });
  const customerLookupQuery = trpc.customer.list.useQuery({ companyId }, { enabled: lookupKind === "customer" });
  const salesInvoiceCustomerLookupQuery = trpc.salesInvoice.list.useQuery({ companyId }, { enabled: lookupKind === "customer" });
  const isPurchaseModule = selected.module === "Blerje";
  const isSalesModule = selected.module === "Shitje";
  const hideSalesCustomerContext = false;
  const isInventoryModule = selected.module === "Magazina";
  const inlinePartnerLabel = isSalesModule ? "KLIENTI" : isPurchaseModule ? "FURNITORI" : "PARTNERI";
  const inlinePartnerLookupKind = isSalesModule || selected.module === "CRM" ? "customer" : "supplier";
  const showLegacyDocumentTypeFilter = legacyFilterVisibility.documentType;
  const showLegacyCurrencyFilter = legacyFilterVisibility.currency;
  const openLookup = (kind: "supplier" | "customer" | "product" | "warehouse" | "document", currentValue = "") => { setLookupKind(kind); setLookupTerm(currentValue); };
  const customerLookupOptions = useMemo<CustomerLookupRecord[]>(() => {
    const master = customerLookupQuery.data ?? [];
    const knownNames = new Set(master.map(item => item.name.trim().toLocaleLowerCase("sq-AL")));
    const imported = (salesInvoiceCustomerLookupQuery.data ?? [])
      .flatMap(invoice => invoice.customerName?.trim() ? [invoice.customerName.trim()] : [])
      .filter(name => !knownNames.has(name.toLocaleLowerCase("sq-AL")))
      .filter((name, index, names) => names.findIndex(candidate => candidate.toLocaleLowerCase("sq-AL") === name.toLocaleLowerCase("sq-AL")) === index)
      .map((name, index) => ({ id: -(index + 1), name, code: null, email: null, phone: null }));
    return [...master, ...imported];
  }, [customerLookupQuery.data, salesInvoiceCustomerLookupQuery.data]);
  const lookupResults = lookupKind === "customer"
    ? filterReportCustomers(customerLookupOptions, lookupTerm).map(item => ({ type: "Klient", title: item.name, subtitle: item.code || item.email || item.phone || "Klient nga faturat e importuara", path: "/customers" }))
    : (lookupQuery.data ?? []).filter(item => {
        if (lookupKind === "supplier") return item.type === "Furnitor";
        if (lookupKind === "product") return item.type === "Artikull";
        if (lookupKind === "warehouse") return item.type === "Magazinë";
        if (lookupKind === "document") return ["Faturë blerje", "Faturë shitje", "Porosi blerje", "Porosi shitje", "Lëvizje stoku", "Pagesë"].includes(item.type);
        return false;
      });
  const lookupIsFetching = lookupKind === "customer" ? customerLookupQuery.isFetching || salesInvoiceCustomerLookupQuery.isFetching : lookupQuery.isFetching;
  const chooseLookup = (item: { title: string }) => {
    if (lookupKind === "supplier" || lookupKind === "customer") setPartnerFilter(item.title);
    else if (lookupKind === "product") setCategoryFilter(item.title);
    else if (lookupKind === "warehouse") setWarehouseFilter(item.title);
    else if (lookupKind === "document") setDocumentFilter(item.title);
    setLookupKind(null);
    setLookupTerm("");
  };
  const reportSearchResults = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("sq-AL");
    return REPORT_CATALOG.filter(item => {
      const searchable = `${item.title} ${item.description} ${item.module} ${item.group} ${item.key}`.toLocaleLowerCase("sq-AL");
      return !search || searchable.includes(search);
    });
  }, [query]);
  const visibleReports = useMemo(() => reportSearchResults.filter(item => moduleFilter === "Të gjitha" || item.module === moduleFilter), [moduleFilter, reportSearchResults]);

  const groupedReports = useMemo(() => reportModules.map(module => {
    const reports = visibleReports.filter(item => item.module === module);
    const groups = Array.from(new Set(reports.map(item => item.group))).map(group => ({ group, reports: reports.filter(item => item.group === group) }));
    return { module, reports, groups };
  }).filter(item => item.reports.length > 0), [visibleReports]);

  const report = reportQuery.data;
  const rawRows = (report?.rows ?? []) as Record<string, unknown>[];
  const columns = report?.columns ?? [];
  const filteredRows = useMemo(() => searchReportRows(filterReportRows(rawRows, { documentFilter: effectiveDocumentFilter, documentFilterEnd: showLegacyDocumentNumberFilter ? documentFilterEnd : "", partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax }), tableSearch), [rawRows, effectiveDocumentFilter, documentFilterEnd, showLegacyDocumentNumberFilter, partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax, tableSearch]);
  const columnFilteredRows = useMemo(() => filterReportRowsByColumns(filteredRows, columnFilters), [filteredRows, columnFilters]);
  const rows = useMemo(() => sortReportRows(columnFilteredRows, tableSort), [columnFilteredRows, tableSort]);
  const activeFilterEntries = useMemo(() => activeReportFilters({ [selected.key === "inventory_product_card_pdf" ? "Dokumenti burimor" : "Furnitor / Klient"]: partnerFilter, "Nr. dokumenti": effectiveDocumentFilter, [selected.key === "inventory_product_card_pdf" ? "Artikull" : "Kategori / Artikull"]: categoryFilter, Status: statusFilter, Monedha: currencyFilter, "Lloj dokumenti": documentTypeFilter, [selected.key === "inventory_product_card_pdf" ? "Magazinë" : "Magazina"]: warehouseFilter, Njësia: unitFilter, "Shuma minimale": amountMin, "Shuma maksimale": amountMax, "Data nga": dateFrom, "Data deri": dateTo, "Kërkimi në tabelë": tableSearch }), [selected.key, partnerFilter, documentFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax, dateFrom, dateTo, tableSearch]);
  const activeFilterMeta = useMemo(() => Object.fromEntries(activeFilterEntries), [activeFilterEntries]);
  const isReferenceReport = selected.key.endsWith("_pdf") || selected.key === "sales_customer_statement";
  const totalFor = (column: string) => sumNumericColumn(rows, column);
  const reportFavorites = savedFilters.filter(filter => filter.companyId === companyId && filter.reportKey === selected.key);
  const isReportLoading = reportQuery.isFetching || isViewing;

  const currentFilterSnapshot = (): Omit<SavedReportFilter, "id" | "companyId" | "reportKey" | "name"> => ({
    dateFrom, dateTo, documentFilter, documentFilterEnd, partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax,
  });
  const saveFavorite = () => {
    const name = favoriteName.trim();
    if (!name) return toast.error("Vendosni një emër për filtrin e preferuar.");
    const next: SavedReportFilter = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, companyId, reportKey: selected.key, name, ...currentFilterSnapshot() };
    const updated = [...savedFilters.filter(filter => !(filter.companyId === companyId && filter.reportKey === selected.key && filter.name.toLocaleLowerCase("sq-AL") === name.toLocaleLowerCase("sq-AL"))), next];
    setSavedFilters(updated);
    window.localStorage.setItem("sistemi-genit-report-filters", JSON.stringify(updated));
    setFavoriteName("");
    toast.success("Filtri i preferuar u ruajt.");
  };
  const applyFavorite = (filter: SavedReportFilter) => {
    setDateFrom(filter.dateFrom); setDateTo(filter.dateTo); setDocumentFilter(filter.documentFilter); setDocumentFilterEnd(filter.documentFilterEnd ?? ""); setPartnerFilter(filter.partnerFilter);
    setCategoryFilter(filter.categoryFilter); setStatusFilter(filter.statusFilter); setCurrencyFilter(filter.currencyFilter ?? ""); setDocumentTypeFilter(filter.documentTypeFilter ?? ""); setWarehouseFilter(filter.warehouseFilter ?? ""); setUnitFilter(filter.unitFilter ?? ""); setAmountMin(filter.amountMin); setAmountMax(filter.amountMax);
    toast.success(`U aplikua filtri: ${filter.name}`);
  };
  const deleteFavorite = (id: string) => {
    const updated = savedFilters.filter(filter => filter.id !== id);
    setSavedFilters(updated);
    window.localStorage.setItem("sistemi-genit-report-filters", JSON.stringify(updated));
  };
  const viewReport = async () => {
    setIsViewing(true);
    try {
      const result = await reportQuery.refetch({ throwOnError: true });
      if (result.data) {
        setHasExecutedReport(true);
        setIsReportOpen(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Raporti nuk u ngarkua.");
    } finally {
      setIsViewing(false);
    }
  };

  const openReport = (item: ReportCatalogItem) => {
    setSelectedKey(item.key);
    setHasExecutedReport(false);

    setModuleFilter(item.module);
    setLocation(reportUrl(item.module, item.key));
    setIsReportOpen(true);
  };

  const changeModule = (nextModule: ReportModule | "Të gjitha") => {
    const moduleReferenceKey: Partial<Record<ReportModule, string>> = { Blerje: "purchase_summary_register_pdf", Shitje: "sales_summary_register_pdf" };
    const moduleReference = nextModule === "Të gjitha" ? undefined : REPORT_CATALOG.find(item => item.module === nextModule && (item.key === moduleReferenceKey[nextModule] || (!moduleReferenceKey[nextModule] && item.key.endsWith("_pdf"))));
    const nextReport = nextModule === "Të gjitha"
      ? selected
      : selected.module === nextModule && selected.key.endsWith("_pdf")
        ? selected
        : moduleReference ?? REPORT_CATALOG.find(item => item.module === nextModule) ?? selected;
    setModuleFilter(nextModule);
    setSelectedKey(nextReport.key);
    setHasExecutedReport(false);

    setIsReportOpen(false);
    setLocation(alphaReportWorkspaceUrl(nextModule));
  };

  const clearReportFilters = () => {
    setHasExecutedReport(false);

    setTableSearch("");
    setColumnFilters({});
    setTableSort(null);
    setDateFrom("");
    setDateTo("");
    setDocumentFilter("");
    setDocumentFilterEnd("");
    setPartnerFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setCurrencyFilter("");
    setDocumentTypeFilter("");
    setWarehouseFilter("");
    setUnitFilter("");
    setAmountMin("");
    setAmountMax("");
  };
  const clearFilters = () => {
    clearReportFilters();
    setQuery("");
    changeModule("Të gjitha");
  };
  const isProductCardReport = selected.key === "inventory_product_card_pdf";
  const usesArticleFilters = isInventoryModule || isSalesModule || isPurchaseModule;
  const referenceTitle = isReferenceReport ? getReferenceTitle(selected.key, selected.title) : selected.title;
  const referencePeriod = `${dateFrom || "Fillimi"} — ${dateTo || "Sot"}`;
  const inlineFilterVisibility = getAlphaReportFilterVisibility(selected.module, selected.key);
  const reportMeta = { ...(report?.meta ?? {}), ...activeFilterMeta };
  const exportExcel = () => exportToExcel(rows.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => !key.startsWith("__")))), `${selected.key}_${new Date().toISOString().slice(0, 10)}`, referenceTitle, isReferenceReport ? columns.map(column => ({ key: column, label: getReferenceColumnLabel(selected.key, column) })) : columns, { title: referenceTitle, period: `${dateFrom || "Fillimi"} — ${dateTo || "Sot"}`, landscape: columns.length > 8, reference: isReferenceReport, includeTotals: true, headerColor: isReferenceReport ? "FF714B67" : undefined, titleColor: isReferenceReport ? "FF714B67" : undefined, referenceKey: isReferenceReport ? selected.key : undefined });
  const exportPdf = () => exportToPDF(rows, `${selected.key}_${new Date().toISOString().slice(0, 10)}`, referenceTitle, columns.map(column => ({ key: column, label: isReferenceReport ? getReferenceColumnLabel(selected.key, column) : column })) as { key: keyof Record<string, unknown>; label: string }[], { landscape: columns.length > 8, reference: isReferenceReport, includeTotals: true, referenceKey: isReferenceReport ? selected.key : undefined, period: `${dateFrom || "Fillimi"} — ${dateTo || "Sot"}`, meta: reportMeta, headerColor: [230, 229, 181], headerTextColor: [37, 37, 31], titleColor: [37, 37, 31], fontSize: columns.length > 10 ? 6 : 8 });
  const openDocument = (row: Record<string, unknown>) => {
    const id = Number(row.__documentId);
    const type = String(row.__documentType || "");
    if (!Number.isInteger(id) || id <= 0) return;
    if (type === "purchase-invoice") setLocation(`/purchase-invoices?openInvoice=${id}`);
    else if (type === "purchase-receipt") setLocation(`/purchase-invoices?tab=receipts&openReceipt=${id}`);
    else if (type === "purchase-return") setLocation(`/purchase-invoices?tab=returns&openReturn=${id}`);
    else if (type === "sales-invoice") setLocation(`/sales-invoices?openInvoice=${id}`);
    else if (type === "sales-return") setLocation(`/sales-invoices?openReturn=${id}`);
    else if (type === "stock-movement") setLocation(`/inventory?openMovement=${id}`);
    else if (type === "inventory-transfer") setLocation(`/inventory?openTransfer=${id}`);
    else if (type === "inventory-adjustment") setLocation(`/inventory?openAdjustment=${id}`);
    else if (type === "product") setLocation(`/products?openProduct=${id}`);
    else setOpenedReportDocument(row);
    setIsReportOpen(false);

  };
  const printPreview = () => {
    const popup = window.open("", "_blank", "width=1100,height=800");
    if (!popup) return toast.error("Print Preview u bllokua. Lejoni popup-et për këtë faqe dhe provoni sërish.");
    const period = `${dateFrom || "Fillimi"} — ${dateTo || "Sot"}`;
    if (selected.key === "purchase_supplier_card_format3_pdf") {
      const sheet = document.querySelector<HTMLElement>(".supplier-card-simple-sheet");
      if (sheet) {
        popup.document.write(`<!doctype html><html><head><title>${referenceTitle}</title><style>@page{size:A4 landscape;margin:8mm}*{box-sizing:border-box}body{margin:0;background:#fff;color:#191919;font-family:Arial,Helvetica,sans-serif}.supplier-card-simple-sheet{width:100%;min-height:0;padding:12px 18px 18px;overflow:hidden}.supplier-card-simple-header{position:relative;height:82px;text-align:center;white-space:nowrap}.supplier-card-simple-year{position:absolute;top:4px;left:0;font-size:10px;font-weight:700}.supplier-card-simple-header h2{margin:37px 0 8px;font-size:10px;font-weight:700;letter-spacing:.06em}.supplier-card-simple-header p{margin:0;font-size:10px;font-weight:700}.supplier-card-simple-identification{display:grid;grid-template-columns:2.15fr 1.55fr .65fr 1.15fr 1.05fr;gap:14px;min-height:30px;padding:0 2px 7px;font-size:10px;white-space:nowrap}.supplier-card-simple-table{width:100%;table-layout:fixed;border-collapse:collapse;background:#fffedc;color:#191919;font-size:9px}.supplier-card-simple-table th,.supplier-card-simple-table td{border:1px solid #151515;padding:3px 4px;vertical-align:middle;overflow:hidden}.supplier-card-simple-table th{height:22px;background:#fffedc;text-align:center;font-weight:700}.supplier-card-simple-table th:nth-child(1){width:5%}.supplier-card-simple-table th:nth-child(2){width:8%}.supplier-card-simple-table th:nth-child(3){width:5%}.supplier-card-simple-table th:nth-child(4){width:12%}.supplier-card-simple-table th:nth-child(5){width:9%}.supplier-card-simple-table th:nth-child(6){width:33%}.supplier-card-simple-table th:nth-child(7),.supplier-card-simple-table th:nth-child(8),.supplier-card-simple-table th:nth-child(9){width:9.33%}.supplier-card-simple-table tbody td{height:20px;background:#fffef1}.supplier-card-simple-table tfoot td{height:43px;background:#fffedc;font-weight:700}.supplier-card-simple-link{color:#191919;text-decoration:none}@media print{body{margin:0}.supplier-card-simple-sheet{padding:0}}</style></head><body>${sheet.outerHTML}</body></html>`);
        popup.document.close();
        popup.focus();
        return;
      }
    }
    const printGroups = isReferenceReport ? getReferenceGroups(selected.key, columns) : [];
    const printHeaderRows = isReferenceReport ? `${printGroups.length > 0 ? `<tr>${printGroups.map(group => `<th colspan="${group.columns.length}" class="group">${group.label}</th>`).join("")}</tr>` : ""}<tr>${columns.map(column => `<th>${getReferenceColumnLabel(selected.key, column)}</th>`).join("")}</tr>` : `<tr>${columns.map(column => `<th>${column}</th>`).join("")}</tr>`;
    const printTitle = isReferenceReport ? `<div class="reference-head"><span>${new Date().getFullYear()}</span><span>${period}</span><strong>${referenceTitle}</strong></div>` : `<h1>${selected.title}</h1><p class="meta">${selected.module} · Periudha: ${period}</p>`;
    const printMetrics = isReferenceReport ? "" : `<div class="metrics">${(report?.metrics ?? []).map(item => `<div class="metric"><small>${item.label}</small><b>${item.value.toLocaleString("sq-AL")}</b></div>`).join("")}</div>`;
    const printTotalCells = columns.map((column, index) => { const total = sumNumericColumn(rows, column); return `<td>${index === 0 ? (isReferenceReport ? getReferenceTotalLabel(selected.key) : "TOTALI") : total === null ? "" : cellValue(total)}</td>`; }).join("");
    const sourceDocumentHref = (row: Record<string, unknown>) => buildSourceDocumentUrl(row.__documentId, row.__documentType);
    const printRows = rows.map(row => `<tr>${columns.map(column => { const label = cellValue(row[column]); const href = isLinkedDocument(row, column) ? sourceDocumentHref(row) : undefined; return `<td>${href ? `<a href="${href}" target="_blank" rel="noreferrer" class="source-link">↗ ${label}</a>` : label}</td>`; }).join("")}</tr>`).join("");
    popup.document.write(`<!doctype html><html><head><title>${referenceTitle}</title><style>@page{size:A4 ${columns.length > 8 ? "landscape" : "portrait"};margin:8mm}body{font-family:Arial,sans-serif;color:#252525;padding:32px;background:#f3f4f6}.report{background:#fff;padding:24px;border:1px solid #d8d8d8}h1{color:#714b67;margin:0;text-align:center;font-size:20px}.reference-head{display:grid;grid-template-columns:1fr 2fr 1fr;align-items:start;border-bottom:1px solid #4a4a36;padding-bottom:10px;color:#25251f;font-size:10px}.reference-head span:last-of-type{text-align:right}.reference-head strong{grid-column:1 / -1;grid-row:1;text-align:center;text-transform:uppercase;font-size:16px}.meta{color:#666;margin:8px 0 22px;text-align:center}.metrics{display:flex;gap:12px;margin-bottom:20px}.metric{border:1px solid #d8c5d2;padding:12px;min-width:120px;border-radius:3px;background:#fcf8fb}.metric b{display:block;font-size:20px;color:#714b67}table{width:100%;border-collapse:collapse;font-size:${columns.length > 10 ? "8px" : "12px"}}.active-filters{margin:10px 0;padding:7px 9px;border:1px solid #e2c98b;background:#fff8e8;color:#6b4b16;font-size:10px}thead{display:table-header-group}tfoot{display:table-footer-group}tr{break-inside:avoid;page-break-inside:avoid}th{background:${isReferenceReport ? "#e6e5b5" : "#714b67"};color:${isReferenceReport ? "#25251f" : "#fff"};text-align:left}th.group{background:${isReferenceReport ? "#f1f0c8" : "#e9dce7"};color:${isReferenceReport ? "#25251f" : "#55394f"};text-align:center;text-transform:uppercase;font-size:10px}th,td{border:1px solid ${isReferenceReport ? "#8a8a63" : "#cfcfcf"};padding:7px}.source-link{color:#714b67;font-weight:700;text-decoration:underline}.total-row{font-weight:700;background:${isReferenceReport ? "#f1f0c8" : "#fcf8fb"}}tr:nth-child(even){background:${isReferenceReport ? "#fffef1" : "#fafafa"}}footer{display:flex;justify-content:space-between;border-top:2px solid ${isReferenceReport ? "#4a4a36" : "#714b67"};margin-top:18px;padding-top:8px;color:#666;font-size:9px;text-transform:uppercase}@media print{body{padding:0;background:#fff}.report{border:0;padding:0}}</style></head><body><div class="report">${printTitle}${activeFilterEntries.length > 0 ? `<div class="active-filters"><strong>Filtra aktive:</strong> ${activeFilterEntries.map(([label, value]) => `${label}: ${value}`).join(" · ")}</div>` : ""}${printMetrics}<table><thead>${printHeaderRows}</thead><tbody>${printRows}</tbody><tfoot><tr class="total-row">${printTotalCells}</tr></tfoot></table><footer><span>${isReferenceReport ? getReferenceTotalLabel(selected.key) : "Totali i raportit"}</span><span>Sistemi Genit Cloud · Dokumenti mund të ketë disa faqe</span></footer></div><script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  };

  const isAlphaModuleWorkspace = moduleFilter !== "Të gjitha";
  const isAlphaDocumentWorkspace = isAlphaModuleWorkspace;
  const isLinkedDocument = (row: Record<string, unknown>, column: string) => {
    const normalizedColumn = column.trim().toLocaleLowerCase("sq-AL").replace(/\s+/g, " ");
    const documentNumberColumn = new Set(["dokumenti", "nr.", "nr", "nr. ekstraktit", "nr dok", "nr. dok", "nr dokumenti", "numri", "numer", "nr. dokumentit"]);
    const aggregateSourceColumn = new Set(["artikulli", "kartelë", "kartela", "kartel", "emërtimi", "emërtimi i artikullit", "klienti", "kodi", "kod i klientit", "kod klienti", "emri", "furnitori"]);
    const hasSource = Number.isInteger(Number(row.__documentId)) && Number(row.__documentId) > 0;
    return hasSource && (documentNumberColumn.has(normalizedColumn) || aggregateSourceColumn.has(normalizedColumn));
  };
  const toggleTableSort = (column: string) => {
    setTableSort(current => {
      if (current?.column !== column) return { column, direction: "asc" };
      return current.direction === "asc" ? { column, direction: "desc" } : null;
    });
  };
  return <div className={"space-y-3 " + (isAlphaModuleWorkspace ? "text-[#242424]" : "")}>
    {!isReportOpen && <><section data-alpha-report-workspace className={"overflow-hidden border border-[#bdbdbd] bg-white " + (isAlphaModuleWorkspace ? "rounded-none shadow-none" : "rounded-xl shadow-sm")}>
      <div className="flex min-h-10 items-center justify-between border-b border-[#bdbdbd] bg-[#efefef] px-3 py-1.5 text-[#202020]">
        <div className="flex min-w-0 items-center gap-2"><BarChart3 className="h-4 w-4 text-[#0878c9]" /><h1 className="truncate text-sm font-semibold">{isAlphaModuleWorkspace ? alphaModuleLabels[moduleFilter as ReportModule] ?? moduleFilter : "Raporte"}</h1></div>
        {!isAlphaModuleWorkspace && <span className="text-xs text-[#666]">{REPORT_CATALOG.length} raporte</span>}
      </div>
      {moduleFilter === "Të gjitha" && <nav aria-label="Nënmenuja Alpha e Raporteve" className="flex gap-0 overflow-x-auto border-b border-[#bdbdbd] bg-[#0878c9] px-2 py-1 text-[11px] text-white">{alphaReportNavItems.map(item => <button type="button" key={item.label} disabled={!item.module} onClick={() => item.module && changeModule(item.module)} className={"shrink-0 border-r border-white/25 px-2 py-1 font-medium " + (item.module ? "hover:bg-white/15" : "cursor-not-allowed opacity-55")}>{item.label}</button>)}</nav>}
      <div className="flex items-center gap-2 border-b border-[#d3d3d3] bg-white px-3 py-2"><Search className="h-3.5 w-3.5 text-[#0878c9]" /><Input id="reportSearch" value={query} onChange={event => setQuery(event.target.value)} className="h-7 w-56 rounded-none border-[#9e9e9e] bg-white px-2 text-xs shadow-none" placeholder="Kerko" /></div>
    </section>

    <section data-report-catalog className={"border border-[#bdbdbd] bg-white " + (isAlphaModuleWorkspace ? "rounded-none shadow-none" : "rounded-xl p-3 shadow-sm")}>
      {visibleReports.length === 0 ? <div className="border border-dashed border-[#bdbdbd] p-10 text-center text-sm text-[#666]">Nuk u gjet raport. Provoni një fjalë tjetër në Kerko.</div> : isAlphaDocumentWorkspace ? <div className="space-y-0">
        <details open className="border-b border-[#bdbdbd]">
          <summary className="cursor-pointer list-none border-b border-[#bdbdbd] bg-[#0878c9] px-3 py-2 text-sm font-semibold text-white">Kryesore</summary>
          <div className="grid grid-cols-2 gap-1.5 bg-white p-3 sm:grid-cols-4 xl:grid-cols-6">{visibleReports.map(item => <button type="button" data-report-model key={item.key} onClick={() => openReport(item)} className={"flex min-h-[66px] items-center justify-center border border-[#dedede] bg-white px-2 py-2 text-center text-[11px] font-medium leading-tight text-[#0878c9] transition-colors hover:border-[#0878c9] hover:bg-[#eef8ff] " + (selectedKey === item.key ? "border-2 border-[#0878c9] bg-[#e8f5fd]" : "")}>{item.title}</button>)}</div>
        </details>
        <details className="border-b border-[#bdbdbd]">
          <summary className="cursor-pointer list-none bg-white px-3 py-2 text-sm font-semibold text-[#333]">Te Tjera 2</summary>
          <div className="min-h-10 bg-white" aria-hidden="true" />
        </details>
      </div> : <div className="space-y-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Modelet e Raporteve</h2><p className="text-xs text-slate-500">Zgjidhni një modul për të hapur listën e modeleve.</p></div><span className="text-xs text-slate-500">{visibleReports.length} raporte</span></div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{visibleReports.map(item => <button type="button" key={item.key} onClick={() => openReport(item)} className="flex min-h-16 items-center justify-between rounded-sm border border-slate-200 bg-white p-3 text-left text-sm font-semibold text-slate-800 hover:border-[#0878c9] hover:bg-[#eef8ff]"><span>{item.title}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-[#0878c9]" /></button>)}</div>
      </div>}
    </section></>}

    {isReportOpen && <AlphaReportInlineFilters moduleLabel={selected.module} filterVisibility={inlineFilterVisibility} partnerLabel={inlinePartnerLabel} partnerLookupKind={inlinePartnerLookupKind} showPartner={isPurchaseModule || isSalesModule || selected.module === "CRM"} selectedTitle={selected.title} dateFrom={dateFrom} dateTo={dateTo} documentFilter={documentFilter} documentFilterEnd={documentFilterEnd} partnerFilter={partnerFilter} categoryFilter={categoryFilter} statusFilter={statusFilter} currencyFilter={currencyFilter} documentTypeFilter={documentTypeFilter} warehouseFilter={warehouseFilter} amountMin={amountMin} amountMax={amountMax} isLoading={isReportLoading} hasExecuted={hasExecutedReport} referenceResult={isReferenceReport ? <ReferenceReportView reportKey={selected.key} module={selected.module} title={selected.title} period={referencePeriod} columns={columns} rows={rows} metrics={report?.metrics ?? []} meta={reportMeta} isLoading={isReportLoading} cellValue={cellValue} isLinkedDocument={isLinkedDocument} onOpenDocument={openDocument} sort={tableSort} onSort={toggleTableSort} /> : undefined} columns={columns} rows={rows} metrics={report?.metrics ?? []} onOpenDocument={openDocument} formatCell={cellValue} onDateFromChange={event => setDateFrom(event.target.value)} onDateToChange={event => setDateTo(event.target.value)} onDocumentFilterChange={setDocumentFilter} onDocumentFilterEndChange={setDocumentFilterEnd} onPartnerFilterChange={setPartnerFilter} onCategoryFilterChange={setCategoryFilter} onStatusFilterChange={setStatusFilter} onCurrencyFilterChange={setCurrencyFilter} onDocumentTypeFilterChange={setDocumentTypeFilter} onWarehouseFilterChange={setWarehouseFilter} onAmountMinChange={setAmountMin} onAmountMaxChange={setAmountMax} onLookup={openLookup} onView={viewReport} onClear={clearReportFilters} onNewPage={() => { clearReportFilters(); setIsReportOpen(true); }} onList={() => { clearReportFilters(); setIsReportOpen(false); setLocation(alphaReportWorkspaceUrl(selected.module)); }} onHome={() => setLocation("/")} onDelta={() => toast.info(`Vizualizo ne Delta për ${selected.module} do të përdoret pasi të aktivizohet raporti Delta.`)} />}
    <Dialog open={Boolean(lookupKind)} onOpenChange={open => { if (!open) { setLookupKind(null); setLookupTerm(""); } }}><DialogContent className="max-w-lg"><DialogTitle>Kërko {lookupKind === "supplier" ? "furnitorin" : lookupKind === "customer" ? "klientin" : lookupKind === "product" ? "artikullin" : lookupKind === "warehouse" ? "magazinën" : "dokumentin"}</DialogTitle><Input autoFocus value={lookupTerm} onChange={event => setLookupTerm(event.target.value)} placeholder="Shkruaj të paktën 2 karaktere" />{lookupTerm.trim().length < 2 ? <p className="text-sm text-muted-foreground">Shkruani emrin, kodin ose numrin për të kërkuar në kompaninë aktive.</p> : lookupIsFetching ? <p className="text-sm text-muted-foreground">Po kërkohet...</p> : lookupResults.length === 0 ? <p className="text-sm text-muted-foreground">Nuk u gjetën rezultate.</p> : <div className="max-h-64 space-y-1 overflow-y-auto">{lookupResults.map((item, index) => <button type="button" key={`${item.type}-${item.title}-${index}`} className="block w-full rounded border border-slate-200 px-3 py-2 text-left hover:bg-slate-50" onClick={() => chooseLookup(item)}><span className="block text-sm font-medium">{item.title}</span><span className="block text-xs text-muted-foreground">{item.type} · {item.subtitle}</span></button>)}</div>}</DialogContent></Dialog>

    <ReportDocumentDialog document={openedReportDocument} onOpenChange={open => { if (!open) setOpenedReportDocument(null); }} onOpenDocument={openDocument} />
  </div>;
}

function ReportDocumentDialog({ document, onOpenChange, onOpenDocument }: { document: Record<string, unknown> | null; onOpenChange: (open: boolean) => void; onOpenDocument: (row: Record<string, unknown>) => void }) {
  const row = document ? Object.fromEntries(Object.entries(document).filter(([key]) => !key.startsWith("__"))) : {};
  const documentNumber = String(row.Dokumenti || "Dokument");
  const sourceId = Number(document?.__documentId);
  const hasSourceDocument = Number.isInteger(sourceId) && sourceId > 0 && Boolean(document?.__documentType);
  const columns = Object.keys(row);
  const exportExcel = () => exportToExcel([row], documentNumber, documentNumber);
  const exportPdf = () => exportToPDF([row], documentNumber, documentNumber, columns.map(key => ({ key: key as never, label: key })));
  const printPreview = () => {
    const popup = window.open("", "_blank", "width=1100,height=800");
    if (!popup) return toast.error("Print Preview u bllokua.");
    popup.document.write(`<!doctype html><html><head><title>${documentNumber}</title><style>body{font-family:Arial;padding:32px}h1{color:#714b67}table{width:100%;border-collapse:collapse}th{background:#714b67;color:#fff;text-align:left}td,th{border:1px solid #ddd;padding:9px}</style></head><body><h1>${documentNumber}</h1><table><tbody>${columns.map(column => `<tr><th>${column}</th><td>${cellValue(row[column])}</td></tr>`).join("")}</tbody></table><footer><span>Totali i raportit</span><span>Sistemi Genit Cloud · Dokumenti mund të ketë disa faqe</span></footer></div><script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  };
  return <Dialog open={document !== null} onOpenChange={onOpenChange}><DialogContent className="!left-0 !top-0 !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 overflow-y-auto rounded-none border-0 bg-[#f8f8f8] p-0"><div className="flex flex-wrap items-center gap-3 border-b bg-white px-5 py-4 pr-14"><DialogTitle>{documentNumber}</DialogTitle><div className="ml-auto flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(false)}>Mbyll</Button>{hasSourceDocument && <SourceDocumentLink label="Hap burimin" onOpen={() => { onOpenChange(false); onOpenDocument(document!); }} ariaLabel={`Hap dokumentin burimor ${documentNumber}`} />}<Button size="sm" variant="outline" onClick={printPreview}><Printer className="mr-2 h-4 w-4" />Printo</Button><Button size="sm" variant="outline" onClick={exportExcel}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button><Button size="sm" variant="outline" onClick={exportPdf}><FileText className="mr-2 h-4 w-4" />PDF</Button></div></div><div className="mx-auto max-w-6xl p-5"><table className="w-full overflow-hidden rounded-lg border bg-white text-sm"><tbody>{columns.map(column => <tr className="border-b" key={column}><th className="w-1/3 bg-slate-50 p-3 text-left font-medium">{column}</th><td className="p-3">{cellValue(row[column])}</td></tr>)}</tbody></table></div></DialogContent></Dialog>;
}
