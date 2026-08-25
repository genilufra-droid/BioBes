import * as XLSX from "xlsx";

export type ParsedDeviceLog = {
  deviceId: string;
  name: string;
  department: string;
  days: Record<number, string[]>;
};

export type ParsedPayrollLogs = { year?: number; month?: number; blocks: ParsedDeviceLog[] };

const cell = (value: unknown) => String(value ?? "").trim();
const normalized = (value: unknown) => cell(value).toLowerCase().replace(/:/g, "").trim();

function nextContentRow(rows: unknown[][], start: number) {
  for (let index = start; index < rows.length; index += 1) if (rows[index].some(value => cell(value))) return rows[index];
  return [] as unknown[];
}

function dayColumns(row: unknown[]) {
  const entries = row.map((value, column) => ({ column, day: Number(cell(value)) })).filter(entry => Number.isInteger(entry.day) && entry.day >= 1 && entry.day <= 31);
  if (entries.length < 5 || !entries.slice(0, 5).every((entry, index) => entry.day === entries[0].day + index)) return null;
  return Object.fromEntries(entries.map(entry => [entry.column, entry.day])) as Record<number, number>;
}

function nextValue(row: unknown[], label: string) {
  const index = row.findIndex(value => normalized(value) === label);
  if (index < 0) return "";
  return row.slice(index + 1).map(cell).find(Boolean) || "";
}

function employeeInfo(row: unknown[]) {
  const deviceId = nextValue(row, "no");
  const name = nextValue(row, "name");
  if (deviceId && name) return { deviceId, name, department: nextValue(row, "dept") || "Unset" };

  const joined = row.map(cell).filter(Boolean).join(" ");
  const inline = joined.match(/\bno\s*:?\s*([\w-]+)\s+name\s*:?\s*(.*?)\s+dept\s*:?\s*(.*?)\s*$/i);
  if (!inline) return null;
  return { deviceId: inline[1].trim(), name: inline[2].trim(), department: inline[3].trim() || "Unset" };
}

export function parseListOfLogs(rows: unknown[][]): ParsedPayrollLogs {
  const periodText = rows.slice(0, 5).flat().map(cell).join(" ");
  const period = periodText.match(/(20\d{2})\s*[/-]\s*(\d{1,2})\s*[/-]\s*\d{1,2}/);
  let nearestHeader: Record<number, number> | null = null;
  const blocks: ParsedDeviceLog[] = [];

  rows.forEach((row, index) => {
    const header = dayColumns(row);
    if (header) { nearestHeader = header; return; }
    if (!nearestHeader) return;
    const info = employeeInfo(row);
    if (!info) return;
    const stampsRow = nextContentRow(rows, index + 1);
    const days: Record<number, string[]> = {};
    Object.entries(nearestHeader).forEach(([column, day]) => {
      const stamps = cell(stampsRow[Number(column)]).split(/[\n/]+/).map(value => value.trim()).filter(value => /^\d{1,2}:\d{2}$/.test(value));
      if (stamps.length) days[day] = stamps;
    });
    blocks.push({ ...info, days });
  });

  return { year: period ? Number(period[1]) : undefined, month: period ? Number(period[2]) : undefined, blocks };
}

export async function parseListOfLogsFile(file: File): Promise<ParsedPayrollLogs> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: "array" });
        let allRows: unknown[][] = [];
        
        wb.SheetNames.forEach(name => {
          if (name === "Summary") return;
          const sheet = wb.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
          allRows = allRows.concat(rows);
        });

        const periodText = allRows.slice(0, 5).flat().map(cell).join(" ");
        const period = periodText.match(/(20\d{2})\s*[/-]\s*(\d{1,2})\s*[/-]\s*\d{1,2}/);
        let nearestHeader: Record<number, number> | null = null;
        const blocks: ParsedDeviceLog[] = [];

        allRows.forEach((row, index) => {
          const header = dayColumns(row);
          if (header) { nearestHeader = header; return; }
          if (!nearestHeader) return;
          const info = employeeInfo(row);
          if (!info) return;
          const stampsRow = nextContentRow(allRows, index + 1);
          const days: Record<number, string[]> = {};
          Object.entries(nearestHeader).forEach(([column, day]) => {
            const stamps = cell(stampsRow[Number(column)]).split(/[\n/]+/).map(value => value.trim()).filter(value => /^\d{1,2}:\d{2}$/.test(value));
            if (stamps.length) days[day] = stamps;
          });
          blocks.push({ ...info, days });
        });

        resolve({ year: period ? Number(period[1]) : 2026, month: period ? Number(period[2]) : 8, blocks });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
