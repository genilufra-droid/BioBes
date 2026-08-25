import { describe, expect, it } from "vitest";
import { normalizeDocumentNumber } from "./db";

describe("document number validation", () => {
  it("treats whitespace and letter case as the same document number", () => {
    expect(normalizeDocumentNumber(" BL-01 ")).toBe("bl-01");
    expect(normalizeDocumentNumber("bl-01")).toBe(normalizeDocumentNumber("BL-01"));
  });

  it("keeps different document numbers distinct", () => {
    expect(normalizeDocumentNumber("BL-01")).not.toBe(normalizeDocumentNumber("BL-02"));
  });

  it("rejects blank values at the normalization boundary", () => {
    expect(normalizeDocumentNumber("   ")).toBe("");
  });
});
