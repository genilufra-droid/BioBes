import { describe, expect, it } from "vitest";
import { buildPersonalCardPdfSections } from "./payrollPersonalCardExport";

describe("eksporti i Kartelës Personale", () => {
  it("ndërton të gjashtë seksionet e dokumentit dhe tekstet bosh pa placeholder", () => {
    const sections = buildPersonalCardPdfSections({ filename: "kartela", title: "KARTELA PERSONALE — TEST", periodText: "Korrik 2026", employee: [["Nr. Listëpage", "13"], ["Pozicioni", "—"]], summary: [["Ditë pune", "18"]], daily: [["1", "M", "Manuale", "8", "8 h", "", "", "Normale"]], financial: [["PAGA BRUTO", "", "", "48,000.00 L"]], taxes: [["0.00 L", "∞", "0.00%", "48,000.00 L", "0.00 L"]], warnings: [], documents: [] });
    expect(sections.dailyHeaders).toHaveLength(8);
    expect(sections.financialHeaders).toEqual(["ZËRI", "SASIA", "TARIFA", "SHUMA"]);
    expect(sections.warnings).toEqual(["Asnjë vërejtje për këtë muaj."]);
    expect(sections.documents).toEqual(["Pa dokumente të bashkangjitura."]);
  });
});
