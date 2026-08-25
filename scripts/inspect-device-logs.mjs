import * as XLSX from "xlsx";

const inputPath = process.argv[2];
if (!inputPath) throw new Error("Jep rrugën e skedarit Excel.");

const workbook = XLSX.readFile(inputPath, { cellDates: false, raw: false });
const inspection = workbook.SheetNames.map(name => {
  const sheet = workbook.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  return { name, range: sheet["!ref"], rowCount: rows.length, preview: rows.slice(0, 45) };
});

console.log(JSON.stringify({ sheets: inspection }, null, 2));
