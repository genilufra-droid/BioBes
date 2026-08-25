const STATUS_ALIASES: Record<string, string[]> = {
  "e paguar": ["PAID"],
  "e papaguar": ["UNPAID"],
  "më vonë": ["LATER"],
  paid: ["PAID"],
  unpaid: ["UNPAID"],
  later: ["LATER"],
};

export function matchesSalesRegisterStatus(paymentStatus: string, filter: string) {
  const normalized = filter.trim().toLocaleLowerCase("sq-AL");
  if (!normalized) return true;
  return (STATUS_ALIASES[normalized] ?? [normalized.toUpperCase()]).includes(paymentStatus);
}
