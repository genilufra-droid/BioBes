export type PurchaseLineForTotal = {
  quantity: number;
  unitPrice: number;
};

/** Shuma ruhet në qindarka për të shmangur gabimet e numrave dhjetorë. */
export function calculatePurchaseTotal(lines: PurchaseLineForTotal[]): number {
  if (lines.length === 0) {
    throw new Error("Një porosi duhet të ketë të paktën një artikull.");
  }

  return lines.reduce((total, line) => {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error("Sasia duhet të jetë numër i plotë pozitiv.");
    }
    if (!Number.isInteger(line.unitPrice) || line.unitPrice < 0) {
      throw new Error("Çmimi duhet të jetë vlerë e plotë jo-negative në qindarka.");
    }
    return total + line.quantity * line.unitPrice;
  }, 0);
}

export function canApplyStockReduction(currentStock: number, quantity: number): boolean {
  return Number.isInteger(currentStock) && Number.isInteger(quantity) && currentStock >= 0 && quantity > 0 && currentStock >= quantity;
}

export type StatusDocument = { status: string | null; totalAmount?: number | null };

export function summarizeDocumentStatuses(documents: StatusDocument[]) {
  return documents.reduce<Record<string, { count: number; totalAmount: number }>>((summary, document) => {
    const status = document.status || "DRAFT";
    const current = summary[status] ?? { count: 0, totalAmount: 0 };
    current.count += 1;
    current.totalAmount += document.totalAmount ?? 0;
    summary[status] = current;
    return summary;
  }, {});
}
