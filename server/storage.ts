// Storage adapter: self-hosted local filesystem or Manus Forge/S3.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string): string {
  const normalized = relKey.replace(/^\/+/, "");
  if (!normalized || normalized.split("/").some(part => part === "..")) {
    throw new Error("Invalid storage key");
  }
  return normalized;
}
function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
function localPath(key: string): string {
  const root = path.resolve(ENV.localStorageDir);
  const target = path.resolve(root, key);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error("Invalid storage path");
  return target;
}
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) throw new Error("Storage config missing: configure STORAGE_PROVIDER=local or Forge credentials");
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream"): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  if (ENV.storageProvider.toLowerCase() === "local") {
    const target = localPath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, typeof data === "string" ? Buffer.from(data) : Buffer.from(data));
    return { key, url: `/local-storage/${encodeURIComponent(key).replace(/%2F/g, "/")}` };
  }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!presignResp.ok) throw new Error(`Storage presign failed (${presignResp.status})`);
  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const uploadResp = await fetch(s3Url, { method: "PUT", headers: { "Content-Type": contentType }, body: new Blob([typeof data === "string" ? data : new Uint8Array(data)]) });
  if (!uploadResp.ok) throw new Error(`Storage upload failed (${uploadResp.status})`);
  return { key, url: `/manus-storage/${key}` };
}
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: ENV.storageProvider.toLowerCase() === "local" ? `/local-storage/${key}` : `/manus-storage/${key}` };
}
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  if (ENV.storageProvider.toLowerCase() === "local") return `/local-storage/${key}`;
  const { forgeUrl, forgeKey } = getForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!resp.ok) throw new Error(`Storage signed URL failed (${resp.status})`);
  const { url } = (await resp.json()) as { url: string };
  return url;
}
export async function readLocalStorage(key: string): Promise<Buffer> {
  return readFile(localPath(normalizeKey(key)));
}
