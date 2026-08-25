import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Reference configuration catalogs", () => {
  it("exposes Alpha fields for issuers and document groups", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/ReferenceCatalog.tsx"), "utf8");
    expect(source).toContain('"issuers"');
    expect(source).toContain('"document-groups"');
    expect(source).toContain("Kodi");
    expect(source).toContain("Emërtimi");
    expect(source).toContain("documentType");
    expect(source).toContain("active");
    expect(source).toContain("mainProduction");
    expect(source).toContain("Qendra kryesore e prodhimit");
  });
});
