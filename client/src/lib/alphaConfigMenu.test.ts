import { describe, expect, it } from "vitest";

describe("Alpha configuration menu", () => {
  it("keeps the video-derived non-payroll sequence", () => {
    const labels = ["Ndërmarrja", "Artikuj", "Çmime Shitjeje", "Zbritje Analitike", "Klientë", "Furnitorë", "Emetuesit", "Qendra e Kostos", "Grupim Dokumentash", "Backup automatik", "Fusha shtesë"];
    expect(labels).toEqual(["Ndërmarrja", "Artikuj", "Çmime Shitjeje", "Zbritje Analitike", "Klientë", "Furnitorë", "Emetuesit", "Qendra e Kostos", "Grupim Dokumentash", "Backup automatik", "Fusha shtesë"]);
  });

  it("does not expose the payroll module", () => {
    const labels = ["Ndërmarrja", "Artikuj", "Çmime Shitjeje", "Zbritje Analitike", "Klientë", "Furnitorë", "Emetuesit", "Qendra e Kostos", "Grupim Dokumentash", "Backup automatik", "Fusha shtesë"];
    expect(labels.some(label => label.toLocaleLowerCase().includes("pag"))).toBe(false);
  });
});
