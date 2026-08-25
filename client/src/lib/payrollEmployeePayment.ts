export const euroInputToCents = (value: string) => Math.max(0, Math.round((Number(value.replace(",", ".")) || 0) * 100));
export const centsToEuroInput = (value: number) => String((value || 0) / 100);
