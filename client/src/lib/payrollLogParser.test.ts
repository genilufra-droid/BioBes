import { describe, expect, it } from "vitest";
import { parseListOfLogs } from "./payrollLogParser";

describe("parseListOfLogs", () => {
  it("përdor header-in më të afërt të ditëve për secilin bllok pajisjeje", () => {
    const parsed = parseListOfLogs([
      ["List of Logs"],
      ["Period : 2026/07/01 ~ 07/31"],
      ["", 1, 2, 3, 4, 5],
      ["No :", "2", "Name :", "ardian", "Dept :", "Unset"],
      ["", "07:12/17:04", "08:00/16:26", "", "", ""],
      [1, 2, 3, 4, 5],
      ["No :", "4", "Name :", "irma", "Dept :", "Unset"],
      ["07:53/18:03", "", "07:51/17:07", "", ""],
    ]);
    expect(parsed).toMatchObject({ year: 2026, month: 7 });
    expect(parsed.blocks).toHaveLength(2);
    expect(parsed.blocks[0]).toMatchObject({ deviceId: "2", name: "ardian", days: { 1: ["07:12", "17:04"] } });
    expect(parsed.blocks[1]).toMatchObject({ deviceId: "4", name: "irma", days: { 1: ["07:53", "18:03"] } });
  });

  it("lexon etiketat No, Name dhe Dept kur janë të bashkuara në një qelizë", () => {
    const parsed = parseListOfLogs([
      ["List of Logs"],
      ["Period : 2026/08/01 ~ 08/31"],
      [1, 2, 3, 4, 5],
      ["No : 18 Name : Elira Hoxha Dept : Administratë"],
      ["07:00/16:00", "07:04/16:34", "", "", ""],
    ]);
    expect(parsed.blocks[0]).toMatchObject({ deviceId: "18", name: "Elira Hoxha", department: "Administratë", days: { 1: ["07:00", "16:00"], 2: ["07:04", "16:34"] } });
  });

  it("lexon formatin real Logs me kolona të larguara dhe stampa në rreshta", () => {
    const parsed = parseListOfLogs([
      ["List of Logs"],
      ["Period :", "", "2026/07/01 ~ 07/31\t( biobes )"],
      [""],
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
      ["No :", "", "2", "", "", "", "", "", "Name :", "", "ardian", "", "", "", "", "", "", "", "Dept :", "", "Unset"],
      ["", "", "07:12\n17:04\n", "08:00\n16:26\n", "06:58\n16:04\n"],
    ]);
    expect(parsed).toMatchObject({ year: 2026, month: 7 });
    expect(parsed.blocks).toHaveLength(1);
    expect(parsed.blocks[0]).toMatchObject({ deviceId: "2", name: "ardian", department: "Unset", days: { 3: ["07:12", "17:04"], 4: ["08:00", "16:26"], 5: ["06:58", "16:04"] } });
  });
});
