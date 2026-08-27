import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./DashboardLayout.tsx", import.meta.url), "utf8");

describe("DashboardLayout mobile navigation", () => {
  it("hides the desktop menu on narrow screens and keeps a hamburger entry point", () => {
    expect(source).toContain('className="hidden h-full items-stretch lg:flex" aria-label="Menuja Alpha"');
    expect(source).toContain('aria-label="Hap navigimin"');
  });

  it("provides all primary workspaces and a scrollable mobile navigation panel", () => {
    expect(source).toContain('data-mobile-navigation');
    expect(source).toContain('max-h-[calc(100dvh-74px)] overflow-y-auto');
    for (const label of ["Skedarë", "Konfigurime", "Regjistrime", "Raporte", "Instrumenta", "Ndihmë"]) {
      expect(source).toContain(`label: "${label}"`);
    }
  });
});
