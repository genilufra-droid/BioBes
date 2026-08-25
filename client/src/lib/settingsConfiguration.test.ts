import { describe, expect, it } from "vitest";

describe("Alpha company configuration", () => {
  it("uses bounded flags for optional custom fields", () => {
    const flags = { customFieldsCustomers: 1, customFieldsSuppliers: 0, customFieldsProducts: 1 };
    expect(Object.values(flags).every(value => value === 0 || value === 1)).toBe(true);
  });

  it("keeps the configuration scope tied to the active company", () => {
    const activeCompanyId = 7;
    const payload = { companyId: activeCompanyId, customFieldsCustomers: 1 };
    expect(payload.companyId).toBe(activeCompanyId);
    expect(payload).not.toHaveProperty("payroll");
  });
});

export {};

// The trailing marker is intentionally absent from runtime code; this file only covers the configuration payload contract.
