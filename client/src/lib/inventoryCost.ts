export type CostedProduct = {
  avgPrice?: number | null;
  lastPrice?: number | null;
};

/** Prices are stored in minor units (qindarka), consistently with the product schema. */
export function getProductCostCents(product?: CostedProduct | null) {
  return Number(product?.avgPrice || product?.lastPrice || 0);
}

export function getStockValueCents(product: CostedProduct | null | undefined, quantity: number) {
  return Math.round(getProductCostCents(product) * quantity);
}
