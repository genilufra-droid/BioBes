export type PayrollErrorRow = { niveli: "Bllokuese" | "Vërejtje" | "OK"; mesazhi: string; pritej: string; uGjet: string };

type Employee = { id: number; employeeNumber: string; active: number };
type Attendance = { payrollEmployeeId: number; day: number; normalMinutes: number; overtimeMinutes: number; attendanceCode?: string | null };
type Entry = { payrollEmployeeId: number; employeeNumber: string };

export type PayrollEmployeeWarning = { day?: number; label: string; detail: string };

export function buildPayrollEmployeeWarnings(employeeId: number, attendance: Attendance[], entries: Entry[]): PayrollEmployeeWarning[] {
  const rows = attendance.filter(row => row.payrollEmployeeId === employeeId);
  const warnings: PayrollEmployeeWarning[] = [];
  rows.forEach(row => {
    if (row.attendanceCode === "K") warnings.push({ day: row.day, label: "Vetëm një pullim", detail: "Ka vetëm një stampim dhe kërkon kontroll të hyrjes/daljes." });
    if (row.normalMinutes > 8 * 60) warnings.push({ day: row.day, label: "Orë normale mbi kufi", detail: "Orët normale të kësaj dite tejkalojnë kufirin prej 8 orësh." });
    if (row.normalMinutes + row.overtimeMinutes > 24 * 60) warnings.push({ day: row.day, label: "Orë të pavlefshme", detail: "Orët e pagueshme të kësaj dite tejkalojnë 24 orë." });
  });
  if (rows.length && !entries.some(entry => entry.payrollEmployeeId === employeeId)) warnings.push({ label: "Mungon rreshti në Bordero", detail: "Punonjësi ka prezencë në periudhë, por nuk ka rresht të gjeneruar në Bordero." });
  return warnings;
}

export function buildPayrollErrors(employees: Employee[], attendance: Attendance[], entries: Entry[]) {
  const activeEmployees = employees.filter(employee => employee.active === 1);
  const rows: PayrollErrorRow[] = [];
  rows.push({ niveli: activeEmployees.length ? "OK" : "Bllokuese", mesazhi: "Punonjës aktivë në regjistër", pritej: "≥ 1", uGjet: String(activeEmployees.length) });
  rows.push({ niveli: attendance.length ? "OK" : "Bllokuese", mesazhi: "Listëprezenca është ruajtur", pritej: "≥ 1 rresht", uGjet: String(attendance.length) });
  rows.push({ niveli: entries.length ? "OK" : "Bllokuese", mesazhi: "Borderoja është krijuar", pritej: "≥ 1 rresht", uGjet: String(entries.length) });
  const employeeIds = new Set(activeEmployees.map(employee => employee.id));
  const unknownAttendance = attendance.filter(row => !employeeIds.has(row.payrollEmployeeId)).length;
  rows.push({ niveli: unknownAttendance ? "Bllokuese" : "OK", mesazhi: "Çdo ditë prezence lidhet me punonjës aktiv", pritej: "0 pa lidhje", uGjet: String(unknownAttendance) });
  const duplicateNumbers = employees.length - new Set(employees.map(employee => employee.employeeNumber)).size;
  rows.push({ niveli: duplicateNumbers ? "Bllokuese" : "OK", mesazhi: "Nuk ka numra listëpage të dublikuar", pritej: "0 dublikata", uGjet: String(duplicateNumbers) });
  const excessiveNormal = attendance.filter(row => row.normalMinutes > 8 * 60).length;
  rows.push({ niveli: excessiveNormal ? "Vërejtje" : "OK", mesazhi: "Orët normale ditore janë brenda kufirit", pritej: "≤ 8 orë", uGjet: String(excessiveNormal) });
  const excessiveDay = attendance.filter(row => row.normalMinutes + row.overtimeMinutes > 24 * 60).length;
  rows.push({ niveli: excessiveDay ? "Bllokuese" : "OK", mesazhi: "Orët e pagueshme ditore janë të vlefshme", pritej: "≤ 24 orë", uGjet: String(excessiveDay) });
  const uniqueKeys = new Set(attendance.map(row => `${row.payrollEmployeeId}-${row.day}`)).size;
  rows.push({ niveli: uniqueKeys === attendance.length ? "OK" : "Bllokuese", mesazhi: "Nuk ka dublikata ditore në Listëprezencë", pritej: String(attendance.length), uGjet: String(uniqueKeys) });
  const missingEntries = activeEmployees.filter(employee => attendance.some(row => row.payrollEmployeeId === employee.id) && !entries.some(entry => entry.payrollEmployeeId === employee.id)).length;
  rows.push({ niveli: missingEntries ? "Vërejtje" : "OK", mesazhi: "Punonjësit me prezencë janë në Bordero", pritej: "0 mungojnë", uGjet: String(missingEntries) });
  return rows;
}
