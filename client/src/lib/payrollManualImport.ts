import * as XLSX from "xlsx";

export type ManualImportEmployee = {
  id: number;
  employeeNumber: string | number;
  firstName: string;
  lastName?: string | null;
};

export type ManualImportNewEmployee = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
};

export type ManualImportPresenceEmployee = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
};

export type ManualImportPayrollData = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  regularRateCents: number;
  overtimeRateCents: number;
  baseSalaryCents: number;
  bankPaymentCents: number;
  cashPaymentCents: number;
  paymentMethod: "BANK" | "CASH";
  dailyRateCents?: number;
  isForeign?: number;
};

export type ManualPresenceImportResult = {
  values: Record<string, string>;
  sheetName: string;
  headerRow: number;
  matchedEmployees: number;
  importedCells: number;
  skippedRows: number;
  errors: string[];
  newEmployees: ManualImportNewEmployee[];
  presenceEmployees: ManualImportPresenceEmployee[];
  payrollData: ManualImportPayrollData[];
  foreignPayrollData: ManualImportPayrollData[];
};

const normalize = (value: unknown) => String(value ?? "").trim();
const key = (value: unknown) => normalize(value).toLocaleLowerCase("sq-AL").replace(/[^a-z0-9ëç]/gi, "");

function findHoursSheet(workbook: XLSX.WorkBook, days: number) {
  const named = workbook.SheetNames.find(name => key(name).replace(/ë/g, "e").includes("oretepunes"));
  if (named) return named;
  for (const name of workbook.SheetNames) {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], { header: 1, raw: false, defval: "" });
    const header = matrix.find(row => key(row?.[0]) === "nr" && key(row?.[1]) === "emri" && key(row?.[2]) === "mbiemri" && row.slice(3, 3 + days).some(value => normalize(value) === "1"));
    if (header) return name;
  }
  return undefined;
}

function findHeader(matrix: unknown[][], days: number) {
  for (let index = 0; index < Math.min(matrix.length, 40); index += 1) {
    const row = matrix[index] || [];
    const hasNr = row.some(v => key(v) === "nr");
    if (!hasNr) continue;
    const dayColumns = new Map<number, number>();
    row.forEach((value, column) => {
      const day = Number(normalize(value));
      if (Number.isInteger(day) && day >= 1 && day <= days && !dayColumns.has(day)) dayColumns.set(day, column);
    });
    if (dayColumns.size >= 1) return { index, dayColumns };
  }
  return undefined;
}

function isSplitPayrollSheet(name: string) {
  const normalized = key(name).replace(/ë/g, "e");
  return normalized.includes("bank") || normalized.includes("cash") || normalized.includes("kesh");
}

function findPayrollSheet(workbook: XLSX.WorkBook) {
  const candidates = workbook.SheetNames.filter(name => {
    const normalized = key(name).replace(/ë/g, "e");
    return normalized.includes("pagat") && !normalized.includes("huaj");
  });
  const hasRecognizedHeader = (name: string) => {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], { header: 1, raw: false, defval: "" });
    return Boolean(findPayrollHeader(matrix, isSplitPayrollSheet(name)));
  };
  return candidates.filter(name => !isSplitPayrollSheet(name)).find(hasRecognizedHeader)
    || candidates.find(hasRecognizedHeader)
    || candidates.filter(name => !isSplitPayrollSheet(name))[0]
    || candidates[0];
}

function findForeignPayrollSheet(workbook: XLSX.WorkBook) {
  return workbook.SheetNames.find(name => {
    const normalized = key(name).replace(/ë/g, "e");
    return normalized.includes("tehuajt") || (normalized.includes("pagat") && normalized.includes("huaj"));
  });
}

function hasCombinedNameHeader(columns: Map<string, number>) {
  return columns.has("emermbiemer") || columns.has("emrimbiemri") || columns.has("emripersonit") || columns.has("punonjesi");
}

function findPayrollHeader(matrix: unknown[][], allowForeign = false) {
  for (let index = 0; index < Math.min(matrix.length, 40); index += 1) {
    const row = matrix[index] || [];
    const columns = new Map<string, number>();
    row.forEach((value, column) => {
      const normalized = key(value).replace(/ë/g, "e");
      if (normalized) columns.set(normalized, column);
    });
    const hasRateColumns = columns.has("kostoopn") || columns.has("orepunenormale") || columns.has("pagesanebank") || columns.has("pagesabanke") || columns.has("pagesakesh") || columns.has("pagesacash") || columns.has("pagesa") || columns.has("shuma") || columns.has("shumatotale") || columns.has("paga") || (allowForeign && (columns.has("pagaditepune") || columns.has("pagadite") || columns.has("kostoopsh")));
    const hasIdentity = columns.has("nr") && ((columns.has("emer") && columns.has("mbiemer")) || hasCombinedNameHeader(columns));
    if (hasIdentity && hasRateColumns) return { index, columns };
  }
  return undefined;
}

function nameColumns(columns: Map<string, number>) {
  return {
    first: ["emer", "emri", "emriipare"].map(name => columns.get(name)).find((value): value is number => value !== undefined),
    last: ["mbiemer", "mbiemri"].map(name => columns.get(name)).find((value): value is number => value !== undefined),
    combined: ["emermbiemer", "emrimbiemri", "emripersonit", "punonjesi"].map(name => columns.get(name)).find((value): value is number => value !== undefined),
  };
}

function splitCombinedName(value: unknown) {
  const parts = normalize(value).split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function numericCell(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  let text = normalize(value).replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  if (!text) return 0;
  const comma = text.lastIndexOf(",");
  const dot = text.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    text = comma > dot ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  } else if (comma >= 0) {
    const decimals = text.length - comma - 1;
    text = decimals === 1 || decimals === 2 ? text.replace(",", ".") : text.replace(/,/g, "");
  } else if (dot >= 0 && text.length - dot - 1 === 3) {
    text = text.replace(/\./g, "");
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : 0;
}

function payrollDataFromWorkbook(workbook: XLSX.WorkBook): ManualImportPayrollData[] {
  const sheetName = findPayrollSheet(workbook);
  if (!sheetName) return [];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, raw: false, defval: "" });
  const header = findPayrollHeader(matrix, isSplitPayrollSheet(sheetName));
  if (!header) return [];
  const column = (...names: string[]) => names.map(name => header.columns.get(name)).find(value => value !== undefined);
  const names = nameColumns(header.columns);
  const numberColumn = column("nr");
  const firstNameColumn = names.first;
  const lastNameColumn = names.last;
  const combinedNameColumn = names.combined;
  const regularRateColumn = column("kostoopn");
  const overtimeRateColumn = column("kostoopsh");
  const baseSalaryColumn = column("bonuspagatbaze3", "pagabaze", "shuma1");
  const additionalBonusColumn = column("bonus5000all4", "bonus5000all");
  const bankColumn = column("pagesanebank", "pagesabanke", "pagesamebanke", "pagesbank", "bank", "banke");
  const cashColumn = column("pagesakesh", "pagesacash", "pagesamecash", "cash", "kesh");
  const genericPaymentColumn = column("pagesa", "shuma", "shumatotale", "paga", "total", "vlera", "likuiduar");
  if (numberColumn === undefined || (firstNameColumn === undefined && combinedNameColumn === undefined) || (lastNameColumn === undefined && combinedNameColumn === undefined)) return [];

  return matrix.slice(header.index + 1).flatMap(row => {
    const combined = combinedNameColumn === undefined ? undefined : splitCombinedName(row?.[combinedNameColumn]);
    const firstName = firstNameColumn === undefined ? combined?.firstName || "" : normalize(row?.[firstNameColumn]);
    const lastName = lastNameColumn === undefined ? combined?.lastName || "" : normalize(row?.[lastNameColumn]);
    const employeeNumber = normalize(row?.[numberColumn]);
    if ((!employeeNumber && !firstName && !lastName) || /total|punetoret|huaj/i.test(`${employeeNumber} ${firstName} ${lastName}`)) return [];
    const regularRateCents = Math.round(numericCell(regularRateColumn === undefined ? 0 : row?.[regularRateColumn]) * 100);
    const overtimeRateCents = Math.round(numericCell(overtimeRateColumn === undefined ? 0 : row?.[overtimeRateColumn]) * 100);
    const baseSalaryCents = Math.round((numericCell(baseSalaryColumn === undefined ? 0 : row?.[baseSalaryColumn]) + numericCell(additionalBonusColumn === undefined ? 0 : row?.[additionalBonusColumn])) * 100);
    const bankSource = bankColumn === undefined && /bank/i.test(sheetName) ? genericPaymentColumn : bankColumn;
    const cashSource = cashColumn === undefined && /(cash|kesh)/i.test(sheetName) ? genericPaymentColumn : cashColumn;
    const bankPaymentCents = Math.round(numericCell(bankSource === undefined ? 0 : row?.[bankSource]) * 100);
    const cashPaymentCents = Math.round(numericCell(cashSource === undefined ? 0 : row?.[cashSource]) * 100);
    return [{
      employeeNumber,
      firstName,
      lastName,
      regularRateCents,
      overtimeRateCents,
      baseSalaryCents,
      bankPaymentCents,
      cashPaymentCents,
      paymentMethod: cashPaymentCents > 0 && bankPaymentCents === 0 ? "CASH" as const : "BANK" as const,
    }];
  });
}

function foreignPayrollDataFromWorkbook(workbook: XLSX.WorkBook): ManualImportPayrollData[] {
  const sheetName = findForeignPayrollSheet(workbook);
  if (!sheetName) return [];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, raw: false, defval: "" });
  const header = findPayrollHeader(matrix, true);
  if (!header) return [];
  const column = (...names: string[]) => names.map(name => header.columns.get(name)).find(value => value !== undefined);
  const numberColumn = column("nr");
  const firstNameColumn = column("emer");
  const lastNameColumn = column("mbiemer");
  const dailyRateColumn = column("pagaditepune", "pagadite");
  const overtimeRateColumn = column("kostoopsh");
  const bankColumn = column("pagesabanke", "pagesanebank", "bank");
  const cashColumn = column("pagesacash", "pagesakesh", "cash");
  if (numberColumn === undefined || firstNameColumn === undefined || lastNameColumn === undefined) return [];

  return matrix.slice(header.index + 1).flatMap(row => {
    const firstName = normalize(row?.[firstNameColumn]);
    const lastName = normalize(row?.[lastNameColumn]);
    const employeeNumber = normalize(row?.[numberColumn]);
    if (/shuma totale|total|punetoret|huaj/i.test(`${employeeNumber} ${firstName} ${lastName}`)) return [];
    if (!employeeNumber || !/^\d+(?:[.,]\d+)?$/.test(employeeNumber)) return [];
    if (!firstName && !lastName) return [];
    const dailyRateCents = Math.round(numericCell(dailyRateColumn === undefined ? 0 : row?.[dailyRateColumn]) * 100);
    const overtimeRateCents = Math.round(numericCell(overtimeRateColumn === undefined ? 0 : row?.[overtimeRateColumn]) * 100);
    const bankPaymentCents = Math.round(numericCell(bankColumn === undefined ? 0 : row?.[bankColumn]) * 100);
    const cashPaymentCents = Math.round(numericCell(cashColumn === undefined ? 0 : row?.[cashColumn]) * 100);
    return [{ employeeNumber, firstName, lastName, regularRateCents: 0, overtimeRateCents, baseSalaryCents: 0, bankPaymentCents, cashPaymentCents, paymentMethod: cashPaymentCents > 0 && bankPaymentCents === 0 ? "CASH" as const : "BANK" as const, dailyRateCents, isForeign: 1 }];
  });
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1000;
}

function normalizeCell(value: unknown) {
  const raw = normalize(value);
  if (!raw) return "";
  const normalized = raw.replace(",", ".");
  if (/^[a-zëç]+$/i.test(normalized)) return normalized.toUpperCase();
  const split = normalized.match(/^(\d+(?:\.\d+)?)(?:\s*\+\s*(\d+(?:\.\d+)?))?$/);
  if (!split) return undefined;
  const first = Number(split[1]);
  const overtime = split[2] === undefined ? Math.max(first - 8, 0) : Number(split[2]);
  if (!Number.isFinite(first) || !Number.isFinite(overtime) || first < 0 || first > 24 || overtime < 0 || overtime > 16) return undefined;
  return split[2] === undefined && first > 8 ? `8+${Math.round(overtime)}` : raw;
}

export async function parseManualPresenceWorkbook(
  data: ArrayBuffer,
  employees: ManualImportEmployee[],
  days: number,
  onProgress?: (progress: number) => void,
): Promise<ManualPresenceImportResult> {
  const workbook = XLSX.read(data, { type: "array", raw: false });
  const sheetName = findHoursSheet(workbook, days);
  if (!sheetName) throw new Error("Nuk u gjet sheet-i ORET E PUNES ose template-i i Listëprezencës Manuale.");
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, raw: false, defval: "" });
  const header = findHeader(matrix, days);
  if (!header) throw new Error("Sheet-i ORET E PUNES nuk ka kolonat NR, EMRI, MBIEMRI dhe ditët 1–31.");

  const byNumber = new Map(employees.map(employee => [key(employee.employeeNumber), employee]));
  const byName = new Map(employees.map(employee => [key(`${employee.firstName} ${employee.lastName || ""}`), employee]));
  const values: Record<string, string> = {};
  const errors: string[] = [];
  const matched = new Set<string>();
  const newEmployeesMap = new Map<string, ManualImportNewEmployee>();
  const presenceEmployeesMap = new Map<string, ManualImportPresenceEmployee>();
  let importedCells = 0;
  let skippedRows = 0;

  const dataRows = matrix.slice(header.index + 1);
  for (let rowOffset = 0; rowOffset < dataRows.length; rowOffset += 1) {
    const row = dataRows[rowOffset];
    if (rowOffset % 3 === 0) {
      onProgress?.(40 + Math.round((rowOffset / Math.max(dataRows.length, 1)) * 40));
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    const excelRow = header.index + rowOffset + 2;
    const number = normalize(row?.[0]);
    const firstName = normalize(row?.[1]);
    const lastName = normalize(row?.[2]);
    if (!number && !firstName && !lastName) continue;
    if (/total|punetoret|huaj/i.test(`${number} ${firstName} ${lastName}`)) continue;
    let employee = byNumber.get(key(number)) || byName.get(key(`${firstName} ${lastName}`));
    const hasHours = Array.from(header.dayColumns.values()).some(column => normalize(row?.[column]) !== "");

    if (!employee && hasHours && (firstName || number)) {
      const newEmp: ManualImportNewEmployee = {
        employeeNumber: number || String(Math.floor(Math.random() * 9000 + 1000)),
        firstName: firstName || "Punonjës",
        lastName: lastName || "",
      };
      newEmployeesMap.set(key(newEmp.employeeNumber), newEmp);
      employee = {
        id: -Math.abs(hashString(`${newEmp.employeeNumber}-${newEmp.firstName}`)),
        employeeNumber: newEmp.employeeNumber,
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
      };
      byNumber.set(key(employee.employeeNumber), employee);
    }

    if (!employee) {
      if (hasHours) errors.push(`Rreshti ${excelRow}: punonjësi “${firstName} ${lastName}” (nr. ${number || "—"}) nuk u gjet dhe nuk mund të shtohej.`);
      if (hasHours) skippedRows += 1;
      continue;
    }

    const keyId = number || String(employee.employeeNumber || `${firstName} ${lastName}`).trim();
    const presenceKey = key(`${firstName} ${lastName}`) || key(keyId);
    presenceEmployeesMap.set(presenceKey, { employeeNumber: keyId, firstName, lastName });
    matched.add(keyId ? key(keyId) : key(`${firstName} ${lastName}`));
    header.dayColumns.forEach((column, day) => {
      const raw = row?.[column];
      if (normalize(raw) === "") return;
      const value = normalizeCell(raw);
      if (value === undefined) {
        errors.push(`Qeliza ${String.fromCharCode(65 + Math.min(column, 25))}${excelRow} (dita ${day}): vlera “${normalize(raw)}” nuk pranohet; përdor 8, 8+2 ose kodin M/L/K.`);
        return;
      }
      values[`${keyId}-${day}`] = value;
      importedCells += 1;
    });
  }
  onProgress?.(80);

  return {
    values,
    sheetName,
    headerRow: header.index + 1,
    matchedEmployees: matched.size,
    importedCells,
    skippedRows,
    errors,
    newEmployees: Array.from(newEmployeesMap.values()),
    presenceEmployees: Array.from(presenceEmployeesMap.values()),
    payrollData: payrollDataFromWorkbook(workbook),
    foreignPayrollData: foreignPayrollDataFromWorkbook(workbook),
  };
}
