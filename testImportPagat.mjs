import XLSX from "xlsx";

const wb = XLSX.readFile("/home/ubuntu/upload/Pagat.xlsx");
const sheetName = "PAGAT GUSHT 2026";
const sheet = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("Headers:", rows[1]);
const dataRows = rows.slice(2);
let count = 0;
dataRows.forEach((r, idx) => {
  const nr = r[0];
  const firstName = r[1];
  const lastName = r[2];
  const normalHours = r[3];
  const costNormal = r[4];
  const overtimeHours = r[6];
  const costOvertime = r[7];
  const baseSalary = r[9];

  if (firstName) {
    count++;
    if (count <= 5) {
      console.log(`Employee ${nr}: ${firstName} ${lastName || ""} | Normal: ${normalHours}h (cost: ${costNormal}) | Overtime: ${overtimeHours}h (cost: ${costOvertime}) | Base: ${baseSalary}`);
    }
  }
});
console.log(`Total valid employees in sheet: ${count}`);
