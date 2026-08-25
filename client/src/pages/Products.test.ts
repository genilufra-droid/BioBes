import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const productsPage = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/pages/Products.tsx"),
  "utf8",
);
const articleFields = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/components/AlphaArticleFields.tsx"),
  "utf8",
);

describe("Products action controls", () => {
  it("keeps Edito and Fshi wired to the selected product", () => {
    expect(productsPage).toContain('aria-label={`Edito ${product.name}`}');
    expect(productsPage).toContain('onClick={() => openEditDialog(product)}');
    expect(productsPage).toContain('aria-label={`Fshi ${product.name}`}');
    expect(productsPage).toContain('onClick={() => setDeleteProductId(product.id)}');
  });

  it("matches the Alpha article form contract", () => {
    expect(productsPage).toContain("Artikull i Ri — Regjistrim");
    expect(productsPage).toContain("alpha-form-tool");
    expect(articleFields).toContain(">Kartela</button>");
    expect(articleFields).toContain(">Llogaritë</button>");
    expect(articleFields).toContain('name="code"');
    expect(articleFields).toContain('name="barcode"');
    expect(articleFields).toContain('name="itemType"');
  });

  it("keeps the edit and delete dialogs connected to their real mutations", () => {
    expect(productsPage).toContain("updateProduct.mutateAsync");
    expect(productsPage).toContain("deleteProduct.mutateAsync");
    expect(productsPage).toContain("setEditingProductId(null)");
    expect(productsPage).toContain("setDeleteProductId(null)");
  });
});
