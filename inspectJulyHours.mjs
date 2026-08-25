import XLSX from "xlsx";
const workbook = XLSX.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx", { cellDates: true });
const sheet = workbook.Sheets["ORET E PUNES"];
const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
console.log("ref", sheet["!ref"], "rows", matrix.length, "cols", Math.max(...matrix.map(row => row.length)));
for (let index = 0; index < Math.min(matrix.length, 20); index += 1) {
  const row = matrix[index] || [];
  console.log(index + 1, JSON.stringify(row.slice(0, 40)));
}
console.log("last rows");
for (let index = Math.max(0, matrix.length - 5); index < matrix.length; index += 1) console.log(index + 1, JSON.stringify(matrix[index]));
