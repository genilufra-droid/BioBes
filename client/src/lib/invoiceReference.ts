import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type InvoiceParty = {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  nipt?: string | null;
};

export type ReferenceInvoiceItem = {
  productName: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  totalPrice: number | null;
};

export type ReferenceInvoiceSource = {
  id: number;
  docNumber: string;
  date: Date | string;
  dueDate?: Date | string | null;
  seller?: InvoiceParty;
  buyer?: InvoiceParty;
  totalAmount: number | null;
  vatAmount: number | null;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paymentAmount?: number | null;
  paymentDate?: Date | string | null;
  invoiceType?: string | null;
  operatorName?: string | null;
  locationCode?: string | null;
  warehouseName?: string | null;
  currency?: string | null;
  exchangeRate?: number | string | null;
  invoiceFormat?: string | null;
  exportDetails?: string | null;
  supplyDate?: Date | string | null;
  nsfl?: string | null;
  nivf?: string | null;
  items: ReferenceInvoiceItem[];
};

export type ReferenceInvoiceRow = {
  description: string;
  unit: string;
  quantity: number;
  unitPriceCents: number;
  discountPercent: number;
  vatRate: string;
  valueBeforeVatCents: number;
  vatCents: number;
  totalCents: number;
};

const PAGE_BLUE = "FFD7EAF1";
const PAGE_BLUE_DARK = "FFB2CFD8";
const BORDER = "FF777777";
const TEXT = "FF222222";
const MUTED = "FF555555";

export function shouldUseExportInvoiceTemplate(invoiceFormat: string | null | undefined, currency?: string | null) {
  return invoiceFormat === "EXPORT" || (Boolean(currency) && currency !== "ALL" && !invoiceFormat);
}

function amount(cents: number | null | undefined) {
  return ((cents ?? 0) / 100).toFixed(2);
}
function invoiceCurrencyLabel(currency: string | null | undefined) {
  return !currency || currency === "ALL" ? "L" : currency;
}
function paymentDocumentAmount(invoice: ReferenceInvoiceSource) {
  return invoice.paymentAmount ?? ((invoice.totalAmount ?? 0) + (invoice.vatAmount ?? 0));
}
function paymentLekAmount(invoice: ReferenceInvoiceSource) {
  return Math.round(paymentDocumentAmount(invoice) * Number(invoice.exchangeRate || 1));
}

function excelAmount(cents: number | null | undefined) {
  return Number(amount(cents));
}

function dateText(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("sq-AL") : "—";
}

function dateTimeText(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleString("sq-AL") : "—";
}

function partyAddress(party?: InvoiceParty) {
  return [party?.address, party?.city].filter(Boolean).join(", ") || "—";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

function lineBase(item: ReferenceInvoiceItem) {
  return item.totalPrice ?? Math.round((item.quantity ?? 0) * (item.unitPrice ?? 0));
}

export function buildReferenceInvoiceRows(invoice: ReferenceInvoiceSource): ReferenceInvoiceRow[] {
  const baseTotal = invoice.items.reduce((sum, item) => sum + lineBase(item), 0);
  const declaredBase = invoice.totalAmount ?? baseTotal;
  const vatTotal = invoice.vatAmount ?? 0;
  return invoice.items.map(item => {
    const valueBeforeVatCents = lineBase(item);
    const vatCents = declaredBase > 0 ? Math.round(vatTotal * valueBeforeVatCents / declaredBase) : 0;
    const vatRate = vatTotal > 0 && declaredBase > 0 ? `${((vatTotal / declaredBase) * 100).toFixed(0)}%` : "Pa taksë";
    return {
      description: item.productName || "—",
      unit: item.unit || "—",
      quantity: item.quantity ?? 0,
      unitPriceCents: item.unitPrice ?? 0,
      discountPercent: 0,
      vatRate,
      valueBeforeVatCents,
      vatCents,
      totalCents: valueBeforeVatCents + vatCents,
    };
  });
}

export function buildPurchaseReferenceInvoiceSource(
  invoice: ReferenceInvoiceSource & { supplierName?: string | null; supplierId?: number | null },
  company?: InvoiceParty,
  supplier?: InvoiceParty,
): ReferenceInvoiceSource {
  return {
    ...invoice,
    seller: company ?? { name: "—" },
    buyer: supplier ?? { name: invoice.supplierName ?? "—" },
    invoiceType: invoice.invoiceType ?? "Faturë e parave të gatshme",
    supplyDate: invoice.supplyDate ?? invoice.date,
    paymentMethod: invoice.paymentMethod ?? "Kartëmonedha dhe monedha",
    paymentDate: invoice.paymentDate ?? invoice.date,
  };
}

export function buildSalesReferenceInvoiceSource(
  invoice: ReferenceInvoiceSource & { customerName?: string | null; customerId?: number | null },
  company?: InvoiceParty,
  customer?: InvoiceParty,
): ReferenceInvoiceSource {
  return {
    ...invoice,
    seller: company ?? { name: "—" },
    buyer: customer ?? { name: invoice.customerName ?? "—" },
    invoiceType: invoice.invoiceType ?? "Faturë e parave të gatshme",
    supplyDate: invoice.supplyDate ?? invoice.date,
    paymentMethod: invoice.paymentMethod ?? "Kartëmonedha dhe monedha",
    paymentDate: invoice.paymentDate ?? invoice.date,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function excelSectionBorder(sheet: ExcelJS.Worksheet, startRow: number, endRow: number, startColumn = 1, endColumn = 9) {
  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    for (let columnIndex = startColumn; columnIndex <= endColumn; columnIndex += 1) {
      const cell = sheet.getCell(rowIndex, columnIndex);
      cell.border = {
        top: { style: "thin", color: { argb: BORDER } },
        left: { style: "thin", color: { argb: BORDER } },
        bottom: { style: "thin", color: { argb: BORDER } },
        right: { style: "thin", color: { argb: BORDER } },
      };
    }
  }
}

function setExcelValue(sheet: ExcelJS.Worksheet, row: number, column: number, value: string | number, bold = false) {
  const cell = sheet.getCell(row, column);
  cell.value = value;
  cell.font = { name: "Arial", size: 9, bold, color: { argb: TEXT } };
  cell.alignment = { vertical: "middle", wrapText: true };
  return cell;
}

export async function exportReferenceInvoiceToExcel(invoice: ReferenceInvoiceSource) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistemi Genit Cloud";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Faturë", { views: [{ showGridLines: false }] });
  sheet.pageSetup = { orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1, horizontalDpi: 300, verticalDpi: 300 };
  const sheetLayout = sheet as unknown as { pageMargins?: Record<string, number> };
  sheetLayout.pageMargins = { left: 0.25, right: 0.25, top: 0.3, bottom: 0.3, header: 0.1, footer: 0.1 };
  sheet.headerFooter.oddFooter = "&L Sistemi Genit Cloud&C&F";
  [28, 14, 14, 14, 17, 16, 14, 17, 18].forEach((width, index) => { sheet.getColumn(index + 1).width = width; });

  sheet.mergeCells("A1:I1");
  setExcelValue(sheet, 1, 1, "FATURË", true);
  sheet.getCell("A1").font = { name: "Arial", size: 16, bold: true, color: { argb: TEXT } };
  sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 25;

  const seller = invoice.seller ?? {};
  const buyer = invoice.buyer ?? {};
  const writeParty = (startRow: number, title: string, party: InvoiceParty) => {
    setExcelValue(sheet, startRow, 1, `${title}:`, true);
    sheet.mergeCells(startRow, 2, startRow, 9); setExcelValue(sheet, startRow, 2, party.name || "—");
    setExcelValue(sheet, startRow + 1, 1, "Adresa:", true);
    sheet.mergeCells(startRow + 1, 2, startRow + 1, 9); setExcelValue(sheet, startRow + 1, 2, partyAddress(party));
    setExcelValue(sheet, startRow + 2, 1, "Numri Unik i Identifikimit :", true);
    sheet.mergeCells(startRow + 2, 2, startRow + 2, 9); setExcelValue(sheet, startRow + 2, 2, party.nipt || "—");
    excelSectionBorder(sheet, startRow, startRow + 2);
    [startRow, startRow + 1, startRow + 2].forEach(row => { sheet.getRow(row).height = 18; });
  };
  writeParty(3, "Shitësi", seller);

  const issueStart = 7;
  const issueRows: Array<[string, string]> = [
    ["Data dhe ora e lëshimit të faturës:", dateTimeText(invoice.date)],
    ["Numri i faturës:", invoice.docNumber],
    ["Operatori:", invoice.operatorName || "—"],
    ["Kodi i vendit të ushtrimit të veprimtarisë:", invoice.locationCode || "—"],
    ["Magazina:", invoice.warehouseName || "—"],
    ["Monedha:", `${invoice.currency || "ALL"} · Kursi ${Number(invoice.exchangeRate || 1).toFixed(6)}`],
    ["Lloji i faturës:", invoice.invoiceType || "Faturë e parave të gatshme"],
  ];
  issueRows.forEach(([label, value], index) => {
    setExcelValue(sheet, issueStart + index, 1, label, true);
    sheet.mergeCells(issueStart + index, 2, issueStart + index, 9); setExcelValue(sheet, issueStart + index, 2, value);
    sheet.getRow(issueStart + index).height = 18;
  });
  excelSectionBorder(sheet, issueStart, issueStart + issueRows.length - 1);

  writeParty(14, "Blerësi", buyer);

  const headerRow = 18;
  const headers = ["Përshkrimi i Mallit ose Shërbimit", "Njësia e Matjes", "Sasia", "Çmimi për njësi pa TVSH", "Zbritje %", "Norma e TVSH", "Vlera pa TVSH (sasi x çmim)", "TVSH (vlera)", "Vlera Totale"];
  headers.forEach((header, index) => {
    const cell = setExcelValue(sheet, headerRow, index + 1, header, true);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAGE_BLUE } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
  sheet.getRow(headerRow).height = 48;
  const rows = buildReferenceInvoiceRows(invoice);
  rows.forEach((row, index) => {
    const excelRow = headerRow + 1 + index;
    const values: Array<string | number> = [row.description, row.unit, row.quantity, excelAmount(row.unitPriceCents), row.discountPercent, row.vatRate, excelAmount(row.valueBeforeVatCents), excelAmount(row.vatCents), excelAmount(row.totalCents)];
    values.forEach((value, column) => {
      const cell = setExcelValue(sheet, excelRow, column + 1, value);
      cell.alignment = { horizontal: column === 0 ? "left" : "right", vertical: "middle", wrapText: true };
      if ([2, 3, 4, 6, 7, 8].includes(column)) cell.numFmt = "0.00";
    });
    sheet.getRow(excelRow).height = 18;
  });
  const lastItemRow = headerRow + Math.max(1, rows.length);
  excelSectionBorder(sheet, headerRow, lastItemRow);
  const totalStart = lastItemRow + 1;
  const totalRows: Array<[string, number]> = [
    ["Vlera pa TVSH", invoice.totalAmount ?? rows.reduce((sum, row) => sum + row.valueBeforeVatCents, 0)],
    ["Vlera totale e TVSH-së", invoice.vatAmount ?? 0],
    ["Totali për tu paguar (LEK)", (invoice.totalAmount ?? 0) + (invoice.vatAmount ?? 0)],
  ];
  totalRows.forEach(([label, value], index) => {
    const row = totalStart + index;
    sheet.mergeCells(row, 1, row, 7); setExcelValue(sheet, row, 1, label, true);
    sheet.mergeCells(row, 8, row, 9); const valueCell = setExcelValue(sheet, row, 8, excelAmount(value), true); valueCell.numFmt = "0.00";
    if (index === 2) valueCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAGE_BLUE } };
    excelSectionBorder(sheet, row, row);
    sheet.getRow(row).height = 19;
  });
  const vatStart = totalStart + 4;
  setExcelValue(sheet, vatStart, 1, "Shpërndarja e TVSH-së", true);
  sheet.mergeCells(vatStart, 1, vatStart, 9);
  sheet.getCell(vatStart, 1).alignment = { horizontal: "left", vertical: "middle" };
  const vatHeaders = ["Norma e TVSH", "Baza e tatueshme (LEK)", "Vlera e TVSH-së (LEK)"];
  vatHeaders.forEach((header, index) => { const cell = setExcelValue(sheet, vatStart + 1, index + 1, header, true); cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAGE_BLUE } }; cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; });
  setExcelValue(sheet, vatStart + 2, 1, invoice.vatAmount ? `${((invoice.vatAmount ?? 0) / Math.max(1, invoice.totalAmount ?? 1) * 100).toFixed(0)}%` : "Pa taksë");
  setExcelValue(sheet, vatStart + 2, 2, excelAmount(invoice.totalAmount)); sheet.getCell(vatStart + 2, 2).numFmt = "0.00";
  setExcelValue(sheet, vatStart + 2, 3, excelAmount(invoice.vatAmount)); sheet.getCell(vatStart + 2, 3).numFmt = "0.00";
  excelSectionBorder(sheet, vatStart + 1, vatStart + 2, 1, 3);
  setExcelValue(sheet, vatStart + 4, 1, "Data dhe ora e krijimit së furnizimit:", true);
  sheet.mergeCells(vatStart + 4, 2, vatStart + 4, 5); setExcelValue(sheet, vatStart + 4, 2, dateTimeText(invoice.supplyDate ?? invoice.date));

  const paymentStart = vatStart + 7;
  sheet.mergeCells(paymentStart, 1, paymentStart, 9);
  setExcelValue(sheet, paymentStart, 1, "TË DHËNAT E PAGESËS", true);
  sheet.getCell(paymentStart, 1).font = { name: "Arial", size: 13, bold: true, color: { argb: TEXT } };
  sheet.getCell(paymentStart, 1).alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(paymentStart).height = 24;
  const fiscalRows: Array<[string, string]> = [
    ["Data dhe ora e kryerjes së pagesës:", dateTimeText(invoice.paymentDate ?? invoice.date)],
    ["Numri i sigurisë së lëshuesit të faturës (NSLF):", invoice.nsfl || "—"],
    ["Numri identifikues i veçantë të faturës (NIVF):", invoice.nivf || "—"],
  ];
  fiscalRows.forEach(([label, value], index) => { setExcelValue(sheet, paymentStart + 2 + index, 1, label, true); sheet.mergeCells(paymentStart + 2 + index, 2, paymentStart + 2 + index, 9); setExcelValue(sheet, paymentStart + 2 + index, 2, value); });
  excelSectionBorder(sheet, paymentStart + 2, paymentStart + 4);
  const paymentHeader = paymentStart + 7;
  setExcelValue(sheet, paymentHeader, 1, "Mënyra e pagesës", true); sheet.mergeCells(paymentHeader, 1, paymentHeader, 5);
  setExcelValue(sheet, paymentHeader, 6, `Sasi (${invoiceCurrencyLabel(invoice.currency)}) / Lek`, true); sheet.mergeCells(paymentHeader, 6, paymentHeader, 9);
  [1, 6].forEach(column => { sheet.getCell(paymentHeader, column).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAGE_BLUE } }; sheet.getCell(paymentHeader, column).alignment = { horizontal: "center", vertical: "middle" }; });
  setExcelValue(sheet, paymentHeader + 1, 1, invoice.paymentMethod || "Kartëmonedha dhe monedha"); sheet.mergeCells(paymentHeader + 1, 1, paymentHeader + 1, 5);
  setExcelValue(sheet, paymentHeader + 1, 6, `${amount(paymentDocumentAmount(invoice))} ${invoiceCurrencyLabel(invoice.currency)} · ${amount(paymentLekAmount(invoice))} L`, true); sheet.mergeCells(paymentHeader + 1, 6, paymentHeader + 1, 9);
  excelSectionBorder(sheet, paymentHeader, paymentHeader + 1);

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `Fature_${invoice.docNumber}.xlsx`);
}

function drawBox(doc: jsPDF, x: number, y: number, width: number, height: number) {
  doc.setDrawColor(100, 100, 100); doc.setLineWidth(0.55); doc.rect(x, y, width, height);
}

function drawPartyBox(doc: jsPDF, title: string, party: InvoiceParty, x: number, y: number, width: number, labelOffset = 220) {
  drawBox(doc, x, y, width, 60);
  const valueX = x + labelOffset;
  const valueWidth = Math.max(60, width - labelOffset - 8);
  const write = (label: string, value: string, lineY: number) => {
    doc.setFont("helvetica", "bold"); doc.text(label, x + 6, lineY);
    doc.setFont("helvetica", "normal"); doc.text(doc.splitTextToSize(value, valueWidth), valueX, lineY);
  };
  doc.setFontSize(7.5); doc.setTextColor(35, 35, 35);
  write(`${title}:`, party.name || "—", y + 14);
  write("Adresa:", partyAddress(party), y + 30);
  write(title === "Seller" || title === "Bill To" ? "Tax ID:" : "Numri Unik i Identifikimit :", party.nipt || "—", y + 46);
}

function drawIssueBox(doc: jsPDF, invoice: ReferenceInvoiceSource, x: number, y: number, width: number) {
  const rows: Array<[string, string]> = [
    ["Data dhe ora e lëshimit të faturës:", dateTimeText(invoice.date)],
    ["Numri i faturës:", invoice.docNumber],
    ["Operatori:", invoice.operatorName || "—"],
    ["Kodi i vendit të ushtrimit të veprimtarisë:", invoice.locationCode || "—"],
    ["Magazina:", invoice.warehouseName || "—"],
    ["Monedha:", `${invoice.currency || "ALL"} · Kursi ${Number(invoice.exchangeRate || 1).toFixed(6)}`],
    ["Lloji i faturës:", invoice.invoiceType || "Faturë e parave të gatshme"],
  ];
  const height = 17 + rows.length * 15;
  drawBox(doc, x, y, width, height);
  rows.forEach(([label, value], index) => { const lineY = y + 14 + index * 15; doc.setFont("helvetica", "bold"); doc.text(label, x + 6, lineY); doc.setFont("helvetica", "normal"); doc.text(value, x + 220, lineY); });
  return y + height;
}

function addReferenceInvoicePageOne(doc: jsPDF, invoice: ReferenceInvoiceSource) {
  const x = 52; const width = 491;
  doc.setTextColor(25, 25, 25); doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.text("FATURË", 297.5, 32, { align: "center" });
  drawPartyBox(doc, "Shitësi", invoice.seller ?? {}, x, 45, width);
  const issueBottom = drawIssueBox(doc, invoice, x, 111, width);
  drawPartyBox(doc, "Blerësi", invoice.buyer ?? {}, x, issueBottom + 10, width);
  const tableStart = issueBottom + 80;
  const rows = buildReferenceInvoiceRows(invoice);
  autoTable(doc, {
    head: [["Përshkrimi i Mallit ose Shërbimit", "Njësia e Matjes", "Sasia", "Çmimi për njësi pa TVSH", "Zbritje %", "Norma e TVSH", "Vlera pa TVSH (sasi x çmim)", "TVSH (vlera)", "Vlera Totale"]],
    body: rows.map(row => [row.description, row.unit, row.quantity.toFixed(3), amount(row.unitPriceCents), row.discountPercent.toFixed(2), row.vatRate, amount(row.valueBeforeVatCents), amount(row.vatCents), amount(row.totalCents)]),
    startY: tableStart,
    margin: { left: x, right: 52 },
    styles: { font: "helvetica", fontSize: 5.2, cellPadding: 2.5, lineColor: [110, 110, 110], lineWidth: 0.35, textColor: [35, 35, 35], valign: "middle" },
    headStyles: { fillColor: [215, 234, 241], textColor: [30, 30, 30], fontStyle: "bold", halign: "center", minCellHeight: 34 },
    columnStyles: { 0: { cellWidth: 126 }, 1: { cellWidth: 48, halign: "center" }, 2: { cellWidth: 35, halign: "right" }, 3: { cellWidth: 58, halign: "right" }, 4: { cellWidth: 36, halign: "right" }, 5: { cellWidth: 42, halign: "center" }, 6: { cellWidth: 63, halign: "right" }, 7: { cellWidth: 39, halign: "right" }, 8: { cellWidth: 44, halign: "right" } },
  });
  const finalY = ((doc as any).lastAutoTable?.finalY ?? tableStart + 25) as number;
  autoTable(doc, {
    body: [[`Vlera pa TVSH (${invoice.currency || "ALL"})`, amount(invoice.totalAmount)], [`Vlera totale e TVSH-së (${invoice.currency || "ALL"})`, amount(invoice.vatAmount)], [`Totali për tu paguar (${invoice.currency || "ALL"})`, amount((invoice.totalAmount ?? 0) + (invoice.vatAmount ?? 0))], ["Ekuivalentja në Lek (kursi)", amount(Math.round(((invoice.totalAmount ?? 0) + (invoice.vatAmount ?? 0)) * Number(invoice.exchangeRate || 1)))]],
    startY: finalY + 2,
    margin: { left: x + 248, right: 52 },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 3, lineColor: [110, 110, 110], lineWidth: 0.35 },
    columnStyles: { 0: { cellWidth: 150, fontStyle: "bold" }, 1: { cellWidth: 93, halign: "right" } },
    didParseCell: (data: any) => { if (data.row.index === 2) data.cell.styles.fillColor = [215, 234, 241]; },
  });
  const totalsY = (((doc as any).lastAutoTable?.finalY ?? finalY + 82) as number) + 10;
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.text("Shpërndarja e TVSH-së", x, totalsY);
  autoTable(doc, { head: [["Norma e TVSH", "Baza e tatueshme (LEK)", "Vlera e TVSH-së (LEK)"]], body: [[invoice.vatAmount ? `${((invoice.vatAmount ?? 0) / Math.max(1, invoice.totalAmount ?? 1) * 100).toFixed(0)}%` : "Pa taksë", amount(invoice.totalAmount), amount(invoice.vatAmount)]], startY: totalsY + 4, margin: { left: x, right: 220 }, styles: { fontSize: 6.5, cellPadding: 3, lineColor: [110, 110, 110], lineWidth: 0.35 }, headStyles: { fillColor: [215, 234, 241], textColor: [30, 30, 30], fontStyle: "bold" } });
  const supplyY = (((doc as any).lastAutoTable?.finalY ?? totalsY + 35) as number) + 16;
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.text("Data dhe ora e krijimit së furnizimit:", x, supplyY); doc.setFont("helvetica", "normal"); doc.text(dateTimeText(invoice.supplyDate ?? invoice.date), x + 220, supplyY);
  return supplyY;
}

function addReferenceInvoicePaymentSection(doc: jsPDF, invoice: ReferenceInvoiceSource, startY: number) {
  const x = 52;
  const titleY = startY + 18;
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(25, 25, 25); doc.text("TË DHËNAT E PAGESËS", 297.5, titleY, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setTextColor(35, 35, 35); doc.setFontSize(7.5);
  doc.text("Data dhe ora e kryerjes së pagesës:", x, startY + 34); doc.text(dateTimeText(invoice.paymentDate ?? invoice.date), x + 220, startY + 34);
  doc.text("Numri i sigurisë së lëshuesit të faturës (NSLF):", x, startY + 48); doc.text(invoice.nsfl || "—", x + 220, startY + 48);
  doc.text("Numri identifikues i veçantë të faturës (NIVF):", x, startY + 62); doc.text(invoice.nivf || "—", x + 220, startY + 62);
  doc.setFont("helvetica", "bold"); doc.text("Mënyra e pagesës:", x, startY + 78);
  autoTable(doc, { head: [["Lloji", `Sasi (${invoiceCurrencyLabel(invoice.currency)}) / Lek`]], body: [[invoice.paymentMethod || "Kartëmonedha dhe monedha", `${amount(paymentDocumentAmount(invoice))} ${invoiceCurrencyLabel(invoice.currency)} · ${amount(paymentLekAmount(invoice))} L`]], startY: startY + 84, margin: { left: x, right: 220 }, styles: { fontSize: 7, cellPadding: 3, lineColor: [110, 110, 110], lineWidth: 0.35 }, headStyles: { fillColor: [215, 234, 241], textColor: [30, 30, 30], fontStyle: "bold" }, columnStyles: { 1: { halign: "right" } } });
  // QR intentionally omitted: the requested reference format keeps the fiscal/payment information without a QR block.
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(90, 90, 90); doc.text(invoice.docNumber, x, startY + 132);
}

export function exportReferenceInvoiceToPDF(invoice: ReferenceInvoiceSource) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageOneBottom = addReferenceInvoicePageOne(doc, invoice);
  addReferenceInvoicePaymentSection(doc, invoice, pageOneBottom + 12);
  doc.save(`Fature_${invoice.docNumber}.pdf`);
}

function referenceInvoiceHtmlPageOne(invoice: ReferenceInvoiceSource) {
  const rows = buildReferenceInvoiceRows(invoice).map(row => `<tr><td>${escapeHtml(row.description)}</td><td>${escapeHtml(row.unit)}</td><td class="number">${row.quantity.toFixed(3)}</td><td class="number">${amount(row.unitPriceCents)}</td><td class="number">${row.discountPercent.toFixed(2)}</td><td>${escapeHtml(row.vatRate)}</td><td class="number">${amount(row.valueBeforeVatCents)}</td><td class="number">${amount(row.vatCents)}</td><td class="number">${amount(row.totalCents)}</td></tr>`).join("");
  const party = (title: string, value: InvoiceParty) => `<section class="party"><div><b>${title}:</b><span>${escapeHtml(value.name || "—")}</span></div><div><b>Adresa:</b><span>${escapeHtml(partyAddress(value))}</span></div><div><b>Numri Unik i Identifikimit :</b><span>${escapeHtml(value.nipt || "—")}</span></div></section>`;
  return `<div class="page"><h1>FATURË</h1>${party("Shitësi", invoice.seller ?? {})}<section class="meta"><div><b>Data dhe ora e lëshimit të faturës:</b><span>${escapeHtml(dateTimeText(invoice.date))}</span></div><div><b>Numri i faturës:</b><span>${escapeHtml(invoice.docNumber)}</span></div><div><b>Operatori:</b><span>${escapeHtml(invoice.operatorName || "—")}</span></div><div><b>Kodi i vendit të ushtrimit të veprimtarisë:</b><span>${escapeHtml(invoice.locationCode || "—")}</span></div><div><b>Magazina:</b><span>${escapeHtml(invoice.warehouseName || "—")}</span></div><div><b>Lloji i faturës:</b><span>${escapeHtml(invoice.invoiceType || "Faturë e parave të gatshme")}</span></div></section>${party("Blerësi", invoice.buyer ?? {})}<table class="items"><thead><tr><th>Përshkrimi i Mallit ose Shërbimit</th><th>Njësia e Matjes</th><th>Sasia</th><th>Çmimi për njësi pa TVSH</th><th>Zbritje %</th><th>Norma e TVSH</th><th>Vlera pa TVSH (sasi x çmim)</th><th>TVSH (vlera)</th><th>Vlera Totale</th></tr></thead><tbody>${rows}</tbody></table><table class="totals"><tbody><tr><th>Vlera pa TVSH</th><td>${amount(invoice.totalAmount)}</td></tr><tr><th>Vlera totale e TVSH-së</th><td>${amount(invoice.vatAmount)}</td></tr><tr class="grand"><th>Totali për tu paguar (LEK)</th><td>${amount((invoice.totalAmount ?? 0) + (invoice.vatAmount ?? 0))}</td></tr></tbody></table><h2>Shpërndarja e TVSH-së</h2><table class="vat"><thead><tr><th>Norma e TVSH</th><th>Baza e tatueshme (LEK)</th><th>Vlera e TVSH-së (LEK)</th></tr></thead><tbody><tr><td>${invoice.vatAmount ? `${((invoice.vatAmount ?? 0) / Math.max(1, invoice.totalAmount ?? 1) * 100).toFixed(0)}%` : "Pa taksë"}</td><td>${amount(invoice.totalAmount)}</td><td>${amount(invoice.vatAmount)}</td></tr></tbody></table><p class="supply"><b>Data dhe ora e krijimit së furnizimit:</b><span>${escapeHtml(dateTimeText(invoice.supplyDate ?? invoice.date))}</span></p>${referenceInvoiceHtmlPaymentSection(invoice)}</div>`;
}

function referenceInvoiceHtmlPaymentSection(invoice: ReferenceInvoiceSource) {
  return `<section class="payment-section"><h2 class="payment-title">TË DHËNAT E PAGESËS</h2><div class="page-two-meta"><p><b>Data dhe ora e kryerjes së pagesës:</b><span>${escapeHtml(dateTimeText(invoice.paymentDate ?? invoice.date))}</span></p><p><b>Numri i sigurisë së lëshuesit të faturës (NSLF):</b><span>${escapeHtml(invoice.nsfl || "—")}</span></p><p><b>Numri identifikues i veçantë të faturës (NIVF):</b><span>${escapeHtml(invoice.nivf || "—")}</span></p></div><h2>Mënyra e pagesës:</h2><table class="payment"><thead><tr><th>Lloji</th><th>Sasi (${invoiceCurrencyLabel(invoice.currency)}) / Lek</th></tr></thead><tbody><tr><td>${escapeHtml(invoice.paymentMethod || "Kartëmonedha dhe monedha")}</td><td class="number">${amount(paymentDocumentAmount(invoice))} ${invoiceCurrencyLabel(invoice.currency)} · ${amount(paymentLekAmount(invoice))} L</td></tr></tbody></table></section>`;
}

export function buildReferenceInvoicePrintHtml(invoice: ReferenceInvoiceSource, options: { autoPrint?: boolean } = {}) {
  const autoPrint = options.autoPrint ?? true;
  return `<!doctype html><html lang="sq"><head><meta charset="utf-8"><title>Faturë ${escapeHtml(invoice.docNumber)}</title><style>@page{size:A4 portrait;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#222;margin:0;font-size:9px}.page{width:100%;min-height:auto;page-break-after:auto}h1{text-align:center;font-size:20px;margin:0 0 10px}h2{font-size:9px;margin:9px 0 3px}.party,.meta{border:1px solid #666;margin-bottom:6px;padding:6px}.party div,.meta div,.page-two-meta p,.supply{display:grid;grid-template-columns:220px 1fr;gap:8px;margin:0 0 5px}.party div:last-child,.meta div:last-child{margin-bottom:0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #777;padding:4px;vertical-align:middle}th{background:#d7eaf1;font-weight:700;text-align:center}.items{font-size:6px;margin-top:7px}.items th{height:38px}.items td{height:18px}.number{text-align:right}.totals{width:52%;margin:4px 0 0 auto;font-size:8px}.totals th{text-align:left}.grand th,.grand td{background:#d7eaf1;font-weight:700}.vat{width:62%;font-size:7px}.supply{margin-top:10px}.payment-section{margin-top:10px;border-top:1px solid #666;padding-top:6px;break-inside:avoid}.payment-title{text-align:center;font-size:13px;margin:0 0 8px}.page-two-meta{width:100%;margin-top:4px}.payment{width:64%;font-size:8px}@media print{body{margin:0}.page{page-break-after:auto;break-after:auto}.payment-section{break-inside:avoid}}</style></head><body>${referenceInvoiceHtmlPageOne(invoice)}${autoPrint ? "<script>window.onload=()=>window.print()</script>" : ""}</body></html>`;
}

export function printReferenceInvoice(invoice: ReferenceInvoiceSource) {
  const popup = window.open("", "_blank", "width=900,height=1100");
  if (!popup) return false;
  popup.document.write(buildReferenceInvoicePrintHtml(invoice));
  popup.document.close();
  return true;
}


export type ExportInvoiceDetails = {
  billTo?: string;
  shipTo?: string;
  deliveryPlace?: string;
  meansOfTransport?: string;
  purchaseOrder?: string;
  sealNumber?: string;
  paymentTerms?: string;
  cnCodes?: string[];
  packingNumbers?: string[];
  bagWeights?: number[];
  types?: string[];
  grossWeights?: number[];
  netWeights?: number[];
  netWeight?: number;
  grossWeight?: number;
  countryOfOrigin?: string;
  deliveryTerms?: string;
  bankName?: string;
  swiftCode?: string;
  iban?: string;
  administrator?: string;
  additionalCosts?: number;
  palletCost?: number;
  loadingCost?: number;
};

function exportDetails(invoice: ReferenceInvoiceSource): ExportInvoiceDetails {
  if (!invoice.exportDetails) return {};
  try { return JSON.parse(invoice.exportDetails) as ExportInvoiceDetails; } catch { return {}; }
}

function exportMoney(cents: number | null | undefined, currency: string) {
  return `${((cents ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${invoiceCurrencyLabel(currency)}`;
}

function exportInvoiceRows(invoice: ReferenceInvoiceSource) {
  const details = exportDetails(invoice);
  return buildReferenceInvoiceRows(invoice).map((row, index) => ({
    ...row,
    cnCode: details.cnCodes?.[index] || details.cnCodes?.[0] || "—",
    packingNo: details.packingNumbers?.[index] || "—",
    bagWeight: details.bagWeights?.[index],
    type: details.types?.[index] || "—",
    grossWeight: details.grossWeights?.[index],
    netWeight: details.netWeights?.[index],
  }));
}

export function buildExportInvoicePrintHtml(invoice: ReferenceInvoiceSource, options: { autoPrint?: boolean } = {}) {
  const autoPrint = options.autoPrint ?? true;
  const details = exportDetails(invoice);
  const currency = invoiceCurrencyLabel(invoice.currency);
  const rows = exportInvoiceRows(invoice);
  const net = details.netWeight ?? rows.reduce((sum, row) => sum + (row.netWeight ?? row.quantity), 0);
  const gross = details.grossWeight ?? rows.reduce((sum, row) => sum + (row.grossWeight ?? row.quantity), 0);
  const totalGoods = invoice.totalAmount ?? rows.reduce((sum, row) => sum + row.valueBeforeVatCents, 0);
  const palletCost = details.palletCost ?? 0;
  const loadingCost = details.loadingCost ?? 0;
  const additionalCosts = details.additionalCosts ?? (palletCost + loadingCost);
  const total = totalGoods + additionalCosts;
  const lineRows = rows.map(row => `<tr><td>${escapeHtml(row.cnCode)}</td><td>${escapeHtml(row.packingNo)}</td><td class="number">${row.bagWeight == null ? "—" : row.bagWeight.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td><td>${escapeHtml(row.description)}</td><td>${escapeHtml(row.type)}</td><td class="number">${row.grossWeight == null ? "—" : row.grossWeight.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td><td class="number">${row.netWeight == null ? "—" : row.netWeight.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td><td class="number">€ ${((row.unitPriceCents ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td class="number">€ ${((row.valueBeforeVatCents ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>`).join("");
  const label = (name: string, value: string) => `<div><b>${name}</b><span>${escapeHtml(value || "—")}</span></div>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>BioBes Invoice ${escapeHtml(invoice.docNumber)}</title><style>@page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#171717;margin:0;background:#fff;font-size:10px}.page{width:100%;min-height:277mm;padding:8mm 9mm 7mm;position:relative}.header{display:grid;grid-template-columns:1fr 1.5fr 1fr;align-items:end;border-bottom:1.5px solid #222;padding-bottom:7px;margin-bottom:9px}.brand{font-size:28px;font-weight:700;font-style:italic;letter-spacing:-1.6px;line-height:1;color:#253b2e}.tagline{font-size:8px;font-style:italic;line-height:1.2;margin-top:4px;color:#333}.title{text-align:center;font-size:17px;font-weight:700;margin-bottom:7px}.contact{font-size:8px;line-height:1.35;text-align:left}.contact b{font-size:10px}.date{text-align:right;font-size:10px;margin:0 2px 12px}.parties{margin:0 40px 8px}.parties p{margin:2px 0;line-height:1.28}.parties b{display:inline-block;min-width:112px}.meta{display:grid;grid-template-columns:1.2fr .9fr;column-gap:26px;row-gap:2px;margin:0 40px 8px}.meta div{display:grid;grid-template-columns:126px 1fr;line-height:1.28}.meta b{font-weight:700}.items{width:100%;border-collapse:collapse;margin-top:4px;font-size:8.5px}.items th,.items td{border:1px solid #202020;padding:4px 5px;vertical-align:middle}.items th{font-weight:700;font-style:italic;text-align:center;line-height:1.05;height:36px}.items td{height:35px}.items th:nth-child(1){width:9%}.items th:nth-child(2){width:8%}.items th:nth-child(3){width:10%}.items th:nth-child(4){width:25%}.items th:nth-child(5){width:9%}.items th:nth-child(6){width:10%}.items th:nth-child(7){width:10%}.items th:nth-child(8){width:9%}.items th:nth-child(9){width:12%}.number{text-align:right;white-space:nowrap}.items tfoot td{font-weight:700}.totals{width:43%;margin:0 0 0 auto;border-collapse:collapse;font-size:10px}.totals td{padding:3px 5px;border-bottom:1px solid #222}.totals td:first-child{text-align:left;font-weight:700}.totals td:last-child{text-align:right;white-space:nowrap}.totals .grand td{border-top:1.5px solid #222;border-bottom:1.5px solid #222;font-size:11px}.bank-sign{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:29px;min-height:52px}.bank{font-size:10px;line-height:1.55}.bank b{display:inline-block;width:82px}.administrator{font-size:10px;font-weight:700;padding-top:2px}.stamp{width:70px;height:70px;border:2px solid #5868a0;border-radius:50%;color:#5868a0;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;font-size:8px;line-height:1.15;margin-top:4px;transform:rotate(-12deg)}.signature{height:33px;margin-top:6px;border-bottom:1px solid transparent}.footer{position:absolute;left:9mm;right:9mm;bottom:5mm;border-top:1px solid #222;padding-top:6px;font-weight:700;font-size:9px}.footer span:last-child{float:right;font-weight:400}@media print{body{background:#fff}.page{min-height:277mm}}</style></head><body><main class="page"><header class="header"><div><div class="brand">BioBes</div><div class="tagline">Cultivation and export<br>of medicinal and aromatic plants.</div></div><div class="title">Invoice number : ${escapeHtml(invoice.docNumber)}</div><div class="contact"><b>BioBes shpk</b><br>Sopës 53 Gradisht,<br>Divjakë, 9021, Albania<br>Vat no : L43904041<br>Mob: +355 69 40 45 464<br>Mob: +355 69 28 89 191<br>Email: Info@biobes.al<br>Web: www.biobes.al</div></header><p class="date">Date ${escapeHtml(new Date(invoice.date).toLocaleDateString("en-GB"))}</p><section class="parties"><p><b>Bill To Company</b>: ${escapeHtml(details.billTo || invoice.buyer?.name || "—")}</p><p><b>Vat nr</b>: ${escapeHtml(invoice.buyer?.nipt || "—")}</p><p><b>Adressa</b>: ${escapeHtml(partyAddress(invoice.buyer))}</p><p><b>Ship to company</b>: ${escapeHtml(details.shipTo || "—")}</p><p><b>Address</b>: ${escapeHtml(details.deliveryPlace || partyAddress(invoice.buyer))}</p></section><section class="meta">${label("Delivery Place", details.deliveryPlace || "—")}${label("Place of origin", details.countryOfOrigin || "Albania")}${label("Means of transport", details.meansOfTransport || "—")}${label("Purchase order", details.purchaseOrder || "—")}${label("Delivery Terms", details.deliveryTerms || "—")}${label("Seal number", details.sealNumber || "—")}${label("Paymant", details.paymentTerms || "—")}${label("Currency / Rate", `${currency} / ${Number(invoice.exchangeRate || 1).toFixed(6)}`)}</section><table class="items"><thead><tr><th>CN code</th><th>Packing<br>No.</th><th>Weight of<br>bag(kg)</th><th>Description of goods</th><th>Type</th><th>Gross<br>weight</th><th>Net weight</th><th>Price</th><th>Total amount</th></tr></thead><tbody>${lineRows}</tbody><tfoot><tr><td><i>Total</i></td><td>${rows.reduce((sum, row) => sum + (Number(row.packingNo) || 0), 0) || "—"}</td><td></td><td></td><td></td><td class="number">${gross.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td><td class="number">${net.toLocaleString("en-US", { maximumFractionDigits: 3 })}</td><td></td><td class="number">€ ${((totalGoods ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr></tfoot></table><table class="totals"><tbody><tr><td>Cost of ${rows.reduce((sum, row) => sum + (Number(row.packingNo) || 0), 0) || "30"} pallets *50Eur</td><td>€ ${(palletCost / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr><tr><td>Loading cost</td><td>€ ${(loadingCost / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr><tr class="grand"><td>Total</td><td>€ ${(total / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr></tbody></table><section class="bank-sign"><div><div class="administrator">Administrator</div><div class="stamp">BioBes<br><small>DIVJAKË · ALBANIA</small></div><div class="signature">${escapeHtml(details.administrator || "Besnik Koçi")}</div></div><div class="bank"><div><b>Banka:</b> ${escapeHtml(details.bankName || "RAIFFEISEN BANK ShA")}</div><div><b>Swift code:</b> ${escapeHtml(details.swiftCode || "SGSBALTX")}</div><div><b>Name:</b> Biobes shpk</div><div><b>IBAN:</b> ${escapeHtml(details.iban || "AL63202220060000000031158942")}</div></div></section><footer class="footer">Payment must be exclusively on this account bank IBAN ${escapeHtml(details.iban || "AL63202220060000000031158942")}<span>BioBes shpk</span></footer></main>${autoPrint ? "<script>window.onload=()=>window.print()</script>" : ""}</body></html>`;
}

export function printExportInvoice(invoice: ReferenceInvoiceSource) {
  const popup = window.open("", "_blank", "width=900,height=1100");
  if (!popup) return false;
  popup.document.write(buildExportInvoicePrintHtml(invoice));
  popup.document.close();
  return true;
}

export function exportExportInvoiceToPDF(invoice: ReferenceInvoiceSource) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const details = exportDetails(invoice); const rows = exportInvoiceRows(invoice);
  const goodsTotal = invoice.totalAmount ?? rows.reduce((sum, row) => sum + row.valueBeforeVatCents, 0);
  const palletCost = details.palletCost ?? 0; const loadingCost = details.loadingCost ?? 0; const total = goodsTotal + palletCost + loadingCost;
  const blue: [number, number, number] = [37, 59, 46]; const line: [number, number, number] = [32, 32, 32]; const fill: [number, number, number] = [230, 237, 232];
  const x = 55; const right = 540; const width = right - x;
  doc.setTextColor(...blue); doc.setFont("helvetica", "bolditalic"); doc.setFontSize(28); doc.text("BioBes", 80, 70);
  doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(55, 55, 55); doc.text(["Cultivation and export", "of medicinal and aromatic plants."], 80, 84);
  doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.text(`Invoice number : ${invoice.docNumber}`, 300, 94, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text(["BioBes shpk", "Sopës 53 Gradisht,", "Divjakë, 9021, Albania", "Vat no : L43904041", "Mob: +355 69 40 45 464", "Mob: +355 69 28 89 191", "Email: Info@biobes.al", "Web: www.biobes.al"], 410, 45);
  doc.setDrawColor(...line); doc.setLineWidth(1.1); doc.line(x, 108, right, 108); doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(`Date ${new Date(invoice.date).toLocaleDateString("en-GB")}`, right, 126, { align: "right" });
  const buyer = invoice.buyer ?? {}; const partyLines = [["Bill To Company", details.billTo || buyer.name || "—"], ["Vat nr", buyer.nipt || "—"], ["Adressa", partyAddress(buyer)], ["Ship to company", details.shipTo || "—"], ["Address", details.deliveryPlace || partyAddress(buyer)]];
  doc.setFontSize(9); partyLines.forEach(([label, value], i) => { const y = 160 + i * 15; doc.setFont("helvetica", "bold"); doc.text(`${label}:`, 105, y); doc.setFont("helvetica", "normal"); doc.text(doc.splitTextToSize(String(value), 360), 190, y); });
  const meta: Array<[string, string]> = [["Delivery Place", details.deliveryPlace || "—"], ["Place of origin", details.countryOfOrigin || "Albania"], ["Means of transport", details.meansOfTransport || "—"], ["Purchase order", details.purchaseOrder || "—"], ["Delivery Terms", details.deliveryTerms || "—"], ["Seal number", details.sealNumber || "—"], ["Paymant", details.paymentTerms || "—"], ["Currency / Rate", `${invoiceCurrencyLabel(invoice.currency)} / ${Number(invoice.exchangeRate || 1).toFixed(6)}`]];
  meta.forEach(([label, value], i) => { const col = i % 2; const row = Math.floor(i / 2); const bx = col ? 315 : 105; const y = 245 + row * 14; doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(`${label}:`, bx, y); doc.setFont("helvetica", "normal"); doc.text(doc.splitTextToSize(value, 115), bx + 82, y); });
  const head = ["CN code", "Packing No.", "Weight of bag(kg)", "Description of goods", "Type", "Gross weight", "Net weight", "Price", "Total amount"];
  autoTable(doc, { head: [head], body: rows.map(row => [row.cnCode, row.packingNo, row.bagWeight == null ? "—" : String(row.bagWeight), row.description, row.type, row.grossWeight == null ? "—" : String(row.grossWeight), row.netWeight == null ? "—" : String(row.netWeight), `€ ${((row.unitPriceCents ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, `€ ${((row.valueBeforeVatCents ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`]), foot: [["Total", String(rows.reduce((sum, row) => sum + (Number(row.packingNo) || 0), 0) || "—"), "", "", "", String(details.grossWeight ?? rows.reduce((sum, row) => sum + (row.grossWeight ?? row.quantity), 0)), String(details.netWeight ?? rows.reduce((sum, row) => sum + (row.netWeight ?? row.quantity), 0)), "", `€ ${(goodsTotal / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`]], startY: 335, margin: { left: x, right: 55 }, tableWidth: width, styles: { fontSize: 5.4, cellPadding: 2.6, lineColor: line, lineWidth: 0.6, textColor: [20, 20, 20] }, headStyles: { fillColor: fill, textColor: [20, 20, 20], fontStyle: "bolditalic", halign: "center", minCellHeight: 30 }, footStyles: { fillColor: [255, 255, 255], textColor: [20, 20, 20], fontStyle: "bold" }, columnStyles: { 0: { cellWidth: 47 }, 1: { cellWidth: 48 }, 2: { cellWidth: 55 }, 3: { cellWidth: 122 }, 4: { cellWidth: 38 }, 5: { cellWidth: 55 }, 6: { cellWidth: 54 }, 7: { cellWidth: 48 }, 8: { cellWidth: 63 } } });
  const finalY = ((doc as any).lastAutoTable?.finalY ?? 500) as number; const costRows = [[`Cost of ${rows.reduce((sum, row) => sum + (Number(row.packingNo) || 0), 0) || "30"} pallets *50Eur`, `€ ${(palletCost / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`], ["Loading cost", `€ ${(loadingCost / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`], ["Total", `€ ${(total / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`]];
  autoTable(doc, { body: costRows, startY: finalY + 8, margin: { left: 350, right: 55 }, styles: { fontSize: 8, cellPadding: 3, lineColor: line, lineWidth: 0.6 }, columnStyles: { 0: { cellWidth: 120, fontStyle: "bold" }, 1: { cellWidth: 70, halign: "right" } }, didParseCell: (data: any) => { if (data.row.index === 2) data.cell.styles.fontStyle = "bold"; } });
  const bankY = finalY + 100; doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.text("Administrator", 80, bankY); doc.setDrawColor(88, 104, 160); doc.setTextColor(88, 104, 160); doc.setLineWidth(1.2); doc.circle(112, bankY + 40, 30); doc.setFontSize(8); doc.text("BioBes", 112, bankY + 38, { align: "center" }); doc.setFontSize(5); doc.text("DIVJAKE · ALBANIA", 112, bankY + 48, { align: "center" }); doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(details.administrator || "Besnik Koçi", 80, bankY + 78); doc.setFont("helvetica", "bold"); doc.text("Banka:", 350, bankY); doc.setFont("helvetica", "normal"); doc.text(details.bankName || "RAIFFEISEN BANK ShA", 405, bankY); doc.setFont("helvetica", "bold"); doc.text("Swift code:", 350, bankY + 16); doc.setFont("helvetica", "normal"); doc.text(details.swiftCode || "SGSBALTX", 405, bankY + 16); doc.setFont("helvetica", "bold"); doc.text("Name:", 350, bankY + 32); doc.setFont("helvetica", "normal"); doc.text("Biobes shpk", 405, bankY + 32); doc.setFont("helvetica", "bold"); doc.text("IBAN:", 350, bankY + 48); doc.setFont("helvetica", "normal"); doc.text(details.iban || "AL63202220060000000031158942", 405, bankY + 48);
  const footerY = 790; doc.setDrawColor(...line); doc.line(x, footerY - 8, right, footerY - 8); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(`Payment must be exclusively on this account bank IBAN ${details.iban || "AL63202220060000000031158942"}`, x, footerY); doc.setFont("helvetica", "normal"); doc.text("BioBes shpk", right, footerY, { align: "right" }); doc.save(`Export_Invoice_${invoice.docNumber}.pdf`);
}

export async function exportExportInvoiceToExcel(invoice: ReferenceInvoiceSource) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistemi Genit Cloud";
  const sheet = workbook.addWorksheet("Export Invoice", { views: [{ showGridLines: false }] });
  sheet.pageSetup = { orientation: "portrait", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1 };
  (sheet as unknown as { pageMargins?: Record<string, number> }).pageMargins = { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25, header: 0.1, footer: 0.1 };
  [15, 14, 14, 32, 12, 14, 14, 14, 18].forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  const details = exportDetails(invoice);
  const rows = exportInvoiceRows(invoice);
  const currency = invoiceCurrencyLabel(invoice.currency);
  const net = details.netWeight ?? rows.reduce((sum, row) => sum + (row.netWeight ?? row.quantity), 0);
  const gross = details.grossWeight ?? rows.reduce((sum, row) => sum + (row.grossWeight ?? row.quantity), 0);
  const goodsTotal = invoice.totalAmount ?? rows.reduce((sum, row) => sum + row.valueBeforeVatCents, 0);
  const palletCost = details.palletCost ?? 0;
  const loadingCost = details.loadingCost ?? 0;
  const total = goodsTotal + palletCost + loadingCost;
  sheet.mergeCells("A1:C2"); setExcelValue(sheet, 1, 1, "BioBes", true); sheet.getCell("A1").font = { name: "Arial", size: 20, bold: true, italic: true, color: { argb: "FF253B2E" } }; sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
  sheet.mergeCells("D1:F2"); setExcelValue(sheet, 1, 4, `Invoice number : ${invoice.docNumber}`, true); sheet.getCell("D1").font = { name: "Arial", size: 14, bold: true, color: { argb: TEXT } }; sheet.getCell("D1").alignment = { horizontal: "center", vertical: "middle" };
  sheet.mergeCells("G1:I6"); setExcelValue(sheet, 1, 7, "BioBes shpk\nSopës 53 Gradisht,\nDivjakë, 9021, Albania\nVat no : L43904041\nMob: +355 69 40 45 464\nMob: +355 69 28 89 191\nEmail: Info@biobes.al\nWeb: www.biobes.al"); sheet.getCell("G1").alignment = { wrapText: true, vertical: "top" }; sheet.getRow(1).height = 22;
  sheet.mergeCells("A3:C3"); setExcelValue(sheet, 3, 1, "Cultivation and export\nof medicinal and aromatic plants."); sheet.getCell("A3").font = { name: "Arial", size: 8, italic: true, color: { argb: MUTED } }; sheet.getCell("A3").alignment = { wrapText: true };
  sheet.mergeCells("D3:F3"); setExcelValue(sheet, 3, 4, `Date ${new Date(invoice.date).toLocaleDateString("en-GB")}`); sheet.getCell("D3").alignment = { horizontal: "center" };
  const writeLine = (row: number, left: string, right: string, leftCol: number, rightCol: number) => { setExcelValue(sheet, row, leftCol, left, true); sheet.mergeCells(row, leftCol + 1, row, rightCol); setExcelValue(sheet, row, leftCol + 1, right); };
  writeLine(5, "Bill To Company", details.billTo || invoice.buyer?.name || "—", 1, 4); writeLine(6, "Vat nr", invoice.buyer?.nipt || "—", 1, 4); writeLine(7, "Adressa", partyAddress(invoice.buyer), 1, 4); writeLine(8, "Ship to company", details.shipTo || "—", 1, 4); writeLine(9, "Address", details.deliveryPlace || partyAddress(invoice.buyer), 1, 4);
  [["Delivery Place", details.deliveryPlace || "—"], ["Place of origin", details.countryOfOrigin || "Albania"], ["Means of transport", details.meansOfTransport || "—"], ["Purchase order", details.purchaseOrder || "—"], ["Delivery Terms", details.deliveryTerms || "—"], ["Seal number", details.sealNumber || "—"], ["Paymant", details.paymentTerms || "—"], ["Currency / Rate", `${currency} / ${Number(invoice.exchangeRate || 1).toFixed(6)}`]].forEach(([label, value], index) => { const row = 7 + index; writeLine(row, label, value, 5, 9); });
  const headerRow = 16; const headers = ["CN code", "Packing No.", "Weight of bag(kg)", "Description of goods", "Type", "Gross weight", "Net weight", "Price", "Total amount"]; headers.forEach((header, index) => { const cell = setExcelValue(sheet, headerRow, index + 1, header, true); cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PAGE_BLUE } }; cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; }); sheet.getRow(headerRow).height = 32;
  rows.forEach((row, index) => { const excelRow = headerRow + 1 + index; const values: Array<string | number> = [row.cnCode, row.packingNo, row.bagWeight ?? "—", row.description, row.type, row.grossWeight ?? "—", row.netWeight ?? "—", excelAmount(row.unitPriceCents), excelAmount(row.valueBeforeVatCents)]; values.forEach((value, column) => { const cell = setExcelValue(sheet, excelRow, column + 1, value); cell.alignment = { horizontal: column === 3 ? "left" : "right", vertical: "middle", wrapText: true }; }); sheet.getRow(excelRow).height = 30; });
  const totalRow = headerRow + rows.length + 1; ["Total", "", "", "", "", gross, net, "", excelAmount(goodsTotal)].forEach((value, index) => { const cell = setExcelValue(sheet, totalRow, index + 1, value); cell.font = { name: "Arial", size: 9, bold: true, color: { argb: TEXT } }; }); excelSectionBorder(sheet, headerRow, totalRow, 1, 9);
  const costStart = totalRow + 2; [[`Cost of ${rows.reduce((sum, row) => sum + (Number(row.packingNo) || 0), 0) || "30"} pallets *50Eur`, palletCost], ["Loading cost", loadingCost], ["Total", total]].forEach(([label, value], index) => { const row = costStart + index; sheet.mergeCells(row, 6, row, 8); setExcelValue(sheet, row, 6, String(label), true); setExcelValue(sheet, row, 9, excelAmount(Number(value)), true); excelSectionBorder(sheet, row, row, 6, 9); });
  const bankRow = costStart + 5; setExcelValue(sheet, bankRow, 1, "Administrator", true); setExcelValue(sheet, bankRow + 1, 1, details.administrator || "Besnik Koçi"); setExcelValue(sheet, bankRow, 6, "Banka", true); setExcelValue(sheet, bankRow, 7, details.bankName || "RAIFFEISEN BANK ShA"); setExcelValue(sheet, bankRow + 1, 6, "Swift code", true); setExcelValue(sheet, bankRow + 1, 7, details.swiftCode || "SGSBALTX"); setExcelValue(sheet, bankRow + 2, 6, "Name", true); setExcelValue(sheet, bankRow + 2, 7, "Biobes shpk"); setExcelValue(sheet, bankRow + 3, 6, "IBAN", true); sheet.mergeCells(bankRow + 3, 7, bankRow + 3, 9); setExcelValue(sheet, bankRow + 3, 7, details.iban || "AL63202220060000000031158942");
  const footerRow = bankRow + 6; sheet.mergeCells(footerRow, 1, footerRow, 9); setExcelValue(sheet, footerRow, 1, `Payment must be exclusively on this account bank IBAN ${details.iban || "AL63202220060000000031158942"}`, true); sheet.getCell(footerRow, 1).alignment = { horizontal: "left" };
  const buffer = await workbook.xlsx.writeBuffer(); downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `Export_Invoice_${invoice.docNumber}.xlsx`);
}
