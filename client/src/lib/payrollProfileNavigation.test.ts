import { describe, expect, it } from "vitest";
import { hasIncompleteForeignRates } from "./payrollProfileNavigation";

describe("navigimi te profili i punonjësit", () => {
  it("identifikon punonjësit e huaj me pagë ditore ose OPSH të paplotë", () => {
    expect(hasIncompleteForeignRates({ id: 1, dailyRateCents: 170700, overtimeRateCents: 25000 })).toBe(false);
    expect(hasIncompleteForeignRates({ id: 2, dailyRateCents: 0, overtimeRateCents: 25000 })).toBe(true);
    expect(hasIncompleteForeignRates({ id: 3, dailyRateCents: 170700, overtimeRateCents: 0 })).toBe(true);
  });
});
