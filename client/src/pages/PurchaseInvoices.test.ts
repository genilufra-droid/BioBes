import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./PurchaseInvoices.tsx", import.meta.url), "utf8");
const filterBarSource = readFileSync(new URL("../components/PurchaseRegisterFilterBar.tsx", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Purchase invoice source-document navigation", () => {
  it("renders the invoice number as a clickable source-document link", () => {
    expect(source).toContain(
      '<SourceDocumentLink label={row.docNumber} onOpen={() => onOpenInvoice(row.invoiceId)}',
    );
  });

  it("does not retain the legacy embedded report deep-link route", () => {
    expect(source).not.toContain("setLocation(`/purchase-invoices?tab=${target.tab}&openInvoice=${id}`)");
  });

  it("mounts the invoice detail dialog outside Tabs for the operational register", () => {
    const tabsClose = source.lastIndexOf("      </Tabs>");
    const detailDialog = source.lastIndexOf("      <PurchaseInvoiceDetailDialog");
    const billsTabClose = source.indexOf("        </TabsContent>", source.indexOf('<TabsContent value="bills"'));

    expect(billsTabClose).toBeGreaterThan(-1);
    expect(tabsClose).toBeGreaterThan(billsTabClose);
    expect(detailDialog).toBeGreaterThan(tabsClose);
  });

  it("opens a new purchase invoice when the registrations route asks for one", () => {
    expect(source).toContain('useState(() => new URLSearchParams(locationSearch).get("newInvoice") === "1")');
    expect(source).toContain('if (new URLSearchParams(locationSearch).get("newInvoice") === "1")');
    expect(source).toContain('setActiveTab("bills");');
    expect(source).toContain('setBillOpen(true);');
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

  it("keeps reports exclusively in the top-level Reports workspace", () => {
    expect(source).not.toContain('<ModuleReportMenu module="Blerje"');
    expect(source).not.toContain('<TabsTrigger value="report"');
    expect(source).not.toContain("trpc.purchaseReport.summary.useQuery");
    expect(source).toContain('<TabsTrigger value="bills"');
    expect(source).toContain('<TabsTrigger value="orders"');
  });

  it("uses the compact Alpha workspace shell for the purchase register and new-invoice form", () => {
    expect(source).toContain('data-alpha-purchase-workspace');
    expect(source).toContain('data-alpha-purchase-register');
    expect(source).toContain('Alpha Business / Furnitorë dhe Blerje');
    expect(source).toContain('bg-gradient-to-b from-[#eef6fa] to-[#b9cfdb]');
    expect(source).toContain('data-[state=active]:bg-[#3f7191]');
    expect(styleSource).toContain('[data-alpha-purchase-workspace]');
  });
});
