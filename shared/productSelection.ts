export type InvoiceProductSelection = { productId?: number; productName: string; unit: string; unitPrice: number };

export function linkCreatedProductToInvoiceLine(product: { id: number; name: string; baseUnit?: string | null }, unitPrice: number): InvoiceProductSelection {
  if (!Number.isInteger(product.id) || product.id <= 0) throw new Error("ID-ja e artikullit të krijuar nuk është e vlefshme.");
  return { productId: product.id, productName: product.name.trim(), unit: product.baseUnit || "copë", unitPrice: Math.max(0, unitPrice) };
}
