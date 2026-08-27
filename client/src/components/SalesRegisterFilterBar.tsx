export type SalesRegisterFilters = {
  dateFrom: string;
  dateTo: string;
  docNumber: string;
  status: string;
  customerId: string;
  customer: string;
  invoiceFormat: string;
  currency: string;
  warehouse: string;
  productId: string;
  product: string;
  quantity: string;
  unitPrice: string;
  value: string;
  valueInLek: string;
};

export const emptySalesRegisterFilters: SalesRegisterFilters = {
  dateFrom: "",
  dateTo: "",
  docNumber: "",
  status: "",
  customerId: "",
  customer: "",
  invoiceFormat: "",
  currency: "",
  warehouse: "",
  productId: "",
  product: "",
  quantity: "",
  unitPrice: "",
  value: "",
  valueInLek: "",
};

/**
 * Filtrimi i përditshëm mbahet në toolbar-in e regjistrit Alpha.
 * Paneli modern me 15 fusha vertikale nuk shfaqet në ambientin operativ.
 */
export default function SalesRegisterFilterBar(_props: {
  filters: SalesRegisterFilters;
  onChange: (filters: SalesRegisterFilters) => void;
  customerOptions?: string[];
  warehouseOptions?: string[];
  productOptions?: string[];
  productIdOptions?: string[];
}) {
  return null;
}
