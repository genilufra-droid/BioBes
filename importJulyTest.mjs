import XLSX from "xlsx";
const wb = XLSX.readFile("/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx");

// Lexo sheet oret e punes
const oretSheet = wb.Sheets["ORET E PUNES"];
const oretData = XLSX.utils.sheet_to_json(oretSheet, { header: 1 });

// Lexo sheet pagat korrik
const pagatSheet = wb.Sheets["PAGAT KORRIK 2026"];
const pagatData = XLSX.utils.sheet_to_json(pagatSheet, { header: 1 });

console.log("--- ORET E PUNES SAMPLE (Row 4-8) ---");
for (let i = 3; i < 8; i++) {
  console.log(oretData[i]);
}

console.log("--- PAGAT KORRIK SAMPLE (Row 3-7) ---");
for (let i = 2; i < 7; i++) {
  console.log(pagatData[i]);
}
