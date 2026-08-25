import { describe, expect, it } from "vitest";
import { buildPartnerQuickCreatePayload } from "../shared/partnerQuickCreate";

describe("quick partner creation", () => {
  it("normalizes the active document partner payload", () => {
    expect(buildPartnerQuickCreatePayload(7, {
      name: "  Ana  ",
      code: " A-01 ",
      nipt: " L123 ",
      phone: " +355 1 ",
      email: " ana@example.com ",
      address: " Rruga 1 ",
      city: " Tiranë ",
    })).toEqual({
      companyId: 7,
      name: "Ana",
      code: "A-01",
      nipt: "L123",
      phone: "+355 1",
      email: "ana@example.com",
      address: "Rruga 1",
      city: "Tiranë",
    });
  });

  it("rejects an empty partner name", () => {
    expect(() => buildPartnerQuickCreatePayload(7, { name: "   " })).toThrow("Emri është i detyrueshëm");
  });
});
