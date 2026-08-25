export function purchaseReceiptPath(orderId: number) {
  return `/purchase-invoices?tab=receipts&orderId=${orderId}`;
}
