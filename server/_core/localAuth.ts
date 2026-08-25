import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

const scrypt = promisify(scryptCallback);
type LocalUser = { email: string; name?: string; role?: "admin" | "user"; passwordHash: string };
function users(): LocalUser[] {
  try { const value = JSON.parse(ENV.localAuthUsersJson); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
export async function hashLocalPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}
export async function verifyLocalPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, digest] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !digest) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function isValidLocalBootstrapInput(input: { email: string; password: string; name: string; companyName: string }): boolean {
  return /^\S+@\S+\.\S+$/.test(input.email) && input.password.length >= 10 && input.name.trim().length >= 2 && input.companyName.trim().length >= 2;
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/local-auth/bootstrap", async (req: Request, res: Response) => {
    if (ENV.authProvider.toLowerCase() !== "local") { res.status(404).json({ error: "Local auth is disabled" }); return; }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const companyName = typeof req.body?.companyName === "string" ? req.body.companyName.trim() : "";
    const nipt = typeof req.body?.nipt === "string" ? req.body.nipt.trim() : undefined;
    if (!isValidLocalBootstrapInput({ email, password, name, companyName })) { res.status(400).json({ error: "Email, name, company name and password of at least 10 characters are required" }); return; }
    try {
      const passwordHash = await hashLocalPassword(password);
      const owner = await db.bootstrapLocalOwner({ email, name, passwordHash, companyName, nipt });
      const token = await sdk.signSession({ openId: owner.openId, appId: "self-hosted", name }, { expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.status(201).json({ ok: true, companyId: owner.companyId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bootstrap failed";
      res.status(message.includes("already completed") ? 409 : 503).json({ error: message });
    }
  });

  app.post("/api/local-auth/login", async (req: Request, res: Response) => {
    if (ENV.authProvider.toLowerCase() !== "local") { res.status(404).json({ error: "Local auth is disabled" }); return; }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const configured = users().find(item => item.email.trim().toLowerCase() === email);
    const stored = configured ? null : await db.getUserByEmail(email);
    const account = configured ?? (stored?.passwordHash ? { email: stored.email ?? email, name: stored.name ?? email, role: stored.role, passwordHash: stored.passwordHash } : null);
    if (!account || !(await verifyLocalPassword(password, account.passwordHash))) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const openId = configured ? `local:${email}` : (stored?.openId ?? `local:${email}`);
    await db.upsertUser({ openId, email, name: account.name ?? email, loginMethod: "local", role: account.role === "admin" ? "admin" : "user", lastSignedIn: new Date(), passwordHash: account.passwordHash });
    const token = await sdk.signSession({ openId, appId: "self-hosted", name: account.name ?? email }, { expiresInMs: ONE_YEAR_MS });
    res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
    res.json({ ok: true });
  });
  app.post("/api/local-auth/logout", (_req: Request, res: Response) => { res.clearCookie(COOKIE_NAME, { path: "/" }); res.json({ ok: true }); });
}
