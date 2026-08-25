import XLSX from "xlsx";
const wb = XLSX.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx");
const sheetName = "PAGAT KORRIK 2026";
const sheet = wb.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log("Sheet:", sheetName, "Total rows:", data.length);
for (let i = 0; i < Math.min(12, data.length); i++) {
  console.log(`Row ${i+1}:`, data[i]);
}
