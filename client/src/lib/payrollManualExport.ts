import { exportToExcel, type ExportColumn } from "@/lib/export";
import { printPayrollDocument } from "@/lib/payrollExport";
import { roundedWholeHours } from "@/lib/payrollFormatting";
import { payrollPresenceTotals } from "@/lib/payrollPresence";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ManualPeriod = { year: number; month: number };
type ExportOptions = { filterQuery?: string; sortBy?: "name" | "number" };
type LegendCode = { code: string; label: string };

function manualValue(rec?: { attendanceCode?: string | null; normalMinutes?: number | null; overtimeMinutes?: number | null }) {
  if (!rec) return "";
  if (rec.attendanceCode && rec.attendanceCode !== "8") return rec.attendanceCode;
  const normal = roundedWholeHours(rec.normalMinutes || 0);
  const overtime = roundedWholeHours(rec.overtimeMinutes || 0);
  return normal || overtime ? `${normal}${overtime ? `\n${overtime}` : ""}` : "";
}

const countLegendCodes = (rows: any[], legendCodes: LegendCode[]) => {
  const counts = Object.fromEntries(legendCodes.map(item => [item.code, 0])) as Record<string, number>;
  rows.forEach(row => { const code = row.attendanceCode && row.attendanceCode !== "8" ? row.attendanceCode : ""; if (code && counts[code] !== undefined) counts[code] += 1; });
  return counts;
};

function prepareFilteredEmployees(employees: any[], options?: ExportOptions) {
  let list = [...employees];
  if (options?.filterQuery) {
    const q = options.filterQuery.trim().toLowerCase();
    list = list.filter(emp => `${emp.employeeNumber} ${emp.firstName} ${emp.lastName || ""}`.toLowerCase().includes(q));
  }
  if (options?.sortBy === "name") {
    list.sort((a, b) => `${a.firstName} ${a.lastName || ""}`.localeCompare(`${b.firstName} ${b.lastName || ""}`));
  } else {
    list.sort((a, b) => Number(a.employeeNumber || 0) - Number(b.employeeNumber || 0));
  }
  return list;
}

export function buildManualPresencePdfData(employees: any[], attendance: any[], period: ManualPeriod, options?: ExportOptions, legendCodes: LegendCode[] = []) {
  const filtered = prepareFilteredEmployees(employees, options);
  const days = new Date(period.year, period.month, 0).getDate();
  const records = new Map(attendance.map(row => [`${row.payrollEmployeeId}-${row.day}`, row]));
  const headers = ["Nr.", "Emër Mbiemër", ...Array.from({ length: days }, (_, index) => String(index + 1)), "O.Bruto", "O.Pagesë", "Normale", "Shtesë", ...legendCodes.map(item => item.code), "Total orë"];
  let totalGross = 0;
  let totalPayable = 0;
  let totalNormal = 0;
  let totalOvertime = 0;
  const legendTotals = Object.fromEntries(legendCodes.map(item => [item.code, 0])) as Record<string, number>;
  const body = filtered.map(employee => {
    const employeeRows = attendance.filter(row => row.payrollEmployeeId === employee.id);
    const totals = payrollPresenceTotals(employeeRows);
    const codeCounts = countLegendCodes(employeeRows, legendCodes);
    totalGross += totals.grossMinutes;
    totalPayable += totals.payableMinutes;
    totalNormal += totals.normalMinutes;
    totalOvertime += totals.overtimeMinutes;
    legendCodes.forEach(item => { legendTotals[item.code] += codeCounts[item.code] || 0; });
    return [
      String(employee.employeeNumber),
      `${employee.firstName} ${employee.lastName || ""}`.trim(),
      ...Array.from({ length: days }, (_, index) => manualValue(records.get(`${employee.id}-${index + 1}`))),
      roundedWholeHours(totals.grossMinutes),
      roundedWholeHours(totals.payableMinutes),
      roundedWholeHours(totals.normalMinutes),
      roundedWholeHours(totals.overtimeMinutes),
      ...legendCodes.map(item => codeCounts[item.code] || 0),
      roundedWholeHours(totals.payableMinutes + totals.overtimeMinutes),
    ];
  });
  return { days, headers, body, totalEmployees: filtered.length, totalHours: totalPayable / 60, totalGross, totalPayable, totalNormal, totalOvertime, legendTotals };
}

export function exportManualPresenceExcel(employees: any[], attendance: any[], period: ManualPeriod, options?: ExportOptions, legendCodes: LegendCode[] = []) {
  const filtered = prepareFilteredEmployees(employees, options);
  const days = new Date(period.year, period.month, 0).getDate();
  const records = new Map(attendance.map(row => [`${row.payrollEmployeeId}-${row.day}`, row]));

  const columns: ExportColumn<any>[] = [
    { key: "nr", label: "NR" },
    { key: "punonjesi", label: "PUNONJËSI" },
    ...Array.from({ length: days }, (_, index) => ({ key: `dita${index + 1}`, label: String(index + 1) })),
    { key: "obruto", label: "O.Bruto" },
    { key: "opag", label: "O.Pagesë" },
    { key: "onor", label: "Normale" },
    { key: "osht", label: "Shtesë" },
    ...legendCodes.map(item => ({ key: `legend_${item.code}`, label: item.code })),
    { key: "total", label: "Total orë" },
  ];

  const rows = filtered.map(employee => {
    const rowObj: Record<string, any> = {
      nr: employee.employeeNumber,
      punonjesi: `${employee.firstName} ${employee.lastName || ""}`.trim(),
    };
    const employeeRows = attendance.filter(row => row.payrollEmployeeId === employee.id);
    const totals = payrollPresenceTotals(employeeRows);
    for (let day = 1; day <= days; day++) {
      rowObj[`dita${day}`] = manualValue(records.get(`${employee.id}-${day}`));
    }
    rowObj["obruto"] = roundedWholeHours(totals.grossMinutes);
    rowObj["opag"] = roundedWholeHours(totals.payableMinutes);
    rowObj["onor"] = roundedWholeHours(totals.normalMinutes);
    rowObj["osht"] = roundedWholeHours(totals.overtimeMinutes);
    const codeCounts = countLegendCodes(employeeRows, legendCodes);
    legendCodes.forEach(item => { rowObj[`legend_${item.code}`] = codeCounts[item.code] || 0; });
    rowObj["total"] = roundedWholeHours(totals.payableMinutes + totals.overtimeMinutes);
    return rowObj;
  });

  const title = `LISTËPREZENCA MANUALE — ${period.month}/${period.year}`;
  void exportToExcel(rows, `Listeprezence_Manuale_${period.year}_${String(period.month).padStart(2, "0")}`, "Prezenca", columns, {
    title,
    landscape: true,
    headerColor: "FFEAF0F7",
    titleColor: "FF17253D",
    columnWidths: [8, 24, ...Array.from({ length: days }, () => 4), 10, 10, 10, 10, ...legendCodes.map(() => 8), 10],
  });
}

export function exportManualPresencePdf(employees: any[], attendance: any[], period: ManualPeriod, options?: ExportOptions, legendCodes: LegendCode[] = []) {
  const { headers, body, totalEmployees, totalGross, totalPayable, totalNormal, totalOvertime, legendTotals } = buildManualPresencePdfData(employees, attendance, period, options, legendCodes);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(12);
  doc.text(`LISTËPREZENCA MANUALE — ${period.month}/${period.year}`, 14, 15);
  autoTable(doc, {
    head: [headers],
    body,
    startY: 22,
    theme: "grid",
    styles: { fontSize: 4.5, cellPadding: 0.8, halign: "center" },
    columnStyles: { 0: { cellWidth: 9, halign: "center" }, 1: { cellWidth: 31, halign: "left" } },
    headStyles: { fillColor: [217, 232, 213], textColor: [32, 55, 92], fontStyle: "bold" },
    didDrawPage: data => { doc.setFontSize(8); doc.text(`Faqja ${data.pageNumber}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10); },
  });
  let finalY = (doc as any).lastAutoTable?.finalY || 150;
  if (finalY > doc.internal.pageSize.getHeight() - 30) { doc.addPage(); finalY = 15; }
  doc.setFontSize(7);
  doc.text(`Përmbledhje: ${totalEmployees} punonjës | O.Bruto: ${roundedWholeHours(totalGross)} | O.Pagesë: ${roundedWholeHours(totalPayable)} | Normale: ${roundedWholeHours(totalNormal)} | Shtesë: ${roundedWholeHours(totalOvertime)}`, 14, finalY + 8);
  doc.text(`Legjenda: ${legendCodes.map(item => `${item.code}=${item.label} (${legendTotals[item.code] || 0})`).join(" · ") || "pa kode"}`, 14, finalY + 14);
  doc.save(`Listeprezence_Manuale_${period.year}_${String(period.month).padStart(2, "0")}.pdf`);
}

export function printManualPresence(employees: any[], attendance: any[], period: ManualPeriod, options?: ExportOptions, legendCodes: LegendCode[] = []) {
  const { headers, body, totalEmployees } = buildManualPresencePdfData(employees, attendance, period, options, legendCodes);
  const rows = body.map(values => Object.fromEntries(values.map((value, index) => [String(index), value])));
  printPayrollDocument(`LISTËPREZENCA MANUALE — ${period.month}/${period.year} (Punonjës: ${totalEmployees})`, headers, rows, { fontSize: 5, compact: true });
}
