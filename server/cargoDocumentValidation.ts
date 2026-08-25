const allowedExtensions = new Set(["pdf", "png", "jpg", "jpeg", "webp", "gif", "zip", "doc", "docx", "xls", "xlsx"]);

export const MAX_CARGO_DOCUMENT_BYTES = 25 * 1024 * 1024;

export function validateCargoDocumentInput(fileName: string, fileSize: number, decodedBytes: number) {
  const extension = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
  if (!allowedExtensions.has(extension)) return "Lejohen vetëm PDF, foto, ZIP, Word dhe Excel.";
  if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_CARGO_DOCUMENT_BYTES) return "Skedari duhet të jetë mbi 0 dhe deri në 25 MB.";
  if (!Number.isInteger(decodedBytes) || decodedBytes <= 0 || decodedBytes > MAX_CARGO_DOCUMENT_BYTES) return "Skedari është bosh ose tejkalon 25 MB.";
  return null;
}
