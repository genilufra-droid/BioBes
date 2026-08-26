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
      Magazina: 23,
      Kontabilitet: 20,
      CRM: 7,
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

  it("uses the Alpha label for the partner workspace", () => {
    expect(ALPHA_REPORT_MODULE_LABELS.CRM).toBe("Klientë dhe furnitorë");
  });

  it("does not expose a menu module without a catalog label", () => {
    const catalogModules = new Set(REPORT_CATALOG.map(report => report.module));
    const menuModules = [...ALPHA_PRIMARY_REPORT_MODULES, ...ALPHA_SECONDARY_REPORT_MODULES];
    expect(menuModules.every(module => catalogModules.has(module))).toBe(true);
    expect(menuModules.every(module => ALPHA_REPORT_MODULE_LABELS[module].trim().length > 0)).toBe(true);
  });

  it("keeps the purchase workspace isolated to its complete catalog", () => {
    const purchaseReports = REPORT_CATALOG.filter(report => report.module === "Blerje");
    expect(purchaseReports).toHaveLength(29);
    expect(purchaseReports.map(report => report.key)).toEqual([
      "purchase_invoices", "purchase_orders", "purchase_receipts", "purchase_returns", "purchase_suppliers",
      "purchase_invoice_status", "purchase_open_invoices", "purchase_invoice_volume", "purchase_supplier_statement",
      "purchase_top_suppliers", "purchase_orders_open", "purchase_orders_status", "purchase_receipts_by_supplier",
      "purchase_receipts_timeline", "purchase_returns_analysis", "purchase_returns_status", "purchase_spend_trend",
      "purchase_supplier_count", "purchase_document_register", "purchase_summary_register_pdf", "purchase_receipt_control",
      "purchase_supplier_card_pdf", "purchase_supplier_card_format3_pdf", "purchase_supplier_maturity_pdf",
      "purchase_supplier_maturity_summary_pdf", "purchase_supplier_situation_pdf", "purchase_supplier_situation_category_pdf",
      "purchase_customs_import_register_pdf", "purchase_invoice_payment_register_pdf",
    ]);
  });

  it("matches Alpha's seven partner report models", () => {
    expect(REPORT_CATALOG.filter(report => report.module === "CRM").map(report => report.title)).toEqual([
      "Situacioni i klientit", "Situacioni i furnitorit", "Kartela e klientit", "Kartela e Furnitorit",
      "Kartela e klientit në monedhë bazë", "Kartela e furnitorit në monedhë bazë", "Regjistri përmbledhës faturime dhe pagesa",
    ]);
  });
});
