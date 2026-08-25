import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("AlphaCatalogWindow contract", () => {
  it("keeps the classic catalog toolbar and escape controls", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/AlphaCatalogWindow.tsx"), "utf8");
    expect(source).toContain('label="I ri"');
    expect(source).toContain('label="Rifresko"');
    expect(source).toContain('label="Printo"');
    expect(source).toContain('label="Eksporto"');
    expect(source).toContain('label="Dalje"');
    expect(source).toContain("onClose");
  });
});
