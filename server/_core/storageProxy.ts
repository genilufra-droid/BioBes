import type { Express, Request, Response } from "express";
import { ENV } from "./env";
import { sdk } from "./sdk";
import { readLocalStorage, storageGetSignedUrl } from "../storage";
import * as db from "../db";

async function requireAuthenticated(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req as Parameters<typeof sdk.authenticateRequest>[0]);
    if (user) return user;
  } catch {
    // Fall through to the uniform unauthorized response.
  }
  res.status(401).send("Authentication required");
  return null;
}

export async function authorizeStorageObject(userId: number, key: string): Promise<boolean> {
  const companyId = await db.getStorageObjectCompanyId(key);
  if (!companyId) return false;
  const membership = await db.getCompanyMembership(companyId, userId);
  return Boolean(membership);
}

async function requireStorageAccess(req: Request, res: Response, key: string) {
  const user = await requireAuthenticated(req, res);
  if (!user) return false;
  try {
    if (!(await authorizeStorageObject(user.id, key))) { res.status(404).send("Storage object not found"); return false; }
    return true;
  } catch { res.status(404).send("Storage object not found"); return false; }
}

export function registerStorageProxy(app: Express) {
  app.get("/local-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) { res.status(400).send("Missing storage key"); return; }
    const decodedKey = decodeURIComponent(key);
    if (!(await requireStorageAccess(req, res, decodedKey))) return;
    if (ENV.storageProvider.toLowerCase() !== "local") { res.status(404).send("Local storage is disabled"); return; }
    try {
      const data = await readLocalStorage(decodedKey);
      res.set("Cache-Control", "private, max-age=3600");
      res.send(data);
    } catch { res.status(404).send("Storage object not found"); }
  });
  app.get("/s3-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) { res.status(400).send("Missing storage key"); return; }
    const decodedKey = decodeURIComponent(key);
    if (!(await requireStorageAccess(req, res, decodedKey))) return;
    if (ENV.storageProvider.toLowerCase() !== "s3") { res.status(404).send("S3 storage is disabled"); return; }
    try { res.set("Cache-Control", "private, max-age=900"); res.redirect(307, await storageGetSignedUrl(decodedKey)); }
    catch { res.status(404).send("Storage object not found"); }
  });
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) { res.status(400).send("Missing storage key"); return; }
    const decodedKey = decodeURIComponent(key);
    if (!(await requireStorageAccess(req, res, decodedKey))) return;
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) { res.status(500).send("Storage proxy not configured"); return; }
    try {
      const forgeUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
      forgeUrl.searchParams.set("path", decodedKey);
      const forgeResp = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${ENV.forgeApiKey}` } });
      if (!forgeResp.ok) { res.status(502).send("Storage backend error"); return; }
      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) { res.status(502).send("Empty signed URL from backend"); return; }
      res.set("Cache-Control", "no-store"); res.redirect(307, url);
    } catch (err) { console.error("[StorageProxy] failed:", err); res.status(502).send("Storage proxy error"); }
  });
}
