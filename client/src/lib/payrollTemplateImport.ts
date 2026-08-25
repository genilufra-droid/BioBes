import * as XLSX from "xlsx";

export type EmployeeImportRow = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  shiftCode: "A" | "B" | "C";
  isForeign: number;
  dailyRate: number;
  paymentMethod: "BANK" | "CASH";
  bankName: string;
  bankAccount: string;
  baseSalaryCents: number;
  regularRateCents: number;
  overtimeRateCents: number;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadEmployeeTemplate() {
  const wsData = [
    ["Nr. Listëpage", "Emri", "Mbiemri", "Pozicioni", "Turni (A/B/C)", "I huaj (0/1)", "Paga/Ditë Lek", "Pagesa (BANK/CASH)", "Banka", "IBAN / Llogaria", "Paga Bazë (Lek)"],
    ["1", "Mariglen", "Myftari", "Operator", "A", "0", "0", "BANK", "BKT", "AL472021100000000123456789", "70000"],
    ["2", "Jon", "Lleshi", "Shofer", "B", "1", "45", "CASH", "", "", "50000"]
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Punonjesit");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Template_Regjistri_Punonjesve.xlsx");
}

export function exportEmployeeRegistryExcel(employees: any[]) {
  const wsData = [
    ["NR.", "EMËR", "MBIEMËR", "POZICIONI", "TURNI", "I HUAJ", "TARIFA NORMALE Lek", "TARIFA SHTESË Lek", "PAGA BAZË Lek", "PAGESA", "BANKA", "IBAN"],
    ...employees.map(emp => [
      emp.employeeNumber,
      emp.firstName,
      emp.lastName || "",
      emp.position || "",
      emp.shiftCode || "A",
      emp.isForeign === 1 ? "Po" : "Jo",
      (emp.regularRateCents / 100).toFixed(2),
      (emp.overtimeRateCents / 100).toFixed(2),
      (emp.baseSalaryCents / 100).toFixed(2),
      emp.paymentMethod,
      emp.bankName || "",
      emp.bankAccount || "",
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Regjistri");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Regjistri_Punonjesve_Sistemi_Genit.xlsx");
}

export function parseEmployeeExcelFile(file: File): Promise<{ rows: EmployeeImportRow[]; errors: string[] }> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: "array" });
        
        // Zgjidh sheet-in "PAGAT GUSHT 2026" ose sheet-in e parë
        let sheetName = wb.SheetNames.find(n => n.toUpperCase().includes("GUSHT") || n.toUpperCase().includes("PAGAT")) || wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const rows: EmployeeImportRow[] = [];
        const errors: string[] = [];

        // Kontrollo nëse është shablloni i Pagat.xlsx (kolona NR, EMER, MBIEMER) apo shablloni standard
        let isPagatTemplate = false;
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(5, json.length); i++) {
          const r = json[i];
          if (r && r.some(c => String(c).toUpperCase().includes("ORE PUNE NORMALE") || String(c).toUpperCase().includes("BONUS"))) {
            isPagatTemplate = true;
            headerRowIdx = i;
            break;
          }
          if (r && r.some(c => String(c).toUpperCase().includes("EMER") || String(c).toUpperCase().includes("NR"))) {
            headerRowIdx = i;
          }
        }

        const dataRows = json.slice(headerRowIdx + 1);
        dataRows.forEach((r, idx) => {
          if (!r || !r.some(Boolean)) return;
          const nr = String(r[0] || "").trim();
          const firstName = String(r[1] || "").trim();
          const lastName = String(r[2] || "").trim();
          if (!firstName || firstName.toUpperCase().includes("TOTAL")) return;

          const employeeNumber = nr || String(idx + 1);
          const kostoOpn = Number(r[4]) || 0;
          const kostoOpsh = Number(r[7]) || 0;
          const baseVal = Number(r[9]) || Number(r[5]) || 0;
          const baseSalaryCents = Math.round(baseVal * 100);
          const regularRateCents = Math.round(kostoOpn * 100);
          const overtimeRateCents = Math.round(kostoOpsh * 100);

          rows.push({
            employeeNumber,
            firstName,
            lastName,
            position: "Specialist",
            shiftCode: "A",
            isForeign: 0,
            dailyRate: 0,
            paymentMethod: "BANK",
            bankName: "Banka Kombëtare Tregtare",
            bankAccount: `AL65212110090000000${employeeNumber.padStart(3, "0")}`,
            baseSalaryCents,
            regularRateCents,
            overtimeRateCents,
          });
        });

        resolve({ rows, errors });
      } catch (err) {
        resolve({ rows: [], errors: ["Leximi i skedarit Excel dështoi. Sigurohuni që është format i vlefshëm .xlsx."] });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
