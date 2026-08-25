import * as XLSX from "xlsx";
import fs from "node:fs/promises";
import { validatePayrollTemplate } from "./client/src/lib/payrollTemplateContract.ts";

const templatePath = "./Template_Pagat_Prezenca_Genit_v511.xlsx";
const validBuffer = await fs.readFile(templatePath);
const valid = validatePayrollTemplate(validBuffer.buffer.slice(validBuffer.byteOffset, validBuffer.byteOffset + validBuffer.byteLength), 30);
if (!valid.valid) throw new Error(`Template-i zyrtar u refuzua: ${JSON.stringify(valid.issues)}`);
if (valid.hoursRows !== 2 || valid.payrollRows !== 2) throw new Error(`Numër i papritur rreshtash: ${JSON.stringify(valid)}`);

const workbook = XLSX.read(validBuffer, { type: "buffer" });
const payroll = workbook.Sheets["PAGAT QERSHOR 2026"];
payroll["E3"] = { t: "s", v: "€200" };
const invalidBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
const invalid = validatePayrollTemplate(invalidBuffer.buffer.slice(invalidBuffer.byteOffset, invalidBuffer.byteOffset + invalidBuffer.byteLength), 30);
if (invalid.valid || !invalid.issues.some(issue => issue.message.includes("Vlerë monetare"))) {
  throw new Error(`Skedari me EUR nuk u refuzua: ${JSON.stringify(invalid)}`);
}

console.log(JSON.stringify({ validTemplate: valid, rejectedCurrencyValue: invalid.issues[0] }, null, 2));
