import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const salesSource = readFileSync(new URL("./SalesInvoices.tsx", import.meta.url), "utf8");
const purchaseSource = readFileSync(new URL("./PurchaseInvoices.tsx", import.meta.url), "utf8");
const productSearchSource = readFileSync(new URL("../components/ProductLiveSearch.tsx", import.meta.url), "utf8");

describe("active invoice line quick-create contract", () => {
  it("updates only the indexed sales line after product selection", () => {
    expect(salesSource).toContain("onSelect={patch => onPatch(index, patch)}");
    expect(salesSource).toContain("<ProductLiveSearch companyId={companyId ?? 1} products={products} value={line}");
  });

  it("updates only the indexed purchase line after product selection", () => {
    expect(purchaseSource).toContain("onSelect={patch => onChange(index, patch)}");
    expect(purchaseSource).toContain("<ProductLiveSearch companyId={companyId} products={products} value={line}");
  });

  it("links a newly saved product through the shared selection contract", () => {
    expect(productSearchSource).toContain("linkCreatedProductToInvoiceLine");
    expect(productSearchSource).toContain("onSelect(linkCreatedProductToInvoiceLine");
    expect(productSearchSource).toContain("setCreateOpen(false)");
  });

  it("opens the new Alpha sales invoice registration form from the sales module", () => {
    expect(salesSource).toContain("Faturë Shitje");
    expect(salesSource).toContain("Pika e Shitjes");
    expect(salesSource).toContain("Kursi i këmbimit");
    expect(salesSource).toContain("Si Dok Magazine");
    expect(salesSource).toContain("Ruaj faturën");
    expect(salesSource).toContain("!h-[100dvh]");
  });

  it("opens the Alpha sales registration form for an existing invoice", () => {
    expect(salesSource).toContain("data-testid=\"sales-invoice-registration-form\"");
    expect(salesSource).toContain("alpha-sales-page");
    expect(salesSource).toContain("Faturat e shitjes");
    expect(salesSource).toContain("<SalesInvoiceFormView invoice={invoice}");
    expect(salesSource).not.toContain("<iframe title={`Pamja reference e faturës");
  });

  it("keeps the active sales register in the Alpha visual scope", () => {
    const registerSource = readFileSync(new URL("../components/SalesInvoiceRegister.tsx", import.meta.url), "utf8");
    const totalsSource = readFileSync(new URL("../components/SalesRegisterTotals.tsx", import.meta.url), "utf8");
    expect(registerSource).toContain("data-alpha-sales-register");
    expect(registerSource).toContain("Regjistri i faturave të shitjes");
    expect(registerSource).toContain("Nr. dokumentit është lidhja e hapjes");
    expect(totalsSource).toContain("data-alpha-sales-totals");
  });

  it("keeps sales reports exclusively in the top-level Reports workspace", () => {
    expect(salesSource).not.toContain('<ModuleReportMenu module="Shitje"');
    expect(salesSource).not.toContain('<TabsTrigger value="report"');
    expect(salesSource).not.toContain("trpc.salesReport.summary.useQuery");
    expect(salesSource).toContain('<TabsTrigger value="invoices"');
  });
});
