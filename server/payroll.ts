export type PayrollTaxBracket = { upto: number | null; rateBp: number };

export type PayrollCalculationInput = {
  normalMinutes: number;
  overtimeMinutes: number;
  regularRateCents: number;
  overtimeRateCents: number;
  baseSalaryCents: number;
  advanceCents: number;
  socialEmployeeRateBp: number;
  socialEmployerRateBp: number;
  taxBrackets: PayrollTaxBracket[];
};

export type PayrollBonusSettings = {
  enabled: boolean;
  amountCents: number;
  maxAbsences: number;
  requiresOvertime: boolean;
};

export const defaultPayrollBonusSettings: PayrollBonusSettings = {
  enabled: false,
  amountCents: 500_000,
  maxAbsences: 3,
  requiresOvertime: true,
};

export function parsePayrollBonusSettings(paramsJson?: string | null): PayrollBonusSettings {
  try {
    const value = JSON.parse(paramsJson || "{}") as Partial<Record<"bonusEnabled" | "bonusAmountLek" | "bonusMaxAbsences" | "bonusRequiresOvertime", unknown>>;
    const amountLek = Number(value.bonusAmountLek ?? defaultPayrollBonusSettings.amountCents / 100);
    const maxAbsences = Number(value.bonusMaxAbsences ?? defaultPayrollBonusSettings.maxAbsences);
    return {
      enabled: typeof value.bonusEnabled === "boolean" ? value.bonusEnabled : defaultPayrollBonusSettings.enabled,
      amountCents: Number.isFinite(amountLek) ? Math.max(0, Math.round(amountLek * 100)) : defaultPayrollBonusSettings.amountCents,
      maxAbsences: Number.isFinite(maxAbsences) ? Math.max(0, Math.floor(maxAbsences)) : defaultPayrollBonusSettings.maxAbsences,
      requiresOvertime: typeof value.bonusRequiresOvertime === "boolean" ? value.bonusRequiresOvertime : defaultPayrollBonusSettings.requiresOvertime,
    };
  } catch {
    return defaultPayrollBonusSettings;
  }
}

export function countPayrollAbsenceDays(rows: Array<{ day: number; attendanceCode?: string | null }>) {
  return new Set(rows.filter(row => /^(M|NM)$/i.test(String(row.attendanceCode || "").trim())).map(row => row.day)).size;
}

export function resolvePayrollBonusCents(input: {
  isForeign: number;
  workDays: number;
  dailyRateCents: number;
  periodBonusCents?: number;
  absenceCount?: number;
  overtimeMinutes?: number;
  bonusSettings?: PayrollBonusSettings;
}) {
  if (input.isForeign === 1) return Math.max(0, Math.round(input.workDays)) * Math.max(0, Math.round(input.dailyRateCents));
  if (input.periodBonusCents !== undefined) return Math.max(0, Math.round(input.periodBonusCents));
  const settings = input.bonusSettings;
  if (!settings?.enabled) return 0;
  const absenceCount = Math.max(0, Math.floor(input.absenceCount ?? 0));
  if (absenceCount >= Math.max(0, Math.floor(settings.maxAbsences))) return 0;
  if (settings.requiresOvertime && Math.max(0, input.overtimeMinutes ?? 0) <= 0) return 0;
  return Math.max(0, Math.round(settings.amountCents));
}

export function progressiveTaxCents(taxableCents: number, brackets: PayrollTaxBracket[]) {
  let tax = 0;
  let from = 0;
  for (const bracket of brackets) {
    const to = bracket.upto === null ? Number.POSITIVE_INFINITY : bracket.upto * 100;
    if (taxableCents > from) tax += Math.round((Math.min(taxableCents, to) - from) * bracket.rateBp / 10_000);
    if (taxableCents <= to) break;
    from = to;
  }
  return tax;
}

export function calculatePayrollEntry(input: PayrollCalculationInput) {
  const regularPayCents = Math.round(Math.max(0, input.normalMinutes) * Math.max(0, input.regularRateCents) / 60);
  const overtimePayCents = Math.round(Math.max(0, input.overtimeMinutes) * Math.max(0, input.overtimeRateCents) / 60);
  const grossCents = regularPayCents + overtimePayCents + Math.max(0, input.baseSalaryCents);
  const socialEmployeeCents = Math.round(grossCents * Math.max(0, input.socialEmployeeRateBp) / 10_000);
  const socialEmployerCents = Math.round(grossCents * Math.max(0, input.socialEmployerRateBp) / 10_000);
  const taxableCents = Math.max(0, grossCents - socialEmployeeCents);
  const taxCents = progressiveTaxCents(taxableCents, input.taxBrackets);
  const netCents = grossCents - socialEmployeeCents - taxCents;
  const payableCents = Math.max(0, netCents - Math.max(0, input.advanceCents));
  return { regularPayCents, overtimePayCents, grossCents, socialEmployeeCents, socialEmployerCents, taxableCents, taxCents, netCents, payableCents };
}
