export type PurchaseDocumentType = "Faturë" | "Porosi" | "Pranim" | "Kthim";

export type PurchaseDocumentTarget =
  | { tab: "bills"; query: { openInvoice: number } }
  | { tab: "orders"; query: { openOrder: number } }
  | { tab: "receipts"; query: {} }
  | { tab: "returns"; query: {} };

export function getPurchaseDocumentTarget(type: PurchaseDocumentType, id: number): PurchaseDocumentTarget {
  if (type === "Faturë") return { tab: "bills", query: { openInvoice: id } };
  if (type === "Porosi") return { tab: "orders", query: { openOrder: id } };
  if (type === "Pranim") return { tab: "receipts", query: {} };
  return { tab: "returns", query: {} };
}
