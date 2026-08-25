import { appRouter } from "../server/routers.ts";
import * as db from "../server/db.ts";

const companyId = 1;
const testUserId = 300001;
const caller = appRouter.createCaller({ user: { id: 1, role: "admin" } });

const initialMembership = await db.getCompanyMembership(companyId, testUserId);
if (initialMembership) {
  throw new Error("Përdoruesi i testimit është tashmë anëtar; testi nuk prek të dhënat ekzistuese.");
}

try {
  const search = await caller.company.findUsers({ companyId, search: "rugove" });
  if (!search.some(user => user.id === testUserId)) throw new Error("Kërkimi nuk gjeti përdoruesin e dytë real.");

  await caller.company.addUser({ companyId, userId: testUserId, role: "viewer" });
  const added = await db.getCompanyMembership(companyId, testUserId);
  if (added?.role !== "viewer") throw new Error("Shtimi i anëtarit nuk ruajti rolin viewer.");

  await caller.company.setUserRole({ companyId, userId: testUserId, role: "admin" });
  const updated = await db.getCompanyMembership(companyId, testUserId);
  if (updated?.role !== "admin") throw new Error("Ndryshimi i rolit nuk u ruajt.");

  const memberCaller = appRouter.createCaller({ user: { id: testUserId, role: "user" } });
  let selfRemovalProtectionWorked = false;
  try {
    await memberCaller.company.removeUser({ companyId, userId: testUserId });
  } catch (error) {
    selfRemovalProtectionWorked = error?.code === "FORBIDDEN";
  }
  if (!selfRemovalProtectionWorked) throw new Error("Mbrojtja e përdoruesit aktiv nuk funksionoi.");

  await caller.company.removeUser({ companyId, userId: testUserId });
  const removed = await db.getCompanyMembership(companyId, testUserId);
  if (removed) throw new Error("Heqja e anëtarit nuk u krye.");

  let ownerProtectionWorked = false;
  try {
    await caller.company.removeUser({ companyId, userId: 1 });
  } catch (error) {
    ownerProtectionWorked = error?.code === "FORBIDDEN";
  }
  if (!ownerProtectionWorked) throw new Error("Mbrojtja e pronarit nuk funksionoi.");

  console.log("Sukses: kërkimi, shtimi, ndryshimi i rolit, heqja dhe mbrojtja e pronarit u verifikuan.");
} finally {
  const cleanup = await db.getCompanyMembership(companyId, testUserId);
  if (cleanup) await db.removeCompanyUser(companyId, testUserId);
}
