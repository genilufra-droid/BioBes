import XLSX from "xlsx";

const wb = XLSX.readFile("/home/ubuntu/upload/001_2026_8_MON.XLS");
console.log("Total sheets in log:", wb.SheetNames.length);

let totalEmployeesFound = 0;
wb.SheetNames.forEach(name => {
  const sheet = wb.Sheets[name];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  // Gjej emrin dhe numrin nga rreshti 2 dhe 3
  const row2 = json[2] || [];
  const row3 = json[3] || [];
  const nameVal = row2[7] || row2[5] || row2[1];
  const noVal = row3[9] || row3[7] || row3[1];
  if (nameVal || noVal) {
    totalEmployeesFound++;
    if (totalEmployeesFound <= 5) {
      console.log(`Sheet "${name}" -> Name: ${nameVal}, No: ${noVal}`);
    }
  }
});
console.log(`Total employee sheets parsed: ${totalEmployeesFound}`);
