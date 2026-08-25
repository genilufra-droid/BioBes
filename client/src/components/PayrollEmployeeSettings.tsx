import { useEffect, useState, useRef, useMemo } from "react";
import { Pencil, Save, Download, Upload, FileSpreadsheet, FileText, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { centsToEuroInput, euroInputToCents } from "@/lib/payrollEmployeePayment";
import { filterPayrollEmployees } from "@/lib/payrollEmployeeSearch";
import { downloadEmployeeTemplate, exportEmployeeRegistryExcel, parseEmployeeExcelFile } from "@/lib/payrollTemplateImport";

type Employee = { id: number; employeeNumber: string; firstName: string; lastName: string | null; position: string | null; regularRateCents: number; overtimeRateCents: number; baseSalaryCents: number; advanceCents: number; dailyRateCents: number; paymentMethod: "BANK" | "CASH"; bankName: string | null; bankAccount: string | null; isForeign: number; shiftCode: string | null; active: number };
const euros = centsToEuroInput;
const cents = euroInputToCents;

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-semibold text-[#17253d]">{label}</span>
      <Input value={value} onChange={e => onChange(e.target.value)} className="h-8 text-xs" />
    </div>
  );
}

function EmployeeDocumentsSection({ companyId, employeeId }: { companyId: number; employeeId: number }) {
  const utils = trpc.useUtils();
  const docsQuery = trpc.payroll.documents.list.useQuery({ companyId, employeeId });
  const docs = docsQuery.data || [];
  const [docType, setDocType] = useState<string>("ID");
  const [docName, setDocName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const createDoc = trpc.payroll.documents.create.useMutation({
    onSuccess: async () => {
      await utils.payroll.documents.list.invalidate({ companyId, employeeId });
      toast.success("Dokumenti u ngarkua me sukses.");
      setDocName("");
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (err: any) => {
      setUploading(false);
      toast.error(err.message || "Dështoi ngarkimi i dokumentit.");
    }
  });

  const deleteDoc = trpc.payroll.documents.delete.useMutation({
    onSuccess: async () => {
      await utils.payroll.documents.list.invalidate({ companyId, employeeId });
      toast.success("Dokumenti u fshi.");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      const name = docName.trim() || file.name;
      createDoc.mutate({
        companyId,
        employeeId,
        documentType: docType,
        documentName: name,
        fileUrl: base64String,
        fileKey: `emp_${employeeId}_${Date.now()}_${file.name}`
      });
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error("Gabim në leximin e skedarit.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-4 rounded-md border border-[#cbd8e7] bg-white p-3">
      <div className="mb-3 flex items-center justify-between border-b pb-2">
        <h4 className="text-xs font-semibold text-[#17253d]">Dokumentet Personale (ID, CV, Kontrata)</h4>
        <span className="text-[11px] text-[#64748b]">{docs.length} dokumente</span>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="grid gap-1">
          <span className="text-[11px] font-medium">Lloji i Dokumentit</span>
          <select value={docType} onChange={e => setDocType(e.target.value)} className="h-8 rounded-md border border-[#cbd8e7] px-2 text-xs">
            <option value="ID">Kartë ID / Pasaportë</option>
            <option value="CV">CV / Jetëshkrim</option>
            <option value="Kontrate">Kontratë Pune</option>
            <option value="Certifikate">Certifikatë / Trajnim</option>
            <option value="Tjeter">Dokument tjetër</option>
          </select>
        </div>
        <div className="grid gap-1">
          <span className="text-[11px] font-medium">Përshkrimi / Emri</span>
          <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="p.sh. ID e re 2026" className="h-8 text-xs" />
        </div>
        <div className="flex items-end">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-[#2c5282] text-white hover:bg-[#213f67]" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="mr-1 h-3.5 w-3.5" /> {uploading ? "Duke ngarkuar..." : "+ Ngarko skedar"}
          </Button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="text-center text-[11px] text-[#64748b] py-2">Nuk ka dokumente të ngarkuara për këtë punonjës.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#f1f5f9]">
              <tr>
                <th className="p-1.5 text-left">Lloji</th>
                <th className="p-1.5 text-left">Emri</th>
                <th className="p-1.5 text-left">Data</th>
                <th className="p-1.5 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc: { id: number; documentType: string; documentName: string; fileUrl: string; uploadedAt: Date }) => (
                <tr className="border-t" key={doc.id}>
                  <td className="p-1.5 font-semibold">{doc.documentType}</td>
                  <td className="p-1.5">{doc.documentName}</td>
                  <td className="p-1.5">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td className="p-1.5 text-right space-x-1">
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded border border-[#cbd8e7] px-2 py-0.5 text-[11px] font-medium text-[#2c5282] hover:bg-[#f1f5f9]">
                      <Eye className="mr-1 h-3 w-3" /> Shiko
                    </a>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-[11px] text-red-600 hover:bg-red-50" onClick={() => deleteDoc.mutate({ companyId, id: doc.id })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function PayrollEmployeeSettings({ companyId, employees, onSaved, focusEmployeeId, onFocusHandled, onProfileSaved }: { companyId: number; employees: Employee[]; onSaved: () => Promise<void>; focusEmployeeId?: number; onFocusHandled?: () => void; onProfileSaved?: () => void }) {
  const [selected, setSelected] = useState<Employee>();
  const [docModalEmployee, setDocModalEmployee] = useState<Employee>();
  const [search, setSearch] = useState("");
  const [regularRate, setRegularRate] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [advance, setAdvance] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [isForeign, setIsForeign] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"BANK" | "CASH">("BANK");
  const [shiftCode, setShiftCode] = useState<"A" | "B" | "C">("A");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.payroll.employees.create.useMutation();
  const update = trpc.payroll.employees.update.useMutation({
    onSuccess: async () => {
      await onSaved();
      setSelected(undefined);
      if (onProfileSaved) onProfileSaved();
      else toast.success("Të dhënat e pagesës u ruajtën.");
    },
    onError: error => toast.error(error.message),
  });

  const begin = (employee: Employee) => {
    setSelected(employee);
    setRegularRate(euros(employee.regularRateCents));
    setOvertimeRate(euros(employee.overtimeRateCents));
    setBaseSalary(euros(employee.baseSalaryCents));
    setAdvance(euros(employee.advanceCents));
    setDailyRate(euros(employee.dailyRateCents));
    setIsForeign(employee.isForeign);
    setPaymentMethod(employee.paymentMethod);
    setShiftCode(employee.shiftCode === "B" || employee.shiftCode === "C" ? employee.shiftCode : "A");
    setBankName(employee.bankName || "");
    setBankAccount(employee.bankAccount || "");
  };

  useEffect(() => {
    if (!focusEmployeeId) return;
    const employee = employees.find(item => item.id === focusEmployeeId);
    if (employee) begin(employee);
    onFocusHandled?.();
  }, [focusEmployeeId, employees]);

  const save = () => selected && update.mutate({
    companyId,
    id: selected.id,
    regularRateCents: cents(regularRate),
    overtimeRateCents: cents(overtimeRate),
    baseSalaryCents: cents(baseSalary),
    advanceCents: cents(advance),
    dailyRateCents: cents(dailyRate),
    paymentMethod,
    bankName: bankName.trim() || undefined,
    bankAccount: bankAccount.trim() || undefined,
    isForeign,
    shiftCode,
    active: selected.active,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportProgress(10);
    setImportErrors([]);

    const { rows, errors } = await parseEmployeeExcelFile(file);
    if (errors.length > 0) {
      setImportErrors(errors);
      setImporting(false);
      setImportProgress(0);
      toast.error(`Gabime gjatë leximit të Excel-it (${errors.length}).`);
      return;
    }

    setImportProgress(40);
    let successCount = 0;
    const total = rows.length;

    for (let i = 0; i < total; i++) {
      const row = rows[i];
      try {
        await createMutation.mutateAsync({
          companyId,
          employeeNumber: row.employeeNumber,
          firstName: row.firstName,
          lastName: row.lastName || undefined,
          position: row.position || undefined,
          shiftCode: row.shiftCode,
          isForeign: row.isForeign,
          dailyRateCents: Math.round(row.dailyRate * 100),
          paymentMethod: row.paymentMethod,
          bankName: row.bankName || undefined,
          bankAccount: row.bankAccount || undefined,
          regularRateCents: row.regularRateCents ?? 0,
          overtimeRateCents: row.overtimeRateCents ?? 0,
          baseSalaryCents: row.baseSalaryCents || 0,
          advanceCents: 0,
          active: 1,
        });
        successCount++;
      } catch (err: any) {
        setImportErrors(prev => [...prev, `Rreshti me Nr. ${row.employeeNumber}: ${err?.message || "Dështoi krijimi në databazë."}`]);
      }
      setImportProgress(40 + Math.round((i + 1) / total * 50));
    }

    setImportProgress(100);
    setImporting(false);
    await onSaved();
    toast.success(`U importuan me sukses ${successCount} nga ${total} punonjës.`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredEmployees = useMemo(() => filterPayrollEmployees(employees, search), [employees, search]);

  return (
    <section className="overflow-hidden rounded-md border border-[#d7dee8] bg-white">
      <div className="flex flex-wrap items-center justify-between border-b border-[#e5eaf1] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#17253d]">Regjistri i Punonjësve & Dokumentet</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadEmployeeTemplate()}>
            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> Shablloni Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportEmployeeRegistryExcel(employees)}>
            <Download className="mr-1 h-3.5 w-3.5" /> Eksporto Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <Upload className="mr-1 h-3.5 w-3.5" /> {importing ? "Po importohet..." : "Import Excel (Pagat.xlsx)"}
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="p-4">
        {importing && (
          <div className="mb-4 rounded-md border border-[#cbd8e7] bg-[#f8fbff] p-3">
            <p className="mb-1 text-xs font-semibold text-[#17253d]">Duke importuar punonjësit dhe kostot e pagave nga Pagat.xlsx...</p>
            <Progress value={importProgress} className="h-2 w-full" />
          </div>
        )}

        {importErrors.length > 0 && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <p className="font-semibold">U vunë re gabime gjatë importit të qelizave:</p>
            <ul className="mt-1 list-disc pl-4 space-y-1">
              {importErrors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        )}

        {selected && (
          <div className="mb-4 rounded-md border border-[#cbd8e7] bg-[#f8fbff] p-4">
            <div className="mb-3 flex items-center justify-between">
              <b>{selected.employeeNumber} · {selected.firstName} {selected.lastName || ""}</b>
              <Button variant="outline" size="sm" onClick={() => setSelected(undefined)}>Mbyll</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Tarifa normale Lek/orë" value={regularRate} onChange={setRegularRate} />
              <Field label="Tarifa shtesë Lek/orë" value={overtimeRate} onChange={setOvertimeRate} />
              <Field label="Paga bazë Lek/muaj" value={baseSalary} onChange={setBaseSalary} />
              <Field label="Avans Lek" value={advance} onChange={setAdvance} />
              <div className="grid gap-1">
                <span className="text-sm">Punonjës i huaj</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" className={isForeign === 1 ? "bg-[#2c5282]" : ""} variant={isForeign === 1 ? "default" : "outline"} onClick={() => setIsForeign(1)}>Po</Button>
                  <Button type="button" size="sm" className={isForeign === 0 ? "bg-[#2c5282]" : ""} variant={isForeign === 0 ? "default" : "outline"} onClick={() => setIsForeign(0)}>Jo</Button>
                </div>
              </div>
              {isForeign === 1 && <Field label="Paga / ditë Lek" value={dailyRate} onChange={setDailyRate} />}
              <Field label="Banka" value={bankName} onChange={setBankName} />
              <Field label="IBAN / Nr. llogarie" value={bankAccount} onChange={setBankAccount} />
              <div className="grid gap-1">
                <span className="text-sm">Turni</span>
                <div className="flex gap-2">
                  {(["A", "B", "C"] as const).map(code => <Button type="button" size="sm" key={code} className={shiftCode === code ? "bg-[#2c5282]" : ""} variant={shiftCode === code ? "default" : "outline"} onClick={() => setShiftCode(code)}>{code}</Button>)}
                </div>
              </div>
              <div className="grid gap-1">
                <span className="text-sm">Mënyra e pagesës</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" className={paymentMethod === "BANK" ? "bg-[#2c5282]" : ""} variant={paymentMethod === "BANK" ? "default" : "outline"} onClick={() => setPaymentMethod("BANK")}>Bankë</Button>
                  <Button type="button" size="sm" className={paymentMethod === "CASH" ? "bg-[#2c5282]" : ""} variant={paymentMethod === "CASH" ? "default" : "outline"} onClick={() => setPaymentMethod("CASH")}>Cash</Button>
                </div>
              </div>
            </div>

            <EmployeeDocumentsSection companyId={companyId} employeeId={selected.id} />

            <div className="mt-4 flex justify-end">
              <Button className="bg-[#2c5282] hover:bg-[#213f67]" disabled={update.isPending} onClick={save}>
                <Save className="mr-1 h-4 w-4" />{update.isPending ? "Po ruhet…" : "Ruaj pagesën"}
              </Button>
            </div>
          </div>
        )}

        {docModalEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-[#17253d]">
                  Dokumentet e Punonjësit: {docModalEmployee.employeeNumber} · {docModalEmployee.firstName} {docModalEmployee.lastName || ""}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setDocModalEmployee(undefined)}>Mbyll</Button>
              </div>
              <EmployeeDocumentsSection companyId={companyId} employeeId={docModalEmployee.id} />
            </div>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Live Search: emër, mbiemër ose Nr. listëpage…" className="h-9 min-w-[280px] flex-1" />
          <span className="text-xs text-[#64748b]">{filteredEmployees.length} / {employees.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-sm">
            <thead className="bg-[#eaf0f7]">
              <tr>
                <th className="p-2 text-left">Nr.</th>
                <th className="p-2 text-left">Emër</th>
                <th className="p-2 text-left">Turni</th>
                <th className="p-2 text-left">Kosto OPN</th>
                <th className="p-2 text-left">Kosto OPSH</th>
                <th className="p-2 text-left">Paga bazë</th>
                <th className="p-2 text-left">Pagesa</th>
                <th className="p-2 text-left">IBAN</th>
                <th className="p-2 text-right">Veprime / Dokumente</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr className="border-t" key={employee.id}>
                  <td className="p-2">{employee.employeeNumber}</td>
                  <td className="p-2">{employee.firstName} {employee.lastName || ""}</td>
                  <td className="p-2 font-semibold">{employee.shiftCode || "A"}</td>
                  <td className="p-2">Lek{euros(employee.regularRateCents)}</td>
                  <td className="p-2">Lek{euros(employee.overtimeRateCents)}</td>
                  <td className="p-2">Lek{euros(employee.baseSalaryCents)}</td>
                  <td className="p-2">{employee.paymentMethod === "BANK" ? "Bankë" : "Cash"}</td>
                  <td className="p-2">{employee.bankAccount || "—"}</td>
                  <td className="p-2 text-right space-x-1">
                    <Button variant="outline" size="sm" onClick={() => setDocModalEmployee(employee)} title="Dokumentet (ID, CV, Kontrata)">
                      <FileText className="mr-1 h-3.5 w-3.5 text-[#2c5282]" /> Dokumente
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => begin(employee)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Modifiko
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
