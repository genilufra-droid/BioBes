import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

function ctx(): TrpcContext {
  const now = new Date();
  return { user: { id: 7, openId: "tenant-a", email: "a@example.com", name: "Tenant A", loginMethod: "local", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("ID-only route company isolation", () => {
  afterEach(() => vi.restoreAllMocks());

  it("rejects a weight form from another company before returning it", async () => {
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    const form = vi.spyOn(db, "getWeightFormById").mockResolvedValue({ id: 9, companyId: 2 } as never);
    await expect(appRouter.createCaller(ctx()).weightForm.get({ id: 9, companyId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(form).not.toHaveBeenCalled();
  });

  it("rejects a purchase invoice from another company before loading items", async () => {
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    const invoice = vi.spyOn(db, "getPurchaseInvoiceById").mockResolvedValue({ id: 10, companyId: 2 } as never);
    const items = vi.spyOn(db, "getPurchaseItems").mockResolvedValue([]);
    await expect(appRouter.createCaller(ctx()).purchaseInvoice.get({ id: 10, companyId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(invoice).not.toHaveBeenCalled();
    expect(items).not.toHaveBeenCalled();
  });

  it("rejects creating a purchase invoice in another company before writing to the database", async () => {
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1, role: "viewer" }] as never);
    const create = vi.spyOn(db, "createPurchaseInvoice").mockResolvedValue({ id: 11 } as never);

    await expect(appRouter.createCaller(ctx()).purchaseInvoice.create({
      companyId: 2,
      docNumber: "BL-CROSS-TENANT",
      date: new Date("2026-08-27T00:00:00.000Z"),
      items: [],
    })).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(create).not.toHaveBeenCalled();
  });
});
