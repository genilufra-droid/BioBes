import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const reportsCenterSource = readFileSync(new URL("./ReportsCenter.tsx", import.meta.url), "utf8");
const inlineFiltersSource = readFileSync(new URL("../components/AlphaReportInlineFilters.tsx", import.meta.url), "utf8");

describe("ReportsCenter inline Alpha workspace", () => {
  it("does not retain report filter or result dialogs", () => {
    expect(reportsCenterSource).not.toContain("reference-report-dialog");
    expect(reportsCenterSource).not.toContain("report-result-dialog");
    expect(reportsCenterSource).not.toContain("isReportResultOpen");
  });

  it("renders the report form directly in the report workspace", () => {
    expect(reportsCenterSource).toContain("{isReportOpen && <AlphaReportInlineFilters");
    expect(reportsCenterSource).toContain("{!isReportOpen && <>");
    expect(reportsCenterSource).toContain("moduleLabel={selected.module}");
    expect(reportsCenterSource).toContain("partnerLookupKind={inlinePartnerLookupKind}");
    expect(reportsCenterSource).not.toContain("reports={visibleReports}");
    expect(inlineFiltersSource).not.toContain("Emri i Raportit");
    expect(inlineFiltersSource).not.toContain("reports:");
  });

  it("keeps report exits visible without restoring a modal", () => {
    expect(inlineFiltersSource).toContain('data-report-exit-toolbar');
    expect(inlineFiltersSource).toContain('sticky top-0');
    expect(inlineFiltersSource).toContain('aria-label="Kthehu te Raportet"');
    expect(inlineFiltersSource).toContain('aria-label="Shko në faqen kryesore"');
    expect(reportsCenterSource).toContain('onHome={() => setLocation("/")}');
    expect(reportsCenterSource).toContain('onList={() => { clearReportFilters(); setIsReportOpen(false); setLocation(alphaReportWorkspaceUrl(selected.module)); }}');
  });

  it("renders a report-specific Alpha reference sheet for PDF report results", () => {
    expect(reportsCenterSource).toContain('referenceResult={isReferenceReport ? <ReferenceReportView');
    expect(reportsCenterSource).toContain('onSort={toggleTableSort}');
    expect(inlineFiltersSource).toContain('data-alpha-reference-result');
    expect(inlineFiltersSource).toContain('data-alpha-report-result-format={referenceResult ? "reference" : "grid"}');
    expect(inlineFiltersSource).toContain('[&_[data-purchase-inline-result]]:hidden');
    expect(reportsCenterSource).toContain('const referencePeriod = `${dateFrom || "Fillimi"} — ${dateTo || "Sot"}`;');
  });
});
