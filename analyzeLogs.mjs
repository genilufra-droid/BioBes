import XLSX from "xlsx";

const wb = XLSX.readFile("/home/ubuntu/upload/001_2026_8_MON.XLS");
console.log("Sheet names in logs:", wb.SheetNames);
wb.SheetNames.forEach(name => {
  const sheet = wb.Sheets[name];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\nSheet "${name}" total rows:`, json.length);
  for (let i = 0; i < Math.min(10, json.length); i++) {
    if (json[i] && json[i].some(Boolean)) {
      console.log(`Row ${i}:`, json[i].slice(0, 10));
    }
  }
});
