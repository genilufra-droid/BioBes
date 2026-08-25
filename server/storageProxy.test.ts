import { afterEach, describe, expect, it, vi } from "vitest";
import { registerStorageProxy, authorizeStorageObject } from "./_core/storageProxy";
import * as db from "./db";
import { sdk } from "./_core/sdk";

type Handler = (req: any, res: any) => Promise<void>;

function registeredHandlers() {
  const routes = new Map<string, Handler>();
  const app = { get: (path: string, handler: Handler) => routes.set(path, handler) };
  registerStorageProxy(app as never);
  return routes;
}

function response() {
  const res: any = {
    status: vi.fn(() => res),
    send: vi.fn(() => res),
    set: vi.fn(() => res),
    redirect: vi.fn(() => res),
  };
  return res;
}

describe("storage proxy authorization", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns 401 for anonymous requests on every storage backend", async () => {
    vi.spyOn(sdk, "authenticateRequest").mockResolvedValue(null);
    const routes = registeredHandlers();
    for (const path of ["/local-storage/*", "/s3-storage/*", "/manus-storage/*"]) {
      const res = response();
      await routes.get(path)?.({ params: { 0: "employee_docs/secret.pdf" } }, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Authentication required");
    }
  });

  it("allows only a member of the metadata owner's company", async () => {
    vi.spyOn(db, "getStorageObjectCompanyId").mockResolvedValue(42);
    const membership = vi.spyOn(db, "getCompanyMembership");
    membership.mockResolvedValue({ companyId: 42, userId: 7, role: "viewer" } as never);
    await expect(authorizeStorageObject(7, "employee_docs/owned.pdf")).resolves.toBe(true);
    membership.mockResolvedValue(null);
    await expect(authorizeStorageObject(8, "employee_docs/owned.pdf")).resolves.toBe(false);
  });

  it("denies objects with no registered metadata", async () => {
    vi.spyOn(db, "getStorageObjectCompanyId").mockResolvedValue(null);
    await expect(authorizeStorageObject(7, "unknown/untracked.pdf")).resolves.toBe(false);
  });
});
