import fs from "node:fs/promises";
import * as XLSX from "xlsx";
import { parseManualPresenceWorkbook } from "./client/src/lib/payrollManualImport";

const file = await fs.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx");
const workbook = XLSX.read(file, { type: "buffer", raw: false });
const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets["ORET E PUNES"], { header: 1, raw: false, defval: "" });
const employees = matrix.slice(3).filter(row => row[0] && row[1]).map((row, index) => ({
  id: index + 1,
  employeeNumber: String(row[0]),
  firstName: String(row[1]),
  lastName: String(row[2] || ""),
}));
const result = await parseManualPresenceWorkbook(file, employees, 31);
const sample = Object.entries(result.values).slice(0, 8);
console.log(JSON.stringify({ sheetName: result.sheetName, headerRow: result.headerRow, matchedEmployees: result.matchedEmployees, importedCells: result.importedCells, skippedRows: result.skippedRows, errors: result.errors.length, sample }, null, 2));
if (result.sheetName !== "ORET E PUNES") throw new Error("Sheet-i i orëve nuk u zgjodh.");
if (result.matchedEmployees !== employees.length) throw new Error(`Punonjësit e lidhur: ${result.matchedEmployees}/${employees.length}`);
if (result.importedCells < 1000) throw new Error(`Qeliza të importuara më pak se pritej: ${result.importedCells}`);
if (result.errors.length) throw new Error(`U gjetën gabime: ${result.errors.join(" | ")}`);
