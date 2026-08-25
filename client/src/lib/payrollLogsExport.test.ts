import { describe, expect, it } from "vitest";
import { buildPayrollLogsExport } from "./payrollLogsExport";

describe("eksporti i Logs", () => {
  it("ruan stampimet burimore sipas ditëve dhe totalet e tyre", () => {
    const { rows, totals, columns } = buildPayrollLogsExport([{ deviceId: "78", name: "medina", department: "Unset", days: { 18: ["06:59", "20:00"] } }], 31, 2026, 8);
    expect(columns).toHaveLength(36);
    expect(rows[0]).toMatchObject({ idPajisje: "78", emri: "medina", dita18: 13, gjithsej: 13, normale: 8, shtese: 5 });
    expect(totals).toMatchObject({ emri: "TOTALI DITËS", dita18: 13, gjithsej: 13, normale: 8, shtese: 5 });
  });
});
