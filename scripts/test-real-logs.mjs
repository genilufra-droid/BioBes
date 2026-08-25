import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { parseListOfLogs } from "../client/src/lib/payrollLogParser.ts";
import { calculateAttendanceDay } from "../client/src/lib/payrollAttendance.ts";

const source = "/home/ubuntu/upload/001_2026_7_MON.XLS";
const workbook = XLSX.read(readFileSync(source), { type: "buffer" });
const sheetName = workbook.SheetNames.find(name => name.trim().toLowerCase() === "logs");
if (!sheetName) throw new Error("Fleta Logs mungon në Excel-in real.");

const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
const parsed = parseListOfLogs(rows);
if (!parsed.blocks.length) throw new Error("Parseri nuk nxori punonjës nga Excel-i real.");

const stampCount = parsed.blocks.reduce((total, block) => total + Object.values(block.days).reduce((days, stamps) => days + stamps.length, 0), 0);
const shift = { code: "A", start: "07:00", end: "16:00", lunchMin: 60, opGrace: 30 };
const attendance = parsed.blocks.flatMap(block => Object.values(block.days).map(stamps => calculateAttendanceDay(stamps, shift)));
const summary = attendance.reduce((total, day) => ({ days: total.days + (day.grossMin > 0 ? 1 : 0), grossMin: total.grossMin + day.grossMin, workedMin: total.workedMin + day.workedMin, normalMinutes: total.normalMinutes + day.normalMinutes, overtimeMinutes: total.overtimeMinutes + day.overtimeMinutes, ambiguousLunchDays: total.ambiguousLunchDays + (day.assumedLunch ? 1 : 0) }), { days: 0, grossMin: 0, workedMin: 0, normalMinutes: 0, overtimeMinutes: 0, ambiguousLunchDays: 0 });
console.log(JSON.stringify({ sheetName, year: parsed.year, month: parsed.month, employees: parsed.blocks.length, stamps: stampCount, attendance: summary, first: parsed.blocks[0] }, null, 2));
