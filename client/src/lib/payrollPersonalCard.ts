export type PersonalCardAttendance = { day: number; attendanceCode?: string | null; normalMinutes: number; overtimeMinutes: number; note?: string | null };
import { roundedWholeHours, roundedWholeMinutes } from "./payrollFormatting";

export type PersonalCardDetailRow = {
  dita: number;
  ditaJava: string;
  oretNgaPajisja: string;
  ore: string;
  normale: string;
  shtese: string;
  pushim: string;
  pushimMinuta: number;
  statusi: string;
  kodi: string;
  normalMinutes: number;
  overtimeMinutes: number;
  punuar: boolean;
};

const superscriptDigits: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const roundedHours = roundedWholeHours;

export function formatAttendanceHours(normalMinutes = 0, overtimeMinutes = 0) {
  const normal = roundedHours(normalMinutes);
  const overtime = roundedHours(overtimeMinutes);
  return `${normal}${overtime > 0 ? String(overtime).replace(/\d/g, digit => superscriptDigits[digit] || digit) : ""}`;
}

function attendanceNoteWithoutMinutes(note?: string | null) {
  const source = String(note || "").trim();
  if (!source) return "";
  const logs = source.match(/^Logs\s+\d+/i)?.[0];
  return logs || source.replace(/\b\d+m\b/g, "").replace(/\s*\|\s*/g, " ").trim();
}

export function buildPersonalCardSummary(records: PersonalCardAttendance[]) {
  const normalMinutes = records.reduce((total, record) => total + Number(record.normalMinutes || 0), 0);
  const overtimeMinutes = records.reduce((total, record) => total + Number(record.overtimeMinutes || 0), 0);
  return { days: records.length, normalMinutes, overtimeMinutes, payableMinutes: normalMinutes + overtimeMinutes };
}

export function personalCardRows(records: PersonalCardAttendance[]) {
  return [...records].sort((left, right) => left.day - right.day).map(record => ({
    dita: record.day,
    kodi: record.attendanceCode || "",
    ore: formatAttendanceHours(record.normalMinutes, record.overtimeMinutes),
    shenim: attendanceNoteWithoutMinutes(record.note),
  }));
}

function dayLetter(year: number, month: number, day: number) {
  return ["D", "H", "M", "M", "E", "P", "S"][new Date(year, month - 1, day).getDay()] || "";
}

function sourceTimes(note?: string | null) {
  const source = String(note || "").split("|")[0]?.trim() || "";
  return source.replace(/^Logs\s+[^:]+:\s*/i, "").replace(/\s*\/\s*/g, " → ").trim();
}

function breakMinutes(note?: string | null) {
  return roundedWholeMinutes(Number(String(note || "").match(/Drekë\s+(\d+(?:\.\d+)?)m/i)?.[1] || 0));
}

export function personalCardDetailRows(records: PersonalCardAttendance[], days: number, year: number, month: number): PersonalCardDetailRow[] {
  const byDay = new Map(records.map(record => [record.day, record]));
  return Array.from({ length: days }, (_, index) => {
    const dita = index + 1;
    const record = byDay.get(dita);
    const kodi = record?.attendanceCode || "";
    const normalMinutes = Number(record?.normalMinutes || 0);
    const overtimeMinutes = Number(record?.overtimeMinutes || 0);
    const stamps = sourceTimes(record?.note);
    const pushimMinuta = breakMinutes(record?.note);
    const punuar = normalMinutes > 0 || overtimeMinutes > 0;
    const onePunch = kodi === "K";
    const statusi = kodi === "M" ? "Mungesë (M)" : kodi === "L" ? "Leje (L)" : kodi === "NM" ? "Ngarkesë Madhe (NM)" : kodi === "NV" ? "Pa të dhëna (NV)" : onePunch ? "Vetëm një pullim (K)" : punuar && overtimeMinutes > 0 ? `+${roundedHours(overtimeMinutes)} h shtesë` : punuar ? "Normale" : "";
    return {
      dita,
      ditaJava: dayLetter(year, month, dita),
      oretNgaPajisja: stamps || (onePunch ? "K" : "—"),
      ore: punuar ? formatAttendanceHours(normalMinutes, overtimeMinutes) : "",
      normale: normalMinutes ? `${roundedHours(normalMinutes)} h` : "",
      shtese: overtimeMinutes ? `${roundedHours(overtimeMinutes)} h` : "",
      pushim: pushimMinuta ? `${pushimMinuta} min${pushimMinuta === 0 ? " (pa pushim)" : " ✓"}` : punuar && /Drekë\s+0m/i.test(String(record?.note || "")) ? "0 min (pa pushim) ✓" : "",
      pushimMinuta,
      statusi,
      kodi,
      normalMinutes,
      overtimeMinutes,
      punuar,
    };
  });
}

export type PersonalCardTaxSettings = { taxEnabled?: boolean; taxBand1: number; taxBand2: number; taxBand3: number; taxOverRate: number };
export type PersonalCardTaxRow = { fromCents: number; toCents: number | null; rate: number; allocationCents: number; taxCents: number };

export type PersonalCardWarning = { day?: number; label: string; detail: string };

export function buildPersonalCardWarnings(rows: PersonalCardDetailRow[], options: { hasPayrollEntry?: boolean } = {}): PersonalCardWarning[] {
  const warnings: PersonalCardWarning[] = rows.flatMap(row => {
    if (row.kodi === "K") return [{ day: row.dita, label: "Vetëm një pullim", detail: "Ka vetëm një stampim dhe kërkon kontroll të hyrjes/daljes." }];
    if (row.normalMinutes > 8 * 60) return [{ day: row.dita, label: "Orë normale mbi kufi", detail: "Orët normale të kësaj dite tejkalojnë kufirin prej 8 orësh." }];
    if (row.normalMinutes + row.overtimeMinutes > 24 * 60) return [{ day: row.dita, label: "Orë të pavlefshme", detail: "Orët e pagueshme të kësaj dite tejkalojnë 24 orë." }];
    return [];
  });
  if (rows.some(row => row.punuar) && options.hasPayrollEntry === false) warnings.push({ label: "Mungon rreshti në Bordero", detail: "Punonjësi ka prezencë në periudhë, por nuk ka rresht të gjeneruar në Bordero." });
  return warnings;
}

export function buildPersonalCardTaxRows(taxableCents: number, settings: PersonalCardTaxSettings): PersonalCardTaxRow[] {
  const taxDisabled = settings.taxEnabled === false || Number(settings.taxOverRate) === 0;
  const brackets = [
    { toCents: Math.max(0, settings.taxBand1) * 100, rate: taxDisabled ? 0 : 0 },
    { toCents: Math.max(0, settings.taxBand2) * 100, rate: taxDisabled ? 0 : 0.04 },
    { toCents: Math.max(0, settings.taxBand3) * 100, rate: taxDisabled ? 0 : 0.08 },
    { toCents: null, rate: taxDisabled ? 0 : Math.max(0, settings.taxOverRate) / 100 },
  ];
  const taxable = Math.max(0, Number(taxableCents || 0));
  let fromCents = 0;
  return brackets.map(bracket => {
    const upper = bracket.toCents ?? Number.POSITIVE_INFINITY;
    const allocationCents = taxable > fromCents ? Math.max(0, Math.min(taxable, upper) - fromCents) : 0;
    const row = { fromCents, toCents: bracket.toCents, rate: bracket.rate, allocationCents, taxCents: Math.round(allocationCents * bracket.rate) };
    fromCents = upper;
    return row;
  });
}

export function buildPersonalCardAuditSummary(rows: PersonalCardDetailRow[]) {
  const normalMinutes = rows.reduce((total, row) => total + row.normalMinutes, 0);
  const overtimeMinutes = rows.reduce((total, row) => total + row.overtimeMinutes, 0);
  return {
    workDays: rows.filter(row => row.punuar).length,
    normalMinutes,
    overtimeMinutes,
    payableMinutes: normalMinutes + overtimeMinutes,
    absenceCount: rows.filter(row => row.kodi === "M").length,
    leaveCount: rows.filter(row => row.kodi === "L").length,
    heavyLoadCount: rows.filter(row => row.kodi === "NM").length,
    noDataCount: rows.filter(row => row.kodi === "NV" || (!row.kodi && !row.punuar && row.oretNgaPajisja === "—")).length,
    singlePunchCount: rows.filter(row => row.kodi === "K").length,
    lunchConfirmedCount: rows.filter(row => /Drekë\s+\d+m/i.test(row.pushim) || row.pushim.includes("✓")).length,
    lunchMinutes: rows.reduce((total, row) => total + row.pushimMinuta, 0),
  };
}
