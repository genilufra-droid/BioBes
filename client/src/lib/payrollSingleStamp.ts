export type SingleStampRow = {
  nrListepage: string;
  punonjesi: string;
  dita: number;
  kohaVetme: string;
  problemi: string;
};

export const singleStampColumns = [
  { key: "nrListepage", label: "NR. LISTEPAGE" },
  { key: "punonjesi", label: "PUNONJËSI" },
  { key: "dita", label: "DITA" },
  { key: "kohaVetme", label: "KOHA E VETME" },
  { key: "problemi", label: "PROBLEMI" },
] as const;

export function extractLogStamps(note?: string | null) {
  const source = String(note || "").split("|")[0].trim();
  const match = source.match(/^Logs\s+[^:]+:\s*(.*)$/i);
  if (!match) return [] as string[];
  return match[1]
    .split("/")
    .map(value => value.trim())
    .filter(value => /^\d{1,2}:\d{2}$/.test(value));
}

export function buildSingleStampRows(attendance: any[], employees: any[]): SingleStampRow[] {
  const employeeMap = new Map(employees.map(employee => [employee.id, employee]));
  return attendance
    .flatMap(row => {
      const stamps = extractLogStamps(row.note);
      if (stamps.length !== 1) return [];
      const employee = employeeMap.get(row.payrollEmployeeId);
      if (!employee) return [];
      const name = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Pa emër";
      return [{
        nrListepage: String(employee.employeeNumber || employee.id || ""),
        punonjesi: name,
        dita: Number(row.day),
        kohaVetme: stamps[0],
        problemi: `Mungon dalje — vetëm hyrje · ${name} · dita ${row.day}`,
      }];
    })
    .sort((left, right) => left.punonjesi.localeCompare(right.punonjesi, "sq") || left.dita - right.dita);
}

export type SingleStampLogBlock = { deviceId: string; name: string; days: Record<string, string[]> };

export function buildSingleStampRowsFromLogs(blocks: SingleStampLogBlock[], employees: any[], links: Record<string, number> = {}): SingleStampRow[] {
  const employeeMap = new Map(employees.map(employee => [employee.id, employee]));
  return blocks.flatMap(block => {
    const employee = employeeMap.get(links[block.deviceId]);
    const name = employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : block.name || "Pa emër";
    const nrListepage = String(employee?.employeeNumber || block.deviceId || "");
    return Object.entries(block.days).flatMap(([day, stamps]) => stamps.length === 1 ? [{
      nrListepage,
      punonjesi: name,
      dita: Number(day),
      kohaVetme: stamps[0] || "",
      problemi: `Mungon dalje — vetëm hyrje · ${name} · dita ${day}`,
    }] : []);
  }).sort((left, right) => left.punonjesi.localeCompare(right.punonjesi, "sq") || left.dita - right.dita);
}

export type SingleStampPresenceRow = Record<string, string | number>;

export function buildSingleStampPresenceColumns(dayCount = 31) {
  return [
    { key: "nrListepage", label: "NR. LISTEPAGE" },
    { key: "punonjesi", label: "EMËR MBIEMËR" },
    ...Array.from({ length: dayCount }, (_, index) => ({ key: `dita${index + 1}`, label: String(index + 1) })),
    { key: "diteMungese", label: "DITË ME MUNGESË DALJEJE" },
  ] as const;
}

export function buildSingleStampPresenceRows(rows: SingleStampRow[], dayCount = 31): SingleStampPresenceRow[] {
  const grouped = new Map<string, SingleStampPresenceRow>();
  for (const row of rows) {
    const key = `${row.nrListepage}-${row.punonjesi}`;
    const current = grouped.get(key) || {
      nrListepage: row.nrListepage,
      punonjesi: row.punonjesi,
      ...Object.fromEntries(Array.from({ length: dayCount }, (_, index) => [`dita${index + 1}`, ""])),
      diteMungese: 0,
    };
    if (row.dita >= 1 && row.dita <= dayCount) {
      current[`dita${row.dita}`] = row.kohaVetme;
      current.diteMungese = Number(current.diteMungese || 0) + 1;
    }
    grouped.set(key, current);
  }
  return Array.from(grouped.values()).sort((left, right) => String(left.punonjesi).localeCompare(String(right.punonjesi), "sq"));
}
