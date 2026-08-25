import XLSX from "xlsx";
import { parseListOfLogs } from "./client/src/lib/payrollLogParser";

const workbook = XLSX.readFile("/home/ubuntu/upload/001_2026_8_MON.XLS");
const rows = XLSX.utils.sheet_to_json(workbook.Sheets["Logs"], { header: 1, defval: "" }) as unknown[][];
const result = parseListOfLogs(rows);
console.log(JSON.stringify({
  year: result.year,
  month: result.month,
  blocks: result.blocks.length,
  first: result.blocks.slice(0, 8).map(block => ({ deviceId: block.deviceId, name: block.name, days: Object.keys(block.days).length, day1: block.days[1], day21: block.days[21] })),
  totalStampDays: result.blocks.reduce((sum, block) => sum + Object.keys(block.days).length, 0),
}, null, 2));
