import { describe, expect, it } from "vitest";
import { REPORT_BASE_KEYS, REPORT_CATALOG } from "../shared/reportCatalog";
import { applyInventoryValuePercent, applyOdooReportFilters, applyReportVariant, calculateSupplierSituationAmounts, getInventoryRunningKey, getSupplierMaturityBucket, mapPurchaseCustomsFields, normalizePurchasePaymentAmount, shapeReferenceReport } from "./db";

describe("Odoo-style report catalog", () => {
  it("keeps inventory progressive balances isolated by warehouse and product", () => {
    expect(getInventoryRunningKey(1, 10)).toBe("1:10");
    expect(getInventoryRunningKey(2, 10)).not.toBe(getInventoryRunningKey(1, 10));
    expect(getInventoryRunningKey(null, 10)).toBe("0:10");
  });

  it("calculates warehouse value share from the real total value", () => {
    expect(applyInventoryValuePercent([
      { Kartelë: "A", Vlefta: 100, "Në %": 0 },
      { Kartelë: "B", Vlefta: -300, "Në %": 0 },
    ]).map(row => row["Në %"])).toEqual([25, 75]);
    expect(applyInventoryValuePercent([{ Kartelë: "A", Vlefta: 0 }])[0]["Në %"]).toBe(0);
  });
  it("contains unique reports in every ERP module, including reference formats", () => {
    expect(REPORT_CATALOG.length).toBe(152);
    expect(new Set(REPORT_CATALOG.map(report => report.key)).size).toBe(REPORT_CATALOG.length);
    expect(new Set(REPORT_CATALOG.map(report => report.module))).toEqual(new Set(["Blerje", "Shitje", "Magazina", "Kontabilitet", "CRM", "Banka"]));
    expect(REPORT_CATALOG.every(report => report.group.trim().length > 0)).toBe(true);
    const expectedCounts = { Blerje: 29, Shitje: 36, Magazina: 27, Kontabilitet: 20, CRM: 20, Banka: 20 };
    expect(REPORT_CATALOG.every(report => REPORT_CATALOG.filter(item => item.module === report.module).length === expectedCounts[report.module])).toBe(true);
    expect(REPORT_CATALOG.every(report => Boolean(REPORT_BASE_KEYS[report.key]))).toBe(true);
  });

  it("converts supplier debit and credit to base currency using the real exchange rate", () => {
    expect(calculateSupplierSituationAmounts(1250, 0.92, false)).toEqual({ debit: 1250, credit: 0, debitBase: 1150, creditBase: 0, balance: 1250, balanceBase: 1150 });
    expect(calculateSupplierSituationAmounts(1250, 0.92, true)).toEqual({ debit: 1250, credit: 1250, debitBase: 1150, creditBase: 1150, balance: 0, balanceBase: 0 });
  });

  it("maps real purchase customs fields without fabricating unavailable duty values", () => {
    const row = mapPurchaseCustomsFields({ docNumber: "BL-01", date: new Date("2026-08-18"), inventoryReference: "INV-77", totalAmount: 1200, vatAmount: 200, currency: "EUR", exchangeRate: "1.08", carrierName: "Carrier Test", vehiclePlate: "AA-123-AA" });
    expect(row).toMatchObject({ "Ref.": "INV-77", "Nr.Fl.Dog.": "INV-77", "Vl.Fatures": 1200, Monedha: "EUR", Transport: "Carrier Test", Siguracion: "AA-123-AA", "Refer./Tjera": "INV-77", "Vl pa TVSH": 1000, TVSH: 200 });
    expect(row["Vl.Dogane"]).toBe("");
    expect(row.Dog).toBe("");
    expect(row.Akciz).toBe("");
  });

  it("normalizes purchase invoice and payment amounts into base currency", () => {
    expect(normalizePurchasePaymentAmount(1250, 0.92)).toBe(1150);
    expect(normalizePurchasePaymentAmount(0, 1.25)).toBe(0);
    expect(normalizePurchasePaymentAmount(100, 0)).toBe(100);
  });

  it("classifies supplier maturity into the exact reference buckets", () => {
    expect([0, 1, 30, 31, 60, 61, 90, 91, 180, 181].map(getSupplierMaturityBucket)).toEqual(["0", "1-30", "1-30", "30-60", "30-60", "60-90", "60-90", "90-180", "90-180", "Mbi 180"]);
    expect(getSupplierMaturityBucket(-4)).toBe("0");
  });

  it("creates dedicated analytic views for report variants", () => {
    const baseReport = {
      columns: ["Dokumenti", "Data", "Partneri", "Vlera", "Statusi"],
      rows: [
        { Dokumenti: "SH-01", Data: "2026-08-17", Partneri: "Klienti A", Vlera: 100, Statusi: "DRAFT" },
        { Dokumenti: "SH-02", Data: "2026-08-17", Partneri: "Klienti B", Vlera: 200, Statusi: "POSTED" },
      ],
      metrics: [{ label: "Dokumente", value: 2 }],
    };

    const byStatus = applyReportVariant("sales_invoice_status", baseReport);
    const openDocuments = applyReportVariant("sales_open_invoices", baseReport);

    expect(byStatus.columns).toEqual(["Statusi", "Dokumente", "Vlera"]);
    expect(byStatus.rows).toHaveLength(2);
    expect(openDocuments.rows).toEqual([{ Dokumenti: "SH-01", Data: "2026-08-17", Partneri: "Klienti A", Vlera: 100, Statusi: "DRAFT" }]);

    const accountingBase = {
      columns: ["Data", "Kategoria", "Vlera"],
      rows: [
        { Data: "2026-08-17", Kategoria: "Të ardhura", Vlera: 300 },
        { Data: "2026-08-17", Kategoria: "Shpenzime", Vlera: 120 },
      ],
      metrics: [],
    };
    expect(applyReportVariant("accounting_revenue_summary", accountingBase).rows).toEqual([
      { Data: "2026-08-17", Kategoria: "Të ardhura", Vlera: 300 },
    ]);
    expect(applyReportVariant("accounting_expense_summary", accountingBase).rows).toEqual([
      { Data: "2026-08-17", Kategoria: "Shpenzime", Vlera: 120 },
    ]);

    const inventoryBase = { columns: ["Lloji", "Sasia", "Stoku", "Vlera", "Statusi"], rows: [
      { Lloji: "IN", Sasia: 5, Stoku: 5, Vlera: 50, Statusi: "VALIDATED" },
      { Lloji: "OUT", Sasia: 2, Stoku: -2, Vlera: 20, Statusi: "DRAFT" },
    ], metrics: [{ label: "Lëvizje", value: 2 }] };
    expect(applyReportVariant("inventory_movement_in", inventoryBase).rows).toHaveLength(1);
    expect(applyReportVariant("inventory_movement_out", inventoryBase).rows).toHaveLength(1);
    expect(applyReportVariant("inventory_negative_stock", inventoryBase).rows).toHaveLength(1);
    expect(applyReportVariant("inventory_transfer_status", inventoryBase).columns).toEqual(["Statusi", "Dokumente", "Vlera"]);
    const stockByProduct = applyReportVariant("inventory_stock_by_product", { columns: ["Artikulli", "Stoku", "Magazina"], rows: [{ Artikulli: "Ferre", Stoku: 4, Magazina: "Qendrore", __documentId: 12, __documentType: "product", __warehouse: "Qendrore" }, { Artikulli: "Ferre", Stoku: 6, Magazina: "Dytësore", __documentId: 13, __documentType: "product", __warehouse: "Dytësore" }], metrics: [] });
    expect(stockByProduct.rows).toEqual([{ Artikulli: "Ferre", Dokumente: 2, Stoku: 10, __documentId: 12, __documentType: "product", __warehouse: "Qendrore, Dytësore" }]);
    const stockByLocation = applyReportVariant("inventory_stock_by_location", { columns: ["Lokacioni", "Sasia"], rows: [{ Lokacioni: "A1", Sasia: 4 }, { Lokacioni: "A1", Sasia: 6 }], metrics: [] });
    expect(stockByLocation.rows).toEqual([{ Lokacioni: "A1", Dokumente: 2, Sasia: 10 }]);
  });

  it("preserves dedicated reference PDF columns from generic variants", () => {
    const baseReport = {
      columns: ["Lloj", "Nr", "Data", "Mon", "Artikulli", "Sasia"],
      rows: [{ Lloj: "FS", Nr: "SH-01", Data: "2026-08-17", Mon: "ALL", Artikulli: "Artikull", Sasia: 2 }],
      metrics: [{ label: "Rreshta", value: 1 }],
    };
    const output = applyReportVariant("sales_summary_register_pdf", baseReport);
    expect(output.columns).toEqual(baseReport.columns);
    expect(output.rows).toEqual(baseReport.rows);
    expect(output.metrics).toEqual(baseReport.metrics);
  });

  it("shapes expanded reference reports without fabricating missing source values", () => {
    const output = shapeReferenceReport("purchase_customs_import_register_pdf", {
      columns: ["Dokumenti", "Data", "Partneri", "Vlera", "Statusi"],
      rows: [{ Dokumenti: "BL-01", Data: "2026-08-18", Partneri: "Furnitor", Vlera: 1200, Statusi: "POSTED" }],
      metrics: [{ label: "Dokumente", value: 1 }],
    });

    expect(output.columns).toHaveLength(15);
    expect(output.rows[0]).toMatchObject({ "Ref.": "BL-01", "Dt Fl.Dog.": "2026-08-18", "Vl.Fatures": 1200 });
    expect(output.rows[0]?.Transport).toBe("");
    expect(output.metrics).toEqual([{ label: "Dokumente", value: 1 }]);
  });

  it("preserves hidden supplier and document metadata for reference filters and links", () => {
    const output = shapeReferenceReport("purchase_supplier_card_pdf", {
      columns: ["Nr Dok", "Data", "Vlera"],
      rows: [{ "Nr Dok": "BL-77", Data: "2026-08-23", Vlera: 250, __partnerName: "Furnitor Test", __documentId: 77, __documentType: "purchase-invoice" }],
      metrics: [],
    });
    expect(output.rows[0]).toMatchObject({ __partnerName: "Furnitor Test", __documentId: 77, __documentType: "purchase-invoice" });
  });

  it("filters warehouse reports by real warehouse metadata", () => {
    const output = applyOdooReportFilters({
      columns: ["Kartelë", "Gjendje", "Vlefta"],
      rows: [
        { "Kartelë": "A-01", Gjendje: 4, Vlefta: 40, __warehouse: "Magazina Qendrore" },
        { "Kartelë": "A-02", Gjendje: 8, Vlefta: 80, __warehouse: "Magazina Dytësore" },
      ],
      metrics: [{ label: "Rreshta", value: 2 }],
    }, { warehouseFilter: "Qendrore" });
    expect(output.rows).toHaveLength(1);
    expect(output.rows[0]).toMatchObject({ "Kartelë": "A-01", __warehouse: "Magazina Qendrore" });
  });

  it("returns a valid report structure for every catalog key", () => {
    const baseReport = {
      columns: ["Dokumenti", "Data", "Partneri", "Vlera", "Statusi", "Lloji"],
      rows: [{ Dokumenti: "DOC-01", Data: "2026-08-17", Partneri: "Partner", Vlera: 100, Statusi: "DRAFT", Lloji: "INBOUND" }],
      metrics: [{ label: "Dokumente", value: 1 }],
    };

    REPORT_CATALOG.forEach(report => {
      const output = applyReportVariant(report.key, baseReport);
      expect(output.columns.length).toBeGreaterThan(0);
      expect(Array.isArray(output.rows)).toBe(true);
      expect(Array.isArray(output.metrics)).toBe(true);
    });
  });
});


describe("Reference PDF schemas", () => {
  it("preserves source metadata for sales returns and analytic sales rows", () => {
    const returns = shapeReferenceReport("sales_returns_pdf", { columns: [], rows: [{ "Nr.Dok": "KS-01", Artikulli: "Artikull", __documentId: 19, __documentType: "sales-return" }], metrics: [] });
    const analytic = shapeReferenceReport("sales_analytic_register_pdf", { columns: [], rows: [{ Nr: "SH-01", Emertimi: "Artikull", __documentId: 20, __documentType: "sales-invoice" }], metrics: [] });
    expect(returns.rows[0]).toMatchObject({ "Nr.Dok": "KS-01", __documentId: 19, __documentType: "sales-return" });
    expect(analytic.rows[0]).toMatchObject({ Nr: "SH-01", __documentId: 20, __documentType: "sales-invoice" });
    const inventory = shapeReferenceReport("inventory_product_card_pdf", { columns: [], rows: [{ "Nr Dokumenti": "BL-01", Artikulli: "Artikull", __documentId: 21, __documentType: "stock-movement" }], metrics: [] });
    expect(inventory.rows[0]).toMatchObject({ "Nr Dokumenti": "BL-01", __documentId: 21, __documentType: "stock-movement" });
    const city = shapeReferenceReport("sales_by_city_pdf", { columns: [], rows: [{ Qyteti: "Tiranë", Fatura: 2, __documentId: 22, __documentType: "sales-invoice" }], metrics: [] });
    const customer = shapeReferenceReport("sales_by_customer_pdf", { columns: [], rows: [{ Kodi: "K001", Emërtimi: "Klient", Fatura: 2, __documentId: 23, __documentType: "sales-invoice" }], metrics: [] });
    expect(city.rows[0]).toMatchObject({ Qyteti: "Tiranë", __documentId: 22, __documentType: "sales-invoice" });
    expect(customer.rows[0]).toMatchObject({ Kodi: "K001", __documentId: 23, __documentType: "sales-invoice" });
    const inventoryAnalytic = shapeReferenceReport("inventory_analytic_register_pdf", { columns: [], rows: [{ Numri: "BL-01", Kartela: "A-01", __documentId: 24, __documentType: "purchase-invoice" }], metrics: [] });
    expect(inventoryAnalytic.rows[0]).toMatchObject({ Numri: "BL-01", __documentId: 24, __documentType: "purchase-invoice" });
  });

  it("covers purchase summary reference report empty, single-row and multi-row source contracts", () => {
    const empty = shapeReferenceReport("purchase_summary_register_pdf", { columns: [], rows: [], metrics: [] });
    expect(empty.columns).toHaveLength(14);
    expect(empty.rows).toEqual([]);

    const single = shapeReferenceReport("purchase_summary_register_pdf", {
      columns: [],
      rows: [{ "Nr.": "BL-01", "Dt. Dok": "2026-08-18", Kodi: "F001", Emertimi: "Furnitor Test", Totali: 1200, __documentId: 41, __documentType: "purchase-invoice", __partnerName: "Furnitor Test" }],
      metrics: [{ label: "Dokumente", value: 1 }],
    });
    expect(single.rows).toHaveLength(1);
    expect(single.rows[0]).toMatchObject({ "Nr.": "BL-01", "Dt. Dok": "2026-08-18", Kodi: "F001", Emertimi: "Furnitor Test", Totali: 1200, __documentId: 41, __documentType: "purchase-invoice", __partnerName: "Furnitor Test" });

    const many = shapeReferenceReport("purchase_summary_register_pdf", {
      columns: [],
      rows: [
        { "Nr.": "BL-01", "Dt. Dok": "2026-08-18", Totali: 1200, __documentId: 41, __documentType: "purchase-invoice" },
        { "Nr.": "BL-02", "Dt. Dok": "2026-08-19", Totali: 800, __documentId: 42, __documentType: "purchase-invoice" },
      ],
      metrics: [{ label: "Dokumente", value: 2 }],
    });
    expect(many.rows).toHaveLength(2);
    expect(many.rows.map(row => row.__documentId)).toEqual([41, 42]);
    expect(many.metrics).toEqual([{ label: "Dokumente", value: 2 }]);
  });

  it("keeps the exact column count and order for the newly dedicated formats", () => {
    const expected: Record<string, string[]> = {
      purchase_supplier_situation_category_pdf: ["Kodi", "Emërtimi", "Mon", "Qyteti", "Debi", "Kredi", "Detyrimi", "Debi bazë", "Kredi bazë", "Detyrimi bazë"],
      purchase_customs_import_register_pdf: ["Ref.", "Nr.Fl.Dog.", "Dt Fl.Dog.", "Vl.Fatures", "Monedha", "Kursi", "Vlefta", "Transport", "Siguracion", "Refer./Tjera", "Vl.Dogane", "Dog", "Akciz", "Vl pa TVSH", "TVSH"],
      purchase_invoice_payment_register_pdf: ["Fature", "Pagese", "Numer", "Date", "Pershkrimi", "Faturuar", "Paguar", "Diferenca"],
      purchase_summary_register_pdf: ["Nr. rend", "Lloji", "Nr.", "Dt. Dok", "Monedha", "Kursi", "Kodi", "Emertimi", "Nentotal", "Zbritje", "TVSH", "Totali", "TVSH bazë", "Totali bazë"],
      sales_quantity_total_pdf: ["Artikulli", "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"],
      sales_items_sold_pdf: ["Kartelë", "Emërtimi", "Njësia", "Sasia", "Çmimi", "Vlefta pa TVSH", "Vlefta me TVSH", "Në %", "Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"],
      sales_by_customer_pdf: ["Kodi", "Emërtimi", "Qyteti", "Fatura", "Vlefta"],
      sales_by_city_pdf: ["Qyteti", "Klientë", "Fatura", "Vlera"],
      sales_unsold_items_pdf: ["Nr. Blerje", "Dt.", "Njësia", "Kartelë", "Emërtimi i Artikullit", "Kod Bar", "Gjendja"],
      sales_summary_register_pdf: ["Nr Rend", "Lloj", "Nr", "Date", "Mon", "Kod i Klientit", "Kodi Artikulli", "Vlefta Artikulli", "Zbritje Anal.", "Zbritje Tot.", "Zbritje %", "Zbritje Gjithsej Vlefta", "Vlera me Zbritje pa TVSH", "Vlera me Zbritje me TVSH", "Vlera në Mon Baze pa TVSH", "Vlera në Mon Baze TVSH"],
      sales_quantity_pdf: ["Artikulli", "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"],
      sales_discount_analysis_pdf: ["Kartela", "Emërtimi", "Njësia", "Sasia", "Çmimi", "Vlefta pa TVSH", "Vlefta me TVSH", "Në %", "Vlefta pa TVSH me Zbritje", "Vlefta me TVSH me Zbritje", "Në % Analitike"],
      sales_product_card_pdf: ["Nr Kartele", "Kodbar", "Grup Malli", "Nën Grupi", "Klienti", "Nr. Dok", "Dt. Dok", "Lloj Dok", "Njësia", "Sasia", "Çmimi", "Vlera Pa TVSH", "Vlera Me TVSH", "Progresiv Sasi"],
      sales_returns_pdf: ["Nr.Dok", "Dt.Dok", "Numer FS.Ref", "Date FS.Ref", "Artikulli", "Sasi Fature", "Sasi e Kthyer", "Çmimi", "Zbritje %", "Vlefta e Kthyer me TVSH", "Monedha", "Kursi", "Vlefta e kthyer me TVSH ne MB"],
      sales_margin_pdf: ["Kartela", "Emërtimi i Artikullit", "Njësia", "Sasia e Shitur", "Kosto/Njesi", "KMSH", "Çmimi i shitjes", "Vlera Shitjes", "Marzhi Bruto me Zbritje", "Marzhi Bruto % me Zbritje", "Marzhi Bruto", "Marzhi Bruto %"],
      sales_margin_detail_pdf: ["Kodi", "Emërtimi", "Grupi", "Nën Grupi", "Kodi artikulli", "Emërtimi artikulli", "Sasia", "Volumi Shitjeve(%)", "Vlera e Shitjes", "KMSH", "Marzhi", "Marzhi në %", "Mark up", "Sales"],
      sales_by_product_pdf: ["Klienti", "Sasia", "Çmimi", "Grupi", "Emërtimi", "Nën Grupi", "Kodi", "Volumi i Shitjeve në %", "Vlere(MB)"],
      sales_price_list_pdf: ["Kartela", "Kodbari", "Emërtimi i Artikullit", "Njesia", "Grupi", "Nengrupi", "Cmimi 1", "Cmimi 2", "Cmimi 3", "Cmimi 4", "Cmimi 5"],
      sales_analytic_register_pdf: ["Rend", "Lloj", "Kodi", "Nr", "Dt", "Kodi Klienti", "Emertimi", "Njesia", "Monedha", "Cmimi", "Sasia", "Vlera Gjithsej", "Zbr. Art%", "Vlera me Zbritje Art", "Zbr. Tot%", "Vlera Me Zbritje Tot%", "Kursi", "Vlera Me TVSH Mon. Fature", "Vlera Me Zbritje Mon. Baze"],
      inventory_minimum_status_pdf: ["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventare", "Minimum", "Mungesat", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Furnitori"],
      inventory_warehouse_detail_pdf: ["Kartela", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar", "Hyrje", "Dalje", "Gjendje", "Kosto", "Vlefta", "Në %"],
      inventory_product_card_pdf: ["Lloj Dok.", "Nr Dokumenti", "Dt Dokumenti", "Magazina", "Njësia", "Hyrje", "Çmimi Hyrje", "Vlefta Hyrje", "Dalje", "Çmimi Dalje", "Vlefta Dalje", "Gjendje", "Vlefta"],
      inventory_analytic_register_pdf: ["Lloji", "Numri", "Data", "Dt Regj", "Kartela", "Përshkrimi", "Njësia", "Sasia", "Çmimi", "Vlefta"],
    };
    Object.entries(expected).forEach(([reportKey, columns]) => {
      const output = shapeReferenceReport(reportKey, { columns: [], rows: [{}], metrics: [] });
      expect(output.columns).toEqual(columns);
      expect(output.rows).toHaveLength(1);
    });
  });
});
