import fs from "node:fs";
import http from "node:http";

const targetUrl = "http://127.0.0.1:9222/json/list";
const filePath = "/home/ubuntu/upload/001_2026_8_MON-1.XLS";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function getTarget() {
  return new Promise((resolve, reject) => {
    http.get(targetUrl, response => {
      let data = "";
      response.on("data", chunk => data += chunk);
      response.on("end", () => {
        const pages = JSON.parse(data);
        resolve(pages.find(page => page.type === "page" && page.url.includes("/payroll")) || pages.find(page => page.type === "page"));
      });
    }).on("error", reject);
  });
}

const target = await getTarget();
if (!target?.webSocketDebuggerUrl) throw new Error("Nuk u gjet tab-i i Pagave.");
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
ws.addEventListener("message", event => {
  const message = JSON.parse(String(event.data));
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, response => response.error ? reject(new Error(JSON.stringify(response.error))) : resolve(response.result));
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression, returnByValue = true) {
  const result = await command("Runtime.evaluate", { expression, returnByValue, awaitPromise: true });
  return result.result?.value;
}
await command("Page.bringToFront");
await command("DOM.enable");
await command("Runtime.enable");
await sleep(1200);
const before = await evaluate(`({url: location.href, title: document.title, body: document.body.innerText.slice(0, 5000), inputs: [...document.querySelectorAll('input[type=file]')].length})`);
const root = await command("DOM.getDocument", { depth: -1 });
const node = await command("DOM.querySelector", { nodeId: root.root.nodeId, selector: "input[type=file]" });
if (!node.nodeId) throw new Error("Nuk u gjet input-i i skedarit.");
await command("DOM.setFileInputFiles", { nodeId: node.nodeId, files: [filePath] });
await sleep(2500);
const after = await evaluate(`({url: location.href, body: document.body.innerText.slice(0, 9000)})`);
fs.writeFileSync("/home/ubuntu/payroll_log_browser_test.json", JSON.stringify({ before, after, filePath }, null, 2));
console.log(JSON.stringify({ before: { url: before.url, inputs: before.inputs }, after: { url: after.url, body: after.body } }, null, 2));
ws.close();
