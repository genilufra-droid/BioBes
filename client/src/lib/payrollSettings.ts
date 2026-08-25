export type PayrollLegendCode = { code: string; label: string };
export type PayrollShiftOverride = { payrollEmployeeId: number; shiftCode: "A" | "B" | "C" | "CUSTOM"; dayFrom: number; dayTo: number; start?: string; end?: string; lunchMin?: number; note: string };
export type PayrollAttendanceSettings = {
  shiftAStart: string; shiftAEnd: string; shiftBStart: string; shiftBEnd: string; shiftCStart: string; shiftCEnd: string;
  lunchMin: number; lunchThreshold: number; overtimeGraceMin: number;
  weekdayMaxNormal: number; sundayMaxNormal: number; sundayStart: string; sundayEnd: string; sundayOvertimeThreshold: string;
  companyName: string; institutionCode: string; bankName: string; paymentDescription: string; paymentDay: number; paymentDate: string; currency: string;
  socialEnabled: boolean; socialEmployeeRate: number; socialEmployerRate: number;
  taxEnabled: boolean; taxBand1: number; taxBand2: number; taxBand3: number; taxOverRate: number;
  bonusEnabled: boolean; bonusAmountLek: number; bonusMaxAbsences: number; bonusRequiresOvertime: boolean;
  legendCodes: PayrollLegendCode[]; shiftOverrides: PayrollShiftOverride[]; overwriteManual: boolean;
};

export const defaultPayrollAttendanceSettings: PayrollAttendanceSettings = {
  shiftAStart: "07:00", shiftAEnd: "17:00", shiftBStart: "08:00", shiftBEnd: "17:00", shiftCStart: "12:00", shiftCEnd: "20:00",
  lunchMin: 60, lunchThreshold: 6, overtimeGraceMin: 20, weekdayMaxNormal: 8, sundayMaxNormal: 7.5, sundayStart: "07:00", sundayEnd: "17:00", sundayOvertimeThreshold: "17:20",
  companyName: "", institutionCode: "", bankName: "", paymentDescription: "Pagë", paymentDay: 30, paymentDate: "", currency: "Lek",
  socialEnabled: false, socialEmployeeRate: 0, socialEmployerRate: 0, taxEnabled: true, taxBand1: 80, taxBand2: 250, taxBand3: 450, taxOverRate: 10,
  bonusEnabled: false, bonusAmountLek: 5000, bonusMaxAbsences: 3, bonusRequiresOvertime: true,
  legendCodes: [{ code: "L", label: "Leje" }, { code: "M", label: "Mungesë" }, { code: "NM", label: "Mungesë pa njoftim" }, { code: "NV", label: "Nuk vlen" }], shiftOverrides: [], overwriteManual: false,
};

export function parsePayrollAttendanceSettings(paramsJson?: string | null): PayrollAttendanceSettings {
  try {
    const value = JSON.parse(paramsJson || "{}") as Partial<PayrollAttendanceSettings> & { lunch?: number; overtimeGrace?: number; company?: string; lunchBreak?: number; socialEmployeeRate?: number; socialEmployerRate?: number };
    return {
      shiftAStart: value.shiftAStart || defaultPayrollAttendanceSettings.shiftAStart,
      shiftAEnd: value.shiftAEnd || defaultPayrollAttendanceSettings.shiftAEnd,
      shiftBStart: value.shiftBStart || defaultPayrollAttendanceSettings.shiftBStart,
      shiftBEnd: value.shiftBEnd || defaultPayrollAttendanceSettings.shiftBEnd,
      shiftCStart: value.shiftCStart || defaultPayrollAttendanceSettings.shiftCStart,
      shiftCEnd: value.shiftCEnd || defaultPayrollAttendanceSettings.shiftCEnd,
      lunchMin: Number(value.lunchMin ?? value.lunch ?? value.lunchBreak ?? defaultPayrollAttendanceSettings.lunchMin),
      lunchThreshold: Number(value.lunchThreshold ?? defaultPayrollAttendanceSettings.lunchThreshold),
      overtimeGraceMin: Number(value.overtimeGraceMin ?? value.overtimeGrace ?? defaultPayrollAttendanceSettings.overtimeGraceMin),
      weekdayMaxNormal: Number(value.weekdayMaxNormal ?? defaultPayrollAttendanceSettings.weekdayMaxNormal),
      sundayMaxNormal: Number(value.sundayMaxNormal ?? defaultPayrollAttendanceSettings.sundayMaxNormal),
      sundayStart: value.sundayStart || defaultPayrollAttendanceSettings.sundayStart,
      sundayEnd: value.sundayEnd || defaultPayrollAttendanceSettings.sundayEnd,
      sundayOvertimeThreshold: value.sundayOvertimeThreshold || defaultPayrollAttendanceSettings.sundayOvertimeThreshold,
      companyName: value.companyName || value.company || defaultPayrollAttendanceSettings.companyName,
      institutionCode: value.institutionCode || defaultPayrollAttendanceSettings.institutionCode,
      bankName: value.bankName || defaultPayrollAttendanceSettings.bankName,
      paymentDescription: value.paymentDescription || defaultPayrollAttendanceSettings.paymentDescription,
      paymentDay: Number(value.paymentDay ?? defaultPayrollAttendanceSettings.paymentDay),
      paymentDate: value.paymentDate || defaultPayrollAttendanceSettings.paymentDate,
      currency: value.currency || defaultPayrollAttendanceSettings.currency,
      socialEnabled: Boolean(value.socialEnabled ?? defaultPayrollAttendanceSettings.socialEnabled),
      socialEmployeeRate: Number(value.socialEmployeeRate ?? defaultPayrollAttendanceSettings.socialEmployeeRate),
      socialEmployerRate: Number(value.socialEmployerRate ?? defaultPayrollAttendanceSettings.socialEmployerRate),
      taxEnabled: Boolean(value.taxEnabled ?? defaultPayrollAttendanceSettings.taxEnabled),
      taxBand1: Number(value.taxBand1 ?? defaultPayrollAttendanceSettings.taxBand1),
      taxBand2: Number(value.taxBand2 ?? defaultPayrollAttendanceSettings.taxBand2),
      taxBand3: Number(value.taxBand3 ?? defaultPayrollAttendanceSettings.taxBand3),
      taxOverRate: Number(value.taxOverRate ?? defaultPayrollAttendanceSettings.taxOverRate),
      bonusEnabled: Boolean(value.bonusEnabled ?? defaultPayrollAttendanceSettings.bonusEnabled),
      bonusAmountLek: Math.max(0, Number(value.bonusAmountLek ?? defaultPayrollAttendanceSettings.bonusAmountLek)),
      bonusMaxAbsences: Math.max(0, Math.floor(Number(value.bonusMaxAbsences ?? defaultPayrollAttendanceSettings.bonusMaxAbsences))),
      bonusRequiresOvertime: Boolean(value.bonusRequiresOvertime ?? defaultPayrollAttendanceSettings.bonusRequiresOvertime),
      legendCodes: Array.isArray(value.legendCodes) && value.legendCodes.length ? value.legendCodes.filter(code => code && typeof code.code === "string" && typeof code.label === "string") : defaultPayrollAttendanceSettings.legendCodes,
      shiftOverrides: Array.isArray(value.shiftOverrides) ? value.shiftOverrides.filter(item => item && Number.isInteger(item.payrollEmployeeId) && ["A", "B", "C", "CUSTOM"].includes(item.shiftCode) && Number.isInteger(item.dayFrom) && Number.isInteger(item.dayTo) && item.dayFrom >= 1 && item.dayTo >= item.dayFrom && item.dayTo <= 31).map(item => ({ payrollEmployeeId: item.payrollEmployeeId, shiftCode: item.shiftCode, dayFrom: item.dayFrom, dayTo: item.dayTo, start: typeof item.start === "string" ? item.start : undefined, end: typeof item.end === "string" ? item.end : undefined, lunchMin: typeof item.lunchMin === "number" ? item.lunchMin : undefined, note: typeof item.note === "string" ? item.note : "" })) : defaultPayrollAttendanceSettings.shiftOverrides,
      overwriteManual: Boolean(value.overwriteManual ?? defaultPayrollAttendanceSettings.overwriteManual),
    };
  } catch { return defaultPayrollAttendanceSettings; }
}
