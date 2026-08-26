const base = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const secret = process.env.LOCAL_AUTH_SETUP_SECRET || "ci-only-setup-secret-change-me";
const owner = { email: `ci-owner-${Date.now()}@example.com`, password: "ci-owner-password-long", name: "CI Owner", companyName: "CI Company" };
let cookie = "";
function captureCookie(response) {
  const value = response.headers.get("set-cookie");
  if (value) cookie = value.split(";")[0];
}
async function jsonRequest(path, options = {}) {
  const response = await fetch(`${base}${path}`, { ...options, headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}), ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  captureCookie(response);
  if (!response.ok) throw new Error(`${path} HTTP ${response.status}: ${JSON.stringify(body)}`);
  return body;
}
const bootstrap = await jsonRequest("/api/local-auth/bootstrap", { method: "POST", headers: { "x-local-auth-setup-secret": secret }, body: JSON.stringify(owner) });
if (bootstrap.ok !== true || !bootstrap.companyId) throw new Error(`bootstrap did not return companyId: ${JSON.stringify(bootstrap)}`);
const loginResponse = await fetch(`${base}/api/local-auth/login`, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(owner) });
if (!loginResponse.ok) throw new Error(`login HTTP ${loginResponse.status}: ${await loginResponse.text()}`);
captureCookie(loginResponse);
const companyId = Number(bootstrap.companyId);
const input = { companyId, docNumber: `CI-${Date.now()}`, date: new Date().toISOString(), customerName: "CI Customer", warehouseId: 1, currency: "ALL", items: [], vatAmount: 0 };
const trpcResponse = await fetch(`${base}/api/trpc/salesInvoice.create?batch=1`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ 0: { json: input } }) });
const trpcBody = await trpcResponse.json().catch(() => ({}));
if (!trpcResponse.ok || trpcBody[0]?.error) throw new Error(`salesInvoice.create failed HTTP ${trpcResponse.status}: ${JSON.stringify(trpcBody)}`);
console.log(JSON.stringify({ bootstrap: 201, login: 200, salesInvoice: "created", companyId }));
