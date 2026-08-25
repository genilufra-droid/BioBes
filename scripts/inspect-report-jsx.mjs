import fs from "node:fs";
const source = fs.readFileSync("client/src/pages/ReportsCenter.tsx", "utf8");
for (const marker of ["isSalesModule && <fieldset>", "isPurchaseModule && <label>", "ReportDocumentDialog"]) {
  const index = source.indexOf(marker);
  console.log(`--- ${marker} @ ${index} ---`);
  console.log(index >= 0 ? source.slice(Math.max(0, index - 180), index + 1600) : "not found");
}
EOF
