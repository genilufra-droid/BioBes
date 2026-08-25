export type LeaveAbsence = { payrollEmployeeId: number; leaveType: string; startDate: string; endDate: string; notes?: string | null };

export function leaveDaysInPeriod(rows: LeaveAbsence[], year: number, month: number) {
  const dayMap = new Map<string, LeaveAbsence>();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  for (const row of rows) {
    const from = new Date(`${row.startDate}T00:00:00Z`);
    const to = new Date(`${row.endDate}T00:00:00Z`);
    const cursor = new Date(Math.max(from.getTime(), start.getTime()));
    const last = Math.min(to.getTime(), end.getTime());
    while (cursor.getTime() <= last) {
      dayMap.set(`${row.payrollEmployeeId}-${cursor.getUTCDate()}`, row);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return dayMap;
}
