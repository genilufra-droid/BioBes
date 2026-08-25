import { describe, expect, it } from "vitest";
import { getPartnerTabFromSearch } from "./partnerRoute";

describe("partner route tab", () => {
  it("maps customer and supplier query parameters to their workspaces", () => {
    expect(getPartnerTabFromSearch("?type=customer")).toBe("customers");
    expect(getPartnerTabFromSearch("?type=supplier")).toBe("suppliers");
    expect(getPartnerTabFromSearch("?type=customers")).toBe("customers");
    expect(getPartnerTabFromSearch("?type=suppliers")).toBe("suppliers");
  });

  it("uses the safe supplier default for missing or unknown values", () => {
    expect(getPartnerTabFromSearch("")).toBe("suppliers");
    expect(getPartnerTabFromSearch("?type=unknown")).toBe("suppliers");
    expect(getPartnerTabFromSearch("?type=unknown", "customers")).toBe("customers");
  });
});
