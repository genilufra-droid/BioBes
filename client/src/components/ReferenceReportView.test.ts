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
  expect(getReferenceTitle("purchase_supplier_card_pdf", "fallback")).toBe("KARTELA E FURNITORIT NË MB");
  expect(getReferenceTitle("purchase_supplier_card_format3_pdf", "fallback")).toBe("KARTELA E FURNITORIT (FORMATI I THJESHTË)");
  expect(getReferenceTitle("purchase_customs_import_register_pdf", "fallback")).toBe("REGJISTRI I DOGANIMIT TË IMPORTEVE");
});

it("classifies supplier balances with an explicit status and absolute amount", () => {
  expect(resolveSupplierBalanceStatus(58520, 0)).toEqual({ status: "DEBITOR", amount: 58520 });
  expect(resolveSupplierBalanceStatus(0, 34360)).toEqual({ status: "KREDITOR", amount: 34360 });
  expect(resolveSupplierBalanceStatus(100, 100)).toEqual({ status: "BALANCË", amount: 0 });
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
