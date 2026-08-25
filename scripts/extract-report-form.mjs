import fs from "node:fs";
const source = fs.readFileSync("client/src/pages/ReportsCenter.tsx", "utf8");
const start = source.indexOf('<div className="grid gap-3 border-b');
const end = source.indexOf('</main>', start);
console.log(`start=${start} end=${end}`);
console.log(source.slice(start, Math.min(end, start + 12000)));
