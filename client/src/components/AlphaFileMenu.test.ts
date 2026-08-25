import { describe, expect, it } from "vitest";
import { alphaFileMenuLabels, alphaFileMenuShortcuts, alphaFileMenuSubmenus } from "./AlphaFileMenu";

describe("AlphaFileMenu", () => {
  it("keeps the Skedar menu order from the Alpha reference video", () => {
    expect(alphaFileMenuLabels).toEqual([
      "Ndrysho Ndërmarrje", "Zgjidh Ndërmarrje", "Backup Restore", "Strukturë Administrative", "Njësi Administrative", "Njësi Likujdimi", "Konfigurim fushash", "Grup & Njësi Artikulli", "Qytete & Kategori", "Postimi", "Arkiva e Dokumentave", "Import të dhënash", "Mbyllje Viti", "Dalje",
    ]);
  });

  it("keeps the video submenus for administrative units, liquidity, cities and imports", () => {
    expect(alphaFileMenuSubmenus["Njësi Administrative"]).toEqual(["Pika Shitje", "Pika Furnizimi", "Magazina", "Njësi Prodhim", "Njësi të tjera"]);
    expect(alphaFileMenuSubmenus["Njësi Likujdimi"]).toEqual(["Arka", "Banka"]);
    expect(alphaFileMenuSubmenus["Qytete & Kategori"]).toEqual(["Qytete", "Kategori Klienti/Furnitori", "Afate Maturimi", "Kategori Zbritje"]);
    expect(alphaFileMenuSubmenus["Import të dhënash"]).toContain("Import Nga Skeda");
  });

  it("keeps keyboard shortcuts available without rendering them in the literal video layout", () => {
    expect(alphaFileMenuShortcuts).toMatchObject({ file: "Alt+F", company: "Ctrl+Alt+C", importExport: "Ctrl+Alt+I / E", yearClose: "Ctrl+Alt+Y" });
  });
});
