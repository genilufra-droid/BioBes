import { REPORT_CATALOG, type ReportCatalogItem, type ReportModule } from "../../../shared/reportCatalog";

export type AlphaReportPresentation = Pick<ReportCatalogItem, "key" | "module" | "group" | "title"> & {
  resultFormat: "alpha-reference";
};

/** The catalog is the single source of truth: a report key can never borrow a UI module from a query string. */
export function getAlphaReportPresentation(reportKey: string): AlphaReportPresentation | undefined {
  const report = REPORT_CATALOG.find(item => item.key === reportKey);
  return report ? { key: report.key, module: report.module, group: report.group, title: report.title, resultFormat: "alpha-reference" } : undefined;
}

export function resolveReportModuleForRoute(requestedModule: ReportModule | undefined, reportKey: string | null): ReportModule | undefined {
  return reportKey ? getAlphaReportPresentation(reportKey)?.module ?? requestedModule : requestedModule;
}
