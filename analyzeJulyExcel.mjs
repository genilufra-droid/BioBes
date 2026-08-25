import XLSX from "xlsx";
const wb = XLSX.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx");
console.log("Sheet names:", wb.SheetNames);
const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes("oret")) || wb.SheetNames[0];
console.log("Analyzing sheet:", sheetName);
const sheet = wb.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log("Total rows:", data.length);
console.log("First 10 rows:");
for (let i = 0; i < Math.min(10, data.length); i++) {
  console.log(`Row ${i+1}:`, data[i]);
}
