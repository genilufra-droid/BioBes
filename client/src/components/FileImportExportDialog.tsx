import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Upload, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SalesWorkbookImportDialog from "@/components/SalesWorkbookImportDialog";
import { trpc } from "@/lib/trpc";
import { exportSalesRegisterToExcel, exportSalesRegisterToPDF } from "@/lib/export";
import type { SalesRegisterRow } from "@/pages/SalesInvoices";

export default function FileImportExportDialog({ companyId, open, onOpenChange, onGoToActions }: { companyId: number; open: boolean; onOpenChange: (open: boolean) => void; onGoToActions: () => void }) {
  const [salesImportOpen, setSalesImportOpen] = useState(false);
  const utils = trpc.useUtils();
  const { data: register = [], isLoading } = trpc.salesInvoice.register.useQuery({ companyId }, { enabled: open });
  const { data: warehouses = [] } = trpc.warehouse.list.useQuery({ companyId }, { enabled: open });
  const { data: products = [] } = trpc.product.list.useQuery({ companyId }, { enabled: open });
  const { data: customers = [] } = trpc.customer.list.useQuery({ companyId }, { enabled: open });
  const rows = register as SalesRegisterRow[];
  const exportExcel = () => { if (!rows.length) return toast.error("Nuk ka rreshta shitjeje për eksport."); void exportSalesRegisterToExcel(rows); };
  const exportPdf = () => { if (!rows.length) return toast.error("Nuk ka rreshta shitjeje për eksport."); exportSalesRegisterToPDF(rows); };
  const closeImport = (next: boolean) => { setSalesImportOpen(next); if (!next) void utils.salesInvoice.list.invalidate({ companyId }); };

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-sm border-[#8fa3b2] p-0">
        <DialogHeader className="border-b border-[#aebbc6] bg-[#dbe7ef] px-4 py-2"><DialogTitle className="text-sm font-bold text-[#294d65]">Import / Export</DialogTitle><DialogDescription className="text-xs text-[#536d7d]">Veprime reale të të dhënave për ndërmarrjen aktive.</DialogDescription></DialogHeader>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <section className="border border-[#b4c4cf] bg-[#f8fbfd] p-3"><div className="flex items-center gap-2 text-sm font-bold text-[#2d526b]"><UploadCloud className="h-4 w-4 text-[#2b78b5]" />Importo të dhëna</div><p className="mt-2 text-xs leading-5 text-[#5c7080]">Importo workbook-un real të faturave të shitjes. Leximi, preview, magazina e daljes dhe ruajtja idempotente kryhen në rrjedhën ekzistuese.</p><Button className="mt-3 h-8 rounded-sm bg-[#2b6892]" onClick={() => setSalesImportOpen(true)}><Upload className="mr-1.5 h-4 w-4" />Importo Excel Shitje</Button></section>
          <section className="border border-[#b4c4cf] bg-[#f8fbfd] p-3"><div className="flex items-center gap-2 text-sm font-bold text-[#2d526b]"><Download className="h-4 w-4 text-[#2b78b5]" />Eksporto të dhëna</div><p className="mt-2 text-xs leading-5 text-[#5c7080]">Shkarko regjistrin real të Shitjeve për ndërmarrjen aktive. Përfshihen rreshtat, monedha, kursi dhe lidhjet e dokumenteve.</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" className="h-8 rounded-sm" disabled={isLoading || !rows.length} onClick={exportExcel}><FileSpreadsheet className="mr-1.5 h-4 w-4" />Excel</Button><Button variant="outline" className="h-8 rounded-sm" disabled={isLoading || !rows.length} onClick={exportPdf}><FileText className="mr-1.5 h-4 w-4" />PDF</Button></div></section>
          <section className="md:col-span-2 border border-[#d7e0e7] bg-white px-3 py-2 text-xs text-[#536d7d]"><span className="font-semibold text-[#2d526b]">Audit dhe arkivë:</span> eksportet e veprimeve të sistemit dhe dokumentet e ngarkesave vazhdojnë te ambientet e tyre përkatëse. <button className="ml-1 font-semibold text-[#1e6392] underline" onClick={() => { onOpenChange(false); onGoToActions(); }}>Hap Veprimet</button></section>
        </div>
      </DialogContent>
    </Dialog>
    <SalesWorkbookImportDialog companyId={companyId} warehouses={warehouses} products={products} customers={customers} onImported={() => void utils.salesInvoice.register.invalidate({ companyId })} open={salesImportOpen} onOpenChange={closeImport} showTrigger={false} />
  </>;
}
