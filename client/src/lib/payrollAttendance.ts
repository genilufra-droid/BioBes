export type PayrollShift = { code: string; start: string; end: string; lunchMin?: number; opGrace?: number };
export type AttendanceRules = { lunchBreak?: number; lunchThreshold?: number; normalHours?: number };
export type DayAttendance = { grossMin: number; gross: number; workedMin: number; worked: number; lunchMin: number; normalMinutes: number; normalHours: number; overtimeMinutes: number; overtimeHours: number; assumedLunch: boolean; lunchConfirmed: boolean };

const toMinutes = (time: string) => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 ? hours * 60 + minutes : null;
};
const toHours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;

/** Llogarit një ditë pune sipas rregullave Abacus për stampime, drekë dhe shtesa. */
export function calculateAttendanceDay(rawTimes: string[], shift: PayrollShift, rules: AttendanceRules = {}, lunchOverride?: number): DayAttendance {
  const times = rawTimes.map(toMinutes).filter((value): value is number => value !== null).sort((a, b) => a - b);
  const lunchBreak = rules.lunchBreak ?? shift.lunchMin ?? 60;
  const lunchThreshold = (rules.lunchThreshold ?? 6) * 60;
  const normalLimit = (rules.normalHours ?? 8) * 60;
  const pairedEntries = times.length >= 4;
  let grossMin = 0;
  if (pairedEntries) for (let index = 0; index + 1 < times.length; index += 2) grossMin += Math.max(0, times[index + 1] - times[index]);
  else if (times.length >= 2) grossMin = Math.max(0, times[times.length - 1] - times[0]);
  const deductLunch = lunchBreak > 0 && !pairedEntries && times.length >= 2 && grossMin >= lunchThreshold;
  const hasOverride = lunchOverride !== undefined;
  const lunchMin = deductLunch ? (hasOverride ? Math.max(0, lunchOverride) : lunchBreak) : 0;
  const workedMin = Math.max(0, grossMin - lunchMin);
  const shiftEnd = toMinutes(shift.end) ?? 0;
  let overtimeMinutes = times.length >= 2 ? Math.max(0, times[times.length - 1] - shiftEnd - (shift.opGrace ?? 30)) : 0;
  if (shift.code === "CUSTOM" && workedMin > normalLimit) {
    overtimeMinutes = Math.max(overtimeMinutes, workedMin - normalLimit);
  }
  const normalMinutes = Math.min(workedMin, normalLimit);
  return { grossMin, gross: toHours(grossMin), workedMin, worked: toHours(workedMin), lunchMin, normalMinutes, normalHours: toHours(normalMinutes), overtimeMinutes, overtimeHours: toHours(overtimeMinutes), assumedLunch: deductLunch && !hasOverride, lunchConfirmed: hasOverride };
}

export function getPayrollPeriodDays(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function payrollAttendanceTotals(records: Array<{ normalMinutes?: number | null; overtimeMinutes?: number | null }>) {
  const minutes = records.reduce<{ normalMinutes: number; overtimeMinutes: number }>((result, record) => ({ normalMinutes: result.normalMinutes + Number(record.normalMinutes || 0), overtimeMinutes: result.overtimeMinutes + Number(record.overtimeMinutes || 0) }), { normalMinutes: 0, overtimeMinutes: 0 });
  return { normalHours: minutes.normalMinutes / 60, overtimeHours: minutes.overtimeMinutes / 60 };
}

export function formatPayrollAttendanceCell(record?: { attendanceCode?: string | null; normalMinutes?: number | null; overtimeMinutes?: number | null }) {
  if (!record) return "";
  const normal = Number(record.normalMinutes || 0);
  const overtime = Number(record.overtimeMinutes || 0);
  if (normal || overtime) return `${toHours(normal)}${overtime ? `+${toHours(overtime)}` : ""}`;
  return record.attendanceCode || "";
}
