export type PayrollRateProfile = {
  id: number;
  dailyRateCents?: number | null;
  overtimeRateCents?: number | null;
};

export function hasIncompleteForeignRates(employee?: PayrollRateProfile) {
  return !employee?.dailyRateCents || !employee?.overtimeRateCents;
}
