import { readFileSync } from "node:fs";
import { parseSalesWorkbook } from "../client/src/lib/salesWorkbookImport";

const file = "/home/ubuntu/upload/2026FATURAT,LIKUJDIMETEFERMEREVE(1)(4).xlsx";
const result = parseSalesWorkbook(readFileSync(file));
const invoice540 = result.invoices.find(invoice => invoice.docNumber === "540" && invoice.invoiceFormat === "EXPORT");
console.log(JSON.stringify({
  invoices: result.invoices.length,
  errors: result.issues.filter(issue => issue.severity === "error").length,
  warnings: result.issues.filter(issue => issue.severity === "warning").length,
  invoice540: invoice540 ? {
    date: invoice540.date.toISOString().slice(0, 10),
    customer: invoice540.customerName,
    items: invoice540.items.length,
    sourceRows: invoice540.sourceRows,
    itemNames: invoice540.items.map(item => item.productName),
    warnings: invoice540.warnings,
  } : null,
}, null, 2));
