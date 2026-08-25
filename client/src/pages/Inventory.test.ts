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

  it("keeps inventory tabs and filtered report exports", () => {
    expect(source).toContain('value="stock-report"');
    expect(source).toContain('value="locations"');
    expect(source).toContain('value="transfers"');
    expect(source).toContain('value="adjustments"');
    expect(source).toContain('value="movements"');
    expect(source).toContain('>Excel</Button>');
    expect(source).toContain('>PDF</Button>');
  });

  it("passes warehouse and product filters to the real stock report query", () => {
    expect(source).toContain("warehouseId: reportWarehouseId ? Number(reportWarehouseId) : undefined");
    expect(source).toContain("productId: reportProductId ? Number(reportProductId) : undefined");
    expect(source).toContain("trpc.stockReport.get.useQuery(reportInput)");
  });
});
