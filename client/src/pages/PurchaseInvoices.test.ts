import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./PurchaseInvoices.tsx", import.meta.url), "utf8");
const filterBarSource = readFileSync(new URL("../components/PurchaseRegisterFilterBar.tsx", import.meta.url), "utf8");

describe("Purchase invoice source-document navigation", () => {
  it("renders the invoice number as a clickable source-document link", () => {
    expect(source).toContain(
      '<SourceDocumentLink label={row.docNumber} onOpen={() => onOpenInvoice(row.invoiceId)}',
    );
  });

  it("routes report invoice links through the deep-link that opens the source invoice", () => {
    expect(source).toContain("setLocation(`/purchase-invoices?tab=${target.tab}&openInvoice=${id}`)");
  });

  it("mounts the invoice detail dialog outside Tabs so report links work from every tab", () => {
    const tabsClose = source.lastIndexOf("      </Tabs>");
    const detailDialog = source.lastIndexOf("      <PurchaseInvoiceDetailDialog");
    const billsTabClose = source.indexOf("        </TabsContent>", source.indexOf('<TabsContent value="bills"'));

    expect(billsTabClose).toBeGreaterThan(-1);
    expect(tabsClose).toBeGreaterThan(billsTabClose);
    expect(detailDialog).toBeGreaterThan(tabsClose);
  });

  it("keeps the purchase register column-filter panel hideable and restorable", () => {
    expect(source).toContain("<PurchaseRegisterFilterBar filters={registerFilters} onChange={setRegisterFilters} />");
    expect(filterBarSource).toContain('data-testid="purchase-register-column-filters"');
    expect(filterBarSource).toContain('data-testid="toggle-purchase-register-filters"');
    expect(filterBarSource).toContain('data-testid="apply-purchase-register-filters"');
    expect(filterBarSource).toContain("Fshih filtrat");
    expect(filterBarSource).toContain("Shfaq filtrat");
    expect(filterBarSource).toContain("Shfaq rezultatet");
  });
});
