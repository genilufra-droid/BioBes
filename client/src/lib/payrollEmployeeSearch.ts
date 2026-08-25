export type SearchablePayrollEmployee = {
  employeeNumber?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
};

const normalizeSearch = (value: string) => value.toLocaleLowerCase("sq-AL").replace(/[^a-z0-9ëç]/gi, "");

export function filterPayrollEmployees<T extends SearchablePayrollEmployee>(rows: T[], search: string): T[] {
  const query = normalizeSearch(search);
  if (!query) return rows;
  return rows.filter(row => normalizeSearch(`${row.employeeNumber ?? ""} ${row.firstName ?? ""} ${row.lastName ?? ""} ${row.position ?? ""}`).includes(query));
}
