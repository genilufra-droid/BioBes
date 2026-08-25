import { exportToExcel, exportToPDF } from "@/lib/export";
import { roundedWholeHours } from "@/lib/payrollFormatting";

type PayrollRow = {
  payrollEmployeeId?: number;
  employeeNumber: string;
  employeeName: string;
  normalMinutes: number;
  overtimeMinutes: number;
  regularPayCents?: number;
  overtimePayCents?: number;
  paymentMethod?: "BANK" | "CASH" | string;
  bankPaymentCents?: number;
  cashPaymentCents?: number;
  bonusCents?: number;
  grossCents: number;
  socialEmployeeCents: number;
  socialEmployerCents: number;
  taxCents: number;
  netCents: number;
  payableCents: number;
};

const amount = (cents: number) => (cents / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const hasSplit = (entry: PayrollRow) => entry.bankPaymentCents != null || entry.cashPaymentCents != null ? (entry.bankPaymentCents || 0) !== 0 || (entry.cashPaymentCents || 0) !== 0 : false;
const bankAmount = (entry: PayrollRow) => hasSplit(entry) ? entry.bankPaymentCents || 0 : entry.paymentMethod === "BANK" ? entry.payableCents : 0;
const cashAmount = (entry: PayrollRow) => hasSplit(entry) ? entry.cashPaymentCents || 0 : entry.paymentMethod === "CASH" ? entry.payableCents : 0;
const payrollPdfOptions = { landscape: true, headerColor: [234, 240, 247] as [number, number, number], headerTextColor: [32, 55, 92] as [number, number, number], titleColor: [23, 37, 61] as [number, number, number], fontSize: 7, alternateRowColor: false as const };
const payrollExcelOptions = (title: string) => ({ title, landscape: true, headerColor: "FFEAF0F7", titleColor: "FF17253D" });
const borderoColumns = [
  { key: "nr", label: "NR" }, { key: "punonjesi", label: "EMËR MBIEMËR" }, { key: "oreBruto", label: "ORË BRUTO" }, { key: "orePagese", label: "ORË PAGESË" }, { key: "oreNormale", label: "ORË NORMALE" }, { key: "kostoOpn", label: "KOSTO OPN" }, { key: "shuma1", label: "SHUMA (1)" }, { key: "oreShtese", label: "ORË SHTESË" }, { key: "kostoOpsh", label: "KOSTO OPSH" }, { key: "shuma2", label: "SHUMA (2)" }, { key: "bonus", label: "BONUS" }, { key: "total", label: "TOTAL" }, { key: "banka", label: "BANKA" }, { key: "cash", label: "KESH" },
] as const;
const bankColumns = [{ key: "nr", label: "NR" }, { key: "punonjesi", label: "EMËR MBIEMËR" }, { key: "nrLlogarise", label: "NR. LLOGARISË" }, { key: "banka", label: "BANKA" }, { key: "shuma", label: "SHUMA" }] as const;
const cashColumns = [{ key: "nr", label: "NR" }, { key: "punonjesi", label: "EMËR MBIEMËR" }, { key: "nrListepage", label: "NR. LISTËPAGE" }, { key: "pagesaCash", label: "PAGESA CASH" }, { key: "nenshkrim", label: "NËNSHKRIM" }] as const;

type PayrollBorderoEmployee = { id: number; regularRateCents?: number; overtimeRateCents?: number };

export function payrollBorderoRows(entries: PayrollRow[], employees: PayrollBorderoEmployee[] = []) {
  const rates = new Map(employees.map(employee => [employee.id, employee]));
  return entries.map((entry, index) => {
    const employee = rates.get(entry.payrollEmployeeId || 0);
    return ({
    nr: index + 1,
    punonjesi: entry.employeeName,
    oreBruto: roundedWholeHours(entry.normalMinutes + entry.overtimeMinutes),
    orePagese: roundedWholeHours(entry.normalMinutes + entry.overtimeMinutes),
    oreNormale: roundedWholeHours(entry.normalMinutes),
    kostoOpn: entry.normalMinutes ? amount(Math.round((entry.regularPayCents || 0) * 60 / entry.normalMinutes)) : amount(employee?.regularRateCents || 0),
    shuma1: amount(entry.regularPayCents || 0),
    oreShtese: roundedWholeHours(entry.overtimeMinutes),
    kostoOpsh: entry.overtimeMinutes ? amount(Math.round((entry.overtimePayCents || 0) * 60 / entry.overtimeMinutes)) : amount(employee?.overtimeRateCents || 0),
    shuma2: amount(entry.overtimePayCents || 0),
    bonus: amount(entry.bonusCents || 0),
    total: amount(entry.grossCents),
    banka: amount(bankAmount(entry)),
    cash: amount(cashAmount(entry)),
  });
  });
}

export function payrollBorderoRowsWithTotal(entries: PayrollRow[], employees: PayrollBorderoEmployee[] = []) {
  const rows = payrollBorderoRows(entries, employees);
  const totals = entries.reduce((sum, entry) => ({
    normalMinutes: sum.normalMinutes + entry.normalMinutes,
    overtimeMinutes: sum.overtimeMinutes + entry.overtimeMinutes,
    regularPayCents: sum.regularPayCents + (entry.regularPayCents || 0),
    overtimePayCents: sum.overtimePayCents + (entry.overtimePayCents || 0),
    bonusCents: sum.bonusCents + (entry.bonusCents || 0),
    grossCents: sum.grossCents + entry.grossCents,
    bankPaymentCents: sum.bankPaymentCents + bankAmount(entry),
    cashPaymentCents: sum.cashPaymentCents + cashAmount(entry),
  }), { normalMinutes: 0, overtimeMinutes: 0, regularPayCents: 0, overtimePayCents: 0, bonusCents: 0, grossCents: 0, bankPaymentCents: 0, cashPaymentCents: 0 });
  return [...rows, {
    nr: "TOTAL",
    punonjesi: "",
    oreBruto: roundedWholeHours(totals.normalMinutes + totals.overtimeMinutes),
    orePagese: roundedWholeHours(totals.normalMinutes + totals.overtimeMinutes),
    oreNormale: roundedWholeHours(totals.normalMinutes),
    kostoOpn: "",
    shuma1: amount(totals.regularPayCents),
    oreShtese: roundedWholeHours(totals.overtimeMinutes),
    kostoOpsh: "",
    shuma2: amount(totals.overtimePayCents),
    bonus: amount(totals.bonusCents),
    total: amount(totals.grossCents),
    banka: amount(totals.bankPaymentCents),
    cash: amount(totals.cashPaymentCents),
  }];
}

export function exportPayrollBordero(entries: PayrollRow[], periodLabel: string, employees: PayrollBorderoEmployee[] = []) {
  const rows = payrollBorderoRowsWithTotal(entries, employees);
  exportToExcel(rows, `Bordero_${periodLabel}`, "Bordero", borderoColumns, payrollExcelOptions(`BORDERO — ${periodLabel}`));
}

export function exportPayrollBorderoPdf(entries: PayrollRow[], periodLabel: string, employees: PayrollBorderoEmployee[] = []) {
  const rows = payrollBorderoRowsWithTotal(entries, employees);
  exportToPDF(rows, `Bordero_${periodLabel}`, `BORDERO — ${periodLabel}`, borderoColumns, payrollPdfOptions);
}

export function printPayrollBordero(entries: PayrollRow[], periodLabel: string, employees: PayrollBorderoEmployee[] = []) {
  const rows = payrollBorderoRowsWithTotal(entries, employees);
  printPayrollDocument(`BORDERO — ${periodLabel}`, borderoColumns.map(column => column.label), rows as Record<string, string | number | undefined>[], { fontSize: 7, compact: true });
}

type PayrollPaymentEntry = PayrollRow & { bankAccount?: string | null; bankName?: string | null };
type PayrollPaymentExportRow = {
  nr: number | string;
  punonjesi: string;
  nrLlogarise?: string;
  banka?: string;
  shuma?: string;
  nrListepage?: string;
  pagesaCash?: string;
  nenshkrim?: string;
};

export function payrollPaymentRows(entries: PayrollPaymentEntry[], type: "BANK" | "CASH"): PayrollPaymentExportRow[] {
  return entries.map((entry, index) => type === "BANK" ? ({ nr: index + 1, punonjesi: entry.employeeName, nrLlogarise: entry.bankAccount || "", banka: entry.bankName || "", shuma: amount(bankAmount(entry)) }) : ({ nr: index + 1, punonjesi: entry.employeeName, nrListepage: entry.employeeNumber, pagesaCash: amount(cashAmount(entry)), nenshkrim: "" }));
}

export function payrollPaymentRowsWithTotal(entries: PayrollPaymentEntry[], type: "BANK" | "CASH"): PayrollPaymentExportRow[] {
  const rows = payrollPaymentRows(entries, type);
  const totalCents = entries.reduce((sum, entry) => sum + (type === "BANK" ? bankAmount(entry) : cashAmount(entry)), 0);
  return type === "BANK"
    ? [...rows, { nr: "TOTALI PËR BANKË", punonjesi: "", nrLlogarise: "", banka: "", shuma: amount(totalCents) }]
    : [...rows, { nr: "TOTALI PËR CASH", punonjesi: "", nrListepage: "", pagesaCash: amount(totalCents), nenshkrim: "" }];
}

export function printPayrollDocument(title: string, columns: string[], rows: Record<string, string | number | undefined>[], options?: { fontSize?: number; compact?: boolean }) {
  const body = rows.map(row => `<tr>${Object.values(row).map(value => `<td>${value ?? ""}</td>`).join("")}</tr>`).join("");
  const popup = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
  if (!popup) return;
  const fontSize = options?.fontSize || 11; const padding = options?.compact ? 1 : 6;
  popup.document.write(`<!doctype html><html lang="sq"><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:${options?.compact ? 8 : 24}px;color:#17253d}h1{text-align:center;font-size:${options?.compact ? 12 : 18}px}table{border-collapse:collapse;width:100%;font-size:${fontSize}px}th,td{border:1px solid #b8c3d0;padding:${padding}px;text-align:right}th{background:#eaf0f7;color:#20375c}td:nth-child(2){text-align:left}@page{size:A4 landscape;margin:10mm}</style></head><body><h1>${title}</h1><table><thead><tr>${columns.map(column => `<th>${column}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}

export function exportPayrollBank(entries: PayrollPaymentEntry[], periodLabel: string) {
  exportToExcel(payrollPaymentRowsWithTotal(entries, "BANK"), `Listepagesa_Banke_${periodLabel}`, "Banka", bankColumns, payrollExcelOptions(`LISTËPAGESA BANKË — ${periodLabel}`));
}

export function exportPayrollBankPdf(entries: PayrollPaymentEntry[], periodLabel: string) {
  exportToPDF(payrollPaymentRowsWithTotal(entries, "BANK"), `Listepagesa_Banke_${periodLabel}`, `LISTËPAGESA BANKË — ${periodLabel}`, bankColumns, payrollPdfOptions);
}

export function printPayrollBank(entries: PayrollPaymentEntry[], periodLabel: string) {
  printPayrollDocument(`LISTËPAGESA BANKË — ${periodLabel}`, ["NR", "EMËR MBIEMËR", "NR. LLOGARISË", "BANKA", "SHUMA"], payrollPaymentRowsWithTotal(entries, "BANK") as Record<string, string | number | undefined>[]);
}

export function exportPayrollCash(entries: PayrollPaymentEntry[], periodLabel: string) {
  exportToExcel(payrollPaymentRowsWithTotal(entries, "CASH"), `Listepagesa_Cash_${periodLabel}`, "Cash", cashColumns, payrollExcelOptions(`LISTËPAGESA CASH — ${periodLabel}`));
}

export function exportPayrollCashPdf(entries: PayrollPaymentEntry[], periodLabel: string) {
  exportToPDF(payrollPaymentRowsWithTotal(entries, "CASH"), `Listepagesa_Cash_${periodLabel}`, `LISTËPAGESA CASH — ${periodLabel}`, cashColumns, payrollPdfOptions);
}

export function printPayrollCash(entries: PayrollPaymentEntry[], periodLabel: string) {
  printPayrollDocument(`LISTËPAGESA CASH — ${periodLabel}`, ["NR", "EMËR MBIEMËR", "NR. LISTËPAGE", "PAGESA CASH", "NËNSHKRIM"], payrollPaymentRowsWithTotal(entries, "CASH") as Record<string, string | number | undefined>[]);
}

export function payrollContribRows(entries: PayrollRow[]) {
  return entries.map(entry => ({ punonjesi: entry.employeeName, kontributPunemarres: amount(entry.socialEmployeeCents), kontributPunedhenes: amount(entry.socialEmployerCents), tatim: amount(entry.taxCents) }));
}

export function exportPayrollContrib(entries: PayrollRow[], periodLabel: string) {
  exportToExcel(payrollContribRows(entries), `Libri_Kontributeve_${periodLabel}`, "Kontributet", [{ key: "punonjesi", label: "PUNONJËSI" }, { key: "kontributPunemarres", label: "KONTRIB. PUNËMARRËS" }, { key: "kontributPunedhenes", label: "KONTRIB. PUNËDHËNËS" }, { key: "tatim", label: "TATIM" }], payrollExcelOptions(`LIBRI I KONTRIBUTEVE — ${periodLabel}`));
}

export function exportPayrollContribPdf(entries: PayrollRow[], periodLabel: string) {
  exportToPDF(payrollContribRows(entries), `Libri_Kontributeve_${periodLabel}`, `LIBRI I KONTRIBUTEVE — ${periodLabel}`, [{ key: "punonjesi", label: "PUNONJËSI" }, { key: "kontributPunemarres", label: "KONTRIB. PUNËMARRËS" }, { key: "kontributPunedhenes", label: "KONTRIB. PUNËDHËNËS" }, { key: "tatim", label: "TATIM" }], payrollPdfOptions);
}

export function printPayrollContrib(entries: PayrollRow[], periodLabel: string) {
  printPayrollDocument(`LIBRI I KONTRIBUTEVE — ${periodLabel}`, ["PUNONJËSI", "KONTRIB. PUNËMARRËS", "KONTRIB. PUNËDHËNËS", "TATIM"], payrollContribRows(entries));
}

type PayrollPayslipEntry = PayrollRow & {
  regularPayCents: number;
  overtimePayCents: number;
  advanceCents: number;
};

export function payrollPayslipRows(entries: PayrollPayslipEntry[]) {
  return entries.map((entry, index) => ({
    nr: index + 1,
    punonjesi: entry.employeeName,
    oreNormale: Math.round(entry.normalMinutes / 60),
    oreShtese: Math.round(entry.overtimeMinutes / 60),
    vpagaNormale: amount(entry.regularPayCents),
    vpagaShtese: amount(entry.overtimePayCents),
    bruto: amount(entry.grossCents),
    tatimi: amount(entry.taxCents),
    neto: amount(entry.netCents),
    avans: amount(entry.advanceCents),
    banka: amount(bankAmount(entry)),
    cash: amount(cashAmount(entry)),
    perPagese: amount(entry.payableCents),
  }));
}

export function payrollPayslipRowsWithTotal(entries: PayrollPayslipEntry[]) {
  const rows = payrollPayslipRows(entries);
  const totals = entries.reduce((sum, entry) => ({
    normalMinutes: sum.normalMinutes + entry.normalMinutes,
    overtimeMinutes: sum.overtimeMinutes + entry.overtimeMinutes,
    regularPayCents: sum.regularPayCents + entry.regularPayCents,
    overtimePayCents: sum.overtimePayCents + entry.overtimePayCents,
    grossCents: sum.grossCents + entry.grossCents,
    taxCents: sum.taxCents + entry.taxCents,
    netCents: sum.netCents + entry.netCents,
    advanceCents: sum.advanceCents + entry.advanceCents,
    bankPaymentCents: sum.bankPaymentCents + bankAmount(entry),
    cashPaymentCents: sum.cashPaymentCents + cashAmount(entry),
    payableCents: sum.payableCents + entry.payableCents,
  }), { normalMinutes: 0, overtimeMinutes: 0, regularPayCents: 0, overtimePayCents: 0, grossCents: 0, taxCents: 0, netCents: 0, advanceCents: 0, bankPaymentCents: 0, cashPaymentCents: 0, payableCents: 0 });
  return [...rows, {
    nr: "TOTAL",
    punonjesi: "",
    oreNormale: Math.round(totals.normalMinutes / 60),
    oreShtese: Math.round(totals.overtimeMinutes / 60),
    vpagaNormale: amount(totals.regularPayCents),
    vpagaShtese: amount(totals.overtimePayCents),
    bruto: amount(totals.grossCents),
    tatimi: amount(totals.taxCents),
    neto: amount(totals.netCents),
    avans: amount(totals.advanceCents),
    banka: amount(totals.bankPaymentCents),
    cash: amount(totals.cashPaymentCents),
    perPagese: amount(totals.payableCents),
  }];
}

const payslipColumns = [
  "NR", "PUNONJËSI", "ORË NORM.", "ORË SHT.", "VPAGA NORM.", "VPAGA SHT.", "BRUTO (7)", "TATIMI (8)", "NETO (9)", "AVANS", "BANKË", "CASH", "PËR PAGESË",
];

export function exportPayrollPayslips(entries: PayrollPayslipEntry[], periodLabel: string) {
  exportToExcel(payrollPayslipRowsWithTotal(entries), `Fletepagesat_${periodLabel}`, "Fletëpagesat", [{ key: "nr", label: "NR" }, { key: "punonjesi", label: "PUNONJËSI" }, { key: "oreNormale", label: "ORË NORM." }, { key: "oreShtese", label: "ORË SHT." }, { key: "vpagaNormale", label: "VPAGA NORM." }, { key: "vpagaShtese", label: "VPAGA SHT." }, { key: "bruto", label: "BRUTO (7)" }, { key: "tatimi", label: "TATIMI (8)" }, { key: "neto", label: "NETO (9)" }, { key: "avans", label: "AVANS" }, { key: "banka", label: "BANKË" }, { key: "cash", label: "CASH" }, { key: "perPagese", label: "PËR PAGESË" }], payrollExcelOptions(`FLETËPAGESAT — ${periodLabel}`));
}

export function exportPayrollPayslipsPdf(entries: PayrollPayslipEntry[], periodLabel: string) {
  exportToPDF(payrollPayslipRowsWithTotal(entries), `Fletepagesat_${periodLabel}`, `FLETËPAGESAT — ${periodLabel}`, [
    { key: "nr", label: "NR" }, { key: "punonjesi", label: "PUNONJËSI" }, { key: "oreNormale", label: "ORË NORM." }, { key: "oreShtese", label: "ORË SHT." }, { key: "vpagaNormale", label: "VPAGA NORM." }, { key: "vpagaShtese", label: "VPAGA SHT." }, { key: "bruto", label: "BRUTO (7)" }, { key: "tatimi", label: "TATIMI (8)" }, { key: "neto", label: "NETO (9)" }, { key: "avans", label: "AVANS" }, { key: "banka", label: "BANKË" }, { key: "cash", label: "CASH" }, { key: "perPagese", label: "PËR PAGESË" },
  ], payrollPdfOptions);
}

export function printPayrollPayslips(entries: PayrollPayslipEntry[], periodLabel: string) {
  printPayrollDocument(`FLETËPAGESAT — ${periodLabel}`, payslipColumns, payrollPayslipRowsWithTotal(entries));
}

type PayrollAnalyticEntry = PayrollRow & {
  payrollEmployeeId: number;
};

type PayrollAnalyticEmployee = {
  id: number;
  position?: string | null;
};

export function payrollAnalyticRows(entries: PayrollAnalyticEntry[], employees: PayrollAnalyticEmployee[]) {
  const positions = new Map(employees.map(employee => [employee.id, employee.position?.trim() || "Pa pozicion"]));
  const groups = new Map<string, { pozicioni: string; punonjes: number; oreNormale: number; oreShtese: number; bruto: number; kontribut: number; tatim: number; neto: number; perPagese: number }>();
  for (const entry of entries) {
    const pozicioni = positions.get(entry.payrollEmployeeId) || "Pa pozicion";
    const group = groups.get(pozicioni) || { pozicioni, punonjes: 0, oreNormale: 0, oreShtese: 0, bruto: 0, kontribut: 0, tatim: 0, neto: 0, perPagese: 0 };
    group.punonjes += 1;
    group.oreNormale += entry.normalMinutes;
    group.oreShtese += entry.overtimeMinutes;
    group.bruto += entry.grossCents;
    group.kontribut += entry.socialEmployeeCents;
    group.tatim += entry.taxCents;
    group.neto += entry.netCents;
    group.perPagese += entry.payableCents;
    groups.set(pozicioni, group);
  }
  return Array.from(groups.values()).sort((a, b) => a.pozicioni.localeCompare(b.pozicioni, "sq")).map(group => ({
    pozicioni: group.pozicioni,
    punonjes: group.punonjes,
    oreNormale: roundedWholeHours(group.oreNormale),
    oreShtese: roundedWholeHours(group.oreShtese),
    bruto: amount(group.bruto),
    kontribut: amount(group.kontribut),
    tatim: amount(group.tatim),
    neto: amount(group.neto),
    perPagese: amount(group.perPagese),
  }));
}

const analyticColumns = ["POZICIONI", "PUNONJËS", "ORË NORMALE", "ORË SHTESË", "BRUTO", "KONTRIBUT", "TATIM", "NETO", "PËR PAGESË"];

export function exportPayrollAnalytic(entries: PayrollAnalyticEntry[], employees: PayrollAnalyticEmployee[], periodLabel: string) {
  exportToExcel(payrollAnalyticRows(entries, employees), `Bordero_Analitike_${periodLabel}`, "Bordero Analitike", [{ key: "pozicioni", label: "POZICIONI" }, { key: "punonjes", label: "PUNONJËS" }, { key: "oreNormale", label: "ORË NORMALE" }, { key: "oreShtese", label: "ORË SHTESË" }, { key: "bruto", label: "BRUTO" }, { key: "kontribut", label: "KONTRIBUT" }, { key: "tatim", label: "TATIM" }, { key: "neto", label: "NETO" }, { key: "perPagese", label: "PËR PAGESË" }], payrollExcelOptions(`BORDERO ANALITIKE — ${periodLabel}`));
}

export function exportPayrollAnalyticPdf(entries: PayrollAnalyticEntry[], employees: PayrollAnalyticEmployee[], periodLabel: string) {
  exportToPDF(payrollAnalyticRows(entries, employees), `Bordero_Analitike_${periodLabel}`, `BORDERO ANALITIKE — ${periodLabel}`, [
    { key: "pozicioni", label: "POZICIONI" }, { key: "punonjes", label: "PUNONJËS" }, { key: "oreNormale", label: "ORË NORMALE" }, { key: "oreShtese", label: "ORË SHTESË" }, { key: "bruto", label: "BRUTO" }, { key: "kontribut", label: "KONTRIBUT" }, { key: "tatim", label: "TATIM" }, { key: "neto", label: "NETO" }, { key: "perPagese", label: "PËR PAGESË" },
  ], payrollPdfOptions);
}

export function printPayrollAnalytic(entries: PayrollAnalyticEntry[], employees: PayrollAnalyticEmployee[], periodLabel: string) {
  printPayrollDocument(`BORDERO ANALITIKE — ${periodLabel}`, analyticColumns, payrollAnalyticRows(entries, employees));
}

type PayrollForeignEntry = PayrollRow & {
  payrollEmployeeId: number;
  paymentMethod: "BANK" | "CASH";
};

type PayrollForeignEmployee = {
  id: number;
  isForeign: number;
  dailyRateCents: number;
  overtimeRateCents?: number;
};

type PayrollForeignAttendance = {
  payrollEmployeeId: number;
  normalMinutes: number;
  overtimeMinutes: number;
};

export function payrollForeignRows(entries: PayrollForeignEntry[], employees: PayrollForeignEmployee[], attendance: PayrollForeignAttendance[]) {
  const foreignEmployees = new Map(employees.filter(employee => employee.isForeign === 1).map(employee => [employee.id, employee]));
  const workDays = new Map<number, number>();
  for (const row of attendance) {
    if (row.normalMinutes > 0 || row.overtimeMinutes > 0) workDays.set(row.payrollEmployeeId, (workDays.get(row.payrollEmployeeId) || 0) + 1);
  }
  return entries.filter(entry => foreignEmployees.has(entry.payrollEmployeeId)).map((entry, index) => {
    const employee = foreignEmployees.get(entry.payrollEmployeeId)!;
    const total = entry.payableCents;
    return {
      nr: index + 1,
      punonjesi: entry.employeeName,
      ditePune: workDays.get(entry.payrollEmployeeId) || 0,
      pagaDite: amount(employee.dailyRateCents),
      kostoOpsh: amount(employee.overtimeRateCents || 0),
      oreShtese: roundedWholeHours(entry.overtimeMinutes),
      banke: amount(bankAmount(entry)),
      cash: amount(cashAmount(entry)),
      total: amount(total),
    };
  });
}

const foreignColumns = ["NR", "EMËR MBIEMËR", "DITË PUNE", "PAGA/DITË", "KOSTO OPSH", "ORË SHTESË", "BANKË", "CASH", "TOTAL"];

export function exportPayrollForeign(entries: PayrollForeignEntry[], employees: PayrollForeignEmployee[], attendance: PayrollForeignAttendance[], periodLabel: string) {
  exportToExcel(payrollForeignRows(entries, employees, attendance), `Te_Huajt_${periodLabel}`, "Të Huajt", [{ key: "nr", label: "NR" }, { key: "punonjesi", label: "EMËR MBIEMËR" }, { key: "ditePune", label: "DITË PUNE" }, { key: "pagaDite", label: "PAGA/DITË" }, { key: "kostoOpsh", label: "KOSTO OPSH" }, { key: "oreShtese", label: "ORË SHTESË" }, { key: "banke", label: "BANKË" }, { key: "cash", label: "CASH" }, { key: "total", label: "TOTAL" }], payrollExcelOptions(`TË HUAJT — ${periodLabel}`));
}

export function exportPayrollForeignPdf(entries: PayrollForeignEntry[], employees: PayrollForeignEmployee[], attendance: PayrollForeignAttendance[], periodLabel: string) {
  exportToPDF(payrollForeignRows(entries, employees, attendance), `Te_Huajt_${periodLabel}`, `TË HUAJT — ${periodLabel}`, [
    { key: "nr", label: "NR" }, { key: "punonjesi", label: "EMËR MBIEMËR" }, { key: "ditePune", label: "DITË PUNE" }, { key: "pagaDite", label: "PAGA/DITË" }, { key: "kostoOpsh", label: "KOSTO OPSH" }, { key: "oreShtese", label: "ORË SHTESË" }, { key: "banke", label: "BANKË" }, { key: "cash", label: "CASH" }, { key: "total", label: "TOTAL" },
  ], payrollPdfOptions);
}

export function printPayrollForeign(entries: PayrollForeignEntry[], employees: PayrollForeignEmployee[], attendance: PayrollForeignAttendance[], periodLabel: string) {
  printPayrollDocument(`TË HUAJT — ${periodLabel}`, foreignColumns, payrollForeignRows(entries, employees, attendance));
}

export function payrollTaxContributionRows(entries: PayrollRow[]) {
  return entries.map(entry => ({
    punonjesi: entry.employeeName,
    kontributPunemarres: amount(entry.socialEmployeeCents),
    kontributPunedhenes: amount(entry.socialEmployerCents),
    tatim: amount(entry.taxCents),
    bruto: amount(entry.grossCents),
    neto: amount(entry.netCents),
  }));
}

const taxContributionColumns = ["PUNONJËSI", "KONTRIBUT PUNËMARRËS", "KONTRIBUT PUNËDHËNËS", "TATIM", "BRUTO", "NETO"];

export function exportPayrollTaxContributions(entries: PayrollRow[], periodLabel: string) {
  exportToExcel(payrollTaxContributionRows(entries), `Tatime_Kontribute_${periodLabel}`, "Tatime & Kontribute", [{ key: "punonjesi", label: "PUNONJËSI" }, { key: "kontributPunemarres", label: "KONTRIBUT PUNËMARRËS" }, { key: "kontributPunedhenes", label: "KONTRIBUT PUNËDHËNËS" }, { key: "tatim", label: "TATIM" }, { key: "bruto", label: "BRUTO" }, { key: "neto", label: "NETO" }], payrollExcelOptions(`TATIME & KONTRIBUTE — ${periodLabel}`));
}

export function exportPayrollTaxContributionsPdf(entries: PayrollRow[], periodLabel: string) {
  exportToPDF(payrollTaxContributionRows(entries), `Tatime_Kontribute_${periodLabel}`, `TATIME & KONTRIBUTE — ${periodLabel}`, [
    { key: "punonjesi", label: "PUNONJËSI" }, { key: "kontributPunemarres", label: "KONTRIBUT PUNËMARRËS" }, { key: "kontributPunedhenes", label: "KONTRIBUT PUNËDHËNËS" }, { key: "tatim", label: "TATIM" }, { key: "bruto", label: "BRUTO" }, { key: "neto", label: "NETO" },
  ], payrollPdfOptions);
}

export function printPayrollTaxContributions(entries: PayrollRow[], periodLabel: string) {
  printPayrollDocument(`TATIME & KONTRIBUTE — ${periodLabel}`, taxContributionColumns, payrollTaxContributionRows(entries));
}

type PayrollContributionHistoryEntry = {
  employeeNumber: string;
  employeeName: string;
  grossCents: number;
  socialEmployeeCents: number;
  socialEmployerCents: number;
  taxCents: number;
  netCents: number;
  payableCents: number;
  month: number;
  year: number;
};

export function payrollContributionHistoryRows(entries: PayrollContributionHistoryEntry[]) {
  return entries.map(entry => ({
    periudha: `${String(entry.month).padStart(2, "0")}/${entry.year}`,
    nrListepage: entry.employeeNumber,
    punonjesi: entry.employeeName,
    bruto: amount(entry.grossCents),
    kontributPunemarres: amount(entry.socialEmployeeCents),
    kontributPunedhenes: amount(entry.socialEmployerCents),
    tatim: amount(entry.taxCents),
    neto: amount(entry.netCents),
    perPagese: amount(entry.payableCents),
  }));
}

const contributionHistoryColumns = ["PERIUDHA", "NR. LISTËPAGE", "PUNONJËSI", "BRUTO", "KONTRIBUT PUNËMARRËS", "KONTRIBUT PUNËDHËNËS", "TATIM", "NETO", "PËR PAGESË"];

export function exportPayrollContributionHistory(entries: PayrollContributionHistoryEntry[]) {
  exportToExcel(payrollContributionHistoryRows(entries), "Libri_i_Kontributeve", "Libri i Kontributeve", [{ key: "periudha", label: "PERIUDHA" }, { key: "nrListepage", label: "NR. LISTËPAGE" }, { key: "punonjesi", label: "PUNONJËSI" }, { key: "bruto", label: "BRUTO" }, { key: "kontributPunemarres", label: "KONTRIBUT PUNËMARRËS" }, { key: "kontributPunedhenes", label: "KONTRIBUT PUNËDHËNËS" }, { key: "tatim", label: "TATIM" }, { key: "neto", label: "NETO" }, { key: "perPagese", label: "PËR PAGESË" }], payrollExcelOptions("LIBRI I KONTRIBUTEVE"));
}

export function exportPayrollContributionHistoryPdf(entries: PayrollContributionHistoryEntry[]) {
  exportToPDF(payrollContributionHistoryRows(entries), "Libri_i_Kontributeve", "LIBRI I KONTRIBUTEVE", [
    { key: "periudha", label: "PERIUDHA" }, { key: "nrListepage", label: "NR. LISTËPAGE" }, { key: "punonjesi", label: "PUNONJËSI" }, { key: "bruto", label: "BRUTO" }, { key: "kontributPunemarres", label: "KONTRIBUT PUNËMARRËS" }, { key: "kontributPunedhenes", label: "KONTRIBUT PUNËDHËNËS" }, { key: "tatim", label: "TATIM" }, { key: "neto", label: "NETO" }, { key: "perPagese", label: "PËR PAGESË" },
  ], payrollPdfOptions);
}

export function printPayrollContributionHistory(entries: PayrollContributionHistoryEntry[]) {
  printPayrollDocument("LIBRI I KONTRIBUTEVE", contributionHistoryColumns, payrollContributionHistoryRows(entries));
}
