import * as XLSX from "xlsx";

export type SalesImportFormat = "DOMESTIC" | "EXPORT";

export type SalesImportLine = {
  productCode?: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  vatAmount: number;
  sourceRow: number;
  metadata?: Record<string, string | number | null>;
};

export type SalesImportInvoice = {
  sourceSheet: string;
  sourceKind: "DOMESTIC_SALES" | "EXPORT_SALES";
  sourceRows: number[];
  docNumber: string;
  date: Date;
  customerCode?: string;
  customerName?: string;
  currency: string;
  exchangeRate: number;
  invoiceFormat: SalesImportFormat;
  totalAmount: number;
  totalVat: number;
  totalAmountLek?: number;
  items: SalesImportLine[];
  exportDetails?: string;
  warnings: string[];
};

export type SalesImportIssue = {
  severity: "warning" | "error";
  sourceSheet: string;
  sourceRow?: number;
  message: string;
};

export type SalesImportResult = {
  invoices: SalesImportInvoice[];
  issues: SalesImportIssue[];
  sourceSheets: string[];
  skippedPurchaseRows: number;
};

type Cell = unknown;
type Matrix = Cell[][];

type ColumnMap = Record<string, number>;

const normalize = (value: unknown) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("sq-AL")
  .replace(/[^a-z0-9]+/g, "");

const text = (value: unknown) => String(value ?? "").replace(/\u00a0/g, " ").trim();

const numberValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = text(value);
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^0-9,.-]/g, "");
  if (!cleaned) return undefined;
  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (comma >= 0 && dot >= 0) {
    normalized = comma > dot ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  } else if (comma >= 0) {
    const decimals = cleaned.length - comma - 1;
    normalized = decimals > 0 && decimals <= 2 ? cleaned.replace(",", ".") : cleaned.replace(/,/g, "");
  } else if ((cleaned.match(/\./g) || []).length > 1) {
    normalized = cleaned.replace(/\./g, "");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const excelSerialDate = (serial: number) => new Date(Date.UTC(1899, 11, 30) + serial * 86400000);

const dateValue = (value: unknown): Date | undefined => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = excelSerialDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  const raw = text(value);
  if (!raw) return undefined;
  const european = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (european) {
    const year = Number(european[3].length === 2 ? `20${european[3]}` : european[3]);
    const date = new Date(Date.UTC(year, Number(european[2]) - 1, Number(european[1])));
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const firstColumn = (headers: string[], candidates: string[]) => {
  for (const candidate of candidates) {
    const exact = headers.findIndex(header => header === candidate);
    if (exact >= 0) return exact;
  }
  const index = headers.findIndex(header => candidates.some(candidate => header.includes(candidate)));
  return index >= 0 ? index : undefined;
};

const columns = (headers: Cell[], definitions: Record<string, string[]>) => {
  const normalized = headers.map(normalize);
  const result: ColumnMap = {};
  for (const [key, candidates] of Object.entries(definitions)) {
    const index = firstColumn(normalized, candidates.map(normalize));
    if (index !== undefined) result[key] = index;
  }
  return result;
};

const headerRow = (rows: Matrix, required: string[]) => rows.findIndex(row => {
  const joined = row.map(normalize).join("|");
  return required.every(token => joined.includes(normalize(token)));
});

const cell = (row: Cell[], map: ColumnMap, key: string) => map[key] === undefined ? undefined : row[map[key]];

const cents = (value: number | undefined) => Math.round((value ?? 0) * 100);

const validRow = (row: Cell[], map: ColumnMap) => Boolean(text(cell(row, map, "docNumber")) && text(cell(row, map, "productName")));

const repeatedHeaderRow = (row: Cell[], map: ColumnMap) => {
  const doc = normalize(text(cell(row, map, "docNumber")));
  const product = normalize(text(cell(row, map, "productName")));
  const date = normalize(text(cell(row, map, "date")));
  return (doc.includes("nrfature") || doc === "nr") && (product.includes("produkti") || product.includes("artikulli")) && date.includes("data");
};

const sourceDateKey = (date: Date) => date.toISOString().slice(0, 10);

const parseDomestic = (sheetName: string, rows: Matrix, issues: SalesImportIssue[]) => {
  const index = headerRow(rows, ["Data", "Nr. Fature", "Produkti"]);
  if (index < 0) {
    issues.push({ severity: "error", sourceSheet: sheetName, message: "Nuk u gjet header-i i shitjeve vendase." });
    return [] as SalesImportInvoice[];
  }
  const map = columns(rows[index], {
    date: ["data"],
    docNumber: ["nrfature", "nr"],
    customerName: ["kompania", "klienti", "bleresi"],
    productCode: ["kodi"],
    productName: ["produkti", "artikulli"],
    quantity: ["sasia"],
    unitPrice: ["cmimlek", "cmim"],
    netAmount: ["vlerapatvsh"],
    vatAmount: ["tvsh"],
    grossAmount: ["shuma", "vlerame tvsh"],
  });
  const groups = new Map<string, SalesImportInvoice>();
  rows.slice(index + 1).forEach((row, rowOffset) => {
    const sourceRow = index + rowOffset + 2;
    if (!validRow(row, map) || repeatedHeaderRow(row, map)) return;
    const docNumber = text(cell(row, map, "docNumber"));
    const date = dateValue(cell(row, map, "date"));
    const productName = text(cell(row, map, "productName"));
    if (!date) {
      issues.push({ severity: "error", sourceSheet: sheetName, sourceRow, message: `Data e faturës ${docNumber} nuk është e vlefshme.` });
      return;
    }
    const quantity = numberValue(cell(row, map, "quantity"));
    const unitPrice = numberValue(cell(row, map, "unitPrice"));
    if (!quantity || quantity <= 0 || unitPrice === undefined || unitPrice < 0) {
      issues.push({ severity: "error", sourceSheet: sheetName, sourceRow, message: `Rreshti i faturës ${docNumber} ka sasi ose çmim të pavlefshëm.` });
      return;
    }
    const net = numberValue(cell(row, map, "netAmount"));
    const vat = numberValue(cell(row, map, "vatAmount")) ?? 0;
    const gross = numberValue(cell(row, map, "grossAmount")) ?? ((net ?? quantity * unitPrice) + vat);
    const key = `${docNumber.toLocaleLowerCase("sq-AL")}::${sourceDateKey(date)}`;
    const invoice = groups.get(key) ?? {
      sourceSheet: sheetName,
      sourceKind: "DOMESTIC_SALES",
      sourceRows: [],
      docNumber,
      date,
      customerCode: undefined,
      customerName: text(cell(row, map, "customerName")) || undefined,
      currency: "ALL",
      exchangeRate: 1,
      invoiceFormat: "DOMESTIC",
      totalAmount: 0,
      totalVat: 0,
      items: [],
      warnings: [],
    } satisfies SalesImportInvoice;
    if (invoice.customerName && text(cell(row, map, "customerName")) && invoice.customerName !== text(cell(row, map, "customerName"))) invoice.warnings.push(`Fatura ${docNumber} ka më shumë se një klient/kompani në rreshta.`);
    invoice.sourceRows.push(sourceRow);
    invoice.totalAmount += cents(gross);
    invoice.totalVat += cents(vat);
    invoice.items.push({
      productCode: text(cell(row, map, "productCode")) || undefined,
      productName,
      quantity,
      unit: "Kg",
      unitPrice: cents(unitPrice),
      totalPrice: cents(gross),
      vatAmount: cents(vat),
      sourceRow,
    });
    groups.set(key, invoice);
  });
  for (const invoice of Array.from(groups.values())) {
    invoice.exportDetails = JSON.stringify({ sourceSheet: invoice.sourceSheet, sourceRows: invoice.sourceRows, customerName: invoice.customerName, currency: invoice.currency, exchangeRate: invoice.exchangeRate });
  }
  return Array.from(groups.values());
};

const parseExport = (sheetName: string, rows: Matrix, issues: SalesImportIssue[]) => {
  const index = headerRow(rows, ["Nr. Fature", "PRODUKTI", "Sasia"]);
  if (index < 0) {
    issues.push({ severity: "error", sourceSheet: sheetName, message: "Nuk u gjet header-i i eksporteve." });
    return [] as SalesImportInvoice[];
  }
  const map = columns(rows[index], {
    date: ["data"],
    docNumber: ["nrfature", "nr"],
    productCode: ["kodicode", "kodi"],
    productName: ["produkti"],
    quantity: ["sasia"],
    unitPrice: ["cmimeur", "cmim"],
    grossAmount: ["shuma"],
    customerName: ["kompania", "klienti"],
    country: ["shteti", "shtet"],
    status: ["statusi"],
    exchangeRate: ["kursi"],
    totalLek: ["vleraneleke", "vleranelek"],
    lotCode: ["kodi"],
    packaging: ["cilesiathase", "thase"],
    transport: ["transport"],
    invoiceValue: ["vlefatures"],
    liquidationDate: ["dtelik"],
    commission: ["komisione"],
    liquidation: ["perlikuidim"],
  });
  const groups = new Map<string, SalesImportInvoice>();
  rows.slice(index + 1).forEach((row, rowOffset) => {
    const sourceRow = index + rowOffset + 2;
    if (!validRow(row, map) || repeatedHeaderRow(row, map)) return;
    const docNumber = text(cell(row, map, "docNumber"));
    const customerName = text(cell(row, map, "customerName")) || undefined;
    const date = dateValue(cell(row, map, "date"));
    const productName = text(cell(row, map, "productName"));
    const key = `${normalize(docNumber)}::${normalize(customerName)}`;
    const existing = groups.get(key);
    if (!date && !existing) {
      issues.push({ severity: "error", sourceSheet: sheetName, sourceRow, message: `Data e eksportit ${docNumber} nuk është e vlefshme.` });
      return;
    }
    const invoiceDate = date ?? existing?.date;
    if (!invoiceDate) return;
    const quantity = numberValue(cell(row, map, "quantity"));
    const unitPrice = numberValue(cell(row, map, "unitPrice"));
    if (!quantity || quantity <= 0 || unitPrice === undefined || unitPrice < 0) {
      issues.push({ severity: "error", sourceSheet: sheetName, sourceRow, message: `Rreshti i eksportit ${docNumber} ka sasi ose çmim të pavlefshëm.` });
      return;
    }
    const exchangeRate = numberValue(cell(row, map, "exchangeRate")) ?? 1;
    const gross = numberValue(cell(row, map, "grossAmount")) ?? quantity * unitPrice;
    const invoice = existing ?? {
      sourceSheet: sheetName,
      sourceKind: "EXPORT_SALES",
      sourceRows: [],
      docNumber,
      date: invoiceDate,
      customerName,
      currency: "EUR",
      exchangeRate,
      invoiceFormat: "EXPORT",
      totalAmount: 0,
      totalVat: 0,
      totalAmountLek: 0,
      items: [],
      warnings: [],
    } satisfies SalesImportInvoice;
    if (invoice.exchangeRate !== exchangeRate) invoice.warnings.push(`Fatura ${docNumber} ka kurse të ndryshme këmbimi në rreshta.`);
    if (date && date.getUTCFullYear() === 2026 && invoice.date.getUTCFullYear() !== 2026) invoice.date = date;
    if (date && sourceDateKey(date) !== sourceDateKey(invoice.date) && !invoice.warnings.some(warning => warning.includes("data të ndryshme"))) invoice.warnings.push(`Fatura ${docNumber} ka data të ndryshme në rreshta; përdoret data e vitit 2026 kur është e disponueshme.`);
    invoice.sourceRows.push(sourceRow);
    invoice.totalAmount += cents(gross);
    invoice.totalAmountLek = (invoice.totalAmountLek ?? 0) + cents(numberValue(cell(row, map, "totalLek")) ?? gross * exchangeRate);
    invoice.items.push({
      productCode: text(cell(row, map, "productCode")) || undefined,
      productName,
      quantity,
      unit: "Kg",
      unitPrice: cents(unitPrice),
      totalPrice: cents(gross),
      vatAmount: 0,
      sourceRow,
      metadata: {
        country: text(cell(row, map, "country")) || null,
        status: text(cell(row, map, "status")) || null,
        lotCode: text(cell(row, map, "lotCode")) || null,
        packaging: text(cell(row, map, "packaging")) || null,
        transport: text(cell(row, map, "transport")) || null,
        invoiceValue: numberValue(cell(row, map, "invoiceValue")) ?? null,
        liquidationDate: text(cell(row, map, "liquidationDate")) || null,
        commission: numberValue(cell(row, map, "commission")) ?? null,
        liquidation: numberValue(cell(row, map, "liquidation")) ?? null,
      },
    });
    groups.set(key, invoice);
  });
  for (const invoice of Array.from(groups.values())) {
    invoice.exportDetails = JSON.stringify({ sourceSheet: invoice.sourceSheet, sourceRows: invoice.sourceRows, customerName: invoice.customerName, currency: invoice.currency, exchangeRate: invoice.exchangeRate, totalAmountLek: invoice.totalAmountLek, items: invoice.items.map((item: SalesImportLine) => item.metadata) });
  }
  return Array.from(groups.values());
};

export function parseSalesWorkbook(data: ArrayBuffer | Uint8Array): SalesImportResult {
  const workbook = XLSX.read(data, { type: "array", cellDates: true, raw: true, dense: true });
  const issues: SalesImportIssue[] = [];
  const domesticName = workbook.SheetNames.find(name => normalize(name) === normalize("SHITJET B V NE LEKE & EURO"));
  const exportName = workbook.SheetNames.find(name => normalize(name) === normalize("EKSPORTI"));
  const purchaseName = workbook.SheetNames.find(name => normalize(name) === normalize("FATURAT 2026"));
  const invoices = [
    ...(domesticName ? parseDomestic(domesticName, XLSX.utils.sheet_to_json<Cell[]>(workbook.Sheets[domesticName], { header: 1, defval: "", raw: true }), issues) : []),
    ...(exportName ? parseExport(exportName, XLSX.utils.sheet_to_json<Cell[]>(workbook.Sheets[exportName], { header: 1, defval: "", raw: true }), issues) : []),
  ];
  const purchaseRows = purchaseName ? XLSX.utils.sheet_to_json<Cell[]>(workbook.Sheets[purchaseName], { header: 1, defval: "", raw: true }) : [];
  const purchaseHeader = purchaseRows.length > 0 ? headerRow(purchaseRows, ["Data", "NR", "Produkti"]) : -1;
  const skippedPurchaseRows = purchaseName && purchaseHeader >= 0
    ? purchaseRows.slice(purchaseHeader + 1).filter(row => row.some(value => text(value))).length
    : 0;
  if (purchaseName) issues.push({ severity: "warning", sourceSheet: purchaseName, message: `Sheet-i ${purchaseName} u njoh si burim blerjesh nga fermerët dhe nuk u importua si shitje.` });
  if (!domesticName && !exportName) issues.push({ severity: "error", sourceSheet: "workbook", message: "Workbook-u nuk ka sheet SHITJET B V NE LEKE & EURO ose EKSPORTI." });
  return { invoices, issues, sourceSheets: workbook.SheetNames, skippedPurchaseRows };
}
