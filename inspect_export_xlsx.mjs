import ExcelJS from 'exceljs';
import { readdirSync } from 'node:fs';
const files = readdirSync('/home/ubuntu/Downloads').filter(f => /^Export_Invoice_540.*\.xlsx$/.test(f)).sort();
const file = files.at(-1);
if (!file) throw new Error('Export_Invoice_540.xlsx not found');
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(`/home/ubuntu/Downloads/${file}`);
const ws = wb.getWorksheet('Export Invoice');
console.log(JSON.stringify({file, sheets: wb.worksheets.map(s => s.name), dimensions: ws?.dimensions?.toString(), pageSetup: ws?.pageSetup, headers: ws?.getRow(11).values, footer: ws?.getCell(ws.rowCount,1).value}, null, 2));
