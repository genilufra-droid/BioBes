import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

function readerContext(): TrpcContext {
  const now = new Date();
  return {
    user: { id: 7, openId: "reader", email: "reader@example.com", name: "Reader", loginMethod: "email", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("reader company access", () => {
  afterEach(() => vi.restoreAllMocks());

  it("blocks all covered write mutations with FORBIDDEN", async () => {
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    vi.spyOn(db, "getCompanyMembership").mockResolvedValue({ companyId: 1, userId: 7, role: "viewer" } as never);
    const caller = appRouter.createCaller(readerContext());
    const expectForbidden = async (operation: Promise<unknown>) => expect(operation).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expectForbidden(caller.payment.create({ companyId: 1, paymentNumber: "P-READER", paymentDate: new Date(), paymentType: "INBOUND", amount: 100, method: "CASH" }));
    await expectForbidden(caller.payment.post({ companyId: 1, id: 1 }));
    await expectForbidden(caller.payment.cancel({ companyId: 1, id: 1 }));
    await expectForbidden(caller.payment.deleteDraft({ companyId: 1, id: 1 }));
    await expectForbidden(caller.creditNotes.create({ companyId: 1, creditNoteNumber: "CN-READER", noteDate: new Date(), sourceType: "SALE", sourceInvoiceId: 1, sourceInvoiceNumber: "S-1", partnerName: "Klient", amount: 100 }));
    await expectForbidden(caller.creditNotes.setStatus({ companyId: 1, id: 1, status: "POSTED" }));
    await expectForbidden(caller.creditNotes.deleteDraft({ companyId: 1, id: 1 }));
  });

  it("lejon query-t read-only për pagesa dhe Nota Krediti", async () => {
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    vi.spyOn(db, "getPayments").mockResolvedValue([] as never);
    vi.spyOn(db, "getCreditNotes").mockResolvedValue([] as never);
    const caller = appRouter.createCaller(readerContext());
    await expect(caller.payment.list({ companyId: 1 })).resolves.toEqual([]);
    await expect(caller.creditNotes.list({ companyId: 1 })).resolves.toEqual([]);
  });
});
