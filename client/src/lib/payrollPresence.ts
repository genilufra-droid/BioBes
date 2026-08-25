export type PresenceAttendance = {
  normalMinutes?: number;
  overtimeMinutes?: number;
  note?: string | null;
};

export function attendanceGrossMinutes(row: PresenceAttendance) {
  const notedGross = String(row.note || "").match(/(?:^|\|)\s*Bruto\s+(\d+)m/i);
  if (notedGross) return Number(notedGross[1]);
  const normal = row.normalMinutes || 0;
  const overtime = row.overtimeMinutes || 0;
  return normal + overtime + (normal >= 480 ? 60 : 0);
}

export function payrollPresenceTotals(rows: PresenceAttendance[]) {
  const normalMinutes = rows.reduce((sum, row) => sum + (row.normalMinutes || 0), 0);
  const overtimeMinutes = rows.reduce((sum, row) => sum + (row.overtimeMinutes || 0), 0);
  return {
    grossMinutes: rows.reduce((sum, row) => sum + attendanceGrossMinutes(row), 0),
    payableMinutes: normalMinutes + overtimeMinutes,
    normalMinutes,
    overtimeMinutes,
  };
}

export const weekdayShort = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];
