import { describe, expect, it } from "vitest";
import { buildPayrollEmployeeWarnings, buildPayrollErrors } from "./payrollErrors";

describe("Kontroll Gabimesh", () => {
  it("sinjalizon mungesën e të dhënave bllokuese", () => {
    const rows = buildPayrollErrors([], [], []);
    expect(rows.filter(row => row.niveli === "Bllokuese")).toHaveLength(3);
  });

  it("gjen dublikatat dhe orët mbi kufirin ditor", () => {
    const rows = buildPayrollErrors([{ id: 1, employeeNumber: "1", active: 1 }, { id: 2, employeeNumber: "1", active: 1 }], [{ payrollEmployeeId: 1, day: 1, normalMinutes: 500, overtimeMinutes: 0 }], [{ payrollEmployeeId: 1, employeeNumber: "1" }]);
    expect(rows.find(row => row.mesazhi.includes("dublikuar"))?.niveli).toBe("Bllokuese");
    expect(rows.find(row => row.mesazhi.includes("normale"))?.niveli).toBe("Vërejtje");
  });

  it("kthen vërejtjet kanonike të një punonjësi nga prezenca dhe Borderoja", () => {
    const warnings = buildPayrollEmployeeWarnings(1, [{ payrollEmployeeId: 1, day: 12, normalMinutes: 540, overtimeMinutes: 0, attendanceCode: "K" }], []);
    expect(warnings).toEqual(expect.arrayContaining([
      { day: 12, label: "Vetëm një pullim", detail: "Ka vetëm një stampim dhe kërkon kontroll të hyrjes/daljes." },
      { day: 12, label: "Orë normale mbi kufi", detail: "Orët normale të kësaj dite tejkalojnë kufirin prej 8 orësh." },
      { label: "Mungon rreshti në Bordero", detail: "Punonjësi ka prezencë në periudhë, por nuk ka rresht të gjeneruar në Bordero." },
    ]));
  });
});
