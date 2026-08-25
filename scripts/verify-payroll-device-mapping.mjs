import { appRouter } from "../server/routers.ts";

const caller = appRouter.createCaller({ user: { id: 1, role: "admin" } });
const companyId = 1;
const deviceId = "45";
const payrollEmployeeId = 90001;

await caller.payroll.mappings.save({ companyId, deviceId, payrollEmployeeId, active: 1 });
const mappings = await caller.payroll.mappings.list({ companyId });
const mapping = mappings.find(item => item.deviceId === deviceId && item.active === 1);

if (!mapping || mapping.payrollEmployeeId !== payrollEmployeeId) {
  throw new Error("Lidhja e përhershme e pajisjes nuk u ruajt siç duhet.");
}

console.log(`Sukses: pajisja ${deviceId} lidhet në mënyrë të përhershme me punonjësin ${payrollEmployeeId}.`);
