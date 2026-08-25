import { describe, expect, it } from "vitest";
import { formatLek } from "./currency";

describe("formatLek", () => {
  it("formats whole lek values with the ERP suffix", () => {
    expect(formatLek(1234.5)).toBe("1234,50 L");
  });

  it("keeps zero and negative values readable", () => {
    expect(formatLek(0)).toBe("0,00 L");
    expect(formatLek(-25)).toBe("-25,00 L");
  });

  it("does not apply an extra cents conversion to existing ERP values", () => {
    expect(formatLek(145.2)).toBe("145,20 L");
  });
});
