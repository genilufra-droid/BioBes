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
export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/local-auth/login", async (req: Request, res: Response) => {
    if (ENV.authProvider.toLowerCase() !== "local") { res.status(404).json({ error: "Local auth is disabled" }); return; }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const account = users().find(item => item.email.trim().toLowerCase() === email);
    if (!account || !(await verifyLocalPassword(password, account.passwordHash))) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const openId = `local:${email}`;
    await db.upsertUser({ openId, email, name: account.name ?? email, loginMethod: "local", role: account.role ?? "user", lastSignedIn: new Date(), passwordHash: account.passwordHash });
    const token = await sdk.signSession({ openId, appId: "self-hosted", name: account.name ?? email }, { expiresInMs: ONE_YEAR_MS });
    res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
    res.json({ ok: true });
  });
  app.post("/api/local-auth/logout", (_req: Request, res: Response) => { res.clearCookie(COOKIE_NAME, { path: "/" }); res.json({ ok: true }); });
}
