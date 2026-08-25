import { readFileSync } from "node:fs";
const source = readFileSync("client/src/pages/SalesInvoices.tsx", "utf8");
const line = source.split("\n").find((value) => value.includes("form=\"sales-invoice-create-form\""));
console.log(line ?? "toolbar line not found");
