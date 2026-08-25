export function canValidateInventoryDocument(status: string | null): boolean {
  return status === "DRAFT";
}

export function canCancelInventoryDocument(status: string | null): boolean {
  return status === "DRAFT";
}

export function canDeleteInventoryDraft(status: string | null): boolean {
  return status === "DRAFT";
}

export function hasWarehouseSelection(warehouseId: number | null | undefined): warehouseId is number {
  return typeof warehouseId === "number" && Number.isInteger(warehouseId) && warehouseId > 0;
}

export function validateRequiredWarehouseId(warehouseId: number | null | undefined): number {
  if (!hasWarehouseSelection(warehouseId)) throw new Error("Zgjidhni një magazinë për faturën para ruajtjes");
  return warehouseId;
}

export function canTransferBetweenWarehouses(sourceWarehouseId: number, destinationWarehouseId: number): boolean {
  return hasWarehouseSelection(sourceWarehouseId) && hasWarehouseSelection(destinationWarehouseId) && sourceWarehouseId !== destinationWarehouseId;
}

export function calculateInventoryDifference(systemQuantity: number, countedQuantity: number): number {
  return countedQuantity - systemQuantity;
}
