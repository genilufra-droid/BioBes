import { describe, expect, it } from "vitest";
import { MAX_CARGO_DOCUMENT_BYTES, validateCargoDocumentInput } from "./cargoDocumentValidation";

describe("cargo document validation", () => {
  it("pranon formatet e arkivës", () => {
    for (const name of ["invoice.pdf", "seal.jpeg", "documents.zip", "cmr.docx", "costs.xlsx"]) {
      expect(validateCargoDocumentInput(name, 1024, 1024)).toBeNull();
    }
  });

  it("refuzon ekzekutues dhe skedarë pa prapashtesë", () => {
    expect(validateCargoDocumentInput("script.exe", 1024, 1024)).toContain("PDF");
    expect(validateCargoDocumentInput("document", 1024, 1024)).toContain("PDF");
  });

  it("zbaton kufirin 25 MB dhe nuk pranon skedar bosh", () => {
    expect(validateCargoDocumentInput("large.pdf", MAX_CARGO_DOCUMENT_BYTES + 1, MAX_CARGO_DOCUMENT_BYTES + 1)).toContain("25 MB");
    expect(validateCargoDocumentInput("empty.pdf", 1, 0)).toContain("bosh");
  });
});
