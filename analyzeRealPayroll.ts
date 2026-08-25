import XLSX from "xlsx";
import { parseListOfLogs } from "./client/src/lib/payrollLogParser";
import { calculateAttendanceDay } from "./client/src/lib/payrollAttendance";

const workbook = XLSX.readFile("/home/ubuntu/upload/001_2026_8_MON.XLS");
const rows = XLSX.utils.sheet_to_json(workbook.Sheets["Logs"], { header: 1, defval: "" }) as unknown[][];
const parsed = parseListOfLogs(rows);
const shift = { code: "A", start: "07:00", end: "16:00", lunchMin: 60, opGrace: 30 };
let normalMinutes = 0;
let overtimeMinutes = 0;
let grossMinutes = 0;
let singleStampDays = 0;
let workDays = 0;
const samples: unknown[] = [];
for (const block of parsed.blocks) {
  for (const [dayText, stamps] of Object.entries(block.days)) {
    const result = calculateAttendanceDay(stamps, shift);
    if (result.normalMinutes || result.overtimeMinutes) workDays++;
    if (stamps.length === 1) singleStampDays++;
    normalMinutes += result.normalMinutes;
    overtimeMinutes += result.overtimeMinutes;
    grossMinutes += result.grossMin;
    if (samples.length < 12 && (block.deviceId === "2" || block.deviceId === "6" || block.deviceId === "9")) {
      samples.push({ id: block.deviceId, name: block.name, day: dayText, stamps, grossMin: result.grossMin, lunchMin: result.lunchMin, normalHours: result.normalHours, overtimeHours: result.overtimeHours });
    }
  }
}
console.log(JSON.stringify({ period: `${parsed.month}/${parsed.year}`, employees: parsed.blocks.length, workDays, singleStampDays, totalGrossHours: Math.round(grossMinutes / 60), totalNormalHours: Math.round(normalMinutes / 60), totalOvertimeHours: Math.round(overtimeMinutes / 60), samples }, null, 2));
