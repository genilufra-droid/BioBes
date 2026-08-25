import { exportToExcel, exportToPDF } from "@/lib/export";

import { roundedWholeHours } from "./payrollFormatting";

type ReconciliationEntry = {
  payrollEmployeeId: number;
  employeeNumber: string;
  normalMinutes: number;
  overtimeMinutes: number;
  grossCents: number;
  netCents: number;
  advanceCents: number;
  payableCents: number;
  paymentMethod: "BANK" | "CASH";
};

export type ReconciliationAttendance = {
  payrollEmployeeId: number;
  day: number;
  normalMinutes: number;
  overtimeMinutes: number;
};

export type ReconciliationEmployee = {
  id: number;
  employeeNumber: string;
  active: number;
  isForeign: number;
};

export type ReconciliationCheck = {
  id: number;
  kontrolli: string;
  burimi: string;
  rezultati: string;
  statusi: "OK" | "GABIM";
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const hours = (minutes: number) => String(roundedWholeHours(minutes));
const amount = (cents: number) => (cents / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const check = (id: number, kontrolli: string, burimi: string, expected: string, actual: string, ok: boolean): ReconciliationCheck => ({ id, kontrolli, burimi, rezultati: `${expected} / ${actual}`, statusi: ok ? "OK" : "GABIM" });

export function buildPayrollReconciliation(entries: ReconciliationEntry[], attendance: ReconciliationAttendance[], employees: ReconciliationEmployee[]): ReconciliationCheck[] {
  const presenceNormal = sum(attendance.map(row => row.normalMinutes));
  const borderoNormal = sum(entries.map(row => row.normalMinutes));
  const presenceOvertime = sum(attendance.map(row => row.overtimeMinutes));
  const borderoOvertime = sum(entries.map(row => row.overtimeMinutes));
  const activeEmployeeIds = new Set(employees.filter(employee => employee.active === 1).map(employee => employee.id));
  const bankEntries = entries.filter(entry => entry.paymentMethod === "BANK");
  const cashEntries = entries.filter(entry => entry.paymentMethod === "CASH");
  const bankTotal = sum(bankEntries.map(entry => entry.payableCents));
  const cashTotal = sum(cashEntries.map(entry => entry.payableCents));
  const payableTotal = sum(entries.map(entry => entry.payableCents));
  const foreignEmployeeIds = new Set(employees.filter(employee => employee.isForeign === 1).map(employee => employee.id));
  const foreignEntries = entries.filter(entry => foreignEmployeeIds.has(entry.payrollEmployeeId));
  const entryIds = entries.map(entry => entry.payrollEmployeeId);
  const entryNumbers = entries.map(entry => entry.employeeNumber);
  const attendanceKeys = attendance.map(row => `${row.payrollEmployeeId}-${row.day}`);
  const employeeAttendance = new Map<number, { normal: number; overtime: number }>();
  for (const row of attendance) {
    const total = employeeAttendance.get(row.payrollEmployeeId) || { normal: 0, overtime: 0 };
    total.normal += row.normalMinutes;
    total.overtime += row.overtimeMinutes;
    employeeAttendance.set(row.payrollEmployeeId, total);
  }
  const graceConsistent = entries.every(entry => {
    const source = employeeAttendance.get(entry.payrollEmployeeId) || { normal: 0, overtime: 0 };
    return Math.abs(source.normal - entry.normalMinutes) <= 30 && Math.abs(source.overtime - entry.overtimeMinutes) <= 30;
  });
  const dailyNormalValid = attendance.every(row => row.normalMinutes <= 8 * 60);
  const dailyPayableValid = attendance.every(row => row.normalMinutes + row.overtimeMinutes <= 24 * 60);
  const uniqueEntries = new Set(entryIds).size === entryIds.length && new Set(entryNumbers).size === entryNumbers.length;
  const uniqueAttendance = new Set(attendanceKeys).size === attendanceKeys.length;
  const activeRowsValid = entries.every(entry => activeEmployeeIds.has(entry.payrollEmployeeId));
  const payrollFormulaValid = entries.every(entry => entry.payableCents === Math.max(0, entry.netCents - entry.advanceCents));
  const nonNegative = entries.every(entry => entry.grossCents >= 0 && entry.netCents >= 0 && entry.payableCents >= 0);

  return [
    check(1, "Listëprezenca normale = Bordero normale", "Orë", hours(presenceNormal), hours(borderoNormal), presenceNormal === borderoNormal),
    check(2, "Listëprezenca shtesë = Bordero shtesë", "Orë", hours(presenceOvertime), hours(borderoOvertime), presenceOvertime === borderoOvertime),
    check(3, "Orët janë konsistente për çdo punonjës", "Devijim maksimal 30 min", "Brenda kufirit", graceConsistent ? "Brenda kufirit" : "Devijim", graceConsistent),
    check(4, "Nuk ka orë negative", "Listëprezenca", "≥ 0", attendance.every(row => row.normalMinutes >= 0 && row.overtimeMinutes >= 0) ? "≥ 0" : "< 0", attendance.every(row => row.normalMinutes >= 0 && row.overtimeMinutes >= 0)),
    check(5, "Për pagesë = Neto − Avans", "Fletëpagesat", "Formula", payrollFormulaValid ? "Formula" : "Mospërputhje", payrollFormulaValid),
    check(6, "Vlerat monetare janë jo-negative", "Bordero/Fletëpagesa", "≥ 0", nonNegative ? "≥ 0" : "< 0", nonNegative),
    check(7, "Për pagesë = Bankë + Cash", "Listëpagesat", amount(payableTotal), amount(bankTotal + cashTotal), payableTotal === bankTotal + cashTotal),
    check(8, "Lista Bankë = rreshtat BANK", "Bankë", amount(bankTotal), amount(sum(entries.filter(entry => entry.paymentMethod === "BANK").map(entry => entry.payableCents))), true),
    check(9, "Lista Cash = rreshtat CASH", "Cash", amount(cashTotal), amount(sum(entries.filter(entry => entry.paymentMethod === "CASH").map(entry => entry.payableCents))), true),
    check(10, "Të Huajt = punonjësit I huaj", "Regjistri", String(foreignEmployeeIds.size), String(foreignEntries.length), foreignEmployeeIds.size === foreignEntries.length),
    check(11, "Orët normale ditore ≤ 8", "Listëprezenca", "≤ 8", dailyNormalValid ? "≤ 8" : "> 8", dailyNormalValid),
    check(12, "Orët e pagueshme ditore ≤ 24", "Listëprezenca", "≤ 24", dailyPayableValid ? "≤ 24" : "> 24", dailyPayableValid),
    check(13, "Çdo rresht lidhet me punonjës aktiv pa dublikatë", "Regjistri/Bordero", "Po", activeRowsValid && uniqueEntries ? "Po" : "Jo", activeRowsValid && uniqueEntries),
    check(14, "Nuk ka dublikata ditore në Listëprezencë", "Listëprezenca", "Pa dublikata", uniqueAttendance ? "Pa dublikata" : "Dublikata", uniqueAttendance),
  ];
}

export function exportPayrollReconciliation(entries: ReconciliationEntry[], attendance: ReconciliationAttendance[], employees: ReconciliationEmployee[], periodLabel: string) {
  const rows = buildPayrollReconciliation(entries, attendance, employees);
  exportToExcel(rows, `Kontroll_Borderoje_${periodLabel}.xlsx`, "Kontroll Borderoje", ["id", "kontrolli", "burimi", "rezultati", "statusi"]);
}

export function exportPayrollReconciliationPdf(entries: ReconciliationEntry[], attendance: ReconciliationAttendance[], employees: ReconciliationEmployee[], periodLabel: string) {
  const rows = buildPayrollReconciliation(entries, attendance, employees);
  exportToPDF(rows, `Kontroll_Borderoje_${periodLabel}.pdf`, `KONTROLL BORDEROJE — ${periodLabel}`, [{ key: "id", label: "NR" }, { key: "kontrolli", label: "KONTROLLI" }, { key: "burimi", label: "BURIMI" }, { key: "rezultati", label: "REZULTATI" }, { key: "statusi", label: "STATUSI" }]);
}

export function printPayrollReconciliation(entries: ReconciliationEntry[], attendance: ReconciliationAttendance[], employees: ReconciliationEmployee[], periodLabel: string) {
  const rows = buildPayrollReconciliation(entries, attendance, employees);
  const body = rows.map(row => `<tr><td>${row.id}</td><td>${row.kontrolli}</td><td>${row.burimi}</td><td>${row.rezultati}</td><td>${row.statusi}</td></tr>`).join("");
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1100,height=800");
  if (!popup) return;
  popup.document.write(`<!doctype html><html lang="sq"><head><title>Kontroll Borderoje ${periodLabel}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#17253d}h1{text-align:center;font-size:18px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #b8c3d0;padding:6px;text-align:left}th{background:#eaf0f7;color:#20375c}td:first-child,td:last-child{text-align:center}.ok{color:#166534}.fail{color:#b91c1c}@page{size:A4 landscape;margin:10mm}</style></head><body><h1>KONTROLL BORDEROJE — ${periodLabel}</h1><table><thead><tr><th>NR</th><th>KONTROLLI</th><th>BURIMI</th><th>REZULTATI</th><th>STATUSI</th></tr></thead><tbody>${body}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}
