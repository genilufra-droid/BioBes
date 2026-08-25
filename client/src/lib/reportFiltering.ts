export type ReportFilterValues = {
  documentFilter: string;
  partnerFilter: string;
  categoryFilter: string;
  statusFilter: string;
  amountMin: string;
  amountMax: string;
  currencyFilter?: string;
  documentTypeFilter?: string;
  warehouseFilter?: string;
  unitFilter?: string;
};

function searchableValue(value: unknown) {
  if (value instanceof Date) return value.toLocaleDateString("sq-AL");
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString("sq-AL");
  if (typeof value === "number") return value.toLocaleString("sq-AL");
  return String(value ?? "—");
}

export function sumNumericColumn(rows: Record<string, unknown>[], column: string) {
  const values = rows.map(row => row[column]).filter(value => typeof value === "number") as number[];
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) : null;
}

export function searchReportRows(rows: Record<string, unknown>[], query: string) {
  const normalized = query.trim().toLocaleLowerCase("sq-AL");
  if (!normalized) return rows;
  return rows.filter(row => Object.values(row).map(searchableValue).join(" ").toLocaleLowerCase("sq-AL").includes(normalized));
}

export type ReportSort = { column: string; direction: "asc" | "desc" } | null;
export type ReportColumnFilters = Record<string, string>;
export type ActiveReportFilter = [label: string, value: string];

export function activeReportFilters(filters: Record<string, string | undefined>): ActiveReportFilter[] {
  return Object.entries(filters)
    .filter(([, value]) => String(value ?? "").trim().length > 0)
    .map(([label, value]) => [label, String(value).trim()] as ActiveReportFilter);
}

export function filterReportRowsByColumns(rows: Record<string, unknown>[], columnFilters: ReportColumnFilters) {
  const activeFilters = Object.entries(columnFilters)
    .map(([column, value]) => [column, value.trim().toLocaleLowerCase("sq-AL")] as const)
    .filter(([, value]) => value.length > 0);
  if (activeFilters.length === 0) return rows;
  return rows.filter(row => activeFilters.every(([column, value]) => searchableValue(row[column]).toLocaleLowerCase("sq-AL").includes(value)));
}

export function sortReportRows(rows: Record<string, unknown>[], sort: ReportSort) {
  if (!sort) return rows;
  return [...rows].sort((left, right) => {
    const a = left[sort.column];
    const b = right[sort.column];
    const aNumber = typeof a === "number" ? a : Number(a);
    const bNumber = typeof b === "number" ? b : Number(b);
    let comparison: number;
    if ((typeof a === "number" || Number.isFinite(aNumber)) && (typeof b === "number" || Number.isFinite(bNumber))) comparison = aNumber - bNumber;
    else comparison = searchableValue(a).localeCompare(searchableValue(b), "sq-AL", { numeric: true, sensitivity: "base" });
    return sort.direction === "asc" ? comparison : -comparison;
  });
}

export function filterReportRows(rows: Record<string, unknown>[], filters: ReportFilterValues) {
  const documentFilter = filters.documentFilter.trim().toLocaleLowerCase("sq-AL");
  const partnerFilter = filters.partnerFilter.trim().toLocaleLowerCase("sq-AL");
  const categoryFilter = filters.categoryFilter.trim().toLocaleLowerCase("sq-AL");
  const statusFilter = filters.statusFilter.trim().toLocaleLowerCase("sq-AL");
  const currencyFilter = (filters.currencyFilter ?? "").trim().toLocaleLowerCase("sq-AL");
  const documentTypeFilter = (filters.documentTypeFilter ?? "").trim().toLocaleLowerCase("sq-AL");
  const warehouseFilter = (filters.warehouseFilter ?? "").trim().toLocaleLowerCase("sq-AL");
  const unitFilter = (filters.unitFilter ?? "").trim().toLocaleLowerCase("sq-AL");
  const min = filters.amountMin.trim() ? Number(filters.amountMin) : undefined;
  const max = filters.amountMax.trim() ? Number(filters.amountMax) : undefined;

  return rows.filter(row => {
    const text = Object.values(row).map(searchableValue).join(" ").toLocaleLowerCase("sq-AL");
    const amount = Number(Object.values(row).find(value => typeof value === "number"));
    return (!documentFilter || text.includes(documentFilter))
      && (!partnerFilter || text.includes(partnerFilter))
      && (!categoryFilter || text.includes(categoryFilter))
      && (!statusFilter || text.includes(statusFilter))
      && (!currencyFilter || text.includes(currencyFilter))
      && (!documentTypeFilter || text.includes(documentTypeFilter))
      && (!warehouseFilter || text.includes(warehouseFilter))
      && (!unitFilter || text.includes(unitFilter))
      && (min === undefined || (Number.isFinite(amount) && amount >= min))
      && (max === undefined || (Number.isFinite(amount) && amount <= max));
  });
}

const COUNT_METRIC_LABELS = new Set(["Dokumente", "Fatura", "Grupime", "Rreshta të regjistrit", "Kërkojnë veprim"]);
const AMOUNT_METRIC_LABELS = new Set(["Vlera totale", "Vlefta", "Vlera", "Totali", "Shpenzim", "Detyrim"]);
const AMOUNT_COLUMN_NAMES = new Set(["Vlera", "Vlefta", "Totali", "Detyrimi", "Detyrimi bazë", "Debi", "Kredi", "Bilanci", "Të ardhura"]);

export function reportMetricValue(label: string, fallback: number, rows: Record<string, unknown>[], columns: string[]) {
  if (COUNT_METRIC_LABELS.has(label)) return rows.length;
  if (AMOUNT_METRIC_LABELS.has(label)) {
    const amountColumn = columns.find(column => AMOUNT_COLUMN_NAMES.has(column));
    const total = amountColumn ? sumNumericColumn(rows, amountColumn) : null;
    return total ?? fallback;
  }
  return fallback;
}
