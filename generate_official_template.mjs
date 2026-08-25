import * as XLSX from "xlsx";
import fs from "node:fs/promises";

const workbook = XLSX.utils.book_new();

// 1. Sheet-i i Prezencës / Oret e Punes (30 dite per Qershorin)
const hoursHeader = ["NR", "EMRI", "MBIEMRI", ...Array.from({ length: 30 }, (_, i) => i + 1)];
const hoursSample = [];
const hoursSheet = XLSX.utils.aoa_to_sheet([["ORET E PUNES - QERSHOR 2026"], hoursHeader, ...hoursSample]);
hoursSheet["!cols"] = [{ wch: 6 }, { wch: 18 }, { wch: 18 }, ...Array.from({ length: 30 }, () => ({ wch: 5 }))];
XLSX.utils.book_append_sheet(workbook, hoursSheet, "ORET E PUNES");

// 2. Sheet-i i Pagave (PAGAT QERSHOR 2026)
const payrollHeader = [
  "NR",
  "EMER",
  "MBIEMER",
  "ORE PUNE NORMALE",
  "KOSTO OPN",
  "SHUMA (1)",
  "ORE PUNE SHTESE",
  "KOSTO OPSH",
  "SHUMA (2)",
  "BONUS & PAGAT BAZE (3)",
  "Bonus 5000 ALL (4)",
  "SHUMA TOTALE (1+2+3+4)",
  "PAGESA NE BANK",
  "PAGESA KESH"
];
const payrollSample = [];
const payrollSheet = XLSX.utils.aoa_to_sheet([["PAGAT QERSHOR 2026"], payrollHeader, ...payrollSample]);
payrollSheet["!cols"] = [
  { wch: 6 }, { wch: 18 }, { wch: 18 },
  { wch: 16 }, { wch: 12 }, { wch: 12 },
  { wch: 16 }, { wch: 12 }, { wch: 12 },
  { wch: 22 }, { wch: 16 }, { wch: 20 },
  { wch: 16 }, { wch: 16 }
];
XLSX.utils.book_append_sheet(workbook, payrollSheet, "PAGAT QERSHOR 2026");

const instructionsSheet = XLSX.utils.aoa_to_sheet([
  ["UDHËZIME PËR IMPORTIN E PAGAVE — SISTEMI GENIT v5.11"],
  ["1", "Mos ndrysho emrat e sheet-eve: ORET E PUNES dhe PAGAT QERSHOR 2026."],
  ["2", "Plotëso NR, EMRI dhe MBIEMRI pa dublikime dhe përdor të njëjtin NR për të njëjtin punonjës në të dyja fletët."],
  ["3", "Në ORET E PUNES përdor vlera si 8, 8+1 ose kode tekstuale të sistemit si M/L; Qershori ka 30 ditë."],
  ["4", "Në PAGAT plotëso ORE PUNE NORMALE, KOSTO OPN, ORE PUNE SHTESE, KOSTO OPSH, BONUS & PAGAT BAZE (3), Bonus 5000 ALL (4), PAGESA NE BANK dhe PAGESA KESH."],
  ["5", "Përdor vetëm numra në kolonat monetare dhe Lek (ALL); mos vendos simbole €/$/£ ose tekst në këto kolona."],
  ["6", "Mos përfshi rreshta përmbledhës TOTAL ose PUNETORET TE HUAJ në rreshtat e punonjësve."],
]);
instructionsSheet["!cols"] = [{ wch: 6 }, { wch: 125 }];
XLSX.utils.book_append_sheet(workbook, instructionsSheet, "UDHËZIME");

const outputPath = "/home/ubuntu/sistemi-genit-cloud/Template_Pagat_Prezenca_Genit_v511.xlsx";
XLSX.writeFile(workbook, outputPath);
console.log(`Template-i u krijua me sukses në: ${outputPath}`);
process.exit(0);
