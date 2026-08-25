import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter, authorizePayrollPeriod } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

function context(role: "admin" | "user" = "user"): TrpcContext {
  const now = new Date();
  return { user: { id: 7, openId: "tenant-a", email: "a@example.com", name: "Tenant A", loginMethod: "local", role, createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("payroll period company authorization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("blocks a company A user from reading company B period data", async () => {
    vi.spyOn(db, "getPayrollPeriodAccess").mockResolvedValue({ id: 22, companyId: 2, status: "DRAFT" });
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    const entries = vi.spyOn(db, "getPayrollEntries").mockResolvedValue([]);
    const caller = appRouter.createCaller(context());
    await expect(caller.payroll.periods.entries({ payrollPeriodId: 22 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(entries).not.toHaveBeenCalled();
  });

  it("blocks cross-tenant generate, attendance, bonuses and clear mutations before DB mutation", async () => {
    vi.spyOn(db, "getPayrollPeriodAccess").mockResolvedValue({ id: 22, companyId: 2, status: "DRAFT" });
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    const generate = vi.spyOn(db, "generatePayrollPeriod").mockResolvedValue({} as never);
    const attendance = vi.spyOn(db, "createPayrollAttendance").mockResolvedValue({} as never);
    const bonuses = vi.spyOn(db, "upsertPayrollPeriodBonuses").mockResolvedValue({ saved: 1 });
    const clear = vi.spyOn(db, "clearPayrollManualAttendance").mockResolvedValue({ cleared: 1 });
    const caller = appRouter.createCaller(context());
    await expect(caller.payroll.periods.generate({ payrollPeriodId: 22 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.payroll.periods.addAttendance({ payrollPeriodId: 22, payrollEmployeeId: 4, day: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.payroll.periods.upsertBonuses({ payrollPeriodId: 22, rows: [{ payrollEmployeeId: 4, bonusCents: 100 }] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.payroll.periods.clearManualAttendance({ payrollPeriodId: 22 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(generate).not.toHaveBeenCalled();
    expect(attendance).not.toHaveBeenCalled();
    expect(bonuses).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it("blocks viewer mutations even within the viewer's company", async () => {
    vi.spyOn(db, "getPayrollPeriodAccess").mockResolvedValue({ id: 22, companyId: 1, status: "DRAFT" });
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    vi.spyOn(db, "getCompanyMembership").mockResolvedValue({ companyId: 1, userId: 7, role: "viewer" } as never);
    const generate = vi.spyOn(db, "generatePayrollPeriod").mockResolvedValue({} as never);
    await expect(appRouter.createCaller(context()).payroll.periods.generate({ payrollPeriodId: 22 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(generate).not.toHaveBeenCalled();
  });

  it("authorizes a member before returning period-owned data", async () => {
    vi.spyOn(db, "getPayrollPeriodAccess").mockResolvedValue({ id: 22, companyId: 1, status: "DRAFT" });
    vi.spyOn(db, "getUserCompanies").mockResolvedValue([{ companyId: 1 }] as never);
    await expect(authorizePayrollPeriod(context().user, 22)).resolves.toMatchObject({ companyId: 1 });
  });
});
