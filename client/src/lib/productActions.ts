export function getOpenProductId(search: string): number {
  const raw = new URLSearchParams(search).get("openProduct");
  const id = Number(raw || 0);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

export function canDeleteProduct(product: { stock?: number | null }, hasReferences: boolean): boolean {
  return !hasReferences && Number(product.stock || 0) === 0;
}
