import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

const scrypt = promisify(scryptCallback);
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 10;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function requestKey(req: Request, suffix: string) { return `${req.ip || req.socket.remoteAddress || "unknown"}:${suffix}`; }
export function consumeLocalAuthRateLimit(key: string, now = Date.now()): boolean {
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) { rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS }); return true; }
  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  return true;
}
export function clearLocalAuthRateLimit(key: string) { rateBuckets.delete(key); }
export function hasValidSetupSecret(provided: string | undefined, configured: string): boolean {
  if (!provided || !configured) return false;
  const providedDigest = createHash("sha256").update(provided).digest();
  const configuredDigest = createHash("sha256").update(configured).digest();
  return timingSafeEqual(providedDigest, configuredDigest);
}
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
  return /^\S+@\S+\.\S+$/.test(input.email) && input.password.length >= 12 && input.name.trim().length >= 2 && input.companyName.trim().length >= 2;
}

function getLocalAccountInput(req: Request) {
  return {
    email: typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "",
    password: typeof req.body?.password === "string" ? req.body.password : "",
    name: typeof req.body?.name === "string" ? req.body.name.trim() : "",
    companyName: typeof req.body?.companyName === "string" ? req.body.companyName.trim() : "",
    nipt: typeof req.body?.nipt === "string" ? req.body.nipt.trim() : undefined,
  };
}

function localSessionFor(account: { openId: string; name: string | null | undefined }) {
  return sdk.signSession({ openId: account.openId, appId: "local", name: account.name?.trim() || "Përdorues lokal" }, { expiresInMs: ONE_YEAR_MS });
}

function setLocalSession(req: Request, res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/local-auth/bootstrap", async (req: Request, res: Response) => {
    const bootstrapKey = requestKey(req, "bootstrap");
    if (!consumeLocalAuthRateLimit(bootstrapKey)) { res.status(429).json({ error: "Too many bootstrap attempts" }); return; }
    const setupSecret = req.header("x-local-auth-setup-secret");
    if (!hasValidSetupSecret(setupSecret, ENV.localAuthSetupSecret)) { res.status(503).json({ error: "LOCAL_AUTH_SETUP_SECRET is required for first-run bootstrap" }); return; }
    const { email, password, name, companyName, nipt } = getLocalAccountInput(req);
    if (!isValidLocalBootstrapInput({ email, password, name, companyName })) { res.status(400).json({ error: "Email, name, company name and password of at least 10 characters are required" }); return; }
    try {
      const passwordHash = await hashLocalPassword(password);
      const owner = await db.bootstrapLocalOwner({ email, name, passwordHash, companyName, nipt });
      const token = await localSessionFor({ openId: owner.openId, name });
      setLocalSession(req, res, token);
      res.status(201).json({ ok: true, companyId: owner.companyId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bootstrap failed";
      res.status(message.includes("already completed") ? 409 : 503).json({ error: message });
    }
  });

  app.post("/api/local-auth/login", async (req: Request, res: Response) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const loginKey = requestKey(req, `login:${email}`);
    if (!consumeLocalAuthRateLimit(loginKey)) { res.status(429).json({ error: "Too many login attempts" }); return; }
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const configured = users().find(item => item.email.trim().toLowerCase() === email);
    const stored = configured ? null : await db.getUserByEmail(email);
    const account = configured ?? (stored?.passwordHash ? { email: stored.email ?? email, name: stored.name ?? email, role: stored.role, passwordHash: stored.passwordHash } : null);
    if (!account || !(await verifyLocalPassword(password, account.passwordHash))) { res.status(401).json({ error: "Invalid credentials" }); return; }
    clearLocalAuthRateLimit(loginKey);
    const openId = configured ? `local:${email}` : (stored?.openId ?? `local:${email}`);
    await db.upsertUser({ openId, email, name: account.name ?? email, loginMethod: "local", role: account.role === "admin" ? "admin" : "user", lastSignedIn: new Date(), passwordHash: account.passwordHash });
    const token = await localSessionFor({ openId, name: account.name ?? email });
    setLocalSession(req, res, token);
    res.json({ ok: true });
  });

  app.post("/api/local-auth/activate-existing-owner", async (req: Request, res: Response) => {
    const activationKey = requestKey(req, "activate-owner");
    if (!consumeLocalAuthRateLimit(activationKey)) { res.status(429).json({ error: "Too many activation attempts" }); return; }
    const setupSecret = req.header("x-local-auth-setup-secret");
    if (!hasValidSetupSecret(setupSecret, ENV.localAuthSetupSecret)) { res.status(401).json({ error: "Activation could not be completed" }); return; }
    const { email, password, name, companyName } = getLocalAccountInput(req);
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || name || companyName) { res.status(400).json({ error: "Email and a password with at least 12 characters are required" }); return; }
    try {
      const account = await db.activateExistingLocalOwner({ email, passwordHash: await hashLocalPassword(password) });
      if (!account) { res.status(409).json({ error: "Activation could not be completed" }); return; }
      clearLocalAuthRateLimit(activationKey);
      setLocalSession(req, res, await localSessionFor(account));
      res.status(201).json({ ok: true });
    } catch { res.status(503).json({ error: "Activation is temporarily unavailable" }); }
  });

  app.post("/api/local-auth/register", async (req: Request, res: Response) => {
    const registrationKey = requestKey(req, "register");
    if (!consumeLocalAuthRateLimit(registrationKey)) { res.status(429).json({ error: "Too many registration attempts" }); return; }
    const input = getLocalAccountInput(req);
    if (!isValidLocalBootstrapInput(input)) { res.status(400).json({ error: "Email, name, company name and a password with at least 12 characters are required" }); return; }
    try {
      await db.registerLocalAccount({ ...input, passwordHash: await hashLocalPassword(input.password) });
      clearLocalAuthRateLimit(registrationKey);
      // Keep this response identical for existing and new emails to avoid account enumeration.
      res.status(201).json({ ok: true, message: "Nëse emaili është i disponueshëm, llogaria është krijuar. Tani hyni me kredencialet tuaja." });
    } catch { res.status(503).json({ error: "Regjistrimi është përkohësisht i padisponueshëm" }); }
  });

  app.post("/api/local-auth/change-password", async (req: Request, res: Response) => {
    const passwordKey = requestKey(req, "change-password");
    if (!consumeLocalAuthRateLimit(passwordKey)) { res.status(429).json({ error: "Too many password attempts" }); return; }
    const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    if (newPassword.length < 12) { res.status(400).json({ error: "Fjalëkalimi i ri duhet të ketë të paktën 12 karaktere" }); return; }
    try {
      const account = await sdk.authenticateRequest(req);
      if (!account.passwordHash || !(await verifyLocalPassword(currentPassword, account.passwordHash))) { res.status(401).json({ error: "Fjalëkalimi aktual nuk është i saktë" }); return; }
      await db.updateLocalPassword(account.id, await hashLocalPassword(newPassword));
      clearLocalAuthRateLimit(passwordKey);
      setLocalSession(req, res, await localSessionFor(account));
      res.json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Fjalëkalimi aktual")) { res.status(401).json({ error: error.message }); return; }
      res.status(401).json({ error: "Duhet të hyni në llogari për të ndryshuar fjalëkalimin" });
    }
  });

  app.post("/api/local-auth/logout", (req: Request, res: Response) => { res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req)); res.json({ ok: true }); });
}
