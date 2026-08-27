export type PurchaseRegisterFilters = {
  dateFrom: string;
  dateTo: string;
  docNumber: string;
  status: string;
  supplierId: string;
  supplier: string;
  productId: string;
  product: string;
  quantity: string;
  unitPrice: string;
  netValue: string;
  vat: string;
  grossValue: string;
  carrier: string;
  plate: string;
  inventoryReference: string;
};

export const emptyPurchaseRegisterFilters: PurchaseRegisterFilters = {
  dateFrom: "",
  dateTo: "",
  docNumber: "",
  status: "",
  supplierId: "",
  supplier: "",
  productId: "",
  product: "",
  quantity: "",
  unitPrice: "",
  netValue: "",
  vat: "",
  grossValue: "",
  carrier: "",
  plate: "",
  inventoryReference: "",
};

/**
 * Kërkimi dhe filtri i pagesës janë pjesë e toolbar-it të regjistrit Alpha.
 * Paneli i gjatë modern me fusha kolonash nuk shfaqet në ambientin operativ.
 */
export function PurchaseRegisterFilterBar(_props: {
  filters: PurchaseRegisterFilters;
  onChange: (filters: PurchaseRegisterFilters) => void;
}) {
  return null;
}
