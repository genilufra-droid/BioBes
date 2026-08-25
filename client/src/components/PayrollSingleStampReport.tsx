import React from "react";
import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildSingleStampPresenceColumns,
  buildSingleStampPresenceRows,
  type SingleStampRow,
} from "@/lib/payrollSingleStamp";

type Props = {
  rows: SingleStampRow[];
  periodLabel: string;
  dayCount?: number;
  onExcel: () => void;
  onPdf: () => void;
  onPrint: () => void;
};

export function PayrollSingleStampReport({ rows, periodLabel, dayCount = 31, onExcel, onPdf, onPrint }: Props) {
  const [search, setSearch] = React.useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("sq-AL");
  const filteredRows = normalizedSearch
    ? rows.filter(row => `${row.nrListepage} ${row.punonjesi} ${row.dita} ${row.kohaVetme}`.toLocaleLowerCase("sq-AL").includes(normalizedSearch))
    : rows;
  const gridRows = buildSingleStampPresenceRows(filteredRows, dayCount);
  const columns = buildSingleStampPresenceColumns(dayCount);
  const dayColumns = columns.slice(2, -1);
  const periodTitle = periodLabel.replaceAll("_", " ");
  const issueCount = filteredRows.length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#cfd9e6] bg-white p-3">
        <div>
          <h2 className="text-base font-semibold text-[#17253d]">SHKARKO PA GISHT — LISTËPREZENCË</h2>
          <p className="text-xs text-[#64748b]">{periodTitle} · {gridRows.length} punonjës me problem · {issueCount} data me vetëm një stampim</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onExcel} disabled={!rows.length}><Download className="mr-1 h-3.5 w-3.5" />Excel</Button>
          <Button size="sm" variant="outline" onClick={onPdf} disabled={!rows.length}><FileText className="mr-1 h-3.5 w-3.5" />PDF</Button>
          <Button size="sm" variant="outline" onClick={onPrint} disabled={!rows.length}><Printer className="mr-1 h-3.5 w-3.5" />Print Preview</Button>
        </div>
      </div>

      <div className="rounded-md border border-[#cfd9e6] bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#17253d]">LISTËPREZENCA — MUNGON DALJE</h3>
            <p className="mt-0.5 text-xs text-[#64748b]">Shfaqen vetëm punonjësit dhe datat ku Logs-i ka saktësisht një stampim.</p>
          </div>
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Kërko emër, nr. listëpage ose datë…" className="h-8 max-w-sm text-xs" />
        </div>

        <div className="overflow-x-auto rounded border border-[#d7dee8]">
          <table className="min-w-[1260px] w-full border-collapse text-[11px]">
            <thead className="bg-[#eaf0f7] text-[#20375c]">
              <tr>
                <th className="sticky left-0 z-20 w-[105px] min-w-[105px] border-r border-[#d7dee8] px-2 py-2 text-left font-semibold">NR. LISTEPAGE</th>
                <th className="sticky left-[105px] z-20 w-[180px] min-w-[180px] border-r border-[#d7dee8] px-2 py-2 text-left font-semibold">EMËR MBIEMËR</th>
                {dayColumns.map(column => <th key={column.key} className="w-[36px] min-w-[36px] border-r border-[#d7dee8] px-1 py-2 text-center font-semibold">{column.label}</th>)}
                <th className="w-[92px] min-w-[92px] px-2 py-2 text-center font-semibold">DITË PA DALJE</th>
              </tr>
            </thead>
            <tbody>
              {gridRows.length ? gridRows.map(row => (
                <tr key={`${row.nrListepage}-${row.punonjesi}`} className="border-t border-[#e2e8f0]">
                  <td className="sticky left-0 z-10 border-r border-[#e2e8f0] bg-white px-2 py-2 font-medium text-[#17253d]">{row.nrListepage}</td>
                  <td className="sticky left-[105px] z-10 border-r border-[#e2e8f0] bg-white px-2 py-2 font-medium text-[#17253d]">{row.punonjesi}</td>
                  {dayColumns.map(column => {
                    const value = row[column.key];
                    return <td key={column.key} className={`border-r border-[#e2e8f0] px-1 py-2 text-center ${value ? "bg-[#fff7d6] font-bold text-[#9a3412]" : "text-transparent"}`} title={value ? `Mungon dalje — ${value}` : undefined}>{value || "·"}</td>;
                  })}
                  <td className="bg-[#fff7d6] px-2 py-2 text-center font-semibold text-[#9a3412]">{row.diteMungese}</td>
                </tr>
              )) : (
                <tr><td colSpan={dayColumns.length + 3} className="px-3 py-10 text-center text-sm text-[#64748b]">Nuk ka data me mungesë daljeje në këtë periudhë.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-[#f0c36d] bg-[#fff7d6]" />Mungon dalje — vetëm hyrje</span>
          <span>Ditët me dy ose katër stampime nuk shfaqen në këtë raport.</span>
        </div>
      </div>
    </section>
  );
}
