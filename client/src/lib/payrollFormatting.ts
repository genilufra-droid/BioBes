export function roundedWholeHours(minutes: number | null | undefined): number {
  return Math.round(Number(minutes || 0) / 60);
}

export function roundedWholeMinutes(minutes: number | null | undefined): number {
  return Math.round(Number(minutes || 0));
}

export function wholeHoursText(minutes: number | null | undefined): string {
  return String(roundedWholeHours(minutes));
}

export function wholeMinutesText(minutes: number | null | undefined, suffix = " min"): string {
  return `${roundedWholeMinutes(minutes)}${suffix}`;
}
