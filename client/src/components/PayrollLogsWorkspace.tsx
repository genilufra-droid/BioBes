import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Eye, Printer, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { calculateAttendanceDay } from "@/lib/payrollAttendance";
import { findEmployeeByDeviceId } from "@/lib/payrollDeviceLink";
import { activePayrollDeviceLinks } from "@/lib/payrollDeviceMapping";
import { parseListOfLogs, type ParsedDeviceLog } from "@/lib/payrollLogParser";
import { buildPayrollLogsExport, exportPayrollLogsExcel, exportPayrollLogsPdf, printPayrollLogs } from "@/lib/payrollLogsExport";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { printPayrollDocument } from "@/lib/payrollExport";
import { buildSingleStampPresenceColumns, buildSingleStampPresenceRows, buildSingleStampRowsFromLogs } from "@/lib/payrollSingleStamp";
import { PayrollSingleStampReport } from "@/components/PayrollSingleStampReport";
import type { PayrollShiftOverride } from "@/lib/payrollSettings";

const months = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];
const shiftA = { code: "A", start: "07:00", end: "17:00", lunchMin: 60, opGrace: 20 };
const superscriptDigits: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
type Employee = { id: number; employeeNumber: string; firstName: string; lastName: string | null; shiftCode?: string | null };
type AttendanceInput = { payrollEmployeeId: number; day: number; attendanceCode?: string; normalMinutes?: number; overtimeMinutes?: number; note?: string };
type ImportedLogs = { blocks: ParsedDeviceLog[]; month?: number; year?: number };

const fullName = (employee?: Employee) => employee ? `${employee.firstName} ${employee.lastName || ""}`.trim() : "";
const splitName = (name: string) => { const [firstName, ...lastName] = name.trim().split(/\s+/); return { firstName: firstName || "", lastName: lastName.join(" ") }; };
const superscript = (value: number) => String(value).replace(/\d/g, digit => superscriptDigits[digit] || digit);
const displayHours = (normalMinutes = 0, overtimeMinutes = 0) => `${Math.round(normalMinutes / 60)}${overtimeMinutes ? superscript(Math.round(overtimeMinutes / 60)) : ""}`;

export function importButtonState(saving: boolean, imported: boolean) {
  if (saving) return { disabled: true, label: "Po krijohen dhe ruhen orët…" };
  if (imported) return { disabled: true, label: "Importi u konfirmua" };
  return { disabled: false, label: "Konfirmo importin automatik" };
}

export function PayrollLogsWorkspace({ companyId, employees, period, periodId, attendance, onSaveDays, onImported, shifts = { A: shiftA }, shiftOverrides = [], overwriteManual = false, lunchThreshold = 6, weekdayMaxNormal = 8, sundayMaxNormal = 7.5, sundayOvertimeThreshold = "" }: { companyId: number; employees: Employee[]; period?: { year: number; month: number }; periodId?: number; attendance: Array<{ payrollEmployeeId: number; day: number }>; onSaveDays: (input: { payrollPeriodId: number; rows: AttendanceInput[] }) => Promise<unknown>; onImported: () => Promise<void>; shifts?: Record<string, typeof shiftA>; shiftOverrides?: PayrollShiftOverride[]; overwriteManual?: boolean; lunchThreshold?: number; weekdayMaxNormal?: number; sundayMaxNormal?: number; sundayOvertimeThreshold?: string }) {
  const utils = trpc.useUtils();
  const createEmployee = trpc.payroll.employees.create.useMutation() as unknown as { mutateAsync: (input: Record<string, unknown>) => Promise<{ id: number }> };
  const saveMapping = trpc.payroll.mappings.save.useMutation() as unknown as { mutateAsync: (input: { companyId: number; deviceId: string; payrollEmployeeId: number; active: number }) => Promise<unknown> };
  const { data: mappings = [] } = trpc.payroll.mappings.list.useQuery({ companyId });
  const [parsed, setParsed] = useState<ImportedLogs>();
  const [fileName, setFileName] = useState("");
  const [links, setLinks] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [imported, setImported] = useState(false);
  const [lunchOverrides, setLunchOverrides] = useState<Record<string, number>>({});
  const blocks = parsed?.blocks || [];
  const importedMonth = parsed?.month || Number(fileName.match(/(?:^|_)20\d{2}_(\d{1,2})(?:_|\.)/)?.[1]) || period?.month;
  const importedYear = parsed?.year || Number(fileName.match(/20\d{2}/)?.[0]) || period?.year;
  const importedLabel = importedMonth && importedYear ? `${months[importedMonth - 1]} ${importedYear}` : "Përzgjidh periudhën";
  const importedFileLabel = importedMonth && importedYear ? `${months[importedMonth - 1]}_${importedYear}` : "Pa_Periudhe";
  const dayCount = importedMonth && importedYear ? new Date(importedYear, importedMonth, 0).getDate() : 31;
  const deviceLinkMap = activePayrollDeviceLinks(mappings);
  const lunchKey = (deviceId: string, day: number) => `${deviceId}-${day}`;
  const shiftFor = (block: ParsedDeviceLog, day?: number) => {
    const payrollEmployeeId = links[block.deviceId];
    const override = day ? shiftOverrides.find(item => item.payrollEmployeeId === payrollEmployeeId && day >= item.dayFrom && day <= item.dayTo) : undefined;
    const base = shifts[override?.shiftCode || employees.find(item => item.id === payrollEmployeeId)?.shiftCode || "A"] || shifts.A || shiftA;
    const isSunday = Boolean(day && importedYear && importedMonth && new Date(importedYear, importedMonth - 1, day).getDay() === 0);
    return isSunday && sundayOvertimeThreshold ? { ...base, end: sundayOvertimeThreshold, opGrace: 0 } : base;
  };
  const attendanceRulesFor = (day: number) => ({ lunchThreshold, normalHours: importedYear && importedMonth && new Date(importedYear, importedMonth - 1, day).getDay() === 0 ? sundayMaxNormal : weekdayMaxNormal });
  const pendingLunchDays = useMemo(() => blocks.flatMap(block => Object.entries(block.days).flatMap(([dayText, stamps]) => {
    const day = Number(dayText);
    const calculated = calculateAttendanceDay(stamps, shiftFor(block, day), attendanceRulesFor(day));
    return calculated.assumedLunch && calculated.lunchMin > 0 ? [{ deviceId: block.deviceId, name: block.name, day, stamps, defaultLunch: calculated.lunchMin }] : [];
  })), [blocks, shifts, shiftOverrides, employees, links, importedYear, importedMonth, lunchThreshold, weekdayMaxNormal, sundayMaxNormal, sundayOvertimeThreshold]);
  const unresolvedLunchDays = pendingLunchDays.filter(item => lunchOverrides[lunchKey(item.deviceId, item.day)] === undefined);
  const applyLunchToAll = (lunchMinutes: number) => setLunchOverrides(Object.fromEntries(pendingLunchDays.map(item => [lunchKey(item.deviceId, item.day), lunchMinutes])));
  const logExport = useMemo(() => buildPayrollLogsExport(blocks, dayCount, importedYear || 2026, importedMonth || 1), [blocks, dayCount, importedMonth, importedYear]);
  const singleStampRows = useMemo(() => buildSingleStampRowsFromLogs(blocks, employees, links), [blocks, employees, links]);
  const singleStampPresenceColumns = useMemo(() => buildSingleStampPresenceColumns(dayCount), [dayCount]);
  const singleStampPresenceRows = useMemo(() => buildSingleStampPresenceRows(singleStampRows, dayCount), [singleStampRows, dayCount]);
  const exportSingleStampExcel = () => void exportToExcel(singleStampPresenceRows, `Shkarko_pa_gisht_${importedFileLabel}`, "Shkarko pa gisht", singleStampPresenceColumns, { title: `SHKARKO PA GISHT — LISTËPREZENCA — ${importedLabel}`, landscape: true, headerColor: "FFFFF2CC", titleColor: "FF17253D", columnWidths: [12, 22, ...Array(dayCount).fill(6.5), 14] });
  const exportSingleStampPdf = () => exportToPDF(singleStampPresenceRows, `Shkarko_pa_gisht_${importedFileLabel}`, `SHKARKO PA GISHT — LISTËPREZENCA — ${importedLabel}`, singleStampPresenceColumns, { landscape: true, headerColor: [255, 242, 204], headerTextColor: [124, 45, 18], titleColor: [23, 37, 61], fontSize: 6, alternateRowColor: false });
  const printSingleStamp = () => printPayrollDocument(`SHKARKO PA GISHT — LISTËPREZENCA — ${importedLabel}`, singleStampPresenceColumns.map(column => column.label), singleStampPresenceRows);

  const preview = useMemo(() => blocks.map(block => {
    const employee = employees.find(item => item.id === links[block.deviceId]);
    const fallback = splitName(block.name);
    return { block, employee, firstName: employee?.firstName || fallback.firstName, lastName: employee?.lastName || fallback.lastName };
  }), [blocks, employees, links]);

  const read = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const book = XLSX.read(event.target?.result, { type: "array" });
        const sheetName = book.SheetNames.find(sheet => sheet.trim().toLowerCase() === "logs") || book.SheetNames[0];
        const result = parseListOfLogs(XLSX.utils.sheet_to_json(book.Sheets[sheetName], { header: 1, defval: "" }) as unknown[][]) as ImportedLogs;
        if (!result.blocks.length) throw new Error("Fleta Logs nuk përmban punonjës të lexueshëm.");
        setParsed(result);
        setFileName(`${file.name} · ${sheetName}`);
        setLinks(Object.fromEntries(result.blocks.map(block => [block.deviceId, findEmployeeByDeviceId(block.deviceId, employees, deviceLinkMap)?.id || deviceLinkMap[block.deviceId] || 0])));
        setShowRaw(false);
        setImported(false);
        setLunchOverrides({});
        toast.success(`${result.blocks.length} punonjës u lexuan. Sistemi i përgatiti lidhjet automatikisht.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Excel nuk u lexua.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const commit = async () => {
    if (!parsed || !period || !periodId) return toast.error("Zgjidh periudhën përpara konfirmimit.");
    if (importedMonth && importedYear && (period.month !== importedMonth || period.year !== importedYear)) return toast.error(`Ngarko periudhën ${importedLabel} përpara konfirmimit.`);
    if (unresolvedLunchDays.length) return toast.error(`Konfirmo pushimin e drekës për ${unresolvedLunchDays.length} ditë me 2 stampime.`);
    setSaving(true);
    try {
      const resolvedLinks = { ...links };
      let created = 0;
      for (const block of parsed.blocks) {
        if (resolvedLinks[block.deviceId]) continue;
        const name = splitName(block.name);
        const employee = await createEmployee.mutateAsync({ companyId, employeeNumber: /^\d+$/.test(block.deviceId) ? block.deviceId : `AUTO${block.deviceId}`, firstName: name.firstName || block.deviceId, lastName: name.lastName || undefined, position: block.department || undefined, regularRateCents: 0, overtimeRateCents: 0, baseSalaryCents: 0, advanceCents: 0, paymentMethod: "BANK", isForeign: 0, shiftCode: "A", dailyRateCents: 0, active: 1 });
        resolvedLinks[block.deviceId] = employee.id;
        created += 1;
      }
      setLinks(resolvedLinks);
      await Promise.all(parsed.blocks.map(block => resolvedLinks[block.deviceId] ? saveMapping.mutateAsync({ companyId, deviceId: block.deviceId, payrollEmployeeId: resolvedLinks[block.deviceId], active: 1 }) : Promise.resolve()));
      await utils.payroll.employees.list.invalidate({ companyId });
      await utils.payroll.mappings.list.invalidate({ companyId });
      const known = overwriteManual ? new Set<string>() : new Set(attendance.map(row => `${row.payrollEmployeeId}-${row.day}`));
      const rows: AttendanceInput[] = [];
      for (const block of parsed.blocks) for (const [value, stamps] of Object.entries(block.days)) {
        const day = Number(value); const employeeId = resolvedLinks[block.deviceId];
        if (!employeeId || !day || day > dayCount || known.has(`${employeeId}-${day}`)) continue;
        const calculated = calculateAttendanceDay(stamps, shiftFor(block, day), attendanceRulesFor(day), lunchOverrides[lunchKey(block.deviceId, day)]);
        if (!calculated.grossMin && stamps.length !== 1) continue;
        rows.push({ payrollEmployeeId: employeeId, day, attendanceCode: stamps.length === 1 ? "K" : "8", normalMinutes: calculated.normalMinutes, overtimeMinutes: calculated.overtimeMinutes, note: `Logs ${block.deviceId}: ${stamps.join(" / ")} | Bruto ${calculated.grossMin}m | Pagesë ${calculated.workedMin}m | Drekë ${calculated.lunchMin}m` });
        known.add(`${employeeId}-${day}`);
      }
      if (rows.length) await onSaveDays({ payrollPeriodId: periodId, rows });
      await onImported();
      setImported(true);
      toast.success(`${created} punonjës u krijuan automatikisht; ${rows.length} ditë u ruajtën në Listëprezencë.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ruajtja automatike e Logs dështoi.");
    } finally { setSaving(false); }
  };

  const mapped = blocks.filter(block => links[block.deviceId]).length;
  const importButton = importButtonState(saving, imported);
  return <div className="space-y-4">
    <section className="overflow-hidden rounded-md border border-[#d7dee8] bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eaf1] px-4 py-3"><h2 className="text-sm font-semibold text-[#17253d]">Ngarko Logs nga pajisja e hyrje-daljeve</h2><label className="inline-flex h-9 cursor-pointer items-center rounded-md bg-[#2c5282] px-3 text-sm font-medium text-white hover:bg-[#1e3a5f]"><Upload className="mr-1.5 h-4 w-4" />Zgjidh Excel<input className="sr-only" type="file" accept=".xls,.xlsx,.xlsm,.csv" onChange={event => read(event.target.files?.[0])} /></label></header><div className="p-4"><p className="rounded border border-[#cfe0ff] bg-[#eff6ff] px-3 py-2 text-xs leading-5 text-[#315b8a]">Zgjidh skedarin .xlsx të eksportuar nga pajisja. Kontrollo të dhënat dhe lidhjet përpara konfirmimit; punonjësit e panjohur krijohen dhe lidhen automatikisht sipas ID-së së pajisjes.</p><p className="mt-3 text-xs text-[#64748b]">{fileName || "Fleta Logs"}</p></div></section>

    <section className="overflow-hidden rounded-md border border-[#d7dee8] bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eaf1] px-4 py-3"><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-[#17253d]">{parsed ? `Paraparja e importit — ${fileName.replace(/ · .+$/, "")}` : "Të dhënat e ngarkuara"}</h2><span className="rounded-full bg-[#fff7d6] px-2 py-0.5 text-[11px] font-semibold text-[#806300]">{blocks.length} punonjës</span></div><div className="flex flex-wrap items-center gap-2"><span className="rounded border border-[#d7dee8] bg-[#f8fafc] px-2 py-1 text-xs text-[#475569]">{importedLabel}</span>{parsed && <><Button size="sm" variant="outline" onClick={() => setShowRaw(value => !value)}><Eye className="mr-1 h-3.5 w-3.5" />{showRaw ? "Fshih të papërpunuarat" : "Shfaq të papërpunuarat"}</Button><Button size="sm" variant="outline" onClick={() => void exportPayrollLogsExcel(logExport.rows, logExport.totals, logExport.columns, importedFileLabel)}><Download className="mr-1 h-3.5 w-3.5" />Excel</Button><Button size="sm" variant="outline" onClick={() => exportPayrollLogsPdf(logExport.rows, logExport.totals, logExport.columns, importedFileLabel)}>PDF</Button><Button size="sm" variant="outline" onClick={() => printPayrollLogs(logExport.rows, logExport.totals, logExport.columns, importedFileLabel)}><Printer className="mr-1 h-3.5 w-3.5" />Print</Button></>}</div></header>{parsed && <p className="border-b border-[#cfe0ff] bg-[#eff6ff] px-4 py-2 text-xs text-[#315b8a]">Kontrollo emrat dhe Nr. e Listëpagesës. Rreshtat <b>I RI</b> krijohen automatikisht kur konfirmon importin; lidhjet ekzistuese ruhen sipas ID-së së pajisjes.</p>}<div className="overflow-x-auto"><table className="min-w-[720px] w-full text-xs"><thead className="bg-[#eaf0f7] text-[#334155]"><tr><th className="p-2 text-left">ID Pajisje</th><th className="p-2 text-left">Emri në pajisje</th><th className="p-2 text-left">Sektori</th><th className="p-2 text-right">Ditët / Stampimet</th></tr></thead><tbody>{preview.length ? preview.map(({ block }) => <tr className="border-t border-[#e5eaf1]" key={block.deviceId}><td className="p-2 font-medium">{block.deviceId}</td><td className="p-2">{block.name}</td><td className="p-2">{block.department || ""}</td><td className="p-2 text-right text-[#475569]">{Object.keys(block.days).length} ditë</td></tr>) : <tr><td colSpan={4} className="p-5 text-center text-[#64748b]">Ende pa të dhëna. Ngarko një skedar dhe shtyp Konfirmo.</td></tr>}</tbody></table></div></section>

    {parsed && <PayrollSingleStampReport rows={singleStampRows} periodLabel={importedLabel} dayCount={dayCount} onExcel={exportSingleStampExcel} onPdf={exportSingleStampPdf} onPrint={printSingleStamp} />}

    {pendingLunchDays.length > 0 && <section className="overflow-hidden rounded-md border border-amber-300 bg-white"><header className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3"><h2 className="text-sm font-semibold text-amber-950">Konfirmo pushimin e drekës</h2><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => applyLunchToAll(pendingLunchDays[0]?.defaultLunch || 0)}>Të gjitha me drekë</Button><Button type="button" size="sm" variant="outline" onClick={() => applyLunchToAll(0)}>Të gjitha pa pushim</Button></div></header><p className="border-b border-amber-100 px-4 py-2 text-xs text-amber-900">Këto ditë kanë 2 stampime dhe kalojnë pragun e orëve. Konfirmo të gjitha si fillim dhe ndrysho individualisht rastet pa pushim, si Medina më 18/08. Pa zgjedhje importi nuk ruhet.</p><div className="max-h-[360px] overflow-auto"><table className="min-w-[800px] w-full text-xs"><thead className="sticky top-0 bg-amber-50 text-amber-950"><tr><th className="p-2 text-left">Punonjësi</th><th className="p-2">Dita</th><th className="p-2 text-left">Stampimet</th><th className="p-2">Vendimi</th></tr></thead><tbody>{pendingLunchDays.map(item => { const key = lunchKey(item.deviceId, item.day); const choice = lunchOverrides[key]; return <tr className="border-t border-amber-100" key={key}><td className="p-2 font-medium">{item.name}</td><td className="p-2 text-center">{item.day}</td><td className="p-2">{item.stamps.join(" – ")}</td><td className="p-2"><div className="flex justify-center gap-2"><Button type="button" size="sm" variant={choice === item.defaultLunch ? "default" : "outline"} className={choice === item.defaultLunch ? "bg-[#2c5282] hover:bg-[#1e3a5f]" : ""} onClick={() => setLunchOverrides(current => ({ ...current, [key]: item.defaultLunch }))}>Ka drekë · {item.defaultLunch} min</Button><Button type="button" size="sm" variant={choice === 0 ? "default" : "outline"} className={choice === 0 ? "bg-[#16736d] hover:bg-[#115c57]" : ""} onClick={() => setLunchOverrides(current => ({ ...current, [key]: 0 }))}>Pa pushim · 0 min</Button></div></td></tr>; })}</tbody></table></div></section>}

    {showRaw && parsed && <section className="overflow-hidden rounded-md border border-[#d7dee8] bg-white"><header className="border-b border-[#e5eaf1] px-4 py-3"><h2 className="text-sm font-semibold text-[#17253d]">Orët e papërpunuara — {blocks.length} punonjës × {dayCount} ditë</h2></header><div className="max-h-[560px] overflow-auto"><table className="min-w-max text-[11px]"><thead className="sticky top-0 z-10 bg-[#eaf0f7] text-[#334155]"><tr><th className="sticky left-0 z-20 bg-[#eaf0f7] p-2 text-left">ID</th><th className="sticky left-[50px] z-20 bg-[#eaf0f7] p-2 text-left">Emri</th>{Array.from({ length: dayCount }, (_, index) => <th className="min-w-10 p-1 text-center" key={index}>{index + 1}</th>)}<th className="p-2">Gjithsej</th><th className="p-2">Normal</th><th className="p-2">Shtesë</th></tr></thead><tbody>{logExport.rows.map(row => <tr className="border-t border-[#e5eaf1] bg-white" key={String(row.idPajisje)}><td className="sticky left-0 bg-white p-2 font-medium">{row.idPajisje}</td><td className="sticky left-[50px] bg-white p-2">{row.emri}</td>{Array.from({ length: dayCount }, (_, index) => <td className="border-l p-1 text-center" key={index}>{row[`dita${index + 1}`] ? `${row[`dita${index + 1}`]}h` : ""}</td>)}<td className="p-2 text-center">{row.gjithsej}</td><td className="p-2 text-center">{row.normale}</td><td className="p-2 text-center">{row.shtese}</td></tr>)}<tr className="border-t-2 border-[#8da3bd] bg-[#eaf0f7] font-semibold"><td className="sticky left-0 bg-[#eaf0f7] p-2"></td><td className="sticky left-[50px] bg-[#eaf0f7] p-2">TOTALI DITËS</td>{Array.from({ length: dayCount }, (_, index) => <td className="border-l p-1 text-center" key={index}>{logExport.totals[`dita${index + 1}`] || ""}</td>)}<td className="p-2 text-center">{logExport.totals.gjithsej}</td><td className="p-2 text-center">{logExport.totals.normale}</td><td className="p-2 text-center">{logExport.totals.shtese}</td></tr></tbody></table></div></section>}

    <section className="overflow-hidden rounded-md border border-[#d7dee8] bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eaf1] px-4 py-3"><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-[#17253d]">Lidhja e përhershme e punonjësve</h2><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${blocks.length && mapped === blocks.length ? "bg-emerald-50 text-emerald-700" : "bg-[#fff7d6] text-[#806300]"}`}>{mapped}/{blocks.length}</span></div>{blocks.length > 0 && <Button className="bg-[#16736d] hover:bg-[#115c57]" size="sm" disabled={importButton.disabled} onClick={commit}>{importButton.label}</Button>}</header>{imported && <p className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800">Importi u konfirmua. Logs dhe lidhjet sipas ID-së së pajisjes u ruajtën në Listëprezencë.</p>}<div className="overflow-x-auto"><table className="min-w-[780px] w-full text-xs"><thead className="bg-[#eaf0f7] text-[#334155]"><tr><th className="p-2 text-left">ID Pajisje</th><th className="p-2 text-left">Emri Pajisje</th><th className="p-2 text-left">Nr. Listëpage / Punonjësi</th><th className="p-2 text-center">Statusi</th></tr></thead><tbody>{preview.length ? preview.map(({ block, employee }) => <tr className="border-t border-[#e5eaf1]" key={block.deviceId}><td className="p-2 font-medium">{block.deviceId}</td><td className="p-2">{block.name}</td><td className="p-2">{employee ? `${employee.employeeNumber} · ${fullName(employee)}` : "Do të krijohet automatikisht"}</td><td className="p-2 text-center"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${employee ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{employee ? "LIDHUR" : "I RI"}</span></td></tr>) : <tr><td colSpan={4} className="p-5 text-center text-[#64748b]">Nuk ka të dhëna.</td></tr>}</tbody></table></div><p className="border-t border-[#e5eaf1] bg-[#f8fafc] px-4 py-2 text-xs text-[#64748b]">Lidhjet ruhen për muajt e ardhshëm dhe përdorin vetëm ID-në e pajisjes.</p></section>
  </div>;
}
