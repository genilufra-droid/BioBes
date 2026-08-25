import { describe, expect, it } from "vitest";
import { importButtonState } from "./PayrollLogsWorkspace";

describe("importButtonState", () => {
  it("bllokon rikthimin e importit pas konfirmimit", () => {
    expect(importButtonState(false, true)).toEqual({ disabled: true, label: "Importi u konfirmua" });
  });

  it("shfaq gjendjen e ruajtjes gjatë importit", () => {
    expect(importButtonState(true, false)).toEqual({ disabled: true, label: "Po krijohen dhe ruhen orët…" });
  });

  it("lejon konfirmimin vetëm për parafytyrime të paimportuara", () => {
    expect(importButtonState(false, false)).toEqual({ disabled: false, label: "Konfirmo importin automatik" });
  });
});
