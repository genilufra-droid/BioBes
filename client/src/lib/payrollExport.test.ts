import { describe, expect, it } from "vitest";
import { payrollAnalyticRows, payrollBorderoRows, payrollBorderoRowsWithTotal, payrollContribRows, payrollForeignRows, payrollPaymentRows, payrollPaymentRowsWithTotal, payrollPayslipRows, payrollPayslipRowsWithTotal, payrollTaxContributionRows } from "./payrollExport";

describe("eksportet e pagave", () => {
  it("ruan kolonat e borderos dhe formaton vlerat nga centet", () => {
    const [row] = payrollBorderoRows([{ employeeNumber: "001", employeeName: "Arta Hoxha", normalMinutes: 480, overtimeMinutes: 60, grossCents: 9500, socialEmployeeCents: 950, socialEmployerCents: 1425, taxCents: 450, netCents: 8100, payableCents: 7600 }]);
    expect(row).toMatchObject({ nr: 1, punonjesi: "Arta Hoxha", oreBruto: 9, orePagese: 9, oreNormale: 8, oreShtese: 1, total: "95,00", banka: "0,00", cash: "0,00" });
  });

  it("ruan koston OPSH nga regjistri edhe kur orët shtesë janë zero", () => {
    const [row] = payrollBorderoRows([
      { payrollEmployeeId: 57, employeeNumber: "057", employeeName: "Novrus Peqini", normalMinutes: 13440, overtimeMinutes: 0, regularPayCents: 4480000, overtimePayCents: 0, grossCents: 4980000, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 0, netCents: 4980000, payableCents: 4980000 },
    ], [{ id: 57, regularRateCents: 20000, overtimeRateCents: 25000 }]);
    expect(row).toMatchObject({ kostoOpn: "200,00", kostoOpsh: "250,00", shuma2: "0,00" });
  });

  it("shton rreshtin TOTAL në fund të Borderos së eksportuar", () => {
    const rows = payrollBorderoRowsWithTotal([
      { employeeNumber: "001", employeeName: "Arta", normalMinutes: 480, overtimeMinutes: 60, regularPayCents: 8000, overtimePayCents: 1500, bonusCents: 500, grossCents: 10000, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 0, netCents: 10000, payableCents: 10000, bankPaymentCents: 7000, cashPaymentCents: 3000 },
      { employeeNumber: "002", employeeName: "Blerim", normalMinutes: 480, overtimeMinutes: 0, regularPayCents: 9000, overtimePayCents: 0, bonusCents: 0, grossCents: 9000, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 0, netCents: 9000, payableCents: 9000, bankPaymentCents: 0, cashPaymentCents: 9000 },
    ]);
    expect(rows).toHaveLength(3);
    expect(rows[2]).toMatchObject({ nr: "TOTAL", oreBruto: 17, oreNormale: 16, oreShtese: 1, shuma1: "170,00", shuma2: "15,00", bonus: "5,00", total: "190,00", banka: "70,00", cash: "120,00" });
  });

  it("përgatit kolonat e referencës për Bankë, Cash dhe Kontribute", () => {
    const entry = { employeeNumber: "001", employeeName: "Arta Hoxha", normalMinutes: 480, overtimeMinutes: 0, grossCents: 10000, socialEmployeeCents: 1000, socialEmployerCents: 1500, taxCents: 500, netCents: 8500, payableCents: 8000, bankPaymentCents: 8000, cashPaymentCents: 0, bankAccount: "AL123", bankName: "BKT" };
    expect(payrollPaymentRows([entry], "BANK")[0]).toMatchObject({ nr: 1, nrLlogarise: "AL123", banka: "BKT", shuma: "80,00" });
    const cashEntry = { ...entry, bankPaymentCents: 0, cashPaymentCents: 8000 };
    const cashRow = payrollPaymentRows([cashEntry], "CASH")[0];
    expect(cashRow).toMatchObject({ nr: 1, nrListepage: "001", pagesaCash: "80,00", nenshkrim: "" });
    expect(Object.keys(cashRow)).toEqual(["nr", "punonjesi", "nrListepage", "pagesaCash", "nenshkrim"]);
    expect(payrollContribRows([entry])[0]).toMatchObject({ punonjesi: "Arta Hoxha", kontributPunemarres: "10,00", kontributPunedhenes: "15,00", tatim: "5,00" });
  });

  it("shton rreshtat TOTAL në fund të Listëpagesës Bankë dhe Cash", () => {
    const bankEntry = { employeeNumber: "001", employeeName: "Arta Hoxha", normalMinutes: 480, overtimeMinutes: 0, grossCents: 10000, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 0, netCents: 10000, payableCents: 10000, bankPaymentCents: 8000, cashPaymentCents: 0, bankAccount: "AL123", bankName: "BKT" };
    const cashEntry = { ...bankEntry, employeeNumber: "002", employeeName: "Blerim Hoxha", bankPaymentCents: 0, cashPaymentCents: 6000 };
    const bankRows = payrollPaymentRowsWithTotal([bankEntry, cashEntry], "BANK");
    const cashRows = payrollPaymentRowsWithTotal([bankEntry, cashEntry], "CASH");
    expect(bankRows).toHaveLength(3);
    expect(bankRows[2]).toMatchObject({ nr: "TOTALI PËR BANKË", shuma: "80,00" });
    expect(cashRows).toHaveLength(3);
    expect(cashRows[2]).toMatchObject({ nr: "TOTALI PËR CASH", pagesaCash: "60,00", nenshkrim: "" });
  });

  it("ndërton Fletëpagesat me orët, pagat, tatimin, avansin, Bankë/Cash dhe pagesën", () => {
    const [row] = payrollPayslipRows([{ employeeNumber: "045", employeeName: "Arben Hoxha", normalMinutes: 480, overtimeMinutes: 90, regularPayCents: 80000, overtimePayCents: 22500, grossCents: 102500, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 10000, netCents: 92500, advanceCents: 5000, bankPaymentCents: 60000, cashPaymentCents: 27500, payableCents: 87500 }]);
    expect(row).toMatchObject({ nr: 1, punonjesi: "Arben Hoxha", oreNormale: 8, oreShtese: 2, vpagaNormale: "800,00", vpagaShtese: "225,00", bruto: "1025,00", tatimi: "100,00", neto: "925,00", avans: "50,00", banka: "600,00", cash: "275,00", perPagese: "875,00" });
    const [negativeCashRow] = payrollPayslipRows([{ employeeNumber: "046", employeeName: "Bora Hoxha", normalMinutes: 480, overtimeMinutes: 0, regularPayCents: 80000, overtimePayCents: 0, grossCents: 80000, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 0, netCents: 80000, advanceCents: 0, bankPaymentCents: 0, cashPaymentCents: -2500, paymentMethod: "CASH", payableCents: -2500 }]);
    expect(negativeCashRow).toMatchObject({ banka: "0,00", cash: "-25,00", perPagese: "-25,00" });
  });

  it("shton rreshtin TOTAL në fund të Fletëpagesave të eksportuara", () => {
    const rows = payrollPayslipRowsWithTotal([
      { employeeNumber: "001", employeeName: "Arta", normalMinutes: 480, overtimeMinutes: 60, regularPayCents: 8000, overtimePayCents: 1500, grossCents: 9500, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 1000, netCents: 8500, advanceCents: 500, bankPaymentCents: 6000, cashPaymentCents: 2000, payableCents: 8000 },
      { employeeNumber: "002", employeeName: "Blerim", normalMinutes: 480, overtimeMinutes: 0, regularPayCents: 9000, overtimePayCents: 0, grossCents: 9000, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 500, netCents: 8500, advanceCents: 0, bankPaymentCents: 0, cashPaymentCents: 8500, payableCents: 8500 },
    ]);
    expect(rows).toHaveLength(3);
    expect(rows[2]).toMatchObject({ nr: "TOTAL", oreNormale: 16, oreShtese: 1, vpagaNormale: "170,00", vpagaShtese: "15,00", bruto: "185,00", tatimi: "15,00", neto: "170,00", avans: "5,00", banka: "60,00", cash: "105,00", perPagese: "165,00" });
  });

  it("rrumbullakos orët normale dhe shtesë në Fletëpagesa pa minuta", () => {
    const [row] = payrollPayslipRows([{ employeeNumber: "047", employeeName: "Test Hoxha", normalMinutes: 539, overtimeMinutes: 34, regularPayCents: 80000, overtimePayCents: 8500, grossCents: 88500, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 0, netCents: 88500, advanceCents: 0, bankPaymentCents: 88500, cashPaymentCents: 0, payableCents: 88500 }]);
    expect(row).toMatchObject({ oreNormale: 9, oreShtese: 1 });
    expect(String(row.oreNormale)).not.toContain(".");
    expect(String(row.oreShtese)).not.toContain(".");
  });

  it("grupon Borderon Analitike sipas pozicionit të punonjësit", () => {
    const rows = payrollAnalyticRows([
      { payrollEmployeeId: 1, employeeNumber: "001", employeeName: "Arta", normalMinutes: 480, overtimeMinutes: 60, grossCents: 10000, socialEmployeeCents: 1000, socialEmployerCents: 1500, taxCents: 500, netCents: 8500, payableCents: 8000 },
      { payrollEmployeeId: 2, employeeNumber: "002", employeeName: "Blerim", normalMinutes: 480, overtimeMinutes: 0, grossCents: 12000, socialEmployeeCents: 1200, socialEmployerCents: 1800, taxCents: 600, netCents: 10200, payableCents: 9700 },
    ], [{ id: 1, position: "Operator" }, { id: 2, position: "Operator" }]);

    expect(rows).toEqual([{ pozicioni: "Operator", punonjes: 2, oreNormale: 16, oreShtese: 1, bruto: "220,00", kontribut: "22,00", tatim: "11,00", neto: "187,00", perPagese: "177,00" }]);
  });

  it("përgatit Të Huajt me ditë pune, pagë ditore dhe pagesë bankare", () => {
    const [row] = payrollForeignRows([{ payrollEmployeeId: 8, employeeNumber: "008", employeeName: "Amir", normalMinutes: 960, overtimeMinutes: 120, grossCents: 21000, socialEmployeeCents: 0, socialEmployerCents: 0, taxCents: 0, netCents: 21000, payableCents: 21000, bankPaymentCents: 15000, cashPaymentCents: 6000, paymentMethod: "BANK" }], [{ id: 8, isForeign: 1, dailyRateCents: 10000, overtimeRateCents: 12500 }], [{ payrollEmployeeId: 8, normalMinutes: 480, overtimeMinutes: 0 }, { payrollEmployeeId: 8, normalMinutes: 480, overtimeMinutes: 120 }]);
    expect(row).toMatchObject({ nr: 1, punonjesi: "Amir", ditePune: 2, pagaDite: "100,00", kostoOpsh: "125,00", oreShtese: 2, banke: "150,00", cash: "60,00", total: "210,00" });
  });

  it("përgatit Tatime & Kontribute me bruto dhe neto", () => {
    const [row] = payrollTaxContributionRows([{ employeeNumber: "001", employeeName: "Arta", normalMinutes: 0, overtimeMinutes: 0, grossCents: 10000, socialEmployeeCents: 950, socialEmployerCents: 1500, taxCents: 450, netCents: 8600, payableCents: 8600 }]);
    expect(row).toEqual({ punonjesi: "Arta", kontributPunemarres: "9,50", kontributPunedhenes: "15,00", tatim: "4,50", bruto: "100,00", neto: "86,00" });
  });
});
