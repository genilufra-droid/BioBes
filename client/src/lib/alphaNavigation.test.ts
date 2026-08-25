import { describe, expect, it } from "vitest";
import { alphaModuleItems, resolveAlphaModule } from "./alphaNavigation";

describe("Alpha main navigation", () => {
  it("preserves the module order from the Alpha main workspace", () => {
    expect(alphaModuleItems.map(item => item.label)).toEqual([
      "Klientë dhe Shitje", "Furnitorë dhe Blerje", "Magazina", "Arka dhe Banka",
      "Punonjësit", "Qendrat e Kostos", "Kontabiliteti", "Analizat",
    ]);
  });

  it("resolves cloud routes to the correct Alpha workspace", () => {
    expect(resolveAlphaModule("/sales-invoices").id).toBe("sales");
    expect(resolveAlphaModule("/purchase-invoices").id).toBe("purchase");
    expect(resolveAlphaModule("/inventory").id).toBe("inventory");
    expect(resolveAlphaModule("/reports").id).toBe("analysis");
  });
});
