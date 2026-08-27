import { describe, expect, it } from "vitest";
import { REPORT_CATALOG } from "../../../shared/reportCatalog";
import { getAlphaReportPresentation, resolveReportModuleForRoute } from "./reportPresentationPolicy";

describe("Alpha report presentation policy", () => {
  it("assigns every catalog report to the Alpha reference presentation of its own module", () => {
    for (const report of REPORT_CATALOG) {
      expect(getAlphaReportPresentation(report.key)).toMatchObject({ key: report.key, module: report.module, title: report.title, resultFormat: "alpha-reference" });
    }
  });

  it("lets the report key override a conflicting module query so modules cannot be mixed", () => {
    expect(resolveReportModuleForRoute("Shitje", "purchase_summary_register_pdf")).toBe("Blerje");
    expect(resolveReportModuleForRoute("Blerje", "sales_summary_register_pdf")).toBe("Shitje");
    expect(resolveReportModuleForRoute("Magazina", null)).toBe("Magazina");
  });
});
