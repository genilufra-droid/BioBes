from pathlib import Path

path = Path('/home/ubuntu/sistemi-genit-cloud/client/src/lib/export.ts')
text = path.read_text()
start = text.index('export async function exportPurchaseInvoiceDocumentToExcel')
end = text.index('/**\n * Export data to Excel file', start)
replacement = '''export async function exportPurchaseInvoiceDocumentToExcel(invoice: PurchaseInvoiceDocumentSource) {
  await exportReferenceInvoiceToExcel(buildPurchaseReferenceInvoiceSource(invoice, invoice.company, invoice.supplier));
}

export function exportPurchaseInvoiceDocumentToPDF(invoice: PurchaseInvoiceDocumentSource) {
  exportReferenceInvoiceToPDF(buildPurchaseReferenceInvoiceSource(invoice, invoice.company, invoice.supplier));
}

export function printPurchaseInvoiceDocument(invoice: PurchaseInvoiceDocumentSource) {
  return printReferenceInvoice(buildPurchaseReferenceInvoiceSource(invoice, invoice.company, invoice.supplier));
}

'''
path.write_text(text[:start] + replacement + text[end:])
updated = path.read_text()
assert updated.count('export async function exportPurchaseInvoiceDocumentToExcel') == 1
assert updated.count('export function exportPurchaseInvoiceDocumentToPDF') == 1
assert updated.count('export function printPurchaseInvoiceDocument') == 1
