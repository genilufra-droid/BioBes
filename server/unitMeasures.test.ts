import { describe, expect, it } from "vitest";
import { canDeleteUnitMeasure, unitMeasureKey } from "./unitMeasures";

describe("unit measures", () => {
  it("uses abbreviation as the item-facing measure key", () => {
    expect(unitMeasureKey({ name: "Kilogram", abbreviation: "Kg" })).toBe("Kg");
    expect(unitMeasureKey({ name: "Copë" })).toBe("Copë");
  });

  it("blocks deletion while a product uses the measurement unit", () => {
    expect(canDeleteUnitMeasure(0)).toBe(true);
    expect(canDeleteUnitMeasure(1)).toBe(false);
  });
});
