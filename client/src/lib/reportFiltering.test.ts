import { describe, expect, it } from "vitest";
import { activeReportFilters, filterReportRows, filterReportRowsByColumns, reportMetricValue, searchReportRows, sortReportRows, sumNumericColumn } from "./reportFiltering";

describe("filterReportRows", () => {
  it("formats only active filters for display inside reports and documents", () => {
    expect(activeReportFilters({ "Furnitor / Klient": " Ana ", Status: "", Monedha: undefined, Magazina: "Depo 1" })).toEqual([["Furnitor / Klient", "Ana"], ["Magazina", "Depo 1"]]);
  });

  const rows = [
    { Dokumenti: "BL-01", Partneri: "Alba", Statusi: "PAID", Vlera: 120 },
    { Dokumenti: "BL-02", Partneri: "Beta", Statusi: "DRAFT", Vlera: 40 },
    { Dokumenti: "BL-03", Partneri: "Alba", Statusi: "PAID", Vlera: 220 },
  ];

  it("filtron sipas partnerit dhe shumës", () => {
    expect(filterReportRows(rows, {
      documentFilter: "", partnerFilter: "Alba", categoryFilter: "", statusFilter: "",
      amountMin: "100", amountMax: "200",
    })).toEqual([rows[0]]);
  });

  it("aplikon shumën mbi kolonën monetare dhe jo mbi numrin e parë", () => {
    const inventoryRows = [
      { Artikulli: "A", Sasia: 2, Vlefta: 100 },
      { Artikulli: "B", Sasia: 200, Vlefta: 10 },
    ];
    expect(filterReportRows(inventoryRows, {
      documentFilter: "", partnerFilter: "", categoryFilter: "", statusFilter: "",
      amountMin: "50", amountMax: "150",
    })).toEqual([inventoryRows[0]]);
  });

  it("mbledh totalin vetëm nga rreshtat e filtruar", () => {
    const filtered = filterReportRows(rows, {
      documentFilter: "", partnerFilter: "Alba", categoryFilter: "", statusFilter: "",
      amountMin: "", amountMax: "",
    });
    expect(sumNumericColumn(filtered, "Vlera")).toBe(340);
  });

  it("filtron sipas monedhës dhe llojit të dokumentit", () => {
    const currencyRows = [
      { Dokumenti: "BL-01", Lloji: "Faturë", Monedha: "L", Vlera: 120 },
      { Dokumenti: "BL-02", Lloji: "Porosi", Monedha: "EUR", Vlera: 40 },
      { Dokumenti: "BL-03", Lloji: "Faturë", Monedha: "EUR", Vlera: 220 },
    ];
    expect(filterReportRows(currencyRows, {
      documentFilter: "", partnerFilter: "", categoryFilter: "", statusFilter: "",
      currencyFilter: "EUR", documentTypeFilter: "Faturë", amountMin: "", amountMax: "",
    })).toEqual([currencyRows[2]]);
  });

  it("filtron sipas magazinës dhe njësisë", () => {
    const stockRows = [
      { Artikulli: "Ferre", Magazina: "Qendrore", Njësia: "Kg", Sasia: 10 },
      { Artikulli: "Ferre", Magazina: "Dytësore", Njësia: "Kg", Sasia: 4 },
      { Artikulli: "Murriz", Magazina: "Qendrore", Njësia: "Copë", Sasia: 3 },
    ];
    expect(filterReportRows(stockRows, {
      documentFilter: "", partnerFilter: "", categoryFilter: "", statusFilter: "",
      warehouseFilter: "qendrore", unitFilter: "kg", amountMin: "", amountMax: "",
    })).toEqual([stockRows[0]]);
  });

  it("kombinon filtrat kolonë-për-kolonë si Excel", () => {
    expect(filterReportRowsByColumns(rows, { Partneri: "alba", Statusi: "paid" })).toEqual([rows[0], rows[2]]);
    expect(filterReportRowsByColumns(rows, { Dokumenti: "BL-02", Vlera: "40" })).toEqual([rows[1]]);
    expect(filterReportRowsByColumns(rows, {})).toEqual(rows);
  });

  it("kërkon në të gjitha qelizat e tabelës", () => {
    expect(searchReportRows(rows, "alba")).toEqual([rows[0], rows[2]]);
    expect(searchReportRows(rows, "bl-02")).toEqual([rows[1]]);
  });

  it("rendit sipas numrit dhe tekstit në të dy drejtimet", () => {
    expect(sortReportRows(rows, { column: "Vlera", direction: "desc" }).map(row => row.Vlera)).toEqual([220, 120, 40]);
    expect(sortReportRows(rows, { column: "Partneri", direction: "asc" }).map(row => row.Partneri)).toEqual(["Alba", "Alba", "Beta"]);
  });

  it("filtron pa dallim shkronjash dhe heq rreshtat nga eksporti", () => {
    const filtered = filterReportRows(rows, {
      documentFilter: "bl-02", partnerFilter: "", categoryFilter: "", statusFilter: "draft",
      amountMin: "", amountMax: "",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toEqual(rows[1]);
  });
});

describe("reportMetricValue", () => {
  it("llogarit metrikat e faturave nga rreshtat e filtruar", () => {
    const rows = [{ Dokumenti: "BL-01", Statusi: "PAID", Vlera: 120 }, { Dokumenti: "BL-02", Statusi: "DRAFT", Vlera: 40 }];
    expect(reportMetricValue("Dokumente", 99, rows.slice(0, 1), ["Dokumenti", "Statusi", "Vlera"])).toBe(1);
    expect(reportMetricValue("Vlera totale", 999, rows.slice(0, 1), ["Dokumenti", "Statusi", "Vlera"])).toBe(120);
  });

  it("ruan metrikat specifike kur nuk ka kolonë të përshtatshme", () => {
    expect(reportMetricValue("Të ardhura", 250, [{ Kategoria: "Të ardhura" }], ["Kategoria"])).toBe(250);
  });
});
