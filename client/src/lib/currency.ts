/**
 * Formats the amount units used by the non-payroll ERP modules.
 * Those forms and queries currently exchange whole lek values, so this
 * formatter deliberately does not rescale the number.
 */
export function formatLek(value: number | null | undefined): string {
  return `${(value ?? 0).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
}
