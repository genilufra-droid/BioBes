import { describe, expect, it } from "vitest";
import { applyOdooReportFilters } from "./db";

describe("server report filters", () => {
  it("keeps only the selected supplier and exposes the active filter in metadata", () => {
    const result = applyOdooReportFilters({
      columns: ["Nr Dok", "Furnitori", "Debi"],
      rows: [
        { "Nr Dok": "BL-01", Furnitori: "Ana", Debi: 120, __documentId: 1 },
        { "Nr Dok": "BL-02", Furnitori: "Ferre Geni", Debi: 80, __documentId: 2 },
      ],
      metrics: [{ label: "Fatura", value: 2 }, { label: "Detyrim", value: 200 }],
      meta: { Furnitori: "Ana, Ferre Geni" },
    }, { partnerFilter: "Ana" });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]["Furnitori"]).toBe("Ana");
    expect(result.meta?.["Furnitor / Klient"]).toBe("Ana");
    expect(result.metrics.find(item => item.label === "Fatura")?.value).toBe(1);
  });

  it("filters aggregate rows by hidden source currency metadata", () => {
    const result = applyOdooReportFilters({
      columns: ["Kodi", "Emërtimi", "Mon", "Detyrimi"],
      rows: [
        { Kodi: "A", Emërtimi: "Ana", Mon: "ALL", Detyrimi: 120, __partnerName: "Ana", __currency: "ALL", __documentId: 1 },
        { Kodi: "A", Emërtimi: "Ana", Mon: "EUR", Detyrimi: 90, __partnerName: "Ana", __currency: "EUR", __documentId: 2 },
      ],
      metrics: [{ label: "Fatura", value: 2 }],
      meta: { "Monedha e furnitorit": "ALL, EUR" },
    }, { currencyFilter: "EUR" });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].Mon).toBe("EUR");
    expect(result.meta?.Monedha).toBe("EUR");
  });

  it("filters hidden supplier metadata and rewrites the supplier header to the filtered partner", () => {
    const result = applyOdooReportFilters({
      columns: ["Nr Rend", "Nr Dok", "Debi"],
      rows: [
        { "Nr Rend": 1, "Nr Dok": "BL-01", Debi: 120, __partnerName: "Ana", __documentId: 1 },
        { "Nr Rend": 2, "Nr Dok": "BL-02", Debi: 80, __partnerName: "Ferre Geni", __documentId: 2 },
      ],
      metrics: [{ label: "Fatura", value: 2 }, { label: "Detyrimi", value: 200 }],
      meta: { Furnitori: "Ana, Ferre Geni" },
    }, { partnerFilter: "Ana" });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].__partnerName).toBe("Ana");
    expect(result.meta?.Furnitori).toBe("Ana");
    expect(result.metrics.find(item => item.label === "Fatura")?.value).toBe(1);
  });
});
