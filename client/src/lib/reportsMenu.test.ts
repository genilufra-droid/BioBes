import { describe, expect, it } from "vitest";
import { REPORT_CATALOG } from "../../../shared/reportCatalog";
import { ALPHA_PRIMARY_REPORT_MODULES, ALPHA_REPORT_MODULE_GROUPS, ALPHA_REPORT_MODULE_LABELS, ALPHA_REPORT_NAV_ITEMS, ALPHA_SECONDARY_REPORT_MODULES, alphaReportWorkspaceUrl, getAlphaReportModuleCounts } from "./reportsMenu";

describe("Alpha reports menu contract", () => {
  it("keeps the primary modules in Alpha order", () => {
    expect([...ALPHA_PRIMARY_REPORT_MODULES]).toEqual(["Shitje", "Magazina", "Blerje", "Kontabilitet"]);
    expect([...ALPHA_SECONDARY_REPORT_MODULES]).toEqual(["CRM", "Banka"]);
    expect(ALPHA_REPORT_MODULE_GROUPS.primary).toBe(ALPHA_PRIMARY_REPORT_MODULES);
    expect(ALPHA_REPORT_MODULE_GROUPS.secondary).toBe(ALPHA_SECONDARY_REPORT_MODULES);
  });

  it("uses real catalog counts for every visible module card", () => {
    expect(getAlphaReportModuleCounts(REPORT_CATALOG)).toEqual({
      Blerje: 29,
      Shitje: 36,
      Magazina: 27,
      Kontabilitet: 20,
      CRM: 20,
      Banka: 20,
    });
  });

  it("routes module cards to the model workspace before opening filters", () => {
    expect(alphaReportWorkspaceUrl("Blerje")).toBe("/reports?module=Blerje");
    expect(alphaReportWorkspaceUrl("Të gjitha")).toBe("/reports");
  });

  it("mirrors the verified Alpha Web report submenu order", () => {
    expect(ALPHA_REPORT_NAV_ITEMS.map(item => item.label)).toEqual(["Arka", "Banka", "BI", "Blerje", "Fatura Blerjes Einvoice", "Inventar", "Klientë dhe furnitorë", "Kontabilitet", "Shitje", "Fatura shitje Einvoice"]);
    expect(ALPHA_REPORT_NAV_ITEMS.filter(item => item.module).map(item => item.module)).toEqual(["Banka", "Blerje", "Magazina", "CRM", "Kontabilitet", "Shitje"]);
  });

  it("does not expose a menu module without a catalog label", () => {
    const catalogModules = new Set(REPORT_CATALOG.map(report => report.module));
    const menuModules = [...ALPHA_PRIMARY_REPORT_MODULES, ...ALPHA_SECONDARY_REPORT_MODULES];
    expect(menuModules.every(module => catalogModules.has(module))).toBe(true);
    expect(menuModules.every(module => ALPHA_REPORT_MODULE_LABELS[module].trim().length > 0)).toBe(true);
  });
});
