export function canConvertQuotation(status: string | null, hasExistingOrder: boolean): boolean {
  return status !== "CANCELLED" && status !== "EXPIRED" && !hasExistingOrder;
}

export function canInvoiceDelivery(status: string | null, hasExistingInvoice: boolean): boolean {
  return status === "VALIDATED" && !hasExistingInvoice;
}

export function canInvoiceSalesOrder(status: string | null, hasExistingInvoice: boolean): boolean {
  return (status === "CONFIRMED" || status === "DELIVERED") && !hasExistingInvoice;
}

export function canCancelSalesQuotation(status: string | null, hasLinkedOrder: boolean): boolean {
  return (status === "DRAFT" || status === "SENT") && !hasLinkedOrder;
}

export function canCancelSalesOrder(status: string | null, hasLinkedDocuments: boolean): boolean {
  return (status === "DRAFT" || status === "CONFIRMED") && !hasLinkedDocuments;
}

export function canCancelSalesStockDocument(status: string | null): boolean {
  return status === "DRAFT";
}

export function canDeleteSalesDraft(status: string | null, hasLinkedDocuments = false): boolean {
  return status === "DRAFT" && !hasLinkedDocuments;
}
