import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Upload, Warehouse as WarehouseIcon } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseSalesWorkbook, type SalesImportResult } from "@/lib/salesWorkbookImport";

type WarehouseOption = { id: number; name: string };
type ProductOption = { id: number; code: string | null; name: string };
type CustomerOption = { id: number; code: string | null; name: string };

const normalize = (value: unknown) => String(value ?? "").trim().toLocaleLowerCase("sq-AL");

export default function SalesWorkbookImportDialog({ companyId, warehouses, products, customers, onImported, open: controlledOpen, onOpenChange: onControlledOpenChange, showTrigger = true }: { companyId: number; warehouses: WarehouseOption[]; products: ProductOption[]; customers: CustomerOption[]; onImported: () => void; open?: boolean; onOpenChange?: (open: boolean) => void; showTrigger?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<SalesImportResult | null>(null);
  const [warehouseId, setWarehouseId] = useState("");
  const importBatch = trpc.salesInvoice.importBatch.useMutation();
  const selectedWarehouse = warehouses.find(warehouse => String(warehouse.id) === warehouseId);
  const missingProducts = useMemo(() => {
    if (!result) return [];
    return Array.from(new Set(result.invoices.flatMap(invoice => invoice.items.filter(item => !products.some(product => (item.productCode && product.code && normalize(item.productCode) === normalize(product.code)) || normalize(item.productName) === normalize(product.name))).map(item => item.productCode ? `${item.productCode} · ${item.productName}` : item.productName))));
  }, [products, result]);
  const unmatchedCustomers = useMemo(() => {
    if (!result) return [];
    return Array.from(new Set(result.invoices.map(invoice => invoice.customerName).filter(Boolean).filter(name => !customers.some(customer => normalize(customer.name) === normalize(name)))));
  }, [customers, result]);

  const reset = () => { setFileName(""); setResult(null); setWarehouseId(""); if (inputRef.current) inputRef.current.value = ""; };
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = (next: boolean) => { if (controlledOpen === undefined) setInternalOpen(next); else onControlledOpenChange?.(next); if (!next && !importBatch.isPending) reset(); };
  const readFile = async (file: File) => {
    setFileName(file.name);
    try {
      const parsed = parseSalesWorkbook(await file.arrayBuffer());
      setResult(parsed);
      if (parsed.issues.some(issue => issue.severity === "error")) toast.error("Workbook-u ka rreshta që kërkojnë korrigjim.");
      else toast.success(`${parsed.invoices.length} fatura u lexuan për preview.`);
    } catch (error) {
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Excel-i nuk u lexua.");
    }
  };
  const importInvoices = async () => {
    if (!result || result.invoices.length === 0) return toast.error("Nuk ka fatura shitjeje të vlefshme për import.");
    if (!selectedWarehouse) return toast.error("Zgjidhni magazinën e daljes.");
    if (result.issues.some(issue => issue.severity === "error")) return toast.error("Korrigjoni gabimet e workbook-ut para importit.");
    try {
      const response = await importBatch.mutateAsync({
        companyId,
        warehouseId: selectedWarehouse.id,
        invoices: result.invoices.map(invoice => ({
          docNumber: invoice.docNumber,
          date: invoice.date,
          customerCode: invoice.customerCode,
          customerName: invoice.customerName,
          currency: invoice.currency,
          exchangeRate: invoice.exchangeRate,
          invoiceFormat: invoice.invoiceFormat,
          exportDetails: invoice.exportDetails,
          totalAmount: invoice.totalAmount,
          vatAmount: invoice.totalVat,
          items: invoice.items.map(item => ({
            productCode: item.productCode,
            productName: item.productName,
            quantity: Math.round(item.quantity),
            unit: item.unit,
            unitPrice: item.unitPrice,
            notes: item.metadata ? JSON.stringify(item.metadata) : undefined,
          })),
        })),
      });
      if (response.errors.length > 0) toast.warning(`U importuan ${response.imported.length}; ${response.errors.length} kërkojnë kontroll.`);
      else toast.success(`U importuan ${response.imported.length} fatura. Dublikatat: ${response.skipped.length}.`);
      onImported();
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Importi dështoi.");
    }
  };

  return <>
    {showTrigger && <Button variant="outline" onClick={() => onOpenChange(true)}><FileSpreadsheet className="mr-2 h-4 w-4" />Importo Excel Shitje</Button>}
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importo shitjet nga Excel</DialogTitle>
          <DialogDescription>FATURAT 2026 trajtohet si blerje nga fermerët. Ky import merr vetëm shitjet vendase dhe eksportin, i grupon sipas numrit të faturës dhe i lidh me magazinën e daljes.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-[#714b67]/40 bg-[#faf7fa] p-4">
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="block h-10 w-full max-w-xl rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" onChange={event => { const file = event.target.files?.[0]; if (file) void readFile(file); }} />
            <Button type="button" onClick={() => inputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Zgjidh workbook</Button>
            <span className="text-sm text-slate-600">{fileName || "Nuk është zgjedhur skedar."}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2"><p className="text-sm font-medium">Magazina e daljes</p><Select value={warehouseId} onValueChange={setWarehouseId}><SelectTrigger><SelectValue placeholder="Zgjidh magazinën" /></SelectTrigger><SelectContent>{warehouses.map(warehouse => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-end gap-2 text-sm text-slate-600"><WarehouseIcon className="mb-2 h-4 w-4" /><span>{selectedWarehouse ? `Daljet do të lidhen me ${selectedWarehouse.name}.` : "Magazina kërkohet për importin."}</span></div>
          </div>
          {result && <div className="space-y-3 rounded-lg border bg-white p-4">
            <div className="flex flex-wrap gap-2"><Badge variant="secondary">{result.invoices.length} fatura shitjeje</Badge><Badge variant="secondary">{result.invoices.reduce((sum, invoice) => sum + invoice.items.length, 0)} rreshta artikujsh</Badge>{result.skippedPurchaseRows > 0 && <Badge variant="outline">{result.skippedPurchaseRows} rreshta blerjesh të anashkaluara</Badge>}</div>
            {(missingProducts.length > 0 || unmatchedCustomers.length > 0) && <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><p className="font-semibold">Paralajmërime lidhjeje</p>{missingProducts.length > 0 && <p className="mt-1">Artikuj pa lidhje me master-data: {missingProducts.slice(0, 5).join(", ")}{missingProducts.length > 5 ? "…" : ""}</p>}{unmatchedCustomers.length > 0 && <p className="mt-1">Klientë pa lidhje me master-data: {unmatchedCustomers.slice(0, 5).join(", ")}{unmatchedCustomers.length > 5 ? "…" : ""}</p>}<p className="mt-1 text-xs">Dokumentet do të ruajnë emrin origjinal; lidhja me stokun bëhet kur kodi ose emri përputhet me master-data.</p></div>}
            {result.issues.length > 0 && <div className="max-h-32 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">{result.issues.slice(0, 12).map((issue, index) => <p key={`${issue.sourceSheet}-${issue.sourceRow ?? index}`} className={issue.severity === "error" ? "text-red-700" : "text-slate-600"}>{issue.severity === "error" ? "Gabim" : "Shënim"} · {issue.sourceSheet}{issue.sourceRow ? ` rreshti ${issue.sourceRow}` : ""}: {issue.message}</p>)}</div>}
            <div className="max-h-56 overflow-auto rounded-md border"><table className="w-full text-sm"><thead className="sticky top-0 bg-slate-100 text-left"><tr><th className="p-2">Nr. faturë</th><th className="p-2">Data</th><th className="p-2">Klienti</th><th className="p-2">Formati</th><th className="p-2 text-right">Rreshta</th><th className="p-2 text-right">Totali</th></tr></thead><tbody>{result.invoices.slice(0, 50).map(invoice => <tr key={`${invoice.sourceSheet}-${invoice.docNumber}-${invoice.date.toISOString()}`} className="border-t"><td className="p-2 font-medium">{invoice.docNumber}</td><td className="p-2">{invoice.date.toLocaleDateString("sq-AL")}</td><td className="p-2">{invoice.customerName || "—"}</td><td className="p-2">{invoice.invoiceFormat === "EXPORT" ? "Eksport · EUR" : "Vendase · ALL"}</td><td className="p-2 text-right">{invoice.items.length}</td><td className="p-2 text-right">{(invoice.totalAmount / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2 })} {invoice.currency}</td></tr>)}</tbody></table></div>
            {result.invoices.length > 50 && <p className="text-xs text-slate-500">Preview tregon 50 faturat e para; importi mbulon të gjitha faturat e vlefshme.</p>}
          </div>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button><Button onClick={() => void importInvoices()} disabled={!result || result.invoices.length === 0 || !selectedWarehouse || importBatch.isPending}>{importBatch.isPending ? "Duke importuar…" : "Importo faturat"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}

export { XLSX };
