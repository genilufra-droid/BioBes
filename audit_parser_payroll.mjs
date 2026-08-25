import fs from "node:fs/promises";
import * as db from "./server/db.ts";
import { parseManualPresenceWorkbook } from "./client/src/lib/payrollManualImport.ts";
const buffer = await fs.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx");
const employees = await db.getPayrollEmployees(1);
const parsed = await parseManualPresenceWorkbook(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), employees, 31);
console.log(JSON.stringify({ count: parsed.payrollData.length, rows: parsed.payrollData.map(row => ({ number: row.employeeNumber, name: `${row.firstName} ${row.lastName}`, regular: row.regularRateCents, overtime: row.overtimeRateCents, base: row.baseSalaryCents, bank: row.bankPaymentCents, cash: row.cashPaymentCents })) }, null, 2));
process.exit(0);
