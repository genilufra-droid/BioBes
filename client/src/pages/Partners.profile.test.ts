import { describe, expect, it } from "vitest";
import { serializePartnerProfile } from "./Partners";

describe("Alpha partner profile", () => {
  it("serializes the manual fields for a customer", () => {
    const form = new FormData();
    form.set("title", "Sh.p.k.");
    form.set("companyName", "Good Food");
    form.set("surname", "Test");
    form.set("category1", "Retail");
    form.set("priceLevel", "2");
    form.set("maturityCategory", "30 ditë");
    form.set("dueDays", "30");
    form.set("discountPercent", "5.5");
    form.set("creditWarning", "1000");
    form.set("creditBlock", "2000");
    form.set("modifiable", "on");
    form.set("active", "on");
    form.set("accountCode", "411");
    form.set("accountName", "Klientë për mallra, produkte e shërbime");
    form.set("accountCurrency", "LEK");
    form.set("discountAccountCode", "668");
    form.set("discountAccountName", "Shpenzime financiare të tjera");
    form.set("openingComment", "Gjendje fillestare");
    form.set("openingValue", "16000");
    form.set("openingRate", "1");
    form.set("openingBaseValue", "16000");
    form.set("openingDate", "2012-12-01");

    const profile = JSON.parse(serializePartnerProfile(form, "Klient"));
    expect(profile).toMatchObject({
      kind: "Klient",
      title: "Sh.p.k.",
      companyName: "Good Food",
      categories: ["Retail", "", ""],
      priceLevel: "2",
      dueDays: 30,
      discountPercent: 5.5,
      creditWarning: 1000,
      creditBlock: 2000,
      modifiable: true,
      active: true,
      accountCode: "411",
      accountName: "Klientë për mallra, produkte e shërbime",
      accountCurrency: "LEK",
      discountAccountCode: "668",
      discountAccountName: "Shpenzime financiare të tjera",
      openingValue: 16000,
      openingRate: 1,
      openingBaseValue: 16000,
      openingDate: "2012-12-01",
    });
  });

  it("disables sales-only fields in the supplier contract", () => {
    const form = new FormData();
    form.set("title", "Person fizik");
    form.set("companyName", "Arian Petrela");
    form.set("dueDays", "15");
    const profile = JSON.parse(serializePartnerProfile(form, "Furnitor"));
    expect(profile.kind).toBe("Furnitor");
    expect(profile.priceLevel).toBe("");
    expect(profile.discountPercent).toBe(0);
    expect(profile.dueDays).toBe(15);
  });
});
