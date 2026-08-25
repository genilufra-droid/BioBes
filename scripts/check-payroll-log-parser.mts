import { parsePayrollLogSheet } from "../client/src/lib/payrollLogParser";

const row = ["No :", 2, "Name :", "ardian", "Dept :", "Unset"];
const normalized = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
console.log(row.map(value => ({ value, marker: normalized(value).replace(/:/g, "").trim() })));
console.log(JSON.stringify(parsePayrollLogSheet([
  ["List of Logs"],
  ["Period : 2026/07/01 ~ 07/31"],
  row,
  ["", "07:12\n17:04", "08:00\n16:26", "06:58\n16:04"],
  ["", 1, 2, 3],
])));
