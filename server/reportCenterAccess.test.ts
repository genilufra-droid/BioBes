import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

function ctx(): TrpcContext {
  const now = new Date();
  return {
    user: { id: 7, openId: "tenant-a", email: "a@example.com", name: "Tenant A", loginMethod: "local", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("reportCenter company isolation", () => {
  afterEach(() => vi.restoreAllMocks());

  it("rejects a report for another company before querying report data", async () => {
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    const report = vi.spyOn(db, "getOdooReport").mockResolvedValue({ columns: [], rows: [], metrics: [] });

    await expect(appRouter.createCaller(ctx()).reportCenter.get({ companyId: 2, reportKey: "sales_summary_register_pdf" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(report).not.toHaveBeenCalled();
  });
});
