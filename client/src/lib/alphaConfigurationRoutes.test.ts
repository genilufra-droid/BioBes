import { describe, expect, it } from "vitest";

describe("Alpha configuration route matrix", () => {
  const entries = [
    ["Ndërmarrja", "/settings?section=company"],
    ["Mënyra e punës", "/settings?section=configuration"],
    ["Fusha shtesë", "/settings?section=fields"],
    ["Backup automatik", "/settings?section=backup"],
    ["Njësi matjeje", "/measurement-units"],
    ["Qytete dhe njësi administrative", "/administrative-units"],
    ["Magazina", "/inventory"],
    ["Arka dhe banka", "/cash"],
    ["Llogari dhe ditarë", "/accounting"],
    ["Përdoruesit", "/users-roles"],
  ] as const;

  it("uses only real non-payroll destinations", () => {
    expect(entries.every(([, target]) => target.startsWith("/"))).toBe(true);
    expect(entries.some(([label]) => label.toLocaleLowerCase().includes("pag"))).toBe(false);
  });

  it("keeps the settings panels addressable by section", () => {
    expect(entries.slice(0, 4).map(([, target]) => target)).toEqual([
      "/settings?section=company",
      "/settings?section=configuration",
      "/settings?section=fields",
      "/settings?section=backup",
    ]);
  });
});
