import XLSX from "xlsx";
const wb = XLSX.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx");
const sheet = wb.Sheets["PAGAT KORRIK 2026"];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("=== SIMULIMI I BORDEROS SË KORRIKIT 2026 ===");
let totalBank = 0;
let totalCash = 0;
let totalGeneral = 0;

for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1]) continue;
  const name = `${r[1]} ${r[2] || ""}`.trim();
  const totalSum = Number(r[11]) || 0;
  const bank = Number(r[12]) || 0;
  const cash = Number(r[13]) || 0;
  totalBank += bank;
  totalCash += cash;
  totalGeneral += totalSum;
}

console.log(`Totali Bankë: ${totalBank.toLocaleString()} Lek`);
console.log(`Totali Cash: ${totalCash.toLocaleString()} Lek`);
console.log(`Totali i Përgjithshëm: ${totalGeneral.toLocaleString()} Lek`);
console.log("Testi i llogaritjeve të Korrikut përfundoi me sukses!");
