export type CustomerLookupRecord = {
  id: number;
  name: string;
  code?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function filterReportCustomers(customers: CustomerLookupRecord[], term: string) {
  const normalized = term.trim().toLocaleLowerCase("sq-AL");
  if (!normalized) return customers;
  return customers.filter(customer =>
    `${customer.name} ${customer.code || ""} ${customer.email || ""} ${customer.phone || ""}`
      .toLocaleLowerCase("sq-AL")
      .includes(normalized),
  );
}
