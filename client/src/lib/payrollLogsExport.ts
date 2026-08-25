import { exportToExcel, exportToPDF, type ExportColumn } from "@/lib/export";
import { printPayrollDocument } from "@/lib/payrollExport";
import type { ParsedDeviceLog } from "@/lib/payrollLogParser";

export type PayrollLogsExportRow = Record<string, string | number>;

const logTitle = (periodLabel: string) => `LOGS TË LEXUARA — ${periodLabel.toUpperCase()}`;

function rawMinutes(stamps: string[]) {
  const parse = (value: string) => { const [hours, minutes] = value.split(":").map(Number); return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null; };
  let minutes = 0;
  for (let index = 0; index + 1 < stamps.length; index += 2) {
    const start = parse(stamps[index]); const end = parse(stamps[index + 1]);
    if (start !== null && end !== null && end > start) minutes += end - start;
  }
  return minutes;
}

export function buildPayrollLogsExport(blocks: ParsedDeviceLog[], dayCount: number, year = 2026, month = 1) {
  const columns: ExportColumn<PayrollLogsExportRow>[] = [
    { key: "idPajisje", label: "ID" },
    { key: "emri", label: "EMRI" },
    ...Array.from({ length: dayCount }, (_, index) => ({ key: `dita${index + 1}`, label: String(index + 1) })),
    { key: "gjithsej", label: "GJITHSEJ" },
    { key: "normale", label: "NORMAL" },
    { key: "shtese", label: "SHTESË" },
  ];
  const dailyTotals = Array.from({ length: dayCount }, () => 0);
  const rows: PayrollLogsExportRow[] = blocks.map(block => {
    let total = 0; let normal = 0; let overtime = 0;
    const days = Array.from({ length: dayCount }, (_, index) => {
      const day = index + 1;
      const minutes = rawMinutes(block.days[day] || []);
      const sunday = new Date(year, month - 1, day).getDay() === 0;
      const cap = sunday ? 450 : 480;
      total += minutes; normal += Math.min(minutes, cap); overtime += Math.max(0, minutes - cap); dailyTotals[index] += minutes;
      return [`dita${day}`, minutes ? Math.round(minutes / 60) : ""] as const;
    });
    return {
      idPajisje: block.deviceId,
      emri: block.name,
      ...Object.fromEntries(days),
      gjithsej: Math.round(total / 60),
      normale: Math.round(normal / 60),
      shtese: overtime ? Math.round(overtime / 60) : "",
    };
  });
  const total = rows.reduce((sum, row) => sum + Number(row.gjithsej || 0), 0);
  const normal = rows.reduce((sum, row) => sum + Number(row.normale || 0), 0);
  const overtime = rows.reduce((sum, row) => sum + Number(row.shtese || 0), 0);
  const totals: PayrollLogsExportRow = { idPajisje: "", emri: "TOTALI DITËS", ...Object.fromEntries(dailyTotals.map((minutes, index) => [`dita${index + 1}`, minutes ? Math.round(minutes / 60) : ""])), gjithsej: total, normale: normal, shtese: overtime || "" };
  return { rows, totals, columns };
}

const excelOptions = (title: string) => ({ title, landscape: true, headerColor: "FFEAF0F7", titleColor: "FF17253D" });
const pdfOptions = { landscape: true, headerColor: [234, 240, 247] as [number, number, number], headerTextColor: [32, 55, 92] as [number, number, number], titleColor: [23, 37, 61] as [number, number, number], fontSize: 3.5, alternateRowColor: false as const };

export async function exportPayrollLogsExcel(rows: PayrollLogsExportRow[], totals: PayrollLogsExportRow, columns: ExportColumn<PayrollLogsExportRow>[], periodLabel: string) {
  await exportToExcel([...rows, totals], `Logs_Papunuar_${periodLabel}`, "Logs", columns, { ...excelOptions(logTitle(periodLabel)), columnWidths: [8, 22, ...Array.from({ length: columns.length - 5 }, () => 4), 9, 8, 8] });
}

export function exportPayrollLogsPdf(rows: PayrollLogsExportRow[], totals: PayrollLogsExportRow, columns: ExportColumn<PayrollLogsExportRow>[], periodLabel: string) {
  exportToPDF([...rows, totals], `Logs_Papunuar_${periodLabel}`, logTitle(periodLabel), columns, pdfOptions);
}

export function printPayrollLogs(rows: PayrollLogsExportRow[], totals: PayrollLogsExportRow, columns: ExportColumn<PayrollLogsExportRow>[], periodLabel: string) {
  printPayrollDocument(logTitle(periodLabel), columns.map(column => column.label), [...rows, totals], { fontSize: 4, compact: true });
}
