import * as XLSX from "xlsx";

export const HOURS_SHEET_NAME = "ORET E PUNES";
export const PAYROLL_SHEET_PREFIX = "PAGAT";
export const FOREIGN_SHEET_NAME = "TE HUAJT";
export const FOREIGN_REQUIRED_HEADERS = ["NR", "EMER", "MBIEMER", "PAGA/DITE PUNE", "KOSTO OPSH", "PAGESA BANKE", "PAGESA CASH"] as const;
export const HOURS_REQUIRED_HEADERS = ["NR", "EMRI", "MBIEMRI"] as const;
export const PAYROLL_REQUIRED_HEADERS = [
  "NR",
  "EMER",
  "MBIEMER",
  "ORE PUNE NORMALE",
  "KOSTO OPN",
  "ORE PUNE SHTESE",
  "KOSTO OPSH",
  "BONUS & PAGAT BAZE (3)",
  "Bonus 5000 ALL (4)",
  "PAGESA NE BANK",
  "PAGESA KESH",
] as const;

export type TemplateValidationIssue = {
  sheet: string;
  cell?: string;
  message: string;
};

export type PayrollTemplateValidation = {
  valid: boolean;
  hoursSheetName?: string;
  payrollSheetName?: string;
  foreignSheetName?: string;
  issues: TemplateValidationIssue[];
  hoursRows: number;
  payrollRows: number;
  foreignRows: number;
};

const normalize = (value: unknown) => String(value ?? "").trim();
const key = (value: unknown) => normalize(value).toLocaleLowerCase("sq-AL").replace(/[^a-z0-9ëç]/gi, "").replace(/ë/g, "e");
const cellName = (row: number, column: number) => `${XLSX.utils.encode_col(column)}${row + 1}`;
const isSummaryRow = (row: unknown[]) => /total|punetoret|huaj/i.test(`${normalize(row?.[0])} ${normalize(row?.[1])} ${normalize(row?.[2])}`);
const numericText = (value: unknown) => normalize(value).replace(/\s/g, "").replace(/[^\d,.-]/g, "");

function isNumericCell(value: unknown, allowNegative = false) {
  if (typeof value === "number") return Number.isFinite(value) && (allowNegative || value >= 0);
  const raw = normalize(value);
  if (/^[-–—]+$/.test(raw)) return true;
  if (/[€$£]|[a-z]/i.test(raw)) return false;
  const text = numericText(value);
  if (!text) return true;
  const comma = text.lastIndexOf(",");
  const dot = text.lastIndexOf(".");
  const normalized = comma >= 0 && dot >= 0
    ? comma > dot ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "")
    : comma >= 0 ? text.length - comma - 1 <= 2 ? text.replace(",", ".") : text.replace(/,/g, "")
    : dot >= 0 && text.length - dot - 1 === 3 ? text.replace(/\./g, "") : text;
  const number = Number(normalized);
  return Number.isFinite(number) && (allowNegative || number >= 0);
}

function isHoursCell(value: unknown) {
  const text = normalize(value);
  if (!text) return true;
  if (/^[a-zëç]+$/i.test(text)) return true;
  const match = text.replace(",", ".").match(/^(\d+(?:\.\d+)?)(?:\s*\+\s*(\d+(?:\.\d+)?))?$/);
  if (!match) return false;
  const normal = Number(match[1]);
  const overtime = match[2] === undefined ? Math.max(normal - 8, 0) : Number(match[2]);
  return Number.isFinite(normal) && Number.isFinite(overtime) && normal >= 0 && normal <= 24 && overtime >= 0 && overtime <= 16;
}

function headerMap(row: unknown[]) {
  const map = new Map<string, number>();
  row.forEach((value, column) => {
    const normalized = key(value);
    if (normalized && !map.has(normalized)) map.set(normalized, column);
  });
  return map;
}

function findHoursSheet(workbook: XLSX.WorkBook) {
  return workbook.SheetNames.find(name => key(name).includes("oretepunes"));
}

function isSplitPayrollSheet(name: string) {
  const normalized = key(name);
  return normalized.includes("bank") || normalized.includes("cash") || normalized.includes("kesh");
}

function findPayrollSheet(workbook: XLSX.WorkBook) {
  const candidates = workbook.SheetNames.filter(name => key(name).startsWith("pagat") && !key(name).includes("tehuajt"));
  const hasRecognizedHeader = (name: string) => {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], { header: 1, raw: false, defval: "" });
    return Boolean(findPayrollHeader(matrix, isSplitPayrollSheet(name)));
  };
  return candidates.filter(name => !isSplitPayrollSheet(name)).find(hasRecognizedHeader)
    || candidates.find(hasRecognizedHeader)
    || candidates.find(name => !isSplitPayrollSheet(name))
    || candidates[0];
}

function findForeignSheet(workbook: XLSX.WorkBook) {
  return workbook.SheetNames.find(name => key(name).includes("tehuajt") || (key(name).includes("pagat") && key(name).includes("huaj")));
}

function findHoursHeader(matrix: unknown[][]) {
  return matrix.slice(0, 40).map((row, index) => ({ row, index, headers: headerMap(row) })).find(item => item.headers.has("nr") && item.headers.has("emri") && item.headers.has("mbiemri"));
}

function hasCombinedNameHeader(headers: Map<string, number>) {
  return headers.has("emermbiemer") || headers.has("emrimbiemri") || headers.has("emripersonit") || headers.has("punonjesi");
}

function findPayrollHeader(matrix: unknown[][], allowForeign = false) {
  return matrix.slice(0, 40).map((row, index) => ({ row, index, headers: headerMap(row) })).find(item => {
    const hasIdentity = item.headers.has("nr") && ((item.headers.has("emer") && item.headers.has("mbiemer")) || hasCombinedNameHeader(item.headers));
    const hasRate = item.headers.has("kostoopn") || item.headers.has("orepunenormale") || item.headers.has("pagesanebank") || item.headers.has("pagesabanke") || item.headers.has("pagesamebanke") || item.headers.has("pagesakesh") || item.headers.has("pagesacash") || item.headers.has("pagesamecash") || item.headers.has("pagesa") || item.headers.has("shuma") || item.headers.has("shumatotale") || item.headers.has("paga") || item.headers.has("vlera") || (allowForeign && (item.headers.has("pagaditepune") || item.headers.has("pagadite") || item.headers.has("kostoopsh")));
    return hasIdentity && hasRate;
  });
}

function requireHeader(issues: TemplateValidationIssue[], sheet: string, headers: Map<string, number>, aliases: string[], label: string) {
  if (!aliases.some(alias => headers.has(key(alias)))) issues.push({ sheet, message: `Mungon kolona detyruese “${label}”.` });
}

export function validatePayrollTemplate(data: ArrayBuffer, days: number): PayrollTemplateValidation {
  const workbook = XLSX.read(data, { type: "array", raw: false });
  const issues: TemplateValidationIssue[] = [];
  const hoursSheetName = findHoursSheet(workbook);
  const payrollSheetName = findPayrollSheet(workbook);
  const foreignSheetName = findForeignSheet(workbook);
  let hoursRows = 0;
  let payrollRows = 0;
  let foreignRows = 0;

  if (!hoursSheetName) {
    issues.push({ sheet: HOURS_SHEET_NAME, message: `Mungon sheet-i “${HOURS_SHEET_NAME}”.` });
  } else {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[hoursSheetName], { header: 1, raw: false, defval: "" });
    const header = findHoursHeader(matrix);
    if (!header) {
      issues.push({ sheet: hoursSheetName, message: "Mungon koka NR, EMRI, MBİEMRI në rreshtat e parë." });
    } else {
      for (const required of HOURS_REQUIRED_HEADERS) requireHeader(issues, hoursSheetName, header.headers, [required], required);
      for (let day = 1; day <= days; day += 1) {
        if (!header.headers.has(String(day))) issues.push({ sheet: hoursSheetName, message: `Mungon kolona e ditës ${day}.` });
      }
      const dayColumns = Array.from({ length: days }, (_, index) => header.headers.get(String(index + 1))).filter((column): column is number => column !== undefined);
      const seen = new Set<string>();
      matrix.slice(header.index + 1).forEach((row, rowOffset) => {
        if (!row?.some(value => normalize(value)) || isSummaryRow(row)) return;
        hoursRows += 1;
        const employeeKey = normalize(row[0]) || key(`${row[1]} ${row[2]}`);
        if (employeeKey && seen.has(employeeKey)) issues.push({ sheet: hoursSheetName, cell: cellName(header.index + rowOffset + 1, 0), message: `Punonjësi përsëritet në Listëprezencë: “${row[1] ?? ""} ${row[2] ?? ""}”.` });
        if (employeeKey) seen.add(employeeKey);
        dayColumns.forEach(column => {
          if (!isHoursCell(row[column])) issues.push({ sheet: hoursSheetName, cell: cellName(header.index + rowOffset + 1, column), message: `Vlerë ore e pavlefshme “${row[column]}”; përdor p.sh. 8 ose 8+1.` });
        });
      });
    }
  }

  if (foreignSheetName) {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[foreignSheetName], { header: 1, raw: false, defval: "" });
    const header = findPayrollHeader(matrix, true);
    if (!header) {
      issues.push({ sheet: foreignSheetName, message: "Mungon koka e TE HUAJT me NR, EMER, MBIEMER, PAGA/DITE PUNE dhe KOSTO OPSH." });
    } else {
      for (const required of FOREIGN_REQUIRED_HEADERS) {
        const aliases = required === "PAGA/DITE PUNE" ? [required, "PAGA DITE PUNE", "PAGA DITORE", "PAGA/DITE"] : required === "PAGESA BANKE" ? [required, "PAGESA NE BANK", "PAGESA BANK"] : required === "PAGESA CASH" ? [required, "PAGESA KESH", "PAGESA CASH"] : [required];
        requireHeader(issues, foreignSheetName, header.headers, aliases, required);
      }
      const requiredNumeric = ["pagaditepune", "kostoopsh", "pagesabanke", "pagesacash"];
      const columns = new Map(requiredNumeric.map(name => [name, header.headers.get(name)]));
      const numberColumn = header.headers.get("nr");
      const firstNameColumn = header.headers.get("emer");
      const lastNameColumn = header.headers.get("mbiemer");
      const seen = new Set<string>();
      matrix.slice(header.index + 1).forEach((row, rowOffset) => {
        if (!row?.some(value => normalize(value)) || isSummaryRow(row)) return;
        const employeeNumber = numberColumn === undefined ? "" : normalize(row[numberColumn]);
        const firstName = firstNameColumn === undefined ? "" : normalize(row[firstNameColumn]);
        const lastName = lastNameColumn === undefined ? "" : normalize(row[lastNameColumn]);
        if (!/^\d+$/.test(employeeNumber) || (!firstName && !lastName)) return;
        foreignRows += 1;
        const employeeKey = employeeNumber || key(`${firstName} ${lastName}`);
        if (employeeKey && seen.has(employeeKey)) issues.push({ sheet: foreignSheetName, cell: cellName(header.index + rowOffset + 1, 0), message: `Punonjësi përsëritet te TE HUAJT: “${row[1] ?? ""} ${row[2] ?? ""}”.` });
        if (employeeKey) seen.add(employeeKey);
        columns.forEach((column, name) => {
          if (column !== undefined && !isNumericCell(row[column], name === "pagesacash")) issues.push({ sheet: foreignSheetName, cell: cellName(header.index + rowOffset + 1, column), message: `Vlerë monetare e pavlefshme te TE HUAJT në ${name}: “${row[column]}”.` });
        });
      });
    }
  }

  if (payrollSheetName) {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[payrollSheetName], { header: 1, raw: false, defval: "" });
    const header = findPayrollHeader(matrix, isSplitPayrollSheet(payrollSheetName));
    if (header) {
      const hasSeparateIdentity = header.headers.has("emer") && header.headers.has("mbiemer");
      if (!isSplitPayrollSheet(payrollSheetName) && hasSeparateIdentity) {
        for (const required of PAYROLL_REQUIRED_HEADERS) {
          const aliases = required === "BONUS & PAGAT BAZE (3)" ? [required, "PAGA BAZE", "BONUS & PAGAT BAZE"] : [required];
          requireHeader(issues, payrollSheetName, header.headers, aliases, required);
        }
      }
      const requiredNumeric = ["kostoopn", "kostoopsh", "bonuspagatbaze3", "bonus5000all4", "pagesanebank", "pagesabanke", "pagesakesh", "pagesacash", "pagesamebanke", "pagesamecash", "pagesa", "shuma", "vlera"];
      const columns = new Map(requiredNumeric.map(name => [name, header.headers.get(name)]));
      const seen = new Set<string>();
      matrix.slice(header.index + 1).forEach((row, rowOffset) => {
        if (!row?.some(value => normalize(value)) || isSummaryRow(row)) return;
        payrollRows += 1;
        const employeeKey = normalize(row[0]) || key(`${row[1]} ${row[2]}`);
        if (employeeKey && seen.has(employeeKey)) issues.push({ sheet: payrollSheetName, cell: cellName(header.index + rowOffset + 1, 0), message: `Punonjësi përsëritet në Pagat: “${row[1] ?? ""} ${row[2] ?? ""}”.` });
        if (employeeKey) seen.add(employeeKey);
        columns.forEach((column, name) => {
          if (column !== undefined && !isNumericCell(row[column], name === "pagesakesh")) issues.push({ sheet: payrollSheetName, cell: cellName(header.index + rowOffset + 1, column), message: `Vlerë monetare e pavlefshme në ${name}: “${row[column]}”.` });
        });
      });
    }
  }

  if (!hoursRows) issues.push({ sheet: hoursSheetName || HOURS_SHEET_NAME, message: "Nuk u gjet asnjë rresht punonjësi në Listëprezencë." });
  return { valid: issues.length === 0, hoursSheetName, payrollSheetName, foreignSheetName, issues, hoursRows, payrollRows, foreignRows };
}

export function formatTemplateIssues(validation: PayrollTemplateValidation) {
  return validation.issues.slice(0, 8).map(issue => `${issue.sheet}${issue.cell ? ` ${issue.cell}` : ""}: ${issue.message}`).join("\n") + (validation.issues.length > 8 ? `\n… dhe ${validation.issues.length - 8} gabime të tjera.` : "");
}
