import type { ReportCatalogItem, ReportModule } from "../../../shared/reportCatalog";

export const ALPHA_PRIMARY_REPORT_MODULES = ["Shitje", "Magazina", "Blerje", "Kontabilitet"] as const satisfies readonly ReportModule[];
export const ALPHA_SECONDARY_REPORT_MODULES = ["CRM", "Banka"] as const satisfies readonly ReportModule[];

export const ALPHA_REPORT_MODULE_LABELS: Record<ReportModule, string> = {
  Blerje: "Blerje",
  Shitje: "Shitje",
  Magazina: "Magazina",
  Kontabilitet: "Kontabiliteti",
  CRM: "CRM",
  Banka: "Banka",
};

export const ALPHA_REPORT_MODULE_GROUPS = {
  primary: ALPHA_PRIMARY_REPORT_MODULES,
  secondary: ALPHA_SECONDARY_REPORT_MODULES,
} as const;

export const ALPHA_REPORT_NAV_ITEMS = [
  { label: "Arka", module: null },
  { label: "Banka", module: "Banka" },
  { label: "BI", module: null },
  { label: "Blerje", module: "Blerje" },
  { label: "Fatura Blerjes Einvoice", module: null },
  { label: "Inventar", module: "Magazina" },
  { label: "Klientë dhe furnitorë", module: "CRM" },
  { label: "Kontabilitet", module: "Kontabilitet" },
  { label: "Shitje", module: "Shitje" },
  { label: "Fatura shitje Einvoice", module: null },
] as const satisfies readonly { label: string; module: ReportModule | null }[];

export function alphaReportWorkspaceUrl(module: ReportModule | "Të gjitha") {
  return module === "Të gjitha" ? "/reports" : `/reports?module=${encodeURIComponent(module)}`;
}

export function getAlphaReportModuleCounts(reports: readonly ReportCatalogItem[]) {
  return reports.reduce<Record<ReportModule, number>>((counts, report) => {
    counts[report.module] += 1;
    return counts;
  }, { Blerje: 0, Shitje: 0, Magazina: 0, Kontabilitet: 0, CRM: 0, Banka: 0 });
}
