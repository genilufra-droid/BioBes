import { roundedWholeHours } from "./payrollFormatting";

type ManualAttendanceValue = { attendanceCode: string; normalMinutes: number; overtimeMinutes: number };

export function parseManualAttendance(value: string): ManualAttendanceValue | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  if (/^[a-zëç]+$/i.test(normalized)) return { attendanceCode: normalized.toUpperCase(), normalMinutes: 0, overtimeMinutes: 0 };
  const match = normalized.match(/^(\d+(?:\.\d+)?)(?:\s*\+\s*(\d+(?:\.\d+)?))?$/);
  if (!match) throw new Error("Përdor formatin 8 ose 8+2, ose një kod si M.");
  const totalOrNormalHours = Number(match[1]);
  const explicitOvertimeHours = match[2] === undefined ? undefined : Number(match[2]);
  const normalHours = Math.min(totalOrNormalHours, 8);
  const overtimeHours = explicitOvertimeHours === undefined ? Math.max(totalOrNormalHours - 8, 0) : explicitOvertimeHours;
  if (!Number.isFinite(totalOrNormalHours) || !Number.isFinite(normalHours) || !Number.isFinite(overtimeHours) || totalOrNormalHours < 0 || totalOrNormalHours > 24 || overtimeHours < 0 || overtimeHours > 16) throw new Error("Orët manuale nuk janë të vlefshme.");
  return { attendanceCode: "8", normalMinutes: Math.round(normalHours * 60), overtimeMinutes: Math.round(overtimeHours * 60) };
}

export function formatManualAttendance(value?: { attendanceCode?: string | null; normalMinutes?: number | null; overtimeMinutes?: number | null }) {
  if (!value) return "";
  const normal = roundedWholeHours(value.normalMinutes);
  const overtime = roundedWholeHours(value.overtimeMinutes);
  if (normal || overtime) return `${normal}${overtime ? `\n${overtime}` : ""}`;
  return value.attendanceCode || "";
}
