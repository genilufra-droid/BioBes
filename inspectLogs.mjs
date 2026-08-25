import XLSX from "xlsx";
const wb = XLSX.readFile("/home/ubuntu/upload/001_2026_8_MON.XLS");
for (const name of ["Summary", "Logs"]) {
  const sheet = wb.Sheets[name];
  if (!sheet) continue;
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  console.log(`=== ${name} (${rows.length} rows) ===`);
  for (let i = 0; i < Math.min(80, rows.length); i++) {
    if (rows[i].some(v => String(v).trim() !== "")) console.log(i, JSON.stringify(rows[i].slice(0, 45)));
  }
}
for (const name of wb.SheetNames.filter(n => n !== "Summary" && n !== "Logs").slice(0, 3)) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "" });
  console.log(`=== ${name} ===`);
  for (let i = 0; i < Math.min(80, rows.length); i++) {
    if (rows[i].some(v => String(v).trim() !== "")) console.log(i, JSON.stringify(rows[i].slice(0, 45)));
  }
}
