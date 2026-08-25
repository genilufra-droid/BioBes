import { describe, expect, it } from "vitest";
import { buildSingleStampPresenceColumns, buildSingleStampPresenceRows, buildSingleStampRows, buildSingleStampRowsFromLogs, extractLogStamps, singleStampColumns, type SingleStampRow } from "./payrollSingleStamp";

describe("payrollSingleStamp", () => {
  it("lexon vetëm orët nga shënimi i Logs", () => {
    expect(extractLogStamps("Logs 100: 07:04 | Bruto 0m | Pagesë 0m")).toEqual(["07:04"]);
    expect(extractLogStamps("Logs 100: 07:04 / 17:02 | Bruto 598m")).toEqual(["07:04", "17:02"]);
    expect(extractLogStamps("manuale")).toEqual([]);
  });

  it("krijon rreshta vetëm për një stampim dhe nuk përfshin dy stampime", () => {
    const rows = buildSingleStampRows([
      { payrollEmployeeId: 1, day: 9, note: "Logs 100: 17:06 | Bruto 0m" },
      { payrollEmployeeId: 1, day: 10, note: "Logs 100: 07:00 / 17:00 | Bruto 600m" },
      { payrollEmployeeId: 2, day: 25, note: "Logs 101: 06:52 | Bruto 0m" },
    ], [
      { id: 1, employeeNumber: "2", firstName: "Ardian", lastName: "Test" },
      { id: 2, employeeNumber: "3", firstName: "Medina", lastName: "Test" },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows.map(row => [row.nrListepage, row.dita, row.kohaVetme])).toEqual([["2", 9, "17:06"], ["3", 25, "06:52"]]);
    expect(rows[0].problemi).toContain("Mungon dalje — vetëm hyrje");
  });

  it("ruan kolonat e formatit të raportit HTML", () => {
    expect(singleStampColumns.map(column => column.label)).toEqual(["NR. LISTEPAGE", "PUNONJËSI", "DITA", "KOHA E VETME", "PROBLEMI"]);
  });

  it("ndërton listën zyrtare të mungesës së daljes nga Logs", () => {
    const rows = buildSingleStampRowsFromLogs([
      { deviceId: "2", name: "Ardian", days: { "19": ["08:00"], "20": ["08:00", "17:00"] } },
      { deviceId: "7", name: "Medina", days: { "18": ["06:59"] } },
    ], [{ id: 2, employeeNumber: "2", firstName: "Ardian", lastName: "K." }], { "2": 2 });
    expect(rows).toEqual([
      { nrListepage: "2", punonjesi: "Ardian K.", dita: 19, kohaVetme: "08:00", problemi: "Mungon dalje — vetëm hyrje · Ardian K. · dita 19" },
      { nrListepage: "7", punonjesi: "Medina", dita: 18, kohaVetme: "06:59", problemi: "Mungon dalje — vetëm hyrje · Medina · dita 18" },
    ]);
  });
});


describe("gridi Shkarko pa gisht", () => {
  it("grupon punonjësin në një rresht dhe shënon vetëm ditët me një stampim", () => {
    const rows: SingleStampRow[] = [
      { nrListepage: "12", punonjesi: "Medina Hoxha", dita: 18, kohaVetme: "06:59", problemi: "Mungon dalje — vetëm hyrje" },
      { nrListepage: "12", punonjesi: "Medina Hoxha", dita: 22, kohaVetme: "07:01", problemi: "Mungon dalje — vetëm hyrje" },
    ];
    const result = buildSingleStampPresenceRows(rows, 31);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ nrListepage: "12", punonjesi: "Medina Hoxha", dita18: "06:59", dita22: "07:01", diteMungese: 2 });
    expect(result[0].dita17).toBe("");
    expect(result[0].dita19).toBe("");
  });

  it("kthen kolonat e muajit dhe totalin e ditëve problematike", () => {
    const columns = buildSingleStampPresenceColumns(31);
    expect(columns[0]).toMatchObject({ key: "nrListepage", label: "NR. LISTEPAGE" });
    expect(columns[1]).toMatchObject({ key: "punonjesi", label: "EMËR MBIEMËR" });
    expect(columns[2]).toMatchObject({ key: "dita1", label: "1" });
    expect(columns[32]).toMatchObject({ key: "dita31", label: "31" });
    expect(columns[33]).toMatchObject({ key: "diteMungese", label: "DITË ME MUNGESË DALJEJE" });
  });
});
