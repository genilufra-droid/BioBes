import * as XLSX from "xlsx";
import fs from "node:fs/promises";
const buffer = await fs.readFile("./Template_Pagat_Prezenca_Genit_v511.xlsx");
const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
const sheets = Object.fromEntries(workbook.SheetNames.map(name => {
  const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, raw: false, defval: "" });
  return [name, { rows: matrix.length, columns: Math.max(0, ...matrix.map(row => row.length)), header: matrix[1] || matrix[0] || [] }];
}));
if (workbook.SheetNames.join("|") !== "ORET E PUNES|PAGAT QERSHOR 2026|UDHËZIME") throw new Error(`Sheet-et e papritura: ${workbook.SheetNames.join(", ")}`);
if (sheets["ORET E PUNES"].columns !== 33) throw new Error(`ORET E PUNES duhet të ketë 33 kolona, ka ${sheets["ORET E PUNES"].columns}`);
if (sheets["PAGAT QERSHOR 2026"].columns !== 14) throw new Error(`PAGAT duhet të ketë 14 kolona, ka ${sheets["PAGAT QERSHOR 2026"].columns}`);
if (sheets["UDHËZIME"].rows < 6) throw new Error("Fleta UDHËZIME nuk ka udhëzimet e plota.");
console.log(JSON.stringify({ sheetNames: workbook.SheetNames, sheets }, null, 2));
