import XLSX from "xlsx";
const wb = XLSX.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx");
const sheet = wb.Sheets["PAGAT KORRIK 2026"];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("=== KRAHASIMI I KORRIKIT 2026 (EXCEL SAMPLE) ===");
// Header është row 2 (index 1)
const header = rows[1];
console.log("Headers:", header);

let matchCount = 0;
for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1]) continue;
  const nr = r[0];
  const name = r[1];
  const surname = r[2];
  const normalHours = r[3] || 0;
  const overtimeHours = r[6] || 0;
  const totalSum = r[11] || 0;
  const bank = r[12] || 0;
  const cash = r[13] || 0;
  if (matchCount < 10) {
    console.log(`[Nr ${nr}] ${name} ${surname} | OPN: ${normalHours} | OPSH: ${overtimeHours} | Totali: ${totalSum} Lek (Bank: ${bank}, Cash: ${cash})`);
  }
  matchCount++;
}
console.log(`Total active employee payroll rows in Excel: ${matchCount}`);
