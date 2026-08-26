import { describe, expect, it } from "vitest";
import { getReferenceGroups, getReferenceStaticPageLabel, getReferenceTitle, getSalesSummaryReconciliation, groupProductCardRows, resolveSupplierBalanceStatus, SALES_SUMMARY_REFERENCE_COLUMNS, normalizeSalesSummaryPeriod } from "./ReferenceReportView";

describe("reference report column groups", () => {
  it("reconciles the invoice once against all of its detail rows", () => {
    const result = getSalesSummaryReconciliation([
      { __documentId: 1, __invoiceTotalAmount: 30000, __invoiceVatAmount: 5000, __invoiceBaseTotalAmount: 30000, "Vlera me Zbritje me TVSH": 10000 },
      { __documentId: 1, __invoiceTotalAmount: 30000, __invoiceVatAmount: 5000, __invoiceBaseTotalAmount: 30000, "Vlera me Zbritje me TVSH": 20000 },
    ]);
    expect(result).toMatchObject({ invoiceCount: 1, lineCount: 2, invoiceGross: 30000, lineGross: 30000, invoiceVat: 5000, status: "RAKORDUAR" });
  });

  it("preserves the report column order while grouping the warehouse layout", () => {
    const groups = getReferenceGroups("inventory_warehouse_status_pdf", [
      "Kartelë",
      "Përshkrimi",
      "Grupi",
      "Njësia",
      "Llog. Inventar",
      "Hyrje",
      "Dalje",
      "Gjendje",
      "Kosto",
      "Vlefta",
      "Në %",
    ]);

    expect(groups.map(group => [group.label, group.columns])).toEqual([
      ["ARTIKULLI", ["Kartelë", "Përshkrimi", "Grupi", "Njësia", "Llog. Inventar"]],
      ["LËVIZJA", ["Hyrje", "Dalje", "Gjendje"]],
      ["VLERËSIMI", ["Kosto", "Vlefta", "Në %"]],
    ]);
  });

  it("groups purchase summary columns into document, invoice-currency and base-currency sections", () => {
    const columns = ["Nr. rend", "Lloji", "Nr.", "Dt. Dok", "Monedha", "Kursi", "Kodi", "Emertimi", "Nentotal", "Zbritje", "TVSH", "Totali", "TVSH bazë", "Totali bazë"];
    expect(getReferenceGroups("purchase_summary_register_pdf", columns)).toEqual([
      { label: "DOKUMENTI", columns: columns.slice(0, 8) },
      { label: "MONEDHA FATURE", columns: columns.slice(8, 12) },
      { label: "MONEDHA BAZE", columns: columns.slice(12) },
    ]);
  });

  it("groups customs import columns into the four reference sections", () => {
    const columns = ["Ref.", "Nr.Fl.Dog.", "Dt Fl.Dog.", "Vl.Fatures", "Monedha", "Kursi", "Vlefta", "Transport", "Siguracion", "Refer./Tjera", "Vl.Dogane", "Dog", "Akciz", "Vl pa TVSH", "TVSH"];
    expect(getReferenceGroups("purchase_customs_import_register_pdf", columns)).toEqual([
      { label: "DOKUMENTI DOGANOR", columns: columns.slice(0, 3) },
      { label: "FATURA", columns: columns.slice(3, 7) },
      { label: "SHPENZIME", columns: columns.slice(7, 10) },
      { label: "DOGANA", columns: columns.slice(10) },
    ]);
  });

  it("groups supplier maturity columns into report data and maturity buckets", () => {
    const columns = ["Dt. Dok", "Nr Dok", "Lloj Dok", "Date Maturimi", "Dite Maturimi", "Tejkaluar", "0", "1-30", "30-60", "60-90", "90-180", ">", "Totali"];
    expect(getReferenceGroups("purchase_supplier_maturity_pdf", columns)).toEqual([
      { label: "TË DHËNAT E RAPORTIT", columns: columns.slice(0, 5) },
      { label: "KOHA E MATURIMIT", columns: columns.slice(5) },
    ]);
  });

  it("matches the general supplier situation PDF title and groups", () => {
    expect(getReferenceTitle("purchase_supplier_situation_pdf", "fallback")).toBe("SITUACION I FURNITOREVE");
    expect(getReferenceGroups("purchase_supplier_situation_pdf", ["Nr Rend", "Kodi", "Emertimi i Furnitorit", "Nr Llogarie", "Kategoria", "Shuma Debi", "Shuma Kredi", "Detyrimi", "Pesha %"])).toEqual([
      { label: "FURNITORI", columns: ["Nr Rend", "Kodi", "Emertimi i Furnitorit", "Nr Llogarie", "Kategoria"] },
      { label: "VLERAT", columns: ["Shuma Debi", "Shuma Kredi", "Detyrimi", "Pesha %"] },
    ]);
  });

  it("matches the exact supplier maturity PDF titles and summary header", () => {
    expect(getReferenceTitle("purchase_supplier_maturity_pdf", "fallback")).toBe("MATURIMI I FURNITORIT");
    expect(getReferenceTitle("purchase_supplier_maturity_summary_pdf", "fallback")).toBe("MATURIMI I PERMBLEDHES");
    expect(getReferenceGroups("purchase_supplier_maturity_summary_pdf", ["Kod Klienti", "Emri", "Llogaria", "Mon Lig", "Total", "0", "1-30", "30-60", "60-90", "90-180", "Mbi 180"])).toEqual([
      { label: "FURNITORI", columns: ["Kod Klienti", "Emri", "Llogaria", "Mon Lig"] },
      { label: "KOHA E MATURIMIT", columns: ["Total", "0", "1-30", "30-60", "60-90", "90-180", "Mbi 180"] },
    ]);
  });

  it("matches the invoice-and-payment reference header groups", () => {
    const columns = ["Fature", "Pagese", "Numer", "Date", "Pershkrimi", "Faturuar", "Paguar", "Diferenca"];
    expect(getReferenceGroups("purchase_invoice_payment_register_pdf", columns)).toEqual([
      { label: "LLOJI", columns: ["Fature", "Pagese"] },
      { label: "DOKUMENTI", columns: ["Numer", "Date", "Pershkrimi"] },
      { label: "VLEFTA", columns: ["Faturuar", "Paguar", "Diferenca"] },
    ]);
  });

  it("keeps the unsold-items reference columns in one explicit group", () => {
    const columns = ["Nr. Blerje", "Dt.", "Njësia", "Kartelë", "Emërtimi i Artikullit", "Kod Bar", "Gjendja"];
    expect(getReferenceGroups("sales_unsold_items_pdf", columns)).toEqual([
      { label: "TË DHËNAT E RAPORTIT", columns },
    ]);
  });

  it("uses declared reference group positions when source labels are aliases", () => {
    const columns = ["Nr. Blerje", "Dt.", "Njësia", "Kartelë", "Emërtimi i Artikullit", "Kod Bar", "Gjendja"];
    const groups = getReferenceGroups("sales_unsold_items_pdf", columns);
    expect(groups).toEqual([{ label: "TË DHËNAT E RAPORTIT", columns }]);
  });

  it("canonicalizes the warehouse registration-date label across source variants", () => {
    const groups = getReferenceGroups("inventory_analytic_register_pdf", ["Lloji", "Numri", "Data", "Dt Reg", "Kartela", "Përshkrimi", "Njësia", "Sasia", "Çmimi", "Vlefta"]);
    expect(groups.map(group => [group.label, group.columns])).toEqual([
      ["DOKUMENTI", ["Lloji", "Numri", "Data", "Dt Reg"]],
      ["ARTIKULLI", ["Kartela", "Përshkrimi", "Njësia"]],
      ["SASITË DHE VLERAT", ["Sasia", "Çmimi", "Vlefta"]],
    ]);
  });

  it("does not hardcode a static page number in the reference footer", () => {
    expect(getReferenceStaticPageLabel()).toBe("");
  });

  it("groups product-card movements into one reference page per article", () => {
    const groups = groupProductCardRows([
      { __productCode: "A-1", __productName: "Artikulli A", Hyrje: 2 },
      { __productCode: "A-1", __productName: "Artikulli A", Dalje: 1 },
      { __productCode: "B-1", __productName: "Artikulli B", Hyrje: 4 },
    ]);
    expect(groups.map(([key, rows]) => [key, rows.length])).toEqual([["A-1", 2], ["B-1", 1]]);
  });

  it("groups sales-by-product columns like the Alpha reference layout", () => {
    const groups = getReferenceGroups("sales_by_product_pdf", [
      "Klienti", "Sasia", "Çmimi", "Grupi", "Emërtimi", "Nën Grupi", "Kodi", "Volumi i Shitjeve në %", "Vlere(MB)",
    ]);

    expect(groups).toEqual([
      { label: "KLIENTI DHE ARTIKULLI", columns: ["Klienti", "Sasia", "Çmimi", "Grupi", "Emërtimi", "Nën Grupi", "Kodi"] },
      { label: "VOLUMI DHE VLERA", columns: ["Volumi i Shitjeve në %", "Vlere(MB)"] },
    ]);
  });

  it("groups accounting reports by document, values and settlement sections", () => {
    expect(getReferenceGroups("accounting_trial_balance", ["Kodi", "Llogaria", "Tipi", "Debi", "Kredi", "Bilanci"])).toEqual([
      { label: "LLOGARIA", columns: ["Kodi", "Llogaria", "Tipi"] },
      { label: "BILANCI", columns: ["Debi", "Kredi", "Bilanci"] },
    ]);
    expect(getReferenceGroups("accounting_payments", ["Nr.", "Data", "Partneri", "Lloji", "Vlera", "Monedha", "Kursi", "Vlera në Lek", "Metoda", "Statusi"])).toEqual([
      { label: "DOKUMENTI", columns: ["Nr.", "Data", "Partneri", "Lloji"] },
      { label: "VLERAT", columns: ["Vlera", "Monedha", "Kursi", "Vlera në Lek"] },
      { label: "SHLYERJA", columns: ["Metoda", "Statusi"] },
    ]);
  });

  it("groups CRM and bank reports by their Alpha-style sections", () => {
    expect(getReferenceGroups("crm_pipeline", ["Faza", "Mundësi", "Vlera e pritur", "Vlera e peshuar"])).toEqual([
      { label: "FAZA", columns: ["Faza", "Mundësi"] },
      { label: "VLERAT", columns: ["Vlera e pritur", "Vlera e peshuar"] },
    ]);
    expect(getReferenceGroups("bank_transfers", ["Nr.", "Data", "Burim", "Destinacion", "Vlera", "Statusi"])).toEqual([
      { label: "TRANSFERIMI", columns: ["Nr.", "Data", "Burim", "Destinacion"] },
      { label: "VLERA", columns: ["Vlera", "Statusi"] },
    ]);
  });

  it("groups columns without dedicated metadata into Alpha-style sections", () => {
    const groups = getReferenceGroups("unknown_report_pdf", ["Nr Dokumenti", "Klienti", "Sasia", "Vlefta", "Statusi"]);
    expect(groups).toEqual([
      { label: "DOKUMENTI", columns: ["Nr Dokumenti"] },
      { label: "PARTNERI DHE ARTIKULLI", columns: ["Klienti"] },
      { label: "SASITË", columns: ["Sasia"] },
      { label: "VLERAT", columns: ["Vlefta"] },
      { label: "TË TJERA", columns: ["Statusi"] },
    ]);
  });

  it("places unconfigured columns in an ordered Të tjera group", () => {
    const groups = getReferenceGroups("sales_summary_register_pdf", [
      "Nr Rend",
      "Lloj",
      "Nr",
      "Date",
      "Mon",
      "Burimi",
      "Kod i Klientit",
      "Kodi Artikulli",
      "Vlefta Artikulli",
    ]);

    expect(groups.map(group => group.label)).toEqual([
      "DOKUMENTI",
      "TË TJERA",
      "KOD I KLIENTIT",
      "VLEFTË ARTIKULLI",
    ]);
    expect(groups[1]?.columns).toEqual(["Burimi"]);
    expect(groups[2]?.columns).toEqual(["Kod i Klientit"]);
  });
});

it("keeps sales reference report titles uppercase and stable", () => {
  expect(getReferenceTitle("sales_items_sold_pdf", "fallback")).toBe("ARTIKUJT E SHITUR");
  expect(getReferenceTitle("sales_by_customer_pdf", "fallback")).toBe("SHITJET SIPAS KLIENTEVE");
  expect(getReferenceTitle("sales_margin_pdf", "fallback")).toBe("MARZHI I SHITJEVE");
  expect(getReferenceTitle("purchase_supplier_card_pdf", "fallback")).toBe("KARTELA E FURNITORIT");
  expect(getReferenceTitle("purchase_supplier_card_format3_pdf", "fallback")).toBe("KARTELA E FURNITORIT");
  expect(getReferenceTitle("purchase_customs_import_register_pdf", "fallback")).toBe("REGJISTRI I DOGANIMIT TË IMPORTEVE");
});

it("uses the simple supplier-card title and two-level document/account header", () => {
  const groups = getReferenceGroups("purchase_supplier_card_pdf", ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi"]);
  expect(groups).toEqual([
    { label: "DOKUMENTI", columns: ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit"] },
    { label: "MONEDHE LLOGARIE", columns: ["Debi", "Kredi", "Progresivi"] },
  ]);
  expect(getReferenceTitle("purchase_supplier_card_pdf", "fallback")).toBe("KARTELA E FURNITORIT");
});

it("uses the same reference layout contract for the customer card", () => {
  const columns = ["Nr Rend", "Data Rregj", "Lloj Dok", "Nr Dok", "Data Dok", "Përshkrimi i Veprimit", "Debi", "Kredi", "Progresivi"];
  expect(getReferenceTitle("sales_customer_statement", "fallback")).toBe("KARTELA E KLIENTIT");
  expect(getReferenceGroups("sales_customer_statement", columns)).toEqual([
    { label: "DOKUMENTI", columns: columns.slice(0, 6) },
    { label: "MONEDHE LLOGARIE", columns: columns.slice(6) },
  ]);
});

it("classifies supplier balances with an explicit status and absolute amount", () => {
  expect(resolveSupplierBalanceStatus(58520, 0)).toEqual({ status: "DEBITOR", amount: 58520 });
  expect(resolveSupplierBalanceStatus(0, 34360)).toEqual({ status: "KREDITOR", amount: 34360 });
  expect(resolveSupplierBalanceStatus(100, 100)).toEqual({ status: "BALANCË", amount: 0 });
});

it("keeps the warehouse PDF titles and reference headers stable", () => {
  expect(getReferenceTitle("inventory_warehouse_status_pdf", "fallback")).toBe("GJENDJA E MAGAZINES");
  expect(getReferenceTitle("inventory_product_summary_pdf", "fallback")).toBe("GJENDJA E ARTIKUJVE E PERMBLEDHUR");
  expect(getReferenceTitle("inventory_article_analysis_pdf", "fallback")).toBe("ANALIZA E ARTIKUJVE");
  expect(getReferenceTitle("inventory_product_card_pdf", "fallback")).toBe("KARTELA ARTIKULLIT");
  expect(getReferenceGroups("inventory_product_card_pdf", ["Lloj Dok.", "Nr Dokumenti", "Dt Dokumenti", "Magazina", "Njësia", "Hyrje", "Çmimi Hyrje", "Vlefta Hyrje", "Dalje", "Çmimi Dalje", "Vlefta Dalje", "Gjendje", "Vlefta"])).toEqual([
    { label: "DOKUMENTI", columns: ["Lloj Dok.", "Nr Dokumenti", "Dt Dokumenti", "Magazina", "Njësia"] },
    { label: "HYRJE", columns: ["Hyrje", "Çmimi Hyrje", "Vlefta Hyrje"] },
    { label: "DALJE", columns: ["Dalje", "Çmimi Dalje", "Vlefta Dalje"] },
    { label: "GJENDJA", columns: ["Gjendje", "Vlefta"] },
  ]);
});

it("keeps the sales summary reference contract stable", () => {
  expect(SALES_SUMMARY_REFERENCE_COLUMNS).toHaveLength(16);
  expect(SALES_SUMMARY_REFERENCE_COLUMNS[0]).toBe("Nr Rend");
  expect(SALES_SUMMARY_REFERENCE_COLUMNS[5]).toBe("Kod i Klientit");
  expect(SALES_SUMMARY_REFERENCE_COLUMNS[6]).toBe("Kodi Artikulli");
  expect(SALES_SUMMARY_REFERENCE_COLUMNS[7]).toBe("Vlefta Artikulli");
  expect(SALES_SUMMARY_REFERENCE_COLUMNS.at(-1)).toBe("Vlera në Mon Baze TVSH");
  expect(normalizeSalesSummaryPeriod("Fillimi — Sot")).toBe("01/01/2026-31/12/2026");
});
