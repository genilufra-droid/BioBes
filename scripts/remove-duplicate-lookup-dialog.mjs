import fs from "node:fs";
const path = "client/src/pages/ReportsCenter.tsx";
let source = fs.readFileSync(path, "utf8");
const marker = '    <Dialog open={Boolean(lookupKind)}';
const first = source.indexOf(marker);
const second = first < 0 ? -1 : source.indexOf(marker, first + marker.length);
if (second >= 0) {
  const end = source.indexOf('</Dialog>', second);
  if (end < 0) throw new Error('Second lookup dialog is not closed');
  source = `${source.slice(0, second)}${source.slice(end + '</Dialog>'.length)}`;
}
fs.writeFileSync(path, source);
console.log(second >= 0 ? 'removed duplicate lookup dialog' : 'no duplicate lookup dialog found');
