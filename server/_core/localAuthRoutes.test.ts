import express from "express";
import { createServer } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  activateExistingLocalOwner: vi.fn(),
  getUserByEmail: vi.fn(),
  registerLocalAccount: vi.fn(),
  updateLocalPassword: vi.fn(),
  upsertUser: vi.fn(),
}));

const sdkMocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  signSession: vi.fn().mockResolvedValue("signed-local-session"),
}));

vi.mock("../db", () => dbMocks);
vi.mock("./sdk", () => ({ sdk: sdkMocks }));

import { ENV } from "./env";
import { clearLocalAuthRateLimit, consumeLocalAuthRateLimit, hashLocalPassword, registerLocalAuthRoutes } from "./localAuth";

async function callLocalAuth(path: string, body: unknown, headers: Record<string, string> = {}) {
  const app = express();
  app.use(express.json());
  registerLocalAuthRoutes(app);
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
  try {
    return await fetch(`http://127.0.0.1:${address.port}${path}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

afterEach(() => {
  vi.clearAllMocks();
  clearLocalAuthRateLimit("rate-test");
});

describe("local authentication HTTP routes", () => {
  it("keeps the registration response non-enumerating when an email is already unavailable", async () => {
    dbMocks.registerLocalAccount.mockResolvedValue(null);
    const response = await callLocalAuth("/api/local-auth/register", { email: "existing@example.com", name: "Existing User", companyName: "Kompania e Re", password: "LocalPassword!2026" });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, message: "Nëse emaili është i disponueshëm, llogaria është krijuar. Tani hyni me kredencialet tuaja." });
    expect(dbMocks.registerLocalAccount).toHaveBeenCalledWith(expect.objectContaining({ email: "existing@example.com", name: "Existing User", companyName: "Kompania e Re", passwordHash: expect.stringMatching(/^scrypt\$/) }));
  });

  it("activates only a returned existing owner with a server-side setup secret", async () => {
    dbMocks.activateExistingLocalOwner.mockResolvedValue({ id: 1, openId: "legacy-owner-id", email: "owner@example.com", name: "Owner", role: "admin" });
    const response = await callLocalAuth("/api/local-auth/activate-existing-owner", { email: "owner@example.com", password: "LocalPassword!2026" }, { "x-local-auth-setup-secret": ENV.localAuthSetupSecret });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(dbMocks.activateExistingLocalOwner).toHaveBeenCalledWith(expect.objectContaining({ email: "owner@example.com", passwordHash: expect.stringMatching(/^scrypt\$/) }));
    expect(sdkMocks.signSession).toHaveBeenCalledWith({ openId: "legacy-owner-id", appId: "local", name: "Owner" }, { expiresInMs: expect.any(Number) });
  });

  it("requires the current local password before changing it and leaves the database untouched on failure", async () => {
    const passwordHash = await hashLocalPassword("CurrentPassword!2026");
    sdkMocks.authenticateRequest.mockResolvedValue({ id: 1, openId: "local:owner@example.com", name: "Owner", email: "owner@example.com", passwordHash });
    const response = await callLocalAuth("/api/local-auth/change-password", { currentPassword: "wrong-password", newPassword: "ReplacementPassword!2026" });
    expect(response.status).toBe(401);
    expect(dbMocks.updateLocalPassword).not.toHaveBeenCalled();
  });

  it("enforces a bounded request rate for repeated local-auth attempts", () => {
    for (let index = 0; index < 10; index += 1) expect(consumeLocalAuthRateLimit("rate-test", 1_000)).toBe(true);
    expect(consumeLocalAuthRateLimit("rate-test", 1_000)).toBe(false);
  });
});
