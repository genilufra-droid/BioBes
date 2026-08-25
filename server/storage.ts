import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string): string {
  const normalized = relKey.replace(/^\/+/, "");
  if (!normalized || normalized.split("/").some(part => !part || part === "." || part === "..")) throw new Error("Invalid storage key");
  return normalized;
}
function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
function localPath(key: string): string {
  const root = path.resolve(ENV.localStorageDir);
  const target = path.resolve(root, key);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error("Invalid storage path");
  return target;
}
function s3Client() {
  if (!ENV.s3AccessKeyId || !ENV.s3SecretAccessKey || !ENV.s3Bucket) throw new Error("S3 config missing: set S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY");
  return new S3Client({ region: ENV.s3Region, endpoint: ENV.s3Endpoint, forcePathStyle: ENV.s3ForcePathStyle, credentials: { accessKeyId: ENV.s3AccessKeyId, secretAccessKey: ENV.s3SecretAccessKey } });
}
function getForgeConfig() {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) throw new Error("Storage config missing: configure STORAGE_PROVIDER=local/s3 or Forge credentials");
  return { forgeUrl: ENV.forgeApiUrl.replace(/\/+$/, ""), forgeKey: ENV.forgeApiKey };
}
function publicPath(prefix: string, key: string) { return `/${prefix}/${key.split("/").map(encodeURIComponent).join("/")}`; }
export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream"): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const provider = ENV.storageProvider.toLowerCase();
  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  if (provider === "local") { const target = localPath(key); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, body); return { key, url: publicPath("local-storage", key) }; }
  if (provider === "s3") { await s3Client().send(new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key, Body: body, ContentType: contentType })); return { key, url: publicPath("s3-storage", key) }; }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/"); presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!presignResp.ok) throw new Error(`Storage presign failed (${presignResp.status})`);
  const { url: s3Url } = (await presignResp.json()) as { url: string }; if (!s3Url) throw new Error("Forge returned empty presign URL");
  const uploadResp = await fetch(s3Url, { method: "PUT", headers: { "Content-Type": contentType }, body }); if (!uploadResp.ok) throw new Error(`Storage upload failed (${uploadResp.status})`);
  return { key, url: publicPath("manus-storage", key) };
}
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey); const provider = ENV.storageProvider.toLowerCase();
  return { key, url: publicPath(provider === "local" ? "local-storage" : provider === "s3" ? "s3-storage" : "manus-storage", key) };
}
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey); const provider = ENV.storageProvider.toLowerCase();
  if (provider === "local") return publicPath("local-storage", key);
  if (provider === "s3") return getSignedUrl(s3Client(), new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }), { expiresIn: 900 });
  const { forgeUrl, forgeKey } = getForgeConfig(); const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/"); getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } }); if (!resp.ok) throw new Error(`Storage signed URL failed (${resp.status})`); const { url } = (await resp.json()) as { url: string }; if (!url) throw new Error("Empty signed URL from backend"); return url;
}
export async function readLocalStorage(key: string): Promise<Buffer> { return readFile(localPath(normalizeKey(key))); }
