import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("inventory module document navigation contract", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/Inventory.tsx"), "utf8");

  it("keeps source links on stock transfer documents", () => {
    expect(source).toContain('import SourceDocumentLink from "@/components/SourceDocumentLink"');
    expect(source).toContain("<SourceDocumentLink label={transfer.docNumber}");
    expect(source).toContain("Hap transferin");
  });

  it("keeps inventory operational tabs while reports remain top-level", () => {
    expect(source).not.toContain('<ModuleReportMenu module="Magazina"');
    expect(source).not.toContain('value="stock-report"');
    expect(source).not.toContain("trpc.stockReport.get.useQuery");
    expect(source).toContain('value="locations"');
    expect(source).toContain('value="transfers"');
    expect(source).toContain('value="adjustments"');
    expect(source).toContain('value="movements"');
  });

  it("uses the Alpha window, compact grids and document-line editor in the active inventory workspace", () => {
    expect(source).toContain("data-alpha-inventory-workspace");
    expect(source).toContain("data-alpha-inventory-dialog");
    expect(source).toContain("data-alpha-inventory-lines");
    expect(source).toContain("Gjendja e stokut");
    expect(source).toContain("Regjistri i lëvizjeve të stokut");
  });
});
