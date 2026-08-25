export function validatePayrollBackup(value: unknown): { employees: unknown[]; periods: unknown[]; attendance: unknown[]; entries: unknown[] } {
  const payroll = (value as { payroll?: unknown })?.payroll as Record<string, unknown> | undefined;
  if (!payroll || !Array.isArray(payroll.employees) || !Array.isArray(payroll.periods) || !Array.isArray(payroll.attendance) || !Array.isArray(payroll.entries)) throw new Error("Skedari nuk është backup i vlefshëm i Pagave.");
  return payroll as { employees: unknown[]; periods: unknown[]; attendance: unknown[]; entries: unknown[] };
}
