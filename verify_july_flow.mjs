import fs from "node:fs/promises";
import * as XLSX from "xlsx";
import { parseManualPresenceWorkbook } from "/home/ubuntu/sistemi-genit-cloud/client/src/lib/payrollManualImport.ts";
import * as db from "/home/ubuntu/sistemi-genit-cloud/server/db.ts";

const companyId = 1;
const userId = 1;
const workbookPath = "/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx";
const normalize = value => String(value ?? "").trim().toLocaleLowerCase("sq-AL").replace(/[^a-z0-9ëç]/gi, "");
const numeric = value => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  let text = String(value ?? "").trim().replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  if (!text) return 0;
  const comma = text.lastIndexOf(",");
  const dot = text.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) text = comma > dot ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  else if (comma >= 0) text = text.length - comma - 1 <= 2 ? text.replace(",", ".") : text.replace(/,/g, "");
  else if (dot >= 0 && text.length - dot - 1 === 3) text = text.replace(/\./g, "");
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
};
const rawFullName = (first, last) => `${first ?? ""} ${last ?? ""}`.trim();
const fullName = (first, last) => normalize(rawFullName(first, last));
const samePerson = (left, right) => {
  const nameTokens = value => String(value ?? "").toLocaleLowerCase("sq-AL").replace(/[^a-z0-9ëç\s]/gi, "").split(/\s+/).filter(Boolean);
  const leftParts = nameTokens(left);
  const rightParts = nameTokens(right);
  if (leftParts.length < 2 || rightParts.length < 2) return nameTokens(left).join("") === nameTokens(right).join("");
  return leftParts[0] === rightParts[0] && (leftParts[1] === rightParts[1] || leftParts[1].slice(0, 4) === rightParts[1].slice(0, 4));
};

const buffer = await fs.readFile(workbookPath);
const employeesBefore = await db.getPayrollEmployees(companyId);
const parsed = await parseManualPresenceWorkbook(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), employeesBefore, 31);
const resolved = [...employeesBefore];
const byNumber = new Map(resolved.map(employee => [normalize(employee.employeeNumber), employee]));
const byName = new Map(resolved.map(employee => [fullName(employee.firstName, employee.lastName || ""), employee]));
let createdFromHours = 0;
let createdFromPayroll = 0;

for (const employee of parsed.newEmployees) {
  try {
    const created = await db.createPayrollEmployee({ companyId, employeeNumber: employee.employeeNumber, firstName: employee.firstName, lastName: employee.lastName || undefined, regularRateCents: 0, overtimeRateCents: 0, baseSalaryCents: 0, advanceCents: 0, paymentMethod: "BANK", isForeign: 0, shiftCode: "A", dailyRateCents: 0, active: 1 });
    resolved.push(created);
    byNumber.set(normalize(created.employeeNumber), created);
    byName.set(fullName(created.firstName, created.lastName || ""), created);
    createdFromHours += 1;
  } catch {
    // Existing employee numbers remain protected from duplicates.
  }
}

const payrollOnly = parsed.payrollData.filter(data => !byName.has(fullName(data.firstName, data.lastName)) && !byNumber.has(normalize(data.employeeNumber)));
for (const employee of payrollOnly) {
  try {
    const created = await db.createPayrollEmployee({ companyId, employeeNumber: employee.employeeNumber, firstName: employee.firstName || "Punonjës", lastName: employee.lastName || undefined, regularRateCents: 0, overtimeRateCents: 0, baseSalaryCents: 0, advanceCents: 0, paymentMethod: employee.paymentMethod, isForeign: 0, shiftCode: "A", dailyRateCents: 0, active: 1 });
    resolved.push(created);
    byNumber.set(normalize(created.employeeNumber), created);
    byName.set(fullName(created.firstName, created.lastName || ""), created);
    createdFromPayroll += 1;
  } catch {
    // Duplicate number is intentionally not created.
  }
}

const payrollNameKeys = new Set(parsed.payrollData.map(data => fullName(data.firstName, data.lastName)));
const foreignEmployeeIds = new Set();
for (const presenceEmployee of parsed.presenceEmployees || []) {
  const presenceName = rawFullName(presenceEmployee.firstName, presenceEmployee.lastName);
  const presenceKey = fullName(presenceEmployee.firstName, presenceEmployee.lastName);
  const employee = byName.get(presenceKey) || byNumber.get(normalize(presenceEmployee.employeeNumber));
  const hasPayrollName = payrollNameKeys.has(presenceKey) || parsed.payrollData.some(data => samePerson(presenceName, rawFullName(data.firstName, data.lastName)));
  if (employee && !hasPayrollName) foreignEmployeeIds.add(employee.id);
}
const importedRows = parsed.payrollData.flatMap(data => {
  const employee = byName.get(fullName(data.firstName, data.lastName)) || byNumber.get(normalize(data.employeeNumber));
  if (!employee) return [];
  return [{ id: employee.id, regularRateCents: data.regularRateCents, overtimeRateCents: data.overtimeRateCents, baseSalaryCents: data.baseSalaryCents, bankPaymentCents: data.bankPaymentCents, cashPaymentCents: data.cashPaymentCents, paymentMethod: data.paymentMethod, isForeign: 0 }];
});
const foreignRows = Array.from(foreignEmployeeIds).flatMap(id => {
  const employee = resolved.find(row => row.id === id);
  if (!employee) return [];
  return [{ id: employee.id, regularRateCents: employee.regularRateCents || 0, overtimeRateCents: employee.overtimeRateCents || 0, baseSalaryCents: employee.baseSalaryCents || 0, bankPaymentCents: employee.bankPaymentCents || 0, cashPaymentCents: employee.cashPaymentCents || 0, paymentMethod: employee.paymentMethod, isForeign: 1 }];
});
const costUpdate = await db.updatePayrollEmployeeImportData(companyId, [...importedRows, ...foreignRows]);
const period = (await db.getPayrollPeriods(companyId)).find(item => item.year === 2026 && item.month === 7);
if (!period) throw new Error("Periudha Korrik 2026 nuk u gjet.");
await db.generatePayrollPeriod(period.id, userId);
const entries = await db.getPayrollEntries(period.id);

const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
const payrollSheetName = workbook.SheetNames.find(name => normalize(name).replace(/ë/g, "e").includes("pagatkorrik"));
const payrollMatrix = XLSX.utils.sheet_to_json(workbook.Sheets[payrollSheetName], { header: 1, raw: false, defval: "" });
const sourceRows = payrollMatrix.slice(2).filter(row => row?.[0] && !/total/i.test(String(row?.[0]))).map(row => ({ number: normalize(row[0]), name: fullName(row[1], row[2]), grossCents: Math.round(numeric(row[11]) * 100), bankPaymentCents: Math.round(numeric(row[12]) * 100), cashPaymentCents: Math.round(numeric(row[13]) * 100), normalHours: numeric(row[3]), overtimeHours: numeric(row[6]) }));
const entryByName = new Map(entries.map(entry => [normalize(entry.employeeName), entry]));
const entryByNumber = new Map(entries.map(entry => [normalize(entry.employeeNumber), entry]));
const comparisons = sourceRows.map(source => {
  const entry = entryByName.get(source.name) || entryByNumber.get(normalize(source.number));
  return { name: source.name, found: Boolean(entry), grossMatch: Boolean(entry && entry.grossCents === source.grossCents), bankMatch: Boolean(entry && entry.bankPaymentCents === source.bankPaymentCents), cashMatch: Boolean(entry && entry.cashPaymentCents === source.cashPaymentCents), expected: source, actual: entry ? { grossCents: entry.grossCents, bankPaymentCents: entry.bankPaymentCents, cashPaymentCents: entry.cashPaymentCents, normalMinutes: entry.normalMinutes, overtimeMinutes: entry.overtimeMinutes } : null };
});
const kastriot = comparisons.find(row => row.name.includes("kastriot"));
const sum = key => rows => rows.reduce((total, row) => total + (row[key] || 0), 0);
const sourceTotals = { employees: sourceRows.length, grossCents: sum("grossCents")(sourceRows), bankPaymentCents: sum("bankPaymentCents")(sourceRows), cashPaymentCents: sum("cashPaymentCents")(sourceRows), normalHours: sum("normalHours")(sourceRows), overtimeHours: sum("overtimeHours")(sourceRows) };
const regularEntries = entries.filter(entry => !foreignEmployeeIds.has(entry.payrollEmployeeId));
const actualTotals = { entries: regularEntries.length, grossCents: sum("grossCents")(regularEntries), bankPaymentCents: sum("bankPaymentCents")(regularEntries), cashPaymentCents: sum("cashPaymentCents")(regularEntries), normalHours: sum("normalMinutes")(regularEntries) / 60, overtimeHours: sum("overtimeMinutes")(regularEntries) / 60 };
const foreignEntryCount = entries.filter(entry => foreignEmployeeIds.has(entry.payrollEmployeeId)).length;
const evidence = { workbookPath, period: { id: period.id, year: period.year, month: period.month, currency: period.currency, status: period.status }, import: { sheetName: parsed.sheetName, importedCells: parsed.importedCells, matchedEmployees: parsed.matchedEmployees, payrollRows: parsed.payrollData.length, createdFromHours, createdFromPayroll, costUpdate, errors: parsed.errors }, sourceTotals, actualTotals, comparison: { found: comparisons.filter(row => row.found).length, grossMatches: comparisons.filter(row => row.grossMatch).length, bankMatches: comparisons.filter(row => row.bankMatch).length, cashMatches: comparisons.filter(row => row.cashMatch).length, allRowsMatch: comparisons.length === sourceRows.length && comparisons.every(row => row.found && row.grossMatch && row.bankMatch && row.cashMatch) }, kastriot, foreignEntryCount, employeeCountAfter: (await db.getPayrollEmployees(companyId)).length };
await fs.writeFile("/home/ubuntu/sistemi-genit-cloud/korrik-2026-flow-result.json", JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
process.exit(0);
