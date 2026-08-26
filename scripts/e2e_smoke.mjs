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
async function trpcMutation(name, input, meta) {
  const response = await fetch(`${base}/api/trpc/${name}?batch=1`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ 0: { json: input, ...(meta ? { meta } : {}) } }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body[0]?.error) throw new Error(`${name} HTTP ${response.status}: ${JSON.stringify(body)}`);
  return body[0]?.result?.data?.json ?? body[0]?.result?.data;
}
const bootstrap = await jsonRequest("/api/local-auth/bootstrap", { method: "POST", headers: { "x-local-auth-setup-secret": secret }, body: JSON.stringify(owner) });
if (bootstrap.ok !== true || !bootstrap.companyId) throw new Error(`bootstrap did not return companyId: ${JSON.stringify(bootstrap)}`);
const loginResponse = await fetch(`${base}/api/local-auth/login`, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(owner) });
if (!loginResponse.ok) throw new Error(`login HTTP ${loginResponse.status}: ${await loginResponse.text()}`);
captureCookie(loginResponse);
const companyId = Number(bootstrap.companyId);
const warehouse = await trpcMutation("warehouse.create", { companyId, name: "CI Warehouse", code: `CI-${Date.now()}`, unitType: "WAREHOUSE", active: 1, inventoryMethod: "CONTINUOUS", supplyPointOfSale: 0, allowNegativeStock: 1 });
const warehouseId = Number(warehouse?.id);
if (!warehouseId) throw new Error(`warehouse.create did not return id: ${JSON.stringify(warehouse)}`);
const input = { companyId, docNumber: `CI-${Date.now()}`, date: new Date().toISOString(), customerName: "CI Customer", warehouseId, currency: "ALL", items: [], vatAmount: 0 };
await trpcMutation("salesInvoice.create", input, { values: { date: ["Date"] } });
console.log(JSON.stringify({ bootstrap: 201, login: 200, warehouse: 201, salesInvoice: "created", companyId, warehouseId }));
