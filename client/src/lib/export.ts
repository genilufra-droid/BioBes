import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import { getReferenceGroups, getReferenceTotalLabel, SALES_QUANTITY_TOTAL_MONTHS } from '@/components/ReferenceReportView';
import autoTable from 'jspdf-autotable';
import { buildPurchaseReferenceInvoiceSource, exportReferenceInvoiceToExcel, exportReferenceInvoiceToPDF, printReferenceInvoice, type InvoiceParty } from '@/lib/invoiceReference';

export type PurchaseRegisterExportSource = {
  invoiceId: number;
  docNumber: string;
  date: Date | string;
  supplierId: number | null;
  supplierName: string | null;
  invoiceTotalAmount: number | null;
  currency: string | null;
  exchangeRate: number | string | null;
  vatAmount: number | null;
  carrierName: string | null;
  vehiclePlate: string | null;
  inventoryReference: string | null;
  status: string | null;
  paymentStatus: "UNPAID" | "PAID" | "LATER";
  itemId: number | null;
  productId: number | null;
  productName: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  lineTotalAmount: number | null;
};

type PurchaseRegisterExportRow = {
  date: string;
  docNumber: string;
  paymentStatus: string;
  supplierCode: string;
  supplierName: string;
  currency: string;
  exchangeRate: string;
  productCode: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  valueBeforeVat: string;
  vat: string;
  valueWithVat: string;
  valueInLek: string;
  carrierName: string;
  vehiclePlate: string;
  inventoryReference: string;
  status: string;
};

const purchaseRegisterHeaders: Array<{ key: keyof PurchaseRegisterExportRow; label: string; width: number }> = [
  { key: 'date', label: 'DATA / DATË', width: 13 }, { key: 'docNumber', label: 'NR.', width: 14 }, { key: 'paymentStatus', label: 'STATUSI I PAGESËS', width: 17 }, { key: 'supplierCode', label: 'KODI I FERMERIT', width: 16 }, { key: 'supplierName', label: 'FURNITORI', width: 27 }, { key: 'currency', label: 'MONEDHA', width: 11 }, { key: 'exchangeRate', label: 'KURSI', width: 13 }, { key: 'productCode', label: 'KODI I ARTIKULLIT', width: 16 }, { key: 'productName', label: 'ARTIKULLI', width: 25 }, { key: 'quantity', label: 'SASIA / KG', width: 15 }, { key: 'unitPrice', label: 'ÇMIMI', width: 15 }, { key: 'valueBeforeVat', label: 'VLERA PA TVSH', width: 18 }, { key: 'vat', label: 'TVSH', width: 15 }, { key: 'valueWithVat', label: 'VLERA ME TVSH', width: 18 }, { key: 'valueInLek', label: 'VLERA NË LEK', width: 18 }, { key: 'carrierName', label: 'TRANSPORTUESI', width: 24 }, { key: 'vehiclePlate', label: 'TARGA', width: 14 }, { key: 'inventoryReference', label: 'INVENTARI', width: 18 },
];

function formatCurrency(cents: number | null | undefined) {
  return `${((cents ?? 0) / 100).toLocaleString('sq-AL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
}

function documentCurrencyLabel(currency: string | null | undefined) {
  return !currency || currency === 'ALL' ? 'L' : currency;
}

function formatDocumentCurrency(cents: number | null | undefined, currency: string | null | undefined) {
  return `${((cents ?? 0) / 100).toLocaleString('sq-AL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${documentCurrencyLabel(currency)}`;
}

function formatLekEquivalent(cents: number | null | undefined, exchangeRate: number | string | null | undefined) {
  return formatCurrency(Math.round((cents ?? 0) * Number(exchangeRate || 1)));
}

function formatRegisterDate(value: Date | string) {
  return new Date(value).toLocaleDateString('sq-AL');
}

export function buildPurchaseRegisterExportRows(source: PurchaseRegisterExportSource[]): PurchaseRegisterExportRow[] {
  const itemCounts = source.reduce<Record<number, number>>((counts, row) => ({ ...counts, [row.invoiceId]: (counts[row.invoiceId] ?? 0) + 1 }), {});
  return source.map(row => {
    const valueBeforeVat = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0;
    const vat = Math.round((row.vatAmount ?? 0) / itemCounts[row.invoiceId]);
    const paymentStatus = row.status === 'PAID' ? 'PAID' : row.paymentStatus;
    return {
      date: formatRegisterDate(row.date), docNumber: row.docNumber, paymentStatus: paymentStatus === 'PAID' ? 'E paguar' : paymentStatus === 'LATER' ? 'Më vonë' : 'E papaguar', supplierCode: row.supplierId ? String(row.supplierId).padStart(3, '0') : '—', supplierName: row.supplierName || '—', currency: documentCurrencyLabel(row.currency), exchangeRate: Number(row.exchangeRate || 1).toFixed(6), productCode: row.productId?.toString() || '—', productName: row.productName || '—', quantity: row.quantity === null ? '—' : `${row.quantity.toLocaleString('sq-AL')} ${row.unit || ''}`.trim(), unitPrice: row.unitPrice === null ? '—' : formatDocumentCurrency(row.unitPrice, row.currency), valueBeforeVat: formatDocumentCurrency(valueBeforeVat, row.currency), vat: formatDocumentCurrency(vat, row.currency), valueWithVat: formatDocumentCurrency(valueBeforeVat + vat, row.currency), valueInLek: formatLekEquivalent(valueBeforeVat + vat, row.exchangeRate), carrierName: row.carrierName || '—', vehiclePlate: row.vehiclePlate || '—', inventoryReference: row.inventoryReference || '—', status: paymentStatus,
    };
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportPurchaseRegisterToExcel(source: PurchaseRegisterExportSource[]) {
  const rows = buildPurchaseRegisterExportRows(source);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistemi Genit Cloud';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Faturat e Blerjes', { views: [{ state: 'frozen', ySplit: 3, showGridLines: false }] });
  sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  const lastColumn = String.fromCharCode(64 + purchaseRegisterHeaders.length);
  sheet.mergeCells(`A1:${lastColumn}1`);
  sheet.getCell('A1').value = 'REGJISTRI I FATURAVE TË BLERJES';
  sheet.getCell('A1').font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF714B67' } };
  sheet.getCell('A1').alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(1).height = 26;
  sheet.mergeCells(`A2:${lastColumn}2`);
  sheet.getCell('A2').value = `Eksportuar më ${new Date().toLocaleString('sq-AL')} • ${rows.length} rreshta`;
  sheet.getCell('A2').font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF666666' } };
  sheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'middle' };
  sheet.getRow(2).height = 18;
  purchaseRegisterHeaders.forEach((header, index) => {
    const cell = sheet.getCell(3, index + 1);
    cell.value = header.label;
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC9ABA7' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', textRotation: 90, wrapText: true };
    cell.border = { top: { style: 'thin', color: { argb: 'FF8F746F' } }, left: { style: 'thin', color: { argb: 'FF8F746F' } }, bottom: { style: 'thin', color: { argb: 'FF8F746F' } }, right: { style: 'thin', color: { argb: 'FF8F746F' } } };
    sheet.getColumn(index + 1).width = header.width;
  });
  sheet.getRow(3).height = 92;
  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.addRow(purchaseRegisterHeaders.map(header => row[header.key]));
    const fill = row.status === 'PAID' ? 'FFD9EEAF' : row.status === 'LATER' ? 'FFFFF1BF' : 'FFFFFFFF';
    excelRow.height = 19;
    excelRow.eachCell((cell, index) => {
      cell.font = { name: 'Calibri', size: 10, bold: index === 2 || index === 4 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
      cell.alignment = { vertical: 'middle', horizontal: [1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 14, 15].includes(index) ? 'center' : [5, 7, 13].includes(index) ? 'left' : 'right' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFD4CDCE' } }, right: { style: 'thin', color: { argb: 'FFD4CDCE' } } };
    });
  });
  sheet.autoFilter = { from: 'A3', to: `${lastColumn}${Math.max(3, rows.length + 3)}` };
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Regjistri_Faturave_Blerjes.xlsx');
}

export function exportPurchaseRegisterToPDF(source: PurchaseRegisterExportSource[]) {
  const rows = buildPurchaseRegisterExportRows(source);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a3' });
  const width = doc.internal.pageSize.getWidth();
  doc.setFontSize(18);
  doc.setTextColor(113, 75, 103);
  doc.text('REGJISTRI I FATURAVE TË BLERJES', 28, 32);
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Eksportuar më ${new Date().toLocaleString('sq-AL')} • ${rows.length} rreshta`, 28, 48);
  autoTable(doc, {
    head: [purchaseRegisterHeaders.map(header => header.label)],
    body: rows.map(row => purchaseRegisterHeaders.map(header => row[header.key])),
    startY: 62,
    margin: { left: 22, right: 22, bottom: 26 },
    styles: { font: 'helvetica', fontSize: 5.5, cellPadding: 3, lineColor: [212, 205, 206], lineWidth: 0.35, valign: 'middle' },
    headStyles: { fillColor: [201, 171, 167], textColor: 255, fontStyle: 'bold', halign: 'center', minCellHeight: 46 },
    columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 5: { halign: 'center' }, 7: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' }, 10: { halign: 'right' }, 11: { halign: 'right' }, 13: { halign: 'center' }, 14: { halign: 'center' } },
    didParseCell: (data: any) => { if (data.section === 'body') { const state = rows[data.row.index]?.status; data.cell.styles.fillColor = state === 'PAID' ? [217, 238, 175] : state === 'LATER' ? [255, 241, 191] : [255, 255, 255]; } },
    didDrawPage: () => { doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.text(`Sistemi Genit Cloud • Faqe ${doc.getNumberOfPages()}`, width - 28, doc.internal.pageSize.getHeight() - 12, { align: 'right' }); },
  });
  doc.save('Regjistri_Faturave_Blerjes.pdf');
}

export type PurchaseInvoiceDocumentSource = {
  id: number;
  docNumber: string;
  date: Date | string;
  supplierName: string | null;
  supplierId?: number | null;
  totalAmount: number | null;
  vatAmount: number | null;
  carrierName: string | null;
  vehiclePlate: string | null;
  inventoryReference: string | null;
  status: string | null;
  company?: InvoiceParty;
  supplier?: InvoiceParty;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paymentAmount?: number | null;
  paymentDate?: Date | string | null;
  items: Array<{ productName: string | null; quantity: number | null; unit: string | null; unitPrice: number | null; totalPrice: number | null }>;
};

export function buildPurchaseInvoiceDocumentRows(invoice: PurchaseInvoiceDocumentSource) {
  return invoice.items.map(item => [item.productName || '—', item.quantity?.toLocaleString('sq-AL') || '0', item.unit || '—', formatCurrency(item.unitPrice), formatCurrency(item.totalPrice)]);
}

export async function exportPurchaseInvoiceDocumentToExcel(invoice: PurchaseInvoiceDocumentSource) {
  await exportReferenceInvoiceToExcel(buildPurchaseReferenceInvoiceSource(invoice, invoice.company, invoice.supplier));
}

export function exportPurchaseInvoiceDocumentToPDF(invoice: PurchaseInvoiceDocumentSource) {
  exportReferenceInvoiceToPDF(buildPurchaseReferenceInvoiceSource(invoice, invoice.company, invoice.supplier));
}

export function printPurchaseInvoiceDocument(invoice: PurchaseInvoiceDocumentSource) {
  return printReferenceInvoice(buildPurchaseReferenceInvoiceSource(invoice, invoice.company, invoice.supplier));
}

/**
 * Export data to Excel file
 */
export type ExportColumn<T extends Record<string, any>> = { key: keyof T; label: string };
export type ExportExcelOptions = { title?: string; period?: string; landscape?: boolean; reference?: boolean; includeTotals?: boolean; referenceKey?: string; headerColor?: string; titleColor?: string; columnWidths?: number[] };

const SOURCE_DOCUMENT_COLUMN_PATTERNS = ["dokumenti", "nr.", "nr", "nr. dokumentit", "nr dokumenti", "numri", "numer", "artikulli", "kartela", "kartelë", "emërtimi", "emërtimi i artikullit", "klienti", "klientë", "kliente", "qyteti", "kodi", "kod i klientit", "kod klienti", "emri", "furnitori"];

function normalizeExportLabel(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sq-AL").replace(/\s+/g, " ").trim();
}

export function isSourceDocumentColumnLabel(label: string) {
  const normalized = normalizeExportLabel(label);
  const compact = normalized.replace(/\s+/g, "");
  return SOURCE_DOCUMENT_COLUMN_PATTERNS.some(pattern => {
    const normalizedPattern = normalizeExportLabel(pattern);
    return normalized === normalizedPattern || normalized.includes(normalizedPattern) || compact.includes(normalizedPattern.replace(/\s+/g, ""));
  });
}

export function buildSourceDocumentUrl(sourceId: unknown, sourceType: unknown, origin = typeof window !== "undefined" ? window.location.origin : "") {
  const id = Number(sourceId);
  if (!Number.isInteger(id) || id <= 0) return "";
  const path = sourceType === "purchase-invoice" ? `/purchase-invoices?openInvoice=${id}` : sourceType === "purchase-receipt" ? `/purchase-invoices?tab=receipts&openReceipt=${id}` : sourceType === "purchase-return" ? `/purchase-invoices?tab=returns&openReturn=${id}` : sourceType === "sales-invoice" ? `/sales-invoices?openInvoice=${id}` : sourceType === "sales-return" ? `/sales-invoices?openReturn=${id}` : sourceType === "stock-movement" ? `/inventory?openMovement=${id}` : sourceType === "inventory-transfer" ? `/inventory?openTransfer=${id}` : sourceType === "inventory-adjustment" ? `/inventory?openAdjustment=${id}` : sourceType === "product" ? `/products?openProduct=${id}` : "";
  return path ? `${origin}${path}` : "";
}
export type ExportPdfOptions = { landscape?: boolean; reference?: boolean; includeTotals?: boolean; referenceKey?: string; period?: string; meta?: Record<string, unknown>; headerColor?: [number, number, number]; headerTextColor?: [number, number, number]; titleColor?: [number, number, number]; fontSize?: number; alternateRowColor?: [number, number, number] | false };

async function exportToExcelAsync<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1',
  columns?: readonly (keyof T)[] | readonly ExportColumn<T>[],
  options?: ExportExcelOptions,
) {
  const resolvedColumns: ExportColumn<T>[] = columns?.map(column => typeof column === "object" ? column : ({ key: column, label: String(column) })) || Object.keys(data[0] || {}).map(key => ({ key: key as keyof T, label: key }));
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistemi Genit Cloud";
  const isWideReference = Boolean(options?.reference && resolvedColumns.length > 8);
  const worksheet = workbook.addWorksheet(sheetName, { views: [{ state: "frozen", ySplit: options?.title ? ((options.period ? 3 : 2) + (options.reference ? 1 : 0)) : 1, showGridLines: false }] });
  worksheet.pageSetup = { orientation: options?.landscape || isWideReference ? "landscape" : "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalDpi: 300, verticalDpi: 300 };
  let headerRowIndex = 1;
  if (options?.title) {
    worksheet.mergeCells(1, 1, 1, Math.max(1, resolvedColumns.length));
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = options.title;
    titleCell.font = { name: "Calibri", size: options.reference ? 14 : 15, bold: true, color: { argb: options.titleColor || (options.reference ? "FF25251F" : "FF17253D") } };
    titleCell.alignment = { vertical: "middle", horizontal: options.reference ? "center" : "left" };
    worksheet.getRow(1).height = 28;
    if (options.period) {
      worksheet.mergeCells(2, 1, 2, Math.max(1, resolvedColumns.length));
      const periodCell = worksheet.getCell(2, 1);
      periodCell.value = `Periudha: ${options.period} · Sistemi Genit Cloud`;
      periodCell.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF666666" } };
      periodCell.alignment = { vertical: "middle", horizontal: "left" };
      headerRowIndex = 3;
    } else {
      headerRowIndex = 2;
    }
  }
  const referenceGroups = options?.reference && options.referenceKey ? getReferenceGroups(options.referenceKey, resolvedColumns.map(column => String(column.label))) : [];
  if (referenceGroups.length > 0) {
    const groupRowIndex = headerRowIndex;
    const groupRow = worksheet.getRow(groupRowIndex);
    let currentColumn = 1;
    referenceGroups.forEach(group => {
      const groupColumns = group.columns;
      if (groupColumns.length === 0) return;
      worksheet.mergeCells(groupRowIndex, currentColumn, groupRowIndex, currentColumn + groupColumns.length - 1);
      const cell = groupRow.getCell(currentColumn);
      cell.value = group.label;
      cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: options?.reference ? "FF25251F" : "FF55394F" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: options?.reference ? "FFF1F0C8" : "FFE9DCE7" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      currentColumn += groupColumns.length;
    });
    groupRow.height = 20;
    headerRowIndex += 1;
  }
  const header = worksheet.getRow(headerRowIndex);
  header.values = resolvedColumns.map(column => column.label);
  header.height = 27;
  header.eachCell(cell => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: options?.reference ? "FF25251F" : "FF17253D" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: options?.headerColor || (options?.reference ? "FFE6E5B5" : "FFEAF0F7") } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = { top: { style: "thin", color: { argb: "FFB8C3D0" } }, bottom: { style: "thin", color: { argb: "FFB8C3D0" } }, left: { style: "thin", color: { argb: "FFB8C3D0" } }, right: { style: "thin", color: { argb: "FFB8C3D0" } } };
  });
  data.forEach(item => {
    const row = worksheet.addRow(resolvedColumns.map(column => item[column.key] ?? ""));
    row.eachCell((cell, index) => {
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = { vertical: "middle", horizontal: index === 2 ? "left" : "right" };
      cell.border = { bottom: { style: "thin", color: { argb: "FFD4DCE4" } }, right: { style: "thin", color: { argb: "FFD4DCE4" } } };
    });
  });
  resolvedColumns.forEach((column, index) => {
    const longest = Math.max(column.label.length, ...data.map(row => String(row[column.key] ?? "").length));
    worksheet.getColumn(index + 1).width = options?.columnWidths?.[index] || Math.min(32, Math.max(11, longest + 2));
  });
  worksheet.autoFilter = { from: { row: headerRowIndex, column: 1 }, to: { row: Math.max(headerRowIndex, headerRowIndex + data.length), column: Math.max(1, resolvedColumns.length) } };
  if (options?.reference || options?.includeTotals) {
    const totalRow = worksheet.addRow(resolvedColumns.map((column, index) => {
      if (index === 0) return options.reference ? getReferenceTotalLabel(options.referenceKey || "") : "TOTALI";
      const values = data.map(item => item[column.key]).filter(value => typeof value === "number") as number[];
      return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) : "";
    }));
    totalRow.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF714B67" } };
    totalRow.border = { top: { style: "medium", color: { argb: "FF714B67" } } };
    worksheet.headerFooter.oddFooter = `&L Sistemi Genit Cloud&C&F`; 
  }
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${filename}.xlsx`);
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1',
  columns?: readonly (keyof T)[] | readonly ExportColumn<T>[],
  options?: ExportExcelOptions,
) {
  void exportToExcelAsync(data, filename, sheetName, columns, options);
}

/**
 * Export data to PDF file
 */
function exportSupplierCardSimpleToPDF<T extends Record<string, any>>(data: T[], filename: string, title: string, columns: readonly ExportColumn<T>[], options: ExportPdfOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const meta = options.meta || {};
  const supplier = String(meta.Furnitori || meta["Furnitor / Klient"] || "");
  const formatPeriod = (value: string) => value.includes("Fillimi") ? "01/01/2026-31/12/2026" : value;
  const formatCellDate = (value: unknown) => { if (value instanceof Date) return value.toLocaleDateString("sq-AL"); if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString("sq-AL"); return value; };
  const period = formatPeriod(String(options.period || "01/01/2026-31/12/2026").replace(/\s+—\s+/g, "-"));
  const labels = columns.slice(0, 9).map(column => column.label);
  const numberColumnIndex = Math.max(0, columns.findIndex(column => /nr\s*dok|dokumenti/i.test(column.label)));
  const valueFor = (row: T, column: ExportColumn<T>) => { const value = formatCellDate(row[column.key]); return typeof value === "number" ? Number(value).toLocaleString("sq-AL") : String(value ?? ""); };
  const linkedRowIndexes = new Set(data.map((row, index) => Number(row.__documentId) > 0 && Boolean(row.__documentType) ? index + 1 : -1));
  const linkedValue = (row: T, column: ExportColumn<T>) => valueFor(row, column);
  const body = [
    ["", "", "", "", "", `Gjendja deri ne daten ${period.split("-")[0] || period}`, "", "", ""],
    ...data.map(row => columns.slice(0, 9).map(column => linkedValue(row, column))),
  ];
  const sumFor = (pattern: RegExp) => { const column = columns.find(item => pattern.test(item.label)); return column ? data.reduce((sum, row) => sum + (typeof row[column.key] === "number" ? Number(row[column.key]) : 0), 0).toLocaleString("sq-AL") : ""; };
  const activeFilterLabels = new Set(["Furnitor / Klient", "Nr. dokumenti", "Status", "Monedha", "Lloj dokumenti", "Magazina", "Njësia", "Shuma minimale", "Shuma maksimale", "Data nga", "Data deri", "Kërkimi në tabelë"]);
  const filters = Object.entries(meta).filter(([key, value]) => activeFilterLabels.has(key) && value !== undefined && value !== null && String(value).trim() !== "");
  const tableStart = filters.length > 0 ? 106 : 94;
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(25, 25, 25);
  doc.text(String(new Date().getFullYear()), 28, 27);
  doc.text(title.toUpperCase(), pageWidth / 2, 34, { align: "center" });
  doc.setFontSize(8); doc.text(period, pageWidth / 2, 49, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(`Furnitori: ${supplier}`, 35, 80);
  doc.text(`Nr Llogarie: ${String(meta["Nr Llogarie"] || "—")}`, pageWidth * .31, 80);
  doc.text(`Mon ${String(meta.Mon || "")}`, pageWidth * .58, 80);
  doc.text(`Titulli: ${String(meta.Titulli || "Kartelë furnitori")}`, pageWidth * .67, 80);
  doc.text(`NIPTI: ${String(meta.NIPTI || "—")}`, pageWidth * .87, 80);
  if (filters.length > 0) { doc.setFontSize(7); doc.text(`Filtra aktive: ${filters.map(([key, value]) => `${key}: ${String(value)}`).join(" · ")}`, 35, 94); }
  const groupHead = [[...labels.slice(0, 6).map(content => ({ content, rowSpan: 2, styles: { halign: "center" as const, valign: "middle" as const } })), { content: "Monedhe Baze", colSpan: 3, styles: { halign: "center" as const } }], labels.slice(6, 9).map(content => ({ content, styles: { halign: "center" as const } }))];
  autoTable(doc, { head: groupHead as any, body: body as any, startY: tableStart, margin: { left: 35, right: 35 }, tableWidth: pageWidth - 70, theme: "grid", styles: { font: "helvetica", fontSize: 7, textColor: [25, 25, 25], cellPadding: 3, lineColor: [21, 21, 21], lineWidth: .35, halign: "center", valign: "middle" }, headStyles: { fillColor: [255, 254, 220], textColor: [25, 25, 25], fontStyle: "bold", fontSize: 7 }, bodyStyles: { fillColor: [255, 254, 241] }, alternateRowStyles: { fillColor: [255, 254, 220] }, didParseCell: hook => { if (hook.section === "body" && hook.row.index === 0) { hook.cell.styles.fillColor = [255, 254, 220]; if (hook.column.index === 5) hook.cell.styles.halign = "left"; } }, didDrawCell: hook => { if (hook.section !== "body" || hook.column.index !== numberColumnIndex || !linkedRowIndexes.has(hook.row.index)) return; const x = hook.cell.x + hook.cell.width - 7; const y = hook.cell.y + 5; doc.setDrawColor(25, 25, 25); doc.setLineWidth(.8); doc.line(x - 4, y + 4, x, y); doc.line(x, y, x - 2, y + 1); doc.line(x, y, x - 1, y + 3); const sourceRow = data[hook.row.index - 1]; const sourceId = Number(sourceRow?.__documentId); const sourceType = String(sourceRow?.__documentType || ""); const path = buildSourceDocumentUrl(sourceId, sourceType); if (path && typeof window !== "undefined") doc.link(hook.cell.x, hook.cell.y, hook.cell.width, hook.cell.height, { url: path }); } });
  const finalY = (doc as any).lastAutoTable?.finalY || tableStart + 40;
  autoTable(doc, { body: [["", "", "", "", "", "", `Totali: ${sumFor(/debi/i)}`, `Kreditor: ${sumFor(/kredi/i)}`, ""]], startY: finalY, margin: { left: 35, right: 35 }, tableWidth: pageWidth - 70, theme: "grid", styles: { font: "helvetica", fontSize: 8, fontStyle: "bold", fillColor: [255, 254, 220], textColor: [25, 25, 25], cellPadding: 4, lineColor: [21, 21, 21], lineWidth: .35, halign: "left" } });
  doc.save(`${filename}.pdf`);
}

function exportSalesSummaryRegisterToPDF<T extends Record<string, any>>(data: T[], filename: string, columns: readonly ExportColumn<T>[], options: ExportPdfOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const normalizeLabel = (value: string) => value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const labels = ["Nr Rend", "Lloj", "Nr", "Date", "Mon", "Kod i Klientit", "Kodi Artikulli", "Vlefta Artikulli", "Zbritje Anal.", "Zbritje Tot.", "Zbritje %", "Zbritje Gjithsej Vlefta", "Vlera me Zbritje pa TVSH", "Vlera me Zbritje me TVSH", "Vlera ne Mon Baze pa TVSH", "Vlera ne Mon Baze TVSH"];
  const actualFor = (label: string) => columns.find(column => normalizeLabel(String(column.label)) === normalizeLabel(label)) || columns.find(column => normalizeLabel(String(column.label)).includes(normalizeLabel(label)) || normalizeLabel(label).includes(normalizeLabel(String(column.label))));
  const actualColumns = labels.map(actualFor);
  const period = String(options.period || "01/01/2026-31/12/2026").includes("Fillimi") ? "01/01/2026-31/12/2026" : String(options.period || "01/01/2026-31/12/2026").replace(/\\s+—\\s+/g, "-");
  const valueFor = (row: T, column: ExportColumn<T> | undefined) => {
    const value: unknown = column ? row[column.key] : "";
    if (value instanceof Date) return value.toLocaleDateString("sq-AL");
    if (typeof value === "string" && /^\\d{4}-\\d{2}-\\d{2}T/.test(value)) return new Date(value).toLocaleDateString("sq-AL");
    return typeof value === "number" ? value.toLocaleString("sq-AL") : String(value ?? "");
  };
  const linkedRows = new Set(data.map((row, index) => Number(row.__documentId) > 0 && Boolean(row.__documentType) ? index : -1));
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(25, 25, 25);
  doc.text(String(new Date().getFullYear()), 28, 27);
  doc.text("REGJISTRI PERMBLEDHES I SHITJEVE", pageWidth / 2, 28, { align: "center" });
  doc.setFontSize(8); doc.text(period, pageWidth - 28, 28, { align: "right" });
  const point = options.meta?.["Pike Shijte"] || options.meta?.["Pike shitje"];
  if (point) { doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.text(`Pike Shijte: ${String(point)}`, 28, 43); }
  const groupHead = [
    [{ content: "Nr.", rowSpan: 2 }, { content: "Dokumenti", colSpan: 4 }, { content: "Kod i Klientit", rowSpan: 2 }, { content: "Vlefte Artikulli", colSpan: 2 }, { content: "Zbritje", colSpan: 3 }, { content: "Zbritje Gjithsej Vlefta", rowSpan: 2 }, { content: "Vlera me Zbritje", colSpan: 2 }, { content: "Vlera ne Mon Baze", colSpan: 2 }],
    labels.slice(1).map(label => ({ content: label, styles: { halign: "center" as const } })),
    labels.map((_, index) => String(index + 1)),
  ];
  const body = data.map(row => labels.map((_, index) => valueFor(row, actualColumns[index])));
  const totalRow = labels.map((label, index) => index === 0 ? "TOTALI I RAPORTIT" : (() => { const column = actualColumns[index]; const values = data.map(row => column ? row[column.key] : null).filter(value => typeof value === "number") as number[]; return values.length ? values.reduce((sum, value) => sum + value, 0).toLocaleString("sq-AL") : ""; })());
  autoTable(doc, {
    head: groupHead as any,
    body,
    startY: point ? 54 : 46,
    margin: { left: 28, right: 28, bottom: 24 },
    tableWidth: pageWidth - 56,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 6.3, textColor: [25, 25, 25], cellPadding: 2.4, lineColor: [21, 21, 21], lineWidth: .3, halign: "center", valign: "middle" },
    headStyles: { fillColor: [255, 254, 220], textColor: [25, 25, 25], fontStyle: "bold", fontSize: 6.2, minCellHeight: 15 },
    bodyStyles: { fillColor: [255, 254, 241] },
    alternateRowStyles: { fillColor: [255, 254, 220] },
    didDrawCell: hook => { if (hook.section !== "body" || hook.column.index !== 2 || !linkedRows.has(hook.row.index)) return; const x = hook.cell.x + hook.cell.width - 5; const y = hook.cell.y + hook.cell.height / 2; doc.setDrawColor(25, 25, 25); doc.setLineWidth(.7); doc.line(x - 4, y + 3, x, y - 1); doc.line(x, y - 1, x - 2, y); doc.line(x, y - 1, x - 1, y + 2); const sourceRow = data[hook.row.index]; const sourceId = Number(sourceRow?.__documentId); const sourceType = String(sourceRow?.__documentType || ""); const path = buildSourceDocumentUrl(sourceId, sourceType); if (path && typeof window !== "undefined") doc.link(hook.cell.x, hook.cell.y, hook.cell.width, hook.cell.height, { url: path }); },
    didDrawPage: () => { doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 100, 100); doc.text(`Sistemi Genit Cloud · Faqe ${doc.getNumberOfPages()}`, pageWidth - 28, pageHeight - 12, { align: "right" }); },
  });
  autoTable(doc, { body: [totalRow], startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 2 : 46, margin: { left: 28, right: 28 }, tableWidth: pageWidth - 56, theme: "grid", styles: { font: "helvetica", fontSize: 6.3, fontStyle: "bold", fillColor: [255, 254, 220], textColor: [25, 25, 25], cellPadding: 2.4, lineColor: [21, 21, 21], lineWidth: .3, halign: "right" }, columnStyles: { 0: { halign: "left" } } });
  doc.save(`${filename}.pdf`);
}

function exportSalesQuantityTotalToPDF<T extends Record<string, any>>(data: T[], filename: string, columns: readonly ExportColumn<T>[], options: ExportPdfOptions, reportTitle = "SHITJET SIPAS SASISE TOTAL") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [842, 204] });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const normalizeLabel = (value: string) => value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const findColumn = (label: string) => columns.find(column => normalizeLabel(String(column.label)) === normalizeLabel(label)) || columns.find(column => normalizeLabel(String(column.label)).includes(normalizeLabel(label)) || normalizeLabel(label).includes(normalizeLabel(String(column.label))));
  const articleColumn = findColumn("Artikulli");
  const monthColumns = SALES_QUANTITY_TOTAL_MONTHS.map(month => findColumn(month));
  const periodRaw = String(options.period || "01/01/2026-31/12/2026");
  const period = periodRaw.includes("Fillimi") ? "01/01/2026-31/12/2026" : periodRaw.replace(/\\s+—\\s+/g, "-");
  const valueFor = (row: T, column: ExportColumn<T> | undefined) => { const value: unknown = column ? row[column.key] : ""; return typeof value === "number" ? value.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value ?? ""); };
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(25, 25, 25);
  doc.text(String(new Date().getFullYear()), 28, 26);
  doc.text(reportTitle, pageWidth / 2, 27, { align: "center" });
  doc.setFontSize(8); doc.text(`Periudha nga         ${period}`, pageWidth / 2, 41, { align: "center" });
  const body = data.map(row => [valueFor(row, articleColumn), ...monthColumns.map(column => valueFor(row, column))]);
  autoTable(doc, {
    head: [["", ...SALES_QUANTITY_TOTAL_MONTHS]],
    body,
    startY: 48,
    margin: { left: 28, right: 28, bottom: 18 },
    tableWidth: pageWidth - 56,
    theme: "plain",
    styles: { font: "helvetica", fontSize: 7, textColor: [25, 25, 25], cellPadding: 2, lineWidth: 0, valign: "middle" },
    headStyles: { fillColor: false, textColor: [25, 25, 25], fontStyle: "bold", halign: "center" },
    columnStyles: { 0: { cellWidth: 174, halign: "left" }, 1: { cellWidth: 52, halign: "right" }, 2: { cellWidth: 52, halign: "right" }, 3: { cellWidth: 52, halign: "right" }, 4: { cellWidth: 52, halign: "right" }, 5: { cellWidth: 52, halign: "right" }, 6: { cellWidth: 52, halign: "right" }, 7: { cellWidth: 52, halign: "right" }, 8: { cellWidth: 52, halign: "right" }, 9: { cellWidth: 52, halign: "right" }, 10: { cellWidth: 52, halign: "right" }, 11: { cellWidth: 52, halign: "right" }, 12: { cellWidth: 52, halign: "right" } },
    didDrawPage: () => { doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(90, 90, 90); doc.text(`${new Date().toLocaleDateString("sq-AL")}       Printuar nga Alpha Platinium   www.imb.al`, 28, pageHeight - 10); doc.text(String(doc.getNumberOfPages()), pageWidth - 28, pageHeight - 10, { align: "right" }); },
  });
  doc.save(`${filename}.pdf`);
}

export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  columns?: readonly ExportColumn<T>[],
  options?: ExportPdfOptions,
) {
  if (options?.referenceKey === "purchase_supplier_card_format3_pdf" && columns) {
    exportSupplierCardSimpleToPDF(data, filename, title, columns, options);
    return;
  }
  if (options?.referenceKey === "sales_summary_register_pdf" && columns) {
    exportSalesSummaryRegisterToPDF(data, filename, columns, options);
    return;
  }
  if ((options?.referenceKey === "sales_quantity_total_pdf" || options?.referenceKey === "sales_quantity_pdf") && columns) {
    exportSalesQuantityTotalToPDF(data, filename, columns, options, options.referenceKey === "sales_quantity_pdf" ? "SHITJET SIPAS SASISE" : "SHITJET SIPAS SASISE TOTAL");
    return;
  }
  const referenceWide = Boolean(options?.reference && (columns?.length || Object.keys(data[0] || {}).length) > 8);
  const doc = new jsPDF({ orientation: options?.landscape || referenceWide ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const drawPageFooter = () => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Periudha: ${options?.period || "Fillimi — Sot"}`, 14, pageHeight - 20);
    doc.text(`Sistemi Genit Cloud · Faqe ${doc.getNumberOfPages()}`, pageWidth - 14, pageHeight - 20, { align: "right" });
  };
  
  // Add title
  doc.setFontSize(16);
  if (options?.titleColor) doc.setTextColor(...options.titleColor);
  doc.text(title, pageWidth / 2, 15, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('sq-AL')}`, 14, 25);

  // Prepare table data
  let tableColumns: string[] = [];
  let tableData: any[][] = [];

  if (columns) {
    tableColumns = columns.map(col => col.label);
    tableData = data.map(row =>
      columns.map(col => {
        const value = row[col.key];
        if (typeof value === 'number') {
          return value.toLocaleString('sq-AL');
        }
        return String(value ?? '');
      })
    );
  } else {
    tableColumns = Object.keys(data[0] || {});
    tableData = data.map(row =>
      tableColumns.map(col => {
        const value = row[col];
        if (typeof value === 'number') {
          return value.toLocaleString('sq-AL');
        }
        return String(value ?? '');
      })
    );
  }

  // Add table
  const referenceGroups = options?.reference && options.referenceKey ? getReferenceGroups(options.referenceKey, tableColumns) : [];
  const referenceHead = referenceGroups.length > 0 ? [referenceGroups.map(group => ({ content: group.label, colSpan: group.columns.length, styles: { halign: "center" as const } })), tableColumns] : [tableColumns];
  const sourceColumnIndexes = new Set(tableColumns.map((label, index) => isSourceDocumentColumnLabel(label) ? index : -1).filter(index => index >= 0));
  const hasSourceRows = data.some(row => Boolean(buildSourceDocumentUrl(row?.__documentId, row?.__documentType)));
  const effectiveSourceColumnIndexes = sourceColumnIndexes.size > 0 ? sourceColumnIndexes : hasSourceRows ? new Set([0]) : sourceColumnIndexes;
  autoTable(doc, {
    head: referenceHead,
    body: tableData,
    startY: options?.reference ? 56 : 35,
    margin: 10,
    styles: {
      fontSize: options?.fontSize || 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: options?.headerColor || (options?.reference ? [230, 229, 181] : [79, 70, 229]),
      textColor: options?.headerTextColor || (options?.reference ? [37, 37, 31] : 255),
      fontStyle: 'bold',
    },
    alternateRowStyles: options?.alternateRowColor === false ? undefined : { fillColor: options?.alternateRowColor || (options?.reference ? [255, 254, 241] : [240, 240, 240]) },
    didDrawCell: hook => {
      if (hook.section !== "body" || !effectiveSourceColumnIndexes.has(hook.column.index)) return;
      const sourceRow = data[hook.row.index];
      const url = buildSourceDocumentUrl(sourceRow?.__documentId, sourceRow?.__documentType);
      if (!url) return;
      const x = hook.cell.x + hook.cell.width - 5;
      const y = hook.cell.y + hook.cell.height / 2;
      doc.setDrawColor(25, 25, 25);
      doc.setLineWidth(.7);
      doc.line(x - 4, y + 3, x, y - 1);
      doc.line(x, y - 1, x - 2, y);
      doc.line(x, y - 1, x - 1, y + 2);
      doc.link(hook.cell.x, hook.cell.y, hook.cell.width, hook.cell.height, { url });
    },
    didDrawPage: drawPageFooter,
    });
  if (options?.reference || options?.includeTotals) {
    const totalRow = tableColumns.map((column, index) => {
      if (index === 0) return options.reference ? getReferenceTotalLabel(options.referenceKey || "") : "TOTALI";
      const values = data.map(row => row[columns?.[index]?.key ?? column]).filter(value => typeof value === "number") as number[];
      return values.length > 0 ? values.reduce((sum, value) => sum + value, 0).toLocaleString("sq-AL") : "";
    });
    autoTable(doc, {
      head: [], body: [totalRow], startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 2 : 56,
      margin: 10, theme: "plain", styles: { fontSize: options?.fontSize || 9, fontStyle: "bold", fillColor: [241, 240, 200], textColor: [37, 37, 31], cellPadding: 3 },
      didDrawPage: drawPageFooter,
    });
  }
  doc.save(`${filename}.pdf`);
}

export type PurchaseOrderModelSource = {
  docNumber: string;
  orderDate: Date | string;
  customerReference: string | null;
  supplierName: string | null;
  preparationResponsible: string | null;
  loadingResponsible: string | null;
  documentationResponsible: string | null;
  verifierName: string | null;
  notes: string | null;
  items: Array<{
    productName: string;
    plantType: string | null;
    productCode: string | null;
    sackCount: number | null;
    grossWeightKg: number | null;
    netWeightKg: number | null;
    quantity: number;
    loadedQuantity: number;
    notes: string | null;
  }>;
};

const purchaseOrderHeaders = ["NR.", "BIMËT", "LLOJI", "KODI", "NR. THASË", "PESHA E THASËVE BRUTO", "PESHA E THASËVE NETO", "SASIA E POROSITUR", "SASIA E NGARKUAR", "KOMENTE TË NDRYSHME"];

export function buildPurchaseOrderModelRows(order: PurchaseOrderModelSource) {
  return order.items.map((item, index) => [
    String(index + 1), item.productName || "—", item.plantType || "—", item.productCode || "—", item.sackCount?.toLocaleString("sq-AL") || "", item.grossWeightKg ? `${item.grossWeightKg.toLocaleString("sq-AL")} kg` : "", item.netWeightKg ? `${item.netWeightKg.toLocaleString("sq-AL")} kg` : "", `${item.quantity.toLocaleString("sq-AL")} kg`, item.loadedQuantity ? `${item.loadedQuantity.toLocaleString("sq-AL")} kg` : "", item.notes || "",
  ]);
}

function escapeHtml(value: string | null | undefined) {
  return String(value || "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

export async function exportPurchaseOrderModelToExcel(order: PurchaseOrderModelSource) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistemi Genit Cloud";
  const sheet = workbook.addWorksheet("Porosia", { views: [{ state: "frozen", ySplit: 5, showGridLines: false }] });
  sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
  const widths = [7, 28, 14, 16, 12, 18, 18, 17, 17, 28];
  widths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  sheet.mergeCells("A1:B2");
  sheet.getCell("A1").value = "BioBes";
  sheet.getCell("A1").font = { name: "Arial", size: 24, bold: true, color: { argb: "FF477A34" } };
  sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  sheet.mergeCells("C2:H2");
  sheet.getCell("C2").value = `POROSIA  ${order.docNumber}  NR  KLIENTIT  ${order.customerReference || order.supplierName || "—"}`;
  sheet.getCell("C2").font = { name: "Times New Roman", size: 16, bold: true, underline: true };
  sheet.getCell("C2").alignment = { horizontal: "center", vertical: "middle" };
  sheet.mergeCells("I2:J2");
  sheet.getCell("I2").value = `Data ${formatRegisterDate(order.orderDate)}`;
  sheet.getCell("I2").font = { name: "Arial", size: 12, bold: true };
  sheet.getCell("I2").alignment = { horizontal: "right", vertical: "middle" };
  sheet.getRow(2).height = 28;
  purchaseOrderHeaders.forEach((header, index) => {
    const cell = sheet.getCell(4, index + 1);
    cell.value = header;
    cell.font = { name: "Times New Roman", size: 10, bold: true, italic: true };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });
  sheet.getRow(4).height = 50;
  buildPurchaseOrderModelRows(order).forEach(row => {
    const excelRow = sheet.addRow(row);
    excelRow.height = 34;
    excelRow.eachCell((cell, index) => {
      cell.font = { name: "Times New Roman", size: 11, bold: index === 1 };
      cell.alignment = { horizontal: index === 1 || index === 9 ? "left" : "center", vertical: "middle", wrapText: true };
      cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });
  });
  const responsibilityRow = Math.max(8, order.items.length + 6);
  sheet.mergeCells(`A${responsibilityRow}:C${responsibilityRow}`);
  sheet.mergeCells(`D${responsibilityRow}:F${responsibilityRow}`);
  sheet.mergeCells(`G${responsibilityRow}:J${responsibilityRow}`);
  [[`A${responsibilityRow}`, "PERSONI PËRGJ. PËR PËRGATITJEN", order.preparationResponsible], [`D${responsibilityRow}`, "PERSONI PËRGJ. PËR NGARKESËN", order.loadingResponsible], [`G${responsibilityRow}`, "PERSONI PËRGJ. PËR DOKUMENTACIONIN", order.documentationResponsible]].forEach(([cellAddress, label, person]) => {
    const cell = sheet.getCell(cellAddress as string);
    cell.value = `${label}\n${person || ""}`;
    cell.font = { name: "Times New Roman", size: 10, bold: true, underline: true };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
  sheet.mergeCells(`A${responsibilityRow + 2}:H${responsibilityRow + 2}`);
  sheet.mergeCells(`I${responsibilityRow + 2}:J${responsibilityRow + 2}`);
  sheet.getCell(`A${responsibilityRow + 2}`).value = `SHËNIME TË NDRYSHME: ${order.notes || ""}`;
  sheet.getCell(`I${responsibilityRow + 2}`).value = `PERSONI VËREJTËS: ${order.verifierName || ""}`;
  [sheet.getCell(`A${responsibilityRow + 2}`), sheet.getCell(`I${responsibilityRow + 2}`)].forEach(cell => { cell.font = { name: "Times New Roman", size: 10, bold: true }; cell.alignment = { vertical: "middle", wrapText: true }; cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }; });
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `Porosia_${order.docNumber}.xlsx`);
}

export function exportPurchaseOrderModelToPDF(order: PurchaseOrderModelSource) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setTextColor(71, 122, 52);
  doc.setFontSize(23);
  doc.setFont("helvetica", "bold");
  doc.text("BioBes", 42, 38);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(15);
  doc.text(`POROSIA  ${order.docNumber}  NR  KLIENTIT  ${order.customerReference || order.supplierName || "—"}`, pageWidth / 2, 58, { align: "center" });
  doc.setFontSize(11);
  doc.text(`Data ${formatRegisterDate(order.orderDate)}`, pageWidth - 42, 36, { align: "right" });
  autoTable(doc, {
    head: [purchaseOrderHeaders], body: buildPurchaseOrderModelRows(order), startY: 72, margin: { left: 28, right: 28 }, styles: { font: "times", fontSize: 7, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.4, valign: "middle" }, headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", halign: "center", minCellHeight: 42, lineColor: [0, 0, 0], lineWidth: 0.4 }, columnStyles: { 0: { halign: "center" }, 1: { fontStyle: "bold" }, 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" }, 7: { halign: "center" }, 8: { halign: "center" } }, didDrawPage: () => { const bottom = doc.internal.pageSize.getHeight() - 70; doc.setFontSize(8); doc.text(`PERSONI PËRGJ. PËR PËRGATITJEN: ${order.preparationResponsible || ""}`, 32, bottom); doc.text(`PERSONI PËRGJ. PËR NGARKESËN: ${order.loadingResponsible || ""}`, pageWidth / 2, bottom, { align: "center" }); doc.text(`PERSONI PËRGJ. PËR DOKUMENTACIONIN: ${order.documentationResponsible || ""}`, pageWidth - 32, bottom, { align: "right" }); doc.text(`SHËNIME: ${order.notes || ""}`, 32, bottom + 20); doc.text(`PERSONI VËREJTËS: ${order.verifierName || ""}`, pageWidth - 32, bottom + 20, { align: "right" }); },
  });
  doc.save(`Porosia_${order.docNumber}.pdf`);
}

export function printPurchaseOrderModel(order: PurchaseOrderModelSource) {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) return false;
  const rows = buildPurchaseOrderModelRows(order).map(row => `<tr>${row.map((cell, index) => `<td class="${index === 1 ? "plant" : ""}">${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  popup.document.write(`<!doctype html><html><head><title>Porosia ${escapeHtml(order.docNumber)}</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:"Times New Roman",serif;color:#000}header{position:relative;min-height:60px}.brand{font:700 28px Arial;color:#477a34}.date{position:absolute;right:0;top:12px;font:600 16px Arial}.title{text-align:center;font-size:22px;font-weight:700;text-decoration:underline;margin-top:10px}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #000;padding:7px 6px}th{text-align:center;font-size:13px;font-style:italic}td{height:34px;font-size:14px;text-align:center}.plant{text-align:left;font-weight:700}.responsibles{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:22px;font-size:13px;font-weight:700;text-decoration:underline}.bottom{display:grid;grid-template-columns:3fr 1fr;gap:20px;margin-top:16px;border-top:1px solid #000;padding-top:8px;font-size:13px;font-weight:700}</style></head><body><header><div class="brand">BioBes</div><div class="date">Data ${escapeHtml(formatRegisterDate(order.orderDate))}</div><div class="title">POROSIA&nbsp;&nbsp;${escapeHtml(order.docNumber)}&nbsp;&nbsp;NR&nbsp;&nbsp;KLIENTIT&nbsp;&nbsp;${escapeHtml(order.customerReference || order.supplierName || "—")}</div></header><table><thead><tr>${purchaseOrderHeaders.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><section class="responsibles"><div>PERSONI PËRGJ. PËR PËRGATITJEN<br>${escapeHtml(order.preparationResponsible)}</div><div>PERSONI PËRGJ. PËR NGARKESËN<br>${escapeHtml(order.loadingResponsible)}</div><div>PERSONI PËRGJ. PËR DOKUMENTACIONIN<br>${escapeHtml(order.documentationResponsible)}</div></section><section class="bottom"><div>SHËNIME TË NDRYSHME: ${escapeHtml(order.notes)}</div><div>PERSONI VËREJTËS: ${escapeHtml(order.verifierName)}</div></section><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
  return true;
}

/**
 * Export Partners (Suppliers/Customers) to Excel
 */
export function exportPartnersToExcel(
  partners: any[],
  type: 'suppliers' | 'customers'
) {
  const filename = type === 'suppliers' ? 'Furnitoret' : 'Klientet';
  const columns = ['code', 'name', 'nipt', 'phone', 'email', 'address', 'city'];
  
  exportToExcel(partners, filename, type === 'suppliers' ? 'Furnitorët' : 'Klientët', columns as (keyof typeof partners[0])[]);
}

/**
 * Export Partners (Suppliers/Customers) to PDF
 */
export function exportPartnersToPDF(
  partners: any[],
  type: 'suppliers' | 'customers'
) {
  const filename = type === 'suppliers' ? 'Furnitoret' : 'Klientet';
  const title = type === 'suppliers' ? 'Lista e Furnitorëve' : 'Lista e Klientëve';
  
  const columns = [
    { key: 'code' as const, label: 'Kodi' },
    { key: 'name' as const, label: 'Emri' },
    { key: 'nipt' as const, label: 'NIPT' },
    { key: 'phone' as const, label: 'Telefon' },
    { key: 'email' as const, label: 'Email' },
    { key: 'address' as const, label: 'Adresa' },
  ];

  exportToPDF(partners, filename, title, columns);
}

/**
 * Export Invoices to Excel
 */
export function exportInvoicesToExcel(
  invoices: any[],
  type: 'purchase' | 'sales'
) {
  const filename = type === 'purchase' ? 'Faturat_Blerje' : 'Faturat_Shitje';
  const columns = ['number', 'date', 'partnerName', 'totalAmount', 'status'];
  
  exportToExcel(invoices, filename, type === 'purchase' ? 'Faturat e Blerjes' : 'Faturat e Shitjes', columns as (keyof typeof invoices[0])[] || []);
}

/**
 * Export Invoices to PDF
 */
export function exportInvoicesToPDF(
  invoices: any[],
  type: 'purchase' | 'sales'
) {
  const filename = type === 'purchase' ? 'Faturat_Blerje' : 'Faturat_Shitje';
  const title = type === 'purchase' ? 'Faturat e Blerjes' : 'Faturat e Shitjes';
  
  const columns = [
    { key: 'number' as const, label: 'Nr. Faturë' },
    { key: 'date' as const, label: 'Data' },
    { key: 'partnerName' as const, label: 'Partner' },
    { key: 'totalAmount' as const, label: 'Shuma' },
    { key: 'status' as const, label: 'Statusi' },
  ];

  exportToPDF(invoices, filename, title, columns);
}


export type SalesRegisterExportSource = {
  invoiceId: number;
  docNumber: string;
  date: Date | string;
  customerId: number | null;
  customerName: string | null;
  invoiceTotalAmount: number | null;
  currency: string | null;
  exchangeRate: number | string | null;
  invoiceFormat: string | null;
  vatAmount: number | null;
  warehouseName: string | null;
  status: string | null;
  paymentStatus: "UNPAID" | "PAID" | "LATER";
  itemId: number | null;
  productId: number | null;
  productName: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  lineTotalAmount: number | null;
};

type SalesRegisterExportRow = {
  date: string;
  docNumber: string;
  paymentStatus: string;
  customerCode: string;
  customerName: string;
  invoiceFormat: string;
  currency: string;
  exchangeRate: string;
  productCode: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  valueBeforeVat: string;
  vat: string;
  valueWithVat: string;
  valueInLek: string;
  warehouseName: string;
  status: string;
};

const salesRegisterHeaders: Array<{ key: keyof SalesRegisterExportRow; label: string; width: number }> = [
  { key: "date", label: "DATA / DATË", width: 13 },
  { key: "docNumber", label: "NR.", width: 14 },
  { key: "paymentStatus", label: "STATUSI I PAGESËS", width: 17 },
  { key: "customerCode", label: "KODI I KLIENTIT", width: 16 },
  { key: "customerName", label: "KLIENTI", width: 27 },
  { key: "invoiceFormat", label: "FORMATI", width: 13 },
  { key: "currency", label: "MONEDHA", width: 11 },
  { key: "exchangeRate", label: "KURSI", width: 13 },
  { key: "productCode", label: "KODI I ARTIKULLIT", width: 16 },
  { key: "productName", label: "ARTIKULLI", width: 25 },
  { key: "quantity", label: "SASIA / NJËSIA", width: 16 },
  { key: "unitPrice", label: "ÇMIMI", width: 15 },
  { key: "valueBeforeVat", label: "VLERA PA TVSH", width: 18 },
  { key: "vat", label: "TVSH", width: 15 },
  { key: "valueWithVat", label: "VLERA ME TVSH", width: 18 },
  { key: "valueInLek", label: "VLERA NË LEK", width: 18 },
  { key: "warehouseName", label: "MAGAZINA", width: 24 },
  { key: "status", label: "STATUSI", width: 14 },
];

export function buildSalesRegisterExportRows(source: SalesRegisterExportSource[]): SalesRegisterExportRow[] {
  const itemCounts = source.reduce<Record<number, number>>((counts, row) => ({ ...counts, [row.invoiceId]: (counts[row.invoiceId] ?? 0) + 1 }), {});
  return source.map(row => {
    const gross = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0;
    const vat = Math.round((row.vatAmount ?? 0) / (itemCounts[row.invoiceId] || 1));
    const paymentStatus = row.status === "PAID" ? "PAID" : row.paymentStatus;
    return {
      date: formatRegisterDate(row.date),
      docNumber: row.docNumber,
      paymentStatus: paymentStatus === "PAID" ? "E paguar" : paymentStatus === "LATER" ? "Më vonë" : "E papaguar",
      customerCode: row.customerId ? String(row.customerId).padStart(3, "0") : "—",
      customerName: row.customerName || "—",
      invoiceFormat: row.invoiceFormat === "EXPORT" ? "EXPORT" : "VENDASE",
      currency: documentCurrencyLabel(row.currency),
      exchangeRate: Number(row.exchangeRate || 1).toFixed(6),
      productCode: row.productId?.toString() || "—",
      productName: row.productName || "—",
      quantity: row.quantity === null ? "—" : `${row.quantity.toLocaleString("sq-AL")} ${row.unit || ""}`.trim(),
      unitPrice: row.unitPrice === null ? "—" : formatDocumentCurrency(row.unitPrice, row.currency),
      valueBeforeVat: formatDocumentCurrency(gross - vat, row.currency),
      vat: formatDocumentCurrency(vat, row.currency),
      valueWithVat: formatDocumentCurrency(gross, row.currency),
      valueInLek: formatLekEquivalent(gross, row.exchangeRate),
      warehouseName: row.warehouseName || "—",
      status: paymentStatus,
    };
  });
}

export async function exportSalesRegisterToExcel(source: SalesRegisterExportSource[]) {
  const rows = buildSalesRegisterExportRows(source);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistemi Genit Cloud";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Faturat e Shitjes", { views: [{ state: "frozen", ySplit: 3, showGridLines: false }] });
  sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  const lastColumn = String.fromCharCode(64 + salesRegisterHeaders.length);
  sheet.mergeCells(`A1:${lastColumn}1`);
  sheet.getCell("A1").value = "REGJISTRI I FATURAVE TË SHITJES";
  sheet.getCell("A1").font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF714B67" } };
  sheet.getCell("A1").alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(1).height = 26;
  sheet.mergeCells(`A2:${lastColumn}2`);
  sheet.getCell("A2").value = `Eksportuar më ${new Date().toLocaleString("sq-AL")} • ${rows.length} rreshta`;
  sheet.getCell("A2").font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF666666" } };
  sheet.getCell("A2").alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(2).height = 18;
  salesRegisterHeaders.forEach((header, index) => {
    const cell = sheet.getCell(3, index + 1);
    cell.value = header.label;
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC9ABA7" } };
    cell.alignment = { horizontal: "center", vertical: "middle", textRotation: 90, wrapText: true };
    cell.border = { top: { style: "thin", color: { argb: "FF8F746F" } }, left: { style: "thin", color: { argb: "FF8F746F" } }, bottom: { style: "thin", color: { argb: "FF8F746F" } }, right: { style: "thin", color: { argb: "FF8F746F" } } };
    sheet.getColumn(index + 1).width = header.width;
  });
  sheet.getRow(3).height = 92;
  rows.forEach(row => {
    const excelRow = sheet.addRow(salesRegisterHeaders.map(header => row[header.key]));
    const fill = row.status === "PAID" ? "FFD9EEAF" : row.status === "LATER" ? "FFFFF1BF" : "FFFFFFFF";
    excelRow.height = 19;
    excelRow.eachCell((cell, index) => {
      cell.font = { name: "Calibri", size: 10, bold: index === 2 || index === 4 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      cell.alignment = { vertical: "middle", horizontal: [1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 14, 15].includes(index) ? "center" : [5, 7, 13].includes(index) ? "left" : "right" };
      cell.border = { bottom: { style: "thin", color: { argb: "FFD4CDCE" } }, right: { style: "thin", color: { argb: "FFD4CDCE" } } };
    });
  });
  sheet.autoFilter = { from: "A3", to: `${lastColumn}${Math.max(3, rows.length + 3)}` };
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Regjistri_Faturave_Shitjes.xlsx");
}

export function exportSalesRegisterToPDF(source: SalesRegisterExportSource[]) {
  const rows = buildSalesRegisterExportRows(source);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });
  const width = doc.internal.pageSize.getWidth();
  doc.setFontSize(18);
  doc.setTextColor(113, 75, 103);
  doc.text("REGJISTRI I FATURAVE TË SHITJES", 28, 32);
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(`Eksportuar më ${new Date().toLocaleString("sq-AL")} • ${rows.length} rreshta`, 28, 48);
  autoTable(doc, {
    head: [salesRegisterHeaders.map(header => header.label)],
    body: rows.map(row => salesRegisterHeaders.map(header => row[header.key])),
    startY: 62,
    margin: { left: 22, right: 22, bottom: 26 },
    styles: { font: "helvetica", fontSize: 5.5, cellPadding: 3, lineColor: [212, 205, 206], lineWidth: 0.35, valign: "middle" },
    headStyles: { fillColor: [201, 171, 167], textColor: 255, fontStyle: "bold", halign: "center", minCellHeight: 46 },
    columnStyles: { 0: { halign: "center" }, 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" }, 8: { halign: "center" }, 9: { halign: "left" }, 10: { halign: "right" }, 11: { halign: "right" }, 12: { halign: "right" }, 13: { halign: "right" }, 14: { halign: "right" }, 15: { halign: "right" } },
    didParseCell: (data: any) => { if (data.section === "body") { const state = rows[data.row.index]?.status; data.cell.styles.fillColor = state === "PAID" ? [217, 238, 175] : state === "LATER" ? [255, 241, 191] : [255, 255, 255]; } },
    didDrawPage: () => { doc.setFontSize(8); doc.setTextColor(100, 100, 100); doc.text(`Sistemi Genit Cloud • Faqe ${doc.getNumberOfPages()}`, width - 28, doc.internal.pageSize.getHeight() - 12, { align: "right" }); },
  });
  doc.save("Regjistri_Faturave_Shitjes.pdf");
}
