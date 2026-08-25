import { describe, expect, it } from "vitest";
import { matchesSalesRegisterStatus } from "./salesRegisterFilters";

describe("sales register status filters", () => {
  it("matches Albanian labels and persisted status codes", () => {
    expect(matchesSalesRegisterStatus("PAID", "E paguar")).toBe(true);
    expect(matchesSalesRegisterStatus("UNPAID", "E papaguar")).toBe(true);
    expect(matchesSalesRegisterStatus("LATER", "Më vonë")).toBe(true);
    expect(matchesSalesRegisterStatus("PAID", "E papaguar")).toBe(false);
  });

  it("accepts an empty filter and code values", () => {
    expect(matchesSalesRegisterStatus("PAID", "")).toBe(true);
    expect(matchesSalesRegisterStatus("EXPORT", "export")).toBe(true);
  });
});
