import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpRight, BarChart3, Bookmark, CircleHelp, Eye, FileSpreadsheet, FileText, LoaderCircle, Printer, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { buildSourceDocumentUrl, exportToExcel, exportToPDF } from "@/lib/export";
import { REPORT_CATALOG, type ReportCatalogItem, type ReportModule } from "../../../shared/reportCatalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getReferenceColumnLabel, getReferenceGroups, getReferenceTitle, getReferenceTotalLabel, ReferenceReportView } from "@/components/ReferenceReportView";
import SourceDocumentLink from "@/components/SourceDocumentLink";
import { activeReportFilters, filterReportRows, filterReportRowsByColumns, reportMetricValue, searchReportRows, sortReportRows, sumNumericColumn, type ReportColumnFilters, type ReportSort } from "@/lib/reportFiltering";
import { getLegacyReportFilterVisibility } from "@/lib/reportFilterProfile";
import { filterReportCustomers, type CustomerLookupRecord } from "@/lib/reportCustomerLookup";
import { ALPHA_PRIMARY_REPORT_MODULES as alphaPrimaryModules, ALPHA_SECONDARY_REPORT_MODULES as alphaSecondaryModules, ALPHA_REPORT_MODULE_LABELS as alphaModuleLabels, alphaReportWorkspaceUrl } from "@/lib/reportsMenu";

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
  const [isReportResultOpen, setIsReportResultOpen] = useState(false);
  const [hasExecutedReport, setHasExecutedReport] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ReportColumnFilters>({});
  const [tableSort, setTableSort] = useState<ReportSort>(null);
  const [lookupKind, setLookupKind] = useState<"supplier" | "customer" | "product" | "warehouse" | "document" | null>(null);
  const [lookupTerm, setLookupTerm] = useState("");
  const [reportWorkspaceTab, setReportWorkspaceTab] = useState<"Të përgjithshme" | "Konfigurimi" | "Raporti">("Të përgjithshme");

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
    partnerFilter: partnerFilter || undefined,
    categoryFilter: categoryFilter || undefined,
    statusFilter: statusFilter || undefined,
    currencyFilter: currencyFilter || undefined,
    documentTypeFilter: documentTypeFilter || undefined,
    warehouseFilter: warehouseFilter || undefined,
    unitFilter: unitFilter || undefined,
    amountMin: amountMin || undefined,
    amountMax: amountMax || undefined,
  }), [companyId, selectedKey, dateFrom, dateTo, effectiveDocumentFilter, partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax]);
  const reportQuery = trpc.reportCenter.get.useQuery(reportInput, { enabled: hasExecutedReport });
  const lookupQuery = trpc.globalSearch.query.useQuery({ companyId, term: lookupTerm }, { enabled: Boolean(lookupKind && lookupKind !== "customer" && lookupTerm.trim().length >= 2) });
  const customerLookupQuery = trpc.customer.list.useQuery({ companyId }, { enabled: lookupKind === "customer" });
  const salesInvoiceCustomerLookupQuery = trpc.salesInvoice.list.useQuery({ companyId }, { enabled: lookupKind === "customer" });
  const isPurchaseModule = selected.module === "Blerje";
  const isSalesModule = selected.module === "Shitje";
  const hideSalesCustomerContext = false;
  const isInventoryModule = selected.module === "Magazina";
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
  const filteredRows = useMemo(() => searchReportRows(filterReportRows(rawRows, { documentFilter: effectiveDocumentFilter, partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax }), tableSearch), [rawRows, effectiveDocumentFilter, partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax, tableSearch]);
  const columnFilteredRows = useMemo(() => filterReportRowsByColumns(filteredRows, columnFilters), [filteredRows, columnFilters]);
  const rows = useMemo(() => sortReportRows(columnFilteredRows, tableSort), [columnFilteredRows, tableSort]);
  const activeFilterEntries = useMemo(() => activeReportFilters({ [selected.key === "inventory_product_card_pdf" ? "Dokumenti burimor" : "Furnitor / Klient"]: partnerFilter, "Nr. dokumenti": effectiveDocumentFilter, [selected.key === "inventory_product_card_pdf" ? "Artikull" : "Kategori / Artikull"]: categoryFilter, Status: statusFilter, Monedha: currencyFilter, "Lloj dokumenti": documentTypeFilter, [selected.key === "inventory_product_card_pdf" ? "Magazinë" : "Magazina"]: warehouseFilter, Njësia: unitFilter, "Shuma minimale": amountMin, "Shuma maksimale": amountMax, "Data nga": dateFrom, "Data deri": dateTo, "Kërkimi në tabelë": tableSearch }), [selected.key, partnerFilter, documentFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax, dateFrom, dateTo, tableSearch]);
  const activeFilterMeta = useMemo(() => Object.fromEntries(activeFilterEntries), [activeFilterEntries]);
  const isReferenceReport = selected.key.endsWith("_pdf") || selected.key === "sales_customer_statement";
  const totalFor = (column: string) => sumNumericColumn(rows, column);
  const reportFavorites = savedFilters.filter(filter => filter.companyId === companyId && filter.reportKey === selected.key);
  const isReportLoading = reportQuery.isFetching || isViewing;

  const currentFilterSnapshot = (): Omit<SavedReportFilter, "id" | "companyId" | "reportKey" | "name"> => ({
    dateFrom, dateTo, documentFilter, partnerFilter, categoryFilter, statusFilter, currencyFilter, documentTypeFilter, warehouseFilter, unitFilter, amountMin, amountMax,
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
    setDateFrom(filter.dateFrom); setDateTo(filter.dateTo); setDocumentFilter(filter.documentFilter); setPartnerFilter(filter.partnerFilter);
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
        setIsReportOpen(false);
        setIsReportResultOpen(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Raporti nuk u ngarkua.");
    } finally {
      setIsViewing(false);
    }
  };

  const openReport = (item: ReportCatalogItem) => {
    if (item.key === "purchase_document_register") {
      setLocation("/purchase-invoices");
      return;
    }
    if (item.key === "purchase_orders") {
      setLocation("/purchase-invoices?tab=orders");
      return;
    }
    setSelectedKey(item.key); setHasExecutedReport(false); setIsReportResultOpen(false); setModuleFilter(item.module); setLocation(reportUrl(item.module, item.key)); setIsReportOpen(true);
  };

  const changeModule = (nextModule: ReportModule | "Të gjitha") => {
    const moduleReferenceKey: Partial<Record<ReportModule, string>> = { Blerje: "purchase_supplier_card_pdf", Shitje: "sales_summary_register_pdf" };
    const moduleReference = nextModule === "Të gjitha" ? undefined : REPORT_CATALOG.find(item => item.module === nextModule && (item.key === moduleReferenceKey[nextModule] || (!moduleReferenceKey[nextModule] && item.key.endsWith("_pdf"))));
    const nextReport = nextModule === "Të gjitha"
      ? selected
      : selected.module === nextModule && selected.key.endsWith("_pdf")
        ? selected
        : moduleReference ?? REPORT_CATALOG.find(item => item.module === nextModule) ?? selected;
    setModuleFilter(nextModule);
    setSelectedKey(nextReport.key);
    setReportWorkspaceTab("Të përgjithshme");
    setHasExecutedReport(false);
    setIsReportResultOpen(false);
    setIsReportOpen(false);
    setLocation(alphaReportWorkspaceUrl(nextModule));
  };

  const clearFilters = () => {
    setHasExecutedReport(false);
    setIsReportResultOpen(false);
    setTableSearch("");
    setColumnFilters({});
    setTableSort(null);
    setDateFrom("");
    setDateTo("");
    setQuery("");
    setDocumentFilter("");
    setPartnerFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    setCurrencyFilter("");
    setDocumentTypeFilter("");
    setWarehouseFilter("");
    setUnitFilter("");
    setAmountMin("");
    setAmountMax("");
    changeModule("Të gjitha");
  };
  const isProductCardReport = selected.key === "inventory_product_card_pdf";
  const usesArticleFilters = isInventoryModule || isSalesModule || isPurchaseModule;
  const referenceTitle = isReferenceReport ? getReferenceTitle(selected.key, selected.title) : selected.title;
  const reportWindowTitle = selected.module === "Shitje" ? "Raporte Shitjeje" : selected.module === "Blerje" ? "Raporte Blerjeje" : selected.module === "Magazina" ? "Raporte Magazine" : `Raporte ${selected.module}`;
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
    setIsReportResultOpen(false);
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

  const isLinkedDocument = (row: Record<string, unknown>, column: string) => {
    const normalizedColumn = column.trim().toLocaleLowerCase("sq-AL").replace(/\s+/g, " ");
    const documentNumberColumn = new Set(["dokumenti", "nr.", "nr", "nr. ekstraktit", "nr dok", "nr. dok", "nr dokumenti", "numri", "numer", "nr. dokumentit"]);
    const aggregateSourceColumn = new Set(["artikulli", "kartelë", "kartela", "kartel", "emërtimi", "emërtimi i artikullit", "klienti", "kodi", "kod i klientit", "kod klienti", "emri", "furnitori"]);
    const hasSource = Number.isInteger(Number(row.__documentId)) && Number(row.__documentId) > 0;
    return hasSource && (documentNumberColumn.has(normalizedColumn) || aggregateSourceColumn.has(normalizedColumn));
  };
  return <div className="space-y-4">
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-[#714b67] px-5 py-4 text-white lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3"><div className="rounded-md bg-white/15 p-2"><BarChart3 className="h-5 w-5" /></div><div><h1 className="text-xl font-semibold">Raportet</h1></div></div>
        <div className="flex items-center gap-2"><Badge className="border-0 bg-white/15 px-3 text-white">{REPORT_CATALOG.length} raporte · të ndara sipas modulit</Badge><Button size="sm" className="bg-white text-[#714b67] hover:bg-white/90" onClick={clearFilters}>Rivendos</Button></div>
      </div>
      <div className="grid gap-3 bg-[#f7f7f7] p-3 lg:grid-cols-[minmax(0,1fr)_auto_145px_145px]">
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-[#714b67]" /><Input id="reportSearch" value={query} onChange={event => setQuery(event.target.value)} className="h-10 border-slate-300 bg-white pl-9" placeholder="Kerko" /></div>
        <div className="flex h-10 items-center justify-end rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-500" aria-label="Rrjedha e raporteve">Raporte → Moduli → Modeli</div>
        <Input aria-label="Prej datës" type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} className="h-10 border-slate-300 bg-white" />
        <Input aria-label="Deri më datën" type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} className="h-10 border-slate-300 bg-white" />
      </div>
    </section>

    <section data-report-catalog className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Modelet e Raporteve</h2><p className="text-xs text-slate-500">Zgjidhni modulin për të hapur listën e modeleve, si në Alpha Web.</p></div><div className="flex items-center gap-2"><span className="text-xs text-slate-500">{visibleReports.length} / {REPORT_CATALOG.length}</span><Button type="button" size="sm" variant="outline" onClick={() => changeModule("Të gjitha")} disabled={moduleFilter === "Të gjitha"}>Kryesore</Button></div></div>
      {visibleReports.length === 0 ? <div className="rounded-lg border border-dashed p-10 text-center text-sm text-slate-500">Nuk u gjet raport. Provoni një fjalë tjetër në Kerko.</div> : <div className="space-y-4">
        <details open className="rounded-sm border border-slate-200 bg-white">
          <summary className="cursor-pointer list-none border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Kryesore</summary>
          <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
            {alphaPrimaryModules.map(module => { const moduleReports = visibleReports.filter(item => item.module === module); if (moduleReports.length === 0) return null; return <button type="button" data-report-module-card key={module} onClick={() => changeModule(module)} className={`group flex min-h-16 items-center justify-between rounded-sm border border-slate-200 bg-white p-3 text-left transition-all hover:border-[#714b67] hover:bg-[#fbf7fa] ${moduleFilter === module ? "border-[#714b67] bg-[#fbf7fa] shadow-sm" : ""}`}><div className="min-w-0"><div className="mb-1 flex items-center gap-2"><Badge variant="secondary" className={moduleColors[module]}>{alphaModuleLabels[module]}</Badge><span className="text-xs text-slate-500">{moduleReports.length} raporte</span></div><p className="truncate text-xs text-slate-500">Lista e modeleve të {alphaModuleLabels[module].toLocaleLowerCase("sq-AL")}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-[#714b67]" /></button>; })}
          </div>
        </details>
        <details open className="rounded-sm border border-slate-200 bg-white">
          <summary className="cursor-pointer list-none border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Te Tjera 2</summary>
          <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
            {alphaSecondaryModules.map(module => { const moduleReports = visibleReports.filter(item => item.module === module); if (moduleReports.length === 0) return null; return <button type="button" data-report-module-card key={module} onClick={() => changeModule(module)} className={`group flex min-h-16 items-center justify-between rounded-sm border border-slate-200 bg-white p-3 text-left transition-all hover:border-[#714b67] hover:bg-[#fbf7fa] ${moduleFilter === module ? "border-[#714b67] bg-[#fbf7fa] shadow-sm" : ""}`}><div className="min-w-0"><div className="mb-1 flex items-center gap-2"><Badge variant="secondary" className={moduleColors[module]}>{alphaModuleLabels[module]}</Badge><span className="text-xs text-slate-500">{moduleReports.length} raporte</span></div><p className="truncate text-xs text-slate-500">Lista e modeleve të {alphaModuleLabels[module].toLocaleLowerCase("sq-AL")}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-[#714b67]" /></button>; })}
            {alphaSecondaryModules.every(module => visibleReports.every(item => item.module !== module)) && <div className="rounded-sm border border-dashed border-slate-300 p-4 text-xs text-slate-500">SHTO KETU...</div>}
          </div>
        </details>
        {moduleFilter !== "Të gjitha" && groupedReports.length > 0 && <div data-report-model-list className="rounded-sm border border-slate-200 bg-[#f7f7f7] p-3"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2"><div className="flex items-center gap-2"><Badge variant="secondary" className={moduleColors[moduleFilter as ReportModule]}>{alphaModuleLabels[moduleFilter as ReportModule] ?? moduleFilter}</Badge><span className="text-xs text-slate-500">Modelet e raportit</span></div><div className="flex flex-wrap items-center gap-1"><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => toast.info("Modelet e Raporteve vijnë nga katalogu i kompanisë aktive.")}>Ruaj</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => openReport(selected)}>Shiko</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => toast.info("Shtimi i modeleve të reja menaxhohet nga katalogu i Raporteve.")}>Shto</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => toast.info("Zgjidhni një model nga lista për ta klonuar.")}>Klono</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => toast.info("Konfigurimi i modelit ruhet sipas autorizimeve të kompanisë aktive.")}>Modifiko</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => toast.info("Fshirja e modeleve nuk lejohet nga katalogu i Raporteve.")}>Fshi</Button></div></div><div className="mb-3 flex flex-wrap items-center gap-1 border-b border-slate-300"><Button type="button" size="sm" variant="ghost" className={`rounded-none border-b-2 px-3 text-xs ${reportWorkspaceTab === "Të përgjithshme" ? "border-[#714b67] text-[#714b67]" : "border-transparent text-slate-500"}`} onClick={() => setReportWorkspaceTab("Të përgjithshme")}>Të përgjithshme</Button><Button type="button" size="sm" variant="ghost" className={`rounded-none border-b-2 px-3 text-xs ${reportWorkspaceTab === "Konfigurimi" ? "border-[#714b67] text-[#714b67]" : "border-transparent text-slate-500"}`} onClick={() => setReportWorkspaceTab("Konfigurimi")}>Konfigurimi</Button><Button type="button" size="sm" variant="ghost" className={`rounded-none border-b-2 px-3 text-xs ${reportWorkspaceTab === "Raporti" ? "border-[#714b67] text-[#714b67]" : "border-transparent text-slate-500"}`} onClick={() => setReportWorkspaceTab("Raporti")}>Raporti</Button></div><div className="mb-3 flex items-center gap-2"><Input aria-label="Kerko modelin e raportit" placeholder="Kerko..." value={query} onChange={event => setQuery(event.target.value)} className="h-8 max-w-xs bg-white text-xs" /><span className="text-xs text-slate-500">Tërhiqni këtu kolonat për t’i grupuar</span></div><div className="space-y-3">{groupedReports.map(moduleGroup => <div key={moduleGroup.module}><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{moduleGroup.groups.length > 0 ? moduleGroup.groups.map(group => group.group).join(" · ") : "Modele"}</p><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{moduleGroup.reports.map(item => <button type="button" key={item.key} onClick={() => openReport(item)} className={`group flex min-h-16 items-center justify-between rounded-sm border-l-4 p-3 text-left transition-all ${selectedKey === item.key ? "border-l-[#714b67] border-y-[#e2d6e0] border-r-[#e2d6e0] bg-[#fbf7fa] shadow-sm" : "border-l-slate-300 border-y-slate-200 border-r-slate-200 bg-white hover:border-l-[#714b67] hover:bg-slate-50"}`}><h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{item.title.toLocaleUpperCase("sq-AL")}</h3><ArrowUpRight className="h-4 w-4 shrink-0 text-[#714b67]" /></button>)}</div></div>)}</div></div>}
      </div>}
    </section>

    <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}><DialogContent onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); setIsReportOpen(false); } else if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); void viewReport(); } }} data-reference-report={isReferenceReport ? "true" : "false"} className={`reference-report-dialog fixed flex max-w-none flex-col gap-0 overflow-hidden rounded-none border-2 border-[#858585] p-0 ${isReferenceReport ? "bg-[#efefef]" : ""} ${isInventoryModule ? "inventory-report-dialog" : ""}`}><div className={`flex shrink-0 flex-col gap-3 border-b px-3 py-2 pr-12 lg:flex-row lg:items-center lg:justify-start ${isReferenceReport ? "bg-[#efefef] text-[#202020]" : "bg-[#714b67] text-white"}`}><div className={isReferenceReport ? "w-full text-center lg:order-2 lg:ml-3 lg:w-auto lg:text-left" : "flex items-center gap-2"}><div className="flex items-center justify-center gap-2 lg:justify-start"><DialogTitle className={isReferenceReport ? "text-[#714b67]" : "text-white"}>{reportWindowTitle}</DialogTitle><Badge className={isReferenceReport ? "border-0 bg-[#714b67]/10 text-[#714b67]" : "border-0 bg-white/15 text-white"}>{selected.module}</Badge></div>{isReferenceReport && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Raport reference · Periudha: {dateFrom || "Fillimi"} — {dateTo || "Sot"}</p>}</div><div className="legacy-toolbar flex flex-wrap gap-1 lg:order-1 lg:mr-0"><Button variant="outline" size="sm" className={isReferenceReport ? "border-[#714b67]/40 text-[#714b67] hover:bg-[#714b67]/10 hover:text-[#714b67]" : "border-white/40 text-white hover:bg-white/15 hover:text-white"} onClick={() => setIsReportOpen(false)}><X className="mr-2 h-4 w-4" />Mbyll</Button><Button size="sm" className={isReferenceReport ? "bg-[#714b67] text-white hover:bg-[#5f3d58]" : "bg-white text-[#714b67] hover:bg-white/90"} onClick={viewReport} disabled={isReportLoading}><Eye className="mr-2 h-4 w-4" />{isReportLoading ? "Po ngarkohet..." : "Shiko"}</Button><Button variant="outline" size="sm" className={isReferenceReport ? "border-[#714b67]/40 text-[#714b67] hover:bg-[#714b67]/10 hover:text-[#714b67]" : "border-white/40 text-white hover:bg-white/15 hover:text-white"} onClick={() => toast.info("Plotësoni filtrat dhe shtypni Shiko ose Enter për të gjeneruar raportin.")}><CircleHelp className="mr-2 h-4 w-4" />Ndihmë</Button><Button variant="outline" size="sm" className={isReferenceReport ? "border-[#714b67]/40 text-[#714b67] hover:bg-[#714b67]/10 hover:text-[#714b67]" : "border-white/40 text-white hover:bg-white/15 hover:text-white"} disabled={!hasExecutedReport || rows.length === 0} onClick={printPreview}><Printer className="mr-2 h-4 w-4" />Printo</Button><Button variant="outline" size="sm" className={isReferenceReport ? "border-[#714b67]/40 text-[#714b67] hover:bg-[#714b67]/10 hover:text-[#714b67]" : "border-white/40 text-white hover:bg-white/15 hover:text-white"} disabled={!hasExecutedReport || rows.length === 0 || isReportLoading} onClick={exportExcel}><FileSpreadsheet className="mr-2 h-4 w-4" />Excel</Button><Button variant="outline" size="sm" className={isReferenceReport ? "border-[#714b67]/40 text-[#714b67] hover:bg-[#714b67]/10 hover:text-[#714b67]" : "border-white/40 text-white hover:bg-white/15 hover:text-white"} disabled={!hasExecutedReport || rows.length === 0 || isReportLoading} onClick={exportPdf}><FileText className="mr-2 h-4 w-4" />PDF</Button></div></div><div className="grid min-h-0 flex-1 lg:grid-cols-[32%_minmax(0,1fr)]"><aside className="min-h-0 overflow-y-auto border-r bg-[#f3f3f3] p-3"><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-700">Emri i Raportit</h2><Button type="button" size="sm" variant="outline" onClick={() => setIsReportOpen(false)}><X className="mr-1 h-4 w-4" />Mbyll</Button></div><div className="space-y-1">{visibleReports.map(item => <button type="button" key={item.key} onClick={() => { setSelectedKey(item.key); setHasExecutedReport(false); setModuleFilter(item.module); setLocation(reportUrl(item.module, item.key)); }} className={`block w-full rounded px-2 py-1.5 text-left text-xs ${selectedKey === item.key ? "bg-[#1296db] text-white" : "text-slate-700 hover:bg-white"}`}>{item.title}</button>)}</div>{legacyFilterVisibility.genericAmountSidebar && <section className="legacy-side-panels space-y-2 border-t border-[#9d9d9d] bg-[#f1f1f1] p-2"><fieldset className="rounded-sm border border-[#a9a9a9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">Shuma</legend><div className="grid grid-cols-3 gap-1 text-[11px] text-[#444]"><label className="flex items-center gap-1"><input type="radio" name="legacy-amount-mode" checked={amountMode === "Sasia"} onChange={() => setAmountMode("Sasia")} />Sasia</label><label className="flex items-center gap-1"><input type="radio" name="legacy-amount-mode" checked={amountMode === "Cmimi"} onChange={() => setAmountMode("Cmimi")} />Cmimi</label><label className="flex items-center gap-1"><input type="radio" name="legacy-amount-mode" checked={amountMode === "Vlefta"} onChange={() => setAmountMode("Vlefta")} />Vlefta</label></div><div className="mt-2 grid grid-cols-2 gap-2"><label className="text-[11px] text-[#555]">Min<input aria-label="Shuma minimale" type="number" value={amountMin} onChange={event => setAmountMin(event.target.value)} className="mt-1 h-7 w-full border border-[#999] bg-white px-1 text-[11px]" /></label><label className="text-[11px] text-[#555]">Max<input aria-label="Shuma maksimale" type="number" value={amountMax} onChange={event => setAmountMax(event.target.value)} className="mt-1 h-7 w-full border border-[#999] bg-white px-1 text-[11px]" /></label></div></fieldset><fieldset className="hidden rounded-sm border border-[#a9a9a9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">Grupi Sipas</legend><div className="space-y-1"><select aria-label="Grupi 1" value={groupByOne} onChange={event => setGroupByOne(event.target.value)} className="h-7 w-full border border-[#999] bg-white px-1 text-[11px]"><option value="">Grupi 1</option></select><select aria-label="Grupi 2" value={groupByTwo} onChange={event => setGroupByTwo(event.target.value)} className="h-7 w-full border border-[#999] bg-white px-1 text-[11px]"><option value="">Grupi 2</option></select><select aria-label="Grupi 3" value={groupByThree} onChange={event => setGroupByThree(event.target.value)} className="h-7 w-full border border-[#999] bg-white px-1 text-[11px]"><option value="">Grupi 3</option></select></div></fieldset></section>}</aside><main className="min-h-0 min-w-0 overflow-y-auto"><div className="legacy-report-canvas"><section className="legacy-report-middle">{showLegacyDocumentNumberFilter && <fieldset><legend>Numer Dokumenti</legend><div className="legacy-range"><Input aria-label="Numer dokumenti nga" value={documentFilter} onChange={event => setDocumentFilter(event.target.value)} /><span>deri</span><Input aria-label="Numer dokumenti deri" /></div>{showLegacyDocumentTypeFilter && <label>Lloj Dokumenti<select aria-label="Lloj dokumenti" value={documentTypeFilter} onChange={event => setDocumentTypeFilter(event.target.value)}><option value="">Të gjithë</option><option value="Faturë">Faturë</option><option value="Porosi">Porosi</option><option value="Pranim">Pranim</option><option value="Kthim">Kthim</option><option value="Lëvizje">Lëvizje</option></select></label>}{isSalesModule && <label className="hidden">Pike Shitjeje<Input aria-label="Pike Shitjeje" /><button type="button" className="legacy-search-button" aria-label="Kërko pikën e shitjes"><Search /></button></label>}{showLegacyCurrencyFilter && <label>Monedha<select aria-label="Monedha" value={currencyFilter} onChange={event => setCurrencyFilter(event.target.value)}><option value="">Të gjitha</option><option value="L">Lek</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></label>}{isSalesModule && <><label className="hidden">GRUPIM SHITJE<Input aria-label="GRUPIM SHITJE" /><button type="button" className="legacy-search-button" aria-label="Kërko grupimin e shitjes" onClick={() => openLookup("customer")}><Search /></button></label><label className="hidden legacy-check"><input type="checkbox" />Kontrollo per Kthime te lidhura me Fature ne Vitin Paraardhes</label></>}</fieldset>}{isSalesModule && !hideSalesCustomerContext && <fieldset><legend>Klienti</legend><label>Klienti<Input aria-label="Klienti" value={partnerFilter} onChange={event => setPartnerFilter(event.target.value)} /><button type="button" className="legacy-search-button" aria-label="Kërko klientin" onClick={() => openLookup("customer", partnerFilter)}><Search /></button></label><label className="hidden">QYTETI<Input aria-label="Qyteti" /><button type="button" className="legacy-search-button" aria-label="Kërko qytetin"><Search /></button></label><label className="hidden">Shitesi<Input aria-label="Shitesi" /><button type="button" className="legacy-search-button" aria-label="Kërko shitësin"><Search /></button></label><label className="hidden">Agjenti<Input aria-label="Agjenti" /><button type="button" className="legacy-search-button" aria-label="Kërko agjentin"><Search /></button></label><label className="hidden">Llogari klienti<Input aria-label="Llogari klienti" /><button type="button" className="legacy-search-button" aria-label="Kërko llogarinë e klientit"><Search /></button></label><label className="hidden">Kategori Klienti 1<select aria-label="Kategori Klienti 1"><option value="">Të gjithë</option></select></label><label className="hidden">Kategori Klienti 2<select aria-label="Kategori Klienti 2"><option value="">Të gjithë</option></select></label><label className="hidden">Kategori Klienti 3<select aria-label="Kategori Klienti 3"><option value="">Të gjithë</option></select></label><label className="hidden">PERIUDHËSI<Input aria-label="PERIUDHËSI" /><button type="button" className="legacy-search-button" aria-label="Kërko periudhën"><Search /></button></label></fieldset>}<fieldset className="legacy-date-panel"><legend>DATË REGJISTRIMI</legend><div className="legacy-radio-row"><label><input type="radio" name="registration-date" defaultChecked />Aktuale</label><label><input type="radio" name="registration-date" />Viti Ushtrimor</label></div><div className="legacy-range"><input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} /><span>deri</span><input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} /></div></fieldset></section><section className="legacy-right-panel"><fieldset className={usesArticleFilters && !hideSalesCustomerContext ? "" : "hidden"}><legend>Identifikues</legend>{usesArticleFilters && !hideSalesCustomerContext && <label>Kartela<Input aria-label="Kartela" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} /><button type="button" className="legacy-search-button" aria-label="Kërko kartelën" onClick={() => openLookup("product", categoryFilter)}><Search /></button></label>}{isPurchaseModule && <label>FURNITORI<Input aria-label="FURNITORI" value={partnerFilter} onChange={event => setPartnerFilter(event.target.value)} /><button type="button" className="legacy-search-button" aria-label="Kërko furnitorin" onClick={() => openLookup("supplier", partnerFilter)}><Search /></button></label>}</fieldset><fieldset className={usesArticleFilters && !hideSalesCustomerContext ? "" : "hidden"}><legend>MAGAZINA</legend><label>Magazina<Input aria-label="Magazina" value={warehouseFilter} onChange={event => setWarehouseFilter(event.target.value)} /><button type="button" className="legacy-search-button" aria-label="Kërko magazinën" onClick={() => openLookup("warehouse", warehouseFilter)}><Search /></button></label></fieldset><fieldset className="hidden"><legend>Filtra Grafiku</legend><label>SHFAQ AQ GRAFIKE SA<select aria-label="SHFAQ AQ GRAFIKE SA"><option value="">Pa dallim</option></select></label><label>Periudha<select aria-label="Periudha"><option value="">Mujore</option></select></label><label>Vlefta<select aria-label="Vlefta"><option value="">VLEFTA E SHITUR</option></select></label></fieldset><fieldset className="hidden legacy-date-panel"><legend>Date Dokumenti</legend><div className="legacy-radio-row"><label><input type="radio" name="document-date" />Aktuale</label><label><input type="radio" name="document-date" defaultChecked />Viti Ushtrimor</label></div><div className="legacy-range"><input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} /><span>deri</span><input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} /></div></fieldset></section><div className="legacy-bottom-actions"><Button type="button" onClick={() => setIsReportOpen(false)}><X className="mr-1 h-4 w-4" />ESC - Dil</Button><Button type="button" onClick={viewReport} disabled={isReportLoading}><Eye className="mr-1 h-4 w-4" />ENTER - Shiko</Button></div></div><div className={`grid gap-3 border-b border-[#b8b8b8] bg-[#e9e9e9] p-4 md:grid-cols-2 xl:grid-cols-4 ${isReferenceReport ? "hidden" : ""}`}><div className="hidden md:col-span-2 xl:col-span-4 rounded-sm border border-[#b9b9b9] bg-[#dedede] px-3 py-2"><h2 className="text-sm font-semibold uppercase tracking-wide text-[#444]">Filtra</h2><p className="text-xs text-[#666]">Zgjidhni raportin dhe plotësoni kriteret si në formularin reference.</p></div><fieldset className="rounded-sm border border-[#b9b9b9] bg-[#dedede] p-2 md:col-span-2 xl:col-span-2"><legend className="px-1 text-xs font-semibold text-[#555]">Dokumenti</legend><div className="grid gap-2 sm:grid-cols-2"><label className="text-xs text-[#555]">Nr. dokumenti<Input aria-label="Numër dokumenti" value={documentFilter} onChange={event => setDocumentFilter(event.target.value)} placeholder="Nr. dokumenti" className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label><label className="text-xs text-[#555]">Lloj dokumenti<select aria-label="Lloj dokumenti" value={documentTypeFilter} onChange={event => setDocumentTypeFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#bcbcbc] bg-white px-3 text-sm"><option value="">Të gjithë</option><option value="Faturë">Faturë</option><option value="Porosi">Porosi</option><option value="Pranim">Pranim</option><option value="Kthim">Kthim</option><option value="Lëvizje">Lëvizje</option></select></label></div></fieldset><fieldset className="rounded-sm border border-[#b9b9b9] bg-[#dedede] p-2 md:col-span-2 xl:col-span-2"><legend className="px-1 text-xs font-semibold text-[#555]">Partneri dhe klasifikimi</legend><div className="grid gap-2 sm:grid-cols-2"><label className="text-xs text-[#555]">{isProductCardReport ? "Dokumenti burimor" : "Furnitor / Klient"}<Input aria-label={isProductCardReport ? "Dokumenti burimor" : "Partner"} value={partnerFilter} onChange={event => setPartnerFilter(event.target.value)} placeholder={isProductCardReport ? "Dokumenti burimor (opsional)" : "Furnitor / Klient"} className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label><label className="text-xs text-[#555]">{isProductCardReport ? "Artikull" : "Kategori / Artikull"}<Input aria-label={isProductCardReport ? "Artikull" : "Kategori"} value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} placeholder={isProductCardReport ? "Kërko artikullin" : "Kategori / Artikull"} className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label><label className="text-xs text-[#555]">Status<Input aria-label="Status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} placeholder="Status" className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label><label className="text-xs text-[#555]">Monedha<select aria-label="Monedha" value={currencyFilter} onChange={event => setCurrencyFilter(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#bcbcbc] bg-white px-3 text-sm"><option value="">Të gjitha</option><option value="L">Lek</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></label></div></fieldset><fieldset className="rounded-sm border border-[#b9b9b9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">Magazina dhe njësia</legend><div className="grid grid-cols-2 gap-2"><label className="text-xs text-[#555]">{isProductCardReport ? "Magazinë" : "Magazina"}<Input aria-label="Magazinë" value={warehouseFilter} onChange={event => setWarehouseFilter(event.target.value)} placeholder={isProductCardReport ? "Kërko magazinën" : "Magazina"} className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label><label className="text-xs text-[#555]">Njësia<Input aria-label="Njësia" value={unitFilter} onChange={event => setUnitFilter(event.target.value)} placeholder="Njësia" className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label></div></fieldset><fieldset className="rounded-sm border border-[#b9b9b9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">Shuma</legend><div className="grid grid-cols-2 gap-2"><label className="text-xs text-[#555]">Min<Input aria-label="Shuma minimale" type="number" value={amountMin} onChange={event => setAmountMin(event.target.value)} placeholder="Min" className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label><label className="text-xs text-[#555]">Max<Input aria-label="Shuma maksimale" type="number" value={amountMax} onChange={event => setAmountMax(event.target.value)} placeholder="Max" className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label></div></fieldset><fieldset className="rounded-sm border border-[#b9b9b9] bg-[#dedede] p-2"><legend className="px-1 text-xs font-semibold text-[#555]">Datat e dokumentit</legend><div className="grid grid-cols-2 gap-2"><label className="text-xs text-[#555]">Nga<Input aria-label="Data nga" type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label><label className="text-xs text-[#555]">Deri<Input aria-label="Data deri" type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} className="mt-1 h-9 border-[#bcbcbc] bg-white" /></label></div></fieldset><div className="hidden rounded-md border border-[#d8c5d2] bg-[#fcf8fb] p-3 md:col-span-2 xl:col-span-4"><div className="mb-2 flex flex-wrap items-center gap-2"><Bookmark className="h-4 w-4 text-[#714b67]" /><span className="text-xs font-semibold text-[#714b67]">Filtrat e preferuar</span><Input aria-label="Emri i filtrit të preferuar" value={favoriteName} onChange={event => setFavoriteName(event.target.value)} placeholder="Emër për ruajtje" className="h-8 max-w-xs bg-white" /><Button type="button" size="sm" onClick={saveFavorite}><Bookmark className="mr-1 h-3.5 w-3.5" />Ruaj filtrin</Button></div>{reportFavorites.length > 0 ? <div className="flex flex-wrap gap-2">{reportFavorites.map(filter => <div className="flex items-center gap-1 rounded border bg-white pl-2" key={filter.id}><button type="button" className="py-1 text-xs font-medium text-[#714b67] hover:underline" onClick={() => applyFavorite(filter)}>{filter.name}</button><Button type="button" size="icon" variant="ghost" className="h-7 w-7" aria-label={`Fshi filtrin ${filter.name}`} onClick={() => deleteFavorite(filter.id)}><Trash2 className="h-3.5 w-3.5 text-slate-500" /></Button></div>)}</div> : <p className="text-xs text-slate-500">Nuk ka filtra të ruajtur për këtë raport.</p>}</div><div className="hidden rounded-md border border-slate-200 bg-white p-3 md:col-span-2 xl:col-span-4"><Input aria-label="Kërkim brenda tabelës" value={tableSearch} onChange={event => setTableSearch(event.target.value)} placeholder="Kërko brenda tabelës: dokument, klient, furnitor…" /><p className="mt-1 text-xs text-slate-500">{rows.length} rreshta · kliko kokën e kolonës për renditje</p><details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-[#714b67]">Filtra kolonë-për-kolonë si Excel</summary><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{columns.map(column => <label className="text-xs text-slate-600" key={column}>{column}<div className="mt-1 flex gap-1"><Input aria-label={`Filtro kolonën ${column}`} value={columnFilters[column] ?? ""} onChange={event => setColumnFilters(current => ({ ...current, [column]: event.target.value }))} placeholder={`Filtro ${column}`} className="h-8" />{columnFilters[column] ? <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label={`Pastro filtrin ${column}`} onClick={() => setColumnFilters(current => { const next = { ...current }; delete next[column]; return next; })}><X className="h-3.5 w-3.5" /></Button> : null}</div></label>)}</div></details></div><div className="flex flex-wrap items-center gap-2"><Button type="button" size="sm" onClick={() => setIsReportOpen(false)}><X className="mr-1 h-4 w-4" />ESC – Dil</Button><Button type="button" size="sm" variant="outline" onClick={clearFilters}><SlidersHorizontal className="mr-1 h-4 w-4" />Pastro</Button><Button type="button" size="sm" onClick={viewReport} disabled={isReportLoading}>{isReportLoading ? <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> : <Eye className="mr-1 h-4 w-4" />} {isReportLoading ? "Po ngarkohet..." : "ENTER – Shiko"}</Button><Button type="button" size="sm" variant="outline" disabled={!hasExecutedReport || rows.length === 0 || isReportLoading} onClick={() => void printPreview()}><Printer className="mr-1 h-4 w-4" />Printo</Button></div></div>{hasExecutedReport && activeFilterEntries.length > 0 && <div className="border-b bg-[#fff8e8] px-4 py-2 text-xs text-[#6b4b16]"><strong>Filtra aktive në dokument:</strong> {activeFilterEntries.map(([label, value]) => `${label}: ${value}`).join(" · ")}</div>}{isReferenceReport ? <div className={`min-h-0 overflow-y-auto ${hasExecutedReport ? "" : "hidden"}`}><ReferenceReportView reportKey={selected.key} module={selected.module} title={selected.title} period={`${dateFrom || "Fillimi"} — ${dateTo || "Sot"}`} columns={columns} rows={rows} metrics={report?.metrics ?? []} meta={reportMeta} isLoading={isReportLoading} cellValue={cellValue} isLinkedDocument={isLinkedDocument} onOpenDocument={openDocument} sort={tableSort} onSort={column => setTableSort(current => current?.column === column ? { column, direction: current.direction === "asc" ? "desc" : "asc" } : { column, direction: "asc" })} /></div> : <div className={`${hasExecutedReport ? "flex-1" : "hidden"} space-y-5 overflow-y-auto p-5 ${isReferenceReport ? "lg:p-8" : ""}`}><div className={isReferenceReport ? "mx-auto max-w-[1400px] bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:p-6" : ""}>{(report?.metrics.length ?? 0) > 0 && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{report?.metrics.map(metric => <div className={`rounded-lg border p-4 ${isReferenceReport ? "border-[#d8c5d2] bg-[#fcf8fb]" : "bg-background"}`} key={metric.label}><p className="text-xs text-muted-foreground">{metric.label}</p><p className="mt-1 text-xl font-bold">{reportMetricValue(metric.label, metric.value, rows, columns).toLocaleString("sq-AL")}</p></div>)}</div>}<div className="overflow-x-auto"><table className={`w-full min-w-[720px] text-sm ${isReferenceReport ? "border border-slate-300" : ""}`}><thead className={`border-b text-left ${isReferenceReport ? "bg-[#714b67] text-white" : "text-muted-foreground"}`}><tr>{columns.map(column => <th className="p-3 font-medium" key={column}><button type="button" className="inline-flex items-center gap-1 font-medium" onClick={() => setTableSort(current => current?.column === column ? { column, direction: current.direction === "asc" ? "desc" : "asc" } : { column, direction: "asc" })}>{column}<span aria-hidden="true">{tableSort?.column === column ? (tableSort.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>)}</tr></thead><tbody>{isReportLoading ? <tr><td colSpan={Math.max(columns.length, 1)} className="p-10 text-center text-muted-foreground">Po ngarkohet...</td></tr> : rows.length === 0 ? <tr><td colSpan={Math.max(columns.length, 1)} className="p-10 text-center text-muted-foreground">Nuk ka të dhëna.</td></tr> : rows.map((row, index) => <tr key={index} className="border-b last:border-0 hover:bg-muted/30">{columns.map(column => <td className="p-3" key={column}>{isLinkedDocument(row, column) ? <SourceDocumentLink label={cellValue(row[column])} onOpen={() => openDocument(row)} ariaLabel={`Hap dokumentin ${cellValue(row[column])}`} /> : cellValue(row[column])}</td>)}</tr>)}</tbody>{!isReportLoading && <tfoot><tr className="border-t-2 border-[#714b67] bg-[#fcf8fb] font-bold text-[#714b67]">{columns.map((column, index) => { const total = totalFor(column); return <td className="p-3" key={column}>{index === 0 ? "TOTALI" : total === null ? "" : cellValue(total)}</td>; })}</tr></tfoot>}</table></div>{isReferenceReport && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#714b67] pt-3 text-xs font-semibold uppercase tracking-wide text-slate-600"><span>Totali i raportit</span><span>Sistemi Genit Cloud · Dokumenti mund të ketë disa faqe</span></div>}</div></div>}</main></div></DialogContent></Dialog>
    <Dialog open={isReportResultOpen} onOpenChange={open => { setIsReportResultOpen(open); if (!open) { setHasExecutedReport(false); setIsReportOpen(true); } }}><DialogContent className="report-result-dialog !fixed !inset-0 !left-0 !top-0 !flex !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 !flex-col gap-0 overflow-hidden rounded-none border-2 border-[#858585] bg-[#efefef] p-0"><div className="flex shrink-0 items-center justify-between border-b border-[#b8b8b8] bg-[#efefef] px-3 py-2"><DialogTitle className="text-sm font-semibold text-[#714b67]">{reportWindowTitle}</DialogTitle><div className="flex items-center gap-1"><Button type="button" size="sm" variant="outline" onClick={() => { setIsReportResultOpen(false); setHasExecutedReport(false); setIsReportOpen(true); }}><X className="mr-1 h-4 w-4" />Mbyll</Button><Button type="button" size="sm" variant="outline" onClick={() => void printPreview()}><Printer className="mr-1 h-4 w-4" />Printo</Button><Button type="button" size="sm" variant="outline" onClick={exportExcel}><FileSpreadsheet className="mr-1 h-4 w-4" />Excel</Button><Button type="button" size="sm" variant="outline" onClick={exportPdf}><FileText className="mr-1 h-4 w-4" />PDF</Button></div></div><div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f7f7] p-4">{activeFilterEntries.length > 0 && <div className="mx-auto mb-3 max-w-[1400px] border border-[#d7bb72] bg-[#fff8e8] px-3 py-2 text-xs text-[#6b4b16]"><strong>Filtra aktive:</strong> {activeFilterEntries.map(([label, value]) => `${label}: ${value}`).join(" · ")}</div>}{isReferenceReport ? <ReferenceReportView reportKey={selected.key} module={selected.module} title={selected.title} period={`${dateFrom || "Fillimi"} — ${dateTo || "Sot"}`} columns={columns} rows={rows} metrics={report?.metrics ?? []} meta={reportMeta} isLoading={isReportLoading} cellValue={cellValue} isLinkedDocument={isLinkedDocument} onOpenDocument={openDocument} sort={tableSort} onSort={column => setTableSort(current => current?.column === column ? { column, direction: current.direction === "asc" ? "desc" : "asc" } : { column, direction: "asc" })} /> : <div className="mx-auto max-w-[1400px] overflow-x-auto bg-white p-4 shadow-sm"><table className="w-full min-w-[720px] text-sm"><thead className="bg-[#714b67] text-left text-white"><tr>{columns.map(column => <th className="p-3" key={column}>{column}</th>)}</tr></thead><tbody>{isReportLoading ? <tr><td colSpan={Math.max(columns.length, 1)} className="p-10 text-center">Po ngarkohet...</td></tr> : rows.length === 0 ? <tr><td colSpan={Math.max(columns.length, 1)} className="p-10 text-center">Nuk ka të dhëna.</td></tr> : rows.map((row, index) => <tr className="border-b" key={index}>{columns.map(column => <td className="p-3" key={column}>{isLinkedDocument(row, column) ? <SourceDocumentLink label={cellValue(row[column])} onOpen={() => openDocument(row)} ariaLabel={`Hap dokumentin ${cellValue(row[column])}`} /> : cellValue(row[column])}</td>)}</tr>)}</tbody></table></div>}</div></DialogContent></Dialog>
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
