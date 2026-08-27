import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const page = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/Registrations.tsx"), "utf8");
const app = fs.readFileSync(path.resolve(process.cwd(), "client/src/App.tsx"), "utf8");
const layout = fs.readFileSync(path.resolve(process.cwd(), "client/src/components/DashboardLayout.tsx"), "utf8");
const registrationMenu = fs.readFileSync(path.resolve(process.cwd(), "client/src/components/AlphaRegistrationMenu.tsx"), "utf8");

describe("Registrations workspace", () => {
  it("exposes real registration entries", () => {
    expect(registrationMenu).toContain("Faturat e Shitjes");
    expect(registrationMenu).toContain("Faturat e Blerjes");
    expect(page).toContain("Regjistrime magazine");
    expect(page).toContain("Regjistrime kontabël");
    expect(page).toContain("Regjistrime Alpha");
    expect(page).toContain("/sales-invoices");
    expect(page).toContain("/purchase-invoices");
    expect(page).toContain("/inventory?openMovement=");
    expect(page).toContain("invoiceTotalAmount ?? item.totalAmount");
    expect(page).toContain("_path: `/sales-invoices?tab=invoices&openInvoice=${item.invoiceId ?? item.id}`");
    expect(page).toContain("items.findIndex((candidate: any) => (candidate.invoiceId ?? candidate.docNumber ?? candidate.id) === documentKey) === index");
  });

  it("routes the sales registration entry directly to the sales invoice register", () => {
    expect(page).toContain('if (item.key === "sales") { setLocation("/sales-invoices?tab=invoices&newInvoice=1"); return; }');
  });

  it("routes both invoice menu entries directly to new document forms", () => {
    expect(registrationMenu).toContain('path: "/sales-invoices?tab=invoices&newInvoice=1"');
    expect(registrationMenu).toContain('path: "/purchase-invoices?tab=bills&newInvoice=1"');
    expect(page).toContain('if (item.key === "purchases") { setLocation("/purchase-invoices?tab=bills&newInvoice=1"); return; }');
  });

  it("uses an Alpha list/dropdown model instead of a sales workflow", () => {
    expect(page).toContain("data-alpha-registration-workspace");
    expect(page).toContain("alpha-admin-window");
    expect(page).toContain("Zgjidh regjistrin që dëshiron të hapësh");
    expect(page).not.toContain("Procesi i punës");
    expect(registrationMenu).toContain("Faturat e Shitjes");
    expect(registrationMenu).toContain("Faturat e Blerjes");
    expect(registrationMenu).toContain("Transferta");
    expect(registrationMenu).toContain("role=\"menu\"");
  });

  it("is wired from the Alpha menu without touching payroll", () => {
    expect(app).toContain('path="/registrations"');
    expect(layout).toContain("<AlphaRegistrationMenu />");
    expect(layout).toContain('import AlphaRegistrationMenu from "@/components/AlphaRegistrationMenu";');
    expect(app).toContain('path="/payroll"');
  });
});
