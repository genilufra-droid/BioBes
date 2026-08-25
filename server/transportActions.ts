export type CargoLoadStatus = "DRAFT" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export function canCancelCargoLoad(status: CargoLoadStatus) {
  return status !== "DELIVERED" && status !== "CANCELLED";
}

export function canDeleteCargoLoadDraft(status: CargoLoadStatus) {
  return status === "DRAFT";
}

export function normalizeCargoLoadNumber(value: string) {
  return String(value ?? "").trim().toLocaleLowerCase("sq-AL");
}

export function shouldCreateCargoLoad(existingLoadNumbers: string[], orderNumber: string) {
  const normalizedOrder = normalizeCargoLoadNumber(orderNumber);
  return normalizedOrder.length > 0 && !existingLoadNumbers.some(value => normalizeCargoLoadNumber(value) === normalizedOrder);
}

export function calculatePurchaseOrderCargoWeightKg(items: Array<{ netWeightKg?: number | null; grossWeightKg?: number | null; loadedQuantity?: number | null; quantity?: number | null }>) {
  return items.reduce((sum, item) => sum + Number(item.netWeightKg ?? item.grossWeightKg ?? item.loadedQuantity ?? item.quantity ?? 0), 0);
}
