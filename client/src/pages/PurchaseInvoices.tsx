import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useSearch } from "wouter";
import { buildReferenceInvoicePrintHtml } from "@/lib/invoiceReference";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FilePlus2, FileText, PackageCheck, Plus, Printer, RotateCcw, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { exportPurchaseInvoiceDocumentToExcel, exportPurchaseInvoiceDocumentToPDF, exportPurchaseRegisterToExcel, exportPurchaseRegisterToPDF, printPurchaseInvoiceDocument } from "@/lib/export";
import ProductLiveSearch from "@/components/ProductLiveSearch";
import EntityLiveSearch from "@/components/EntityLiveSearch";
import { emptyPurchaseRegisterFilters, PurchaseRegisterFilterBar, type PurchaseRegisterFilters } from "@/components/PurchaseRegisterFilterBar";
import { PurchaseRegisterTotals } from "@/components/PurchaseRegisterTotals";
import { PurchaseSupplierSummary } from "@/components/PurchaseSupplierSummary";
import PurchaseOrdersWorkspace from "@/components/PurchaseOrdersWorkspace";
import SourceDocumentLink from "@/components/SourceDocumentLink";

type LineDraft = {
  productId?: number;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type PurchaseRegisterRow = {
  invoiceId: number;
  docNumber: string;
  date: Date | string;
  supplierId: number | null;
  supplierName: string | null;
  invoiceTotalAmount: number | null;
  currency: string | null;
  exchangeRate: number | string | null;
  vatAmount: number | null;
  carrierName: string | null;
  vehiclePlate: string | null;
  inventoryReference: string | null;
  status: string | null;
  paymentStatus: "UNPAID" | "PAID" | "LATER";
  itemId: number | null;
  productId: number | null;
  productName: string | null;
  quantity: number | null;
  unit: string | null;
  unitPrice: number | null;
  lineTotalAmount: number | null;
};



const blankLine = (): LineDraft => ({ productName: "", quantity: 1, unit: "copë", unitPrice: 0 });
const today = () => new Date().toISOString().slice(0, 10);

function money(cents: number | null | undefined) {
  return `${((cents ?? 0) / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
}

function currencyLabel(currency: string | null | undefined) {
  return !currency || currency === "ALL" ? "L" : currency;
}

function currencyMoney(cents: number | null | undefined, currency: string | null | undefined) {
  return `${((cents ?? 0) / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLabel(currency)}`;
}

function lekEquivalent(cents: number | null | undefined, rate: number | string | null | undefined) {
  return money(Math.round((cents ?? 0) * Number(rate || 1)));
}

function dateText(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("sq-AL") : "—";
}

function PurchaseStatus({ status }: { status: string | null | undefined }) {
  const labels: Record<string, { text: string; className: string }> = {
    DRAFT: { text: "Draft", className: "bg-slate-100 text-slate-700" },
    CONFIRMED: { text: "Konfirmuar", className: "bg-blue-100 text-blue-700" },
    RECEIVED: { text: "Pranuar", className: "bg-emerald-100 text-emerald-700" },
    VALIDATED: { text: "Validuar", className: "bg-emerald-100 text-emerald-700" },
    POSTED: { text: "Postuar", className: "bg-blue-100 text-blue-700" },
    PAID: { text: "Paguar", className: "bg-emerald-100 text-emerald-700" },
    CANCELLED: { text: "Anuluar", className: "bg-red-100 text-red-700" },
  };
  const item = labels[status ?? "DRAFT"] ?? labels.DRAFT;
  return <Badge className={`border-0 font-medium ${item.className}`}>{item.text}</Badge>;
}

function LineEditor({
  companyId,
  lines,
  products,
  showPrices,
  onChange,
  onRemove,
  onAdd,
}: {
  companyId: number;
  lines: LineDraft[];
  products: Array<{ id: number; name: string; baseUnit: string | null; lastPrice: number | null }>;
  showPrices: boolean;
  onChange: (index: number, patch: Partial<LineDraft>) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-0 border border-[#9caeba] bg-[#edf2f5] p-0">
      {lines.map((line, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 border-b border-[#c6d2d8] bg-white p-3 last:border-0">
          <div className={showPrices ? "col-span-12 md:col-span-4" : "col-span-12 md:col-span-5"}>
            <Label className="text-xs">Artikulli</Label>
            <div className="mt-1"><ProductLiveSearch companyId={companyId} products={products} value={line} onSelect={patch => onChange(index, patch)} /></div>
          </div>
          <div className="col-span-4 md:col-span-2">
            <Label className="text-xs">Sasia</Label>
            <Input className="mt-1" min="1" type="number" value={line.quantity} onChange={event => onChange(index, { quantity: Math.max(1, Number(event.target.value) || 1) })} />
          </div>
          <div className="col-span-4 md:col-span-2">
            <Label className="text-xs">Njësia</Label>
            <Input className="mt-1" value={line.unit} onChange={event => onChange(index, { unit: event.target.value })} />
          </div>
          {showPrices && (
            <div className="col-span-4 md:col-span-3">
              <Label className="text-xs">Çmimi (qindarka)</Label>
              <Input className="mt-1" min="0" type="number" value={line.unitPrice} onChange={event => onChange(index, { unitPrice: Math.max(0, Number(event.target.value) || 0) })} />
            </div>
          )}
          <div className="col-span-12 flex items-end justify-between md:col-span-1 md:justify-end">
            {showPrices && <span className="text-xs font-semibold text-slate-600 md:hidden">{money(line.quantity * line.unitPrice)}</span>}
            <Button type="button" size="icon" variant="ghost" disabled={lines.length === 1} onClick={() => onRemove(index)} aria-label="Hiq rreshtin">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" className="m-3 w-[calc(100%-1.5rem)] rounded-none border-dashed border-[#7892a3] bg-[#f8fbfc] text-[#234b67]" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" /> Shto artikull
      </Button>
    </div>
  );
}

export default function PurchaseInvoices({ companyId }: { companyId: number }) {
  const locationSearch = useSearch();
  const [, setLocation] = useLocation();
  const requestedTab = new URLSearchParams(locationSearch).get("tab");
  const initialTab = ["bills", "orders", "receipts", "returns", "report"].includes(requestedTab || "") ? requestedTab! : "bills";
  const [activeTab, setActiveTab] = useState(initialTab);
  const requestedReceiptOrderId = Number(new URLSearchParams(locationSearch).get("orderId"));
  const requestedReceiptId = Number(new URLSearchParams(locationSearch).get("openReceipt"));
  const requestedReturnId = Number(new URLSearchParams(locationSearch).get("openReturn"));
  const utils = trpc.useUtils();
  const [billOpen, setBillOpen] = useState(() => new URLSearchParams(locationSearch).get("newInvoice") === "1");
  const [orderOpen, setOrderOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [receiptOrderId, setReceiptOrderId] = useState<number | undefined>();
  const [billLines, setBillLines] = useState<LineDraft[]>([blankLine()]);
  const [orderLines, setOrderLines] = useState<LineDraft[]>([blankLine()]);
  const [receiptLines, setReceiptLines] = useState<LineDraft[]>([blankLine()]);
  const [returnLines, setReturnLines] = useState<LineDraft[]>([blankLine()]);
  const [registerSearch, setRegisterSearch] = useState("");
  const [registerStatus, setRegisterStatus] = useState("ALL");
  const [registerFilters, setRegisterFilters] = useState<PurchaseRegisterFilters>(() => ({ ...emptyPurchaseRegisterFilters }));
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | undefined>();
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | undefined>();
  const [selectedReturnId, setSelectedReturnId] = useState<number | undefined>();
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => {
    if (new URLSearchParams(locationSearch).get("newInvoice") === "1") {
      setActiveTab("bills");
      setBillOpen(true);
    }
  }, [locationSearch]);
  useEffect(() => { const id = Number(new URLSearchParams(locationSearch).get("openInvoice")); if (Number.isInteger(id) && id > 0) setSelectedInvoiceId(id); }, [locationSearch]);
  useEffect(() => { if (initialTab === "receipts" && Number.isInteger(requestedReceiptOrderId) && requestedReceiptOrderId > 0) { setReceiptOrderId(requestedReceiptOrderId); setReceiptOpen(true); } }, [initialTab, requestedReceiptOrderId]);
  useEffect(() => { setSelectedReceiptId(Number.isInteger(requestedReceiptId) && requestedReceiptId > 0 ? requestedReceiptId : undefined); setSelectedReturnId(Number.isInteger(requestedReturnId) && requestedReturnId > 0 ? requestedReturnId : undefined); }, [requestedReceiptId, requestedReturnId]);

  const { data: invoices = [] } = trpc.purchaseInvoice.list.useQuery({ companyId });
  const { data: purchaseRegister = [] } = trpc.purchaseInvoice.register.useQuery({ companyId });
  const { data: orders = [] } = trpc.purchaseOrder.list.useQuery({ companyId });
  const { data: receipts = [] } = trpc.purchaseReceipt.list.useQuery({ companyId });
  const { data: returns = [] } = trpc.purchaseReturn.list.useQuery({ companyId });
  const { data: suppliers = [] } = trpc.supplier.list.useQuery({ companyId });
  const { data: products = [] } = trpc.product.list.useQuery({ companyId });
  const { data: warehouses = [] } = trpc.warehouse.list.useQuery({ companyId });
  const selectedReceipt = receipts.find(receipt => receipt.id === selectedReceiptId);
  const selectedReturn = returns.find(item => item.id === selectedReturnId);
  const { data: selectedReceiptOrder } = trpc.purchaseOrder.get.useQuery(
    { id: receiptOrderId ?? 1 },
    { enabled: Boolean(receiptOrderId) },
  );

  useEffect(() => {
    if (selectedReceiptOrder?.items) {
      setReceiptLines(selectedReceiptOrder.items.map(item => ({
        productId: item.productId ?? undefined,
        productName: item.productName,
        quantity: Math.max(1, item.quantity - item.receivedQuantity),
        unit: item.unit || "copë",
        unitPrice: item.unitPrice,
      })));
    }
  }, [selectedReceiptOrder]);

  const createBill = trpc.purchaseInvoice.create.useMutation({
    onSuccess: async () => { await Promise.all([utils.purchaseInvoice.list.invalidate({ companyId }), utils.purchaseInvoice.register.invalidate({ companyId })]); setBillOpen(false); setBillLines([blankLine()]); toast.success("Fatura e blerjes u krijua dhe u shtua në regjistër."); },
    onError: error => toast.error(error.message),
  });
  const createOrder = trpc.purchaseOrder.create.useMutation({
    onSuccess: async () => { await utils.purchaseOrder.list.invalidate({ companyId }); setOrderOpen(false); setOrderLines([blankLine()]); toast.success("Porosia e blerjes u krijua."); },
    onError: error => toast.error(error.message),
  });
  const setOrderStatus = trpc.purchaseOrder.setStatus.useMutation({
    onSuccess: async () => { await utils.purchaseOrder.list.invalidate({ companyId }); toast.success("Statusi i porosisë u përditësua."); },
    onError: error => toast.error(error.message),
  });
  const createReceipt = trpc.purchaseReceipt.create.useMutation({
    onSuccess: async () => { await utils.purchaseReceipt.list.invalidate({ companyId }); setReceiptOpen(false); setReceiptLines([blankLine()]); toast.success("Pranimi u ruajt si draft."); },
    onError: error => toast.error(error.message),
  });
  const validateReceipt = trpc.purchaseReceipt.validate.useMutation({
    onSuccess: async () => { await Promise.all([utils.purchaseReceipt.list.invalidate({ companyId }), utils.product.list.invalidate({ companyId }), utils.purchaseOrder.list.invalidate({ companyId })]); toast.success("Pranimi u validua dhe stoku u përditësua."); },
    onError: error => toast.error(error.message),
  });
  const createReturn = trpc.purchaseReturn.create.useMutation({
    onSuccess: async () => { await utils.purchaseReturn.list.invalidate({ companyId }); setReturnOpen(false); setReturnLines([blankLine()]); toast.success("Kthimi u ruajt si draft."); },
    onError: error => toast.error(error.message),
  });
  const validateReturn = trpc.purchaseReturn.validate.useMutation({
    onSuccess: async () => { await Promise.all([utils.purchaseReturn.list.invalidate({ companyId }), utils.product.list.invalidate({ companyId })]); toast.success("Kthimi u validua dhe stoku u përditësua."); },
    onError: error => toast.error(error.message),
  });

  const productOptions = useMemo(() => products.map(product => ({ id: product.id, name: product.name, baseUnit: product.baseUnit, lastPrice: product.lastPrice })), [products]);
  const billTotal = billLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const orderTotal = orderLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const activeOrders = orders.filter(order => order.status === "CONFIRMED").length;
  const pendingReceipts = receipts.filter(receipt => receipt.status === "DRAFT").length;
  const visibleRegisterRows = useMemo(() => {
    const term = registerSearch.trim().toLocaleLowerCase("sq-AL");
    return (purchaseRegister as PurchaseRegisterRow[]).filter(row => {
      const paymentStatus = row.status === "PAID" ? "PAID" : row.paymentStatus ?? "UNPAID";
      const matchesStatus = registerStatus === "ALL" || paymentStatus === registerStatus;
      const matchesTerm = !term || [row.docNumber, row.supplierName, row.productName, row.productId?.toString()].some(value => value?.toLocaleLowerCase("sq-AL").includes(term));
      const rowDate = new Date(row.date).getTime();
      const matchesDateFrom = !registerFilters.dateFrom || rowDate >= new Date(`${registerFilters.dateFrom}T00:00:00`).getTime();
      const matchesDateTo = !registerFilters.dateTo || rowDate <= new Date(`${registerFilters.dateTo}T23:59:59`).getTime();
      const textMatch = (value: unknown, filter: string) => !filter || String(value ?? "").toLocaleLowerCase("sq-AL").includes(filter.toLocaleLowerCase("sq-AL"));
      const numberMatch = (value: number | null | undefined, filter: string) => !filter || String(value ?? "").includes(filter);
      const invoiceRowCount = (purchaseRegister as PurchaseRegisterRow[]).filter(candidate => candidate.invoiceId === row.invoiceId).length || 1;
      const netValue = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0;
      const vatValue = Math.round((row.vatAmount ?? 0) / invoiceRowCount);
      const grossValue = netValue + vatValue;
      return matchesStatus && matchesTerm && matchesDateFrom && matchesDateTo
        && textMatch(row.docNumber, registerFilters.docNumber) && textMatch(paymentStatus, registerFilters.status)
        && textMatch(row.supplierId, registerFilters.supplierId) && textMatch(row.supplierName, registerFilters.supplier)
        && textMatch(row.productId, registerFilters.productId) && textMatch(row.productName, registerFilters.product)
        && numberMatch(row.quantity, registerFilters.quantity) && numberMatch(row.unitPrice, registerFilters.unitPrice)
        && numberMatch(netValue, registerFilters.netValue) && numberMatch(vatValue, registerFilters.vat)
        && numberMatch(grossValue, registerFilters.grossValue) && textMatch(row.carrierName, registerFilters.carrier)
        && textMatch(row.vehiclePlate, registerFilters.plate) && textMatch(row.inventoryReference, registerFilters.inventoryReference);
    });
  }, [purchaseRegister, registerSearch, registerStatus, registerFilters]);

  const mutateLine = (setter: React.Dispatch<React.SetStateAction<LineDraft[]>>, index: number, patch: Partial<LineDraft>) => {
    setter(lines => lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line));
  };
  const removeLine = (setter: React.Dispatch<React.SetStateAction<LineDraft[]>>, index: number) => setter(lines => lines.filter((_, lineIndex) => lineIndex !== index));

  const submitBill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const normalizedItems = billLines.map(line => ({
      ...line,
      productId: line.productId ?? products.find(product => product.name.trim().toLocaleLowerCase("sq-AL") === line.productName.trim().toLocaleLowerCase("sq-AL"))?.id,
    }));
    if (normalizedItems.some(line => !line.productName.trim() || !line.productId)) return toast.error("Zgjidhni artikullin nga lista në çdo rresht.");
    createBill.mutate({
      companyId,
      docNumber: String(form.get("docNumber") || "").trim(),
      date: new Date(String(form.get("date") || today())),
      supplierId: form.get("supplierId") ? Number(form.get("supplierId")) : undefined,
      supplierName: String(form.get("supplierName") || "").trim() || undefined,
      warehouseId: form.get("warehouseId") ? Number(form.get("warehouseId")) : undefined,
      currency: String(form.get("currency") || "ALL"),
      exchangeRate: Number(form.get("exchangeRate") || 1),
      vatAmount: Math.max(0, Number(form.get("vatAmount")) || 0),
      carrierName: String(form.get("carrierName") || "").trim() || undefined,
      vehiclePlate: String(form.get("vehiclePlate") || "").trim().toUpperCase() || undefined,
      inventoryReference: String(form.get("inventoryReference") || "").trim() || undefined,
      items: normalizedItems.map(line => ({ ...line, productName: line.productName.trim() })),
    });
  };

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (orderLines.some(line => !line.productName.trim())) return toast.error("Plotësoni artikullin në çdo rresht.");
    createOrder.mutate({
      companyId,
      docNumber: String(form.get("docNumber") || "").trim(),
      orderDate: new Date(String(form.get("orderDate") || today())),
      expectedDate: form.get("expectedDate") ? new Date(String(form.get("expectedDate"))) : undefined,
      supplierId: form.get("supplierId") ? Number(form.get("supplierId")) : undefined,
      supplierName: String(form.get("supplierName") || "").trim() || undefined,
      notes: String(form.get("notes") || "").trim() || undefined,
      items: orderLines.map(line => ({ ...line, productName: line.productName.trim() })),
    });
  };

  const submitReceipt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (receiptLines.some(line => !line.productName.trim())) return toast.error("Plotësoni artikullin në çdo rresht.");
    createReceipt.mutate({
      companyId,
      docNumber: String(form.get("docNumber") || "").trim(),
      receiptDate: new Date(String(form.get("receiptDate") || today())),
      purchaseOrderId: receiptOrderId,
      supplierId: form.get("supplierId") ? Number(form.get("supplierId")) : undefined,
      supplierName: String(form.get("supplierName") || "").trim() || undefined,
      warehouseId: form.get("warehouseId") ? Number(form.get("warehouseId")) : undefined,
      notes: String(form.get("notes") || "").trim() || undefined,
      items: receiptLines.map(({ unitPrice: _price, ...line }) => ({ ...line, productName: line.productName.trim() })),
    });
  };

  const submitReturn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (returnLines.some(line => !line.productName.trim())) return toast.error("Plotësoni artikullin në çdo rresht.");
    createReturn.mutate({
      companyId,
      docNumber: String(form.get("docNumber") || "").trim(),
      returnDate: new Date(String(form.get("returnDate") || today())),
      supplierId: form.get("supplierId") ? Number(form.get("supplierId")) : undefined,
      supplierName: String(form.get("supplierName") || "").trim() || undefined,
      purchaseReceiptId: form.get("purchaseReceiptId") ? Number(form.get("purchaseReceiptId")) : undefined,
      reason: String(form.get("reason") || "").trim() || undefined,
      items: returnLines.map(({ unitPrice: _price, ...line }) => ({ ...line, productName: line.productName.trim() })),
    });
  };

  return (
    <div data-alpha-purchase-workspace className="space-y-3 bg-[#dfe7ec] p-2">
      <section className="overflow-hidden border border-[#7892a3] bg-white">
        <div>
          <div className="px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#536b79]">Alpha Business / Furnitorë dhe Blerje</p><h1 className="mt-0.5 text-base font-bold text-[#234b67]">Faturat e blerjes</h1></div>
        </div>
        <div className="flex flex-wrap divide-x divide-[#9eafb9] border-t border-[#7892a3] bg-gradient-to-b from-[#eef6fa] to-[#b9cfdb] text-[11px] text-[#234b67] lg:border-l lg:border-t-0">
          <span className="px-3 py-1">Porosi aktive: <strong>{activeOrders}</strong></span><span className="px-3 py-1">Pranime draft: <strong>{pendingReceipts}</strong></span><span className="px-3 py-1">Fatura: <strong>{invoices.length}</strong></span>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-0 rounded-none border border-[#7892a3] bg-[#edf2f5] p-0 md:grid-cols-4">
          <TabsTrigger value="bills" className="rounded-none border-r border-[#7892a3] data-[state=active]:bg-[#3f7191] data-[state=active]:text-white"><FileText className="mr-2 h-4 w-4" />Faturat</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-none border-r border-[#7892a3] data-[state=active]:bg-[#3f7191] data-[state=active]:text-white"><ShoppingCart className="mr-2 h-4 w-4" />Porositë</TabsTrigger>
          <TabsTrigger value="receipts" className="rounded-none border-r border-[#7892a3] data-[state=active]:bg-[#3f7191] data-[state=active]:text-white"><PackageCheck className="mr-2 h-4 w-4" />Pranimet</TabsTrigger>
          <TabsTrigger value="returns" className="rounded-none data-[state=active]:bg-[#3f7191] data-[state=active]:text-white"><RotateCcw className="mr-2 h-4 w-4" />Kthimet</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => void exportPurchaseRegisterToExcel(visibleRegisterRows)}><Download className="mr-2 h-4 w-4" />Excel</Button>
            <Button variant="outline" onClick={() => exportPurchaseRegisterToPDF(visibleRegisterRows)}><Download className="mr-2 h-4 w-4" />PDF</Button>
            <Dialog open={billOpen} onOpenChange={setBillOpen}>
            <DialogTrigger asChild><Button className="rounded-none border border-[#285a7a] bg-[#3f7191] text-white hover:bg-[#285a7a]"><FilePlus2 className="mr-2 h-4 w-4" />Faturë e re</Button></DialogTrigger>
              <DialogContent className="!left-0 !top-0 !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 bg-[#f8f8f8] p-0">
                <form className="flex h-full flex-col" onSubmit={submitBill}>
                  <header className="flex min-h-[52px] shrink-0 items-center border-b border-[#7892a3] bg-gradient-to-b from-[#eef6fa] to-[#b9cfdb] px-4 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#536b79]">Alpha Business / Blerje / Fatura furnitori</p><DialogTitle className="mt-0.5 text-base font-bold text-[#234b67]">Faturë e re e blerjes</DialogTitle></div><div className="ml-auto flex items-center gap-2"><Button type="button" size="sm" variant="outline" className="h-7 rounded-none border-[#7892a3] bg-[#f8fbfc] text-xs text-[#234b67]" onClick={() => setBillOpen(false)}>Anulo</Button><Button size="sm" className="h-7 rounded-none border border-[#285a7a] bg-[#3f7191] text-xs text-white hover:bg-[#285a7a]" disabled={createBill.isPending}>{createBill.isPending ? "Po ruhet…" : "Ruaj faturën"}</Button></div></header>
                  <div className="flex shrink-0 justify-end border-b border-[#7892a3] bg-[#edf2f5] px-4 sm:px-6"><span className="border-l border-r border-t border-[#7892a3] bg-white px-5 py-2 text-xs font-semibold text-[#234b67]">DRAFT</span><span className="border-r border-[#b6c5cc] px-5 py-2 text-xs font-medium text-[#536b79]">POSTED</span><span className="border-r border-[#b6c5cc] px-5 py-2 text-xs font-medium text-[#536b79]">PAID</span></div>
                  <ScrollArea className="min-h-0 flex-1"><div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6"><section className="rounded-md border border-[#ddd8dd] bg-white p-5"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]"><div><h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#343434]">Faturë furnitori</h2><div className="mt-5 max-w-xl"><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Furnitori</Label><div className="mt-1"><EntityLiveSearch idName="supplierId" nameName="supplierName" items={suppliers} placeholder="Kërko ose shkruaj furnitorin..." /></div></div></div><div className="grid content-start gap-4"><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Numri i faturës</Label><Input name="docNumber" required className="mt-1 h-10" placeholder="BL-0001" /></div><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Data e faturës</Label><Input name="date" required type="date" defaultValue={today()} className="mt-1 h-10" /></div></div></div></section>
                    <section className="overflow-visible rounded-md border border-[#ddd8dd] bg-white"><div className="flex items-center justify-between border-b border-[#e9e5e9] px-5 py-3"><div><h2 className="text-sm font-semibold text-[#343434]">Rreshtat e faturës</h2><p className="mt-0.5 text-xs text-[#777]">Kërko artikullin direkt në rresht ose krijoje nëse nuk ekziston.</p></div><span className="text-xs font-medium text-[#714b67]">{billLines.length} rreshta</span></div><div className="p-4"><LineEditor companyId={companyId} lines={billLines} products={productOptions} showPrices onChange={(index, patch) => mutateLine(setBillLines, index, patch)} onRemove={index => removeLine(setBillLines, index)} onAdd={() => setBillLines(lines => [...lines, blankLine()])} /></div><div className="flex justify-end border-t border-[#e9e5e9] bg-[#fbfafb] px-5 py-4"><div className="min-w-72 space-y-2 text-sm"><div className="flex justify-between text-[#777]"><span>Pa taksa</span><span>{money(billTotal)}</span></div><div className="flex justify-between border-t border-[#ddd8dd] pt-3 text-lg font-semibold text-[#343434]"><span>Totali</span><span>{money(billTotal)}</span></div></div></div></section>
                    <section className="rounded-md border border-[#ddd8dd] bg-white"><div className="border-b border-[#e9e5e9] px-5 py-3 text-sm font-semibold">Magazina, TVSH, transport dhe inventar</div><div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-7"><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Magazina</Label><select name="warehouseId" className="mt-1 h-10 w-full rounded-md border border-[#d3ccd3] bg-white px-3 text-sm"><option value="">Zgjidh magazinën</option>{warehouses.map(warehouse => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}{warehouse.code ? ` · ${warehouse.code}` : ""}</option>)}</select></div><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Monedha</Label><select name="currency" defaultValue="ALL" className="mt-1 h-10 w-full rounded-md border border-[#d3ccd3] bg-white px-3 text-sm"><option value="ALL">Lek (ALL)</option><option value="EUR">Euro (EUR)</option><option value="USD">Dollar (USD)</option><option value="GBP">Pound (GBP)</option></select></div><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Kursi i këmbimit</Label><Input name="exchangeRate" min="0.000001" step="0.000001" type="number" defaultValue="1" required className="mt-1 h-10" /><span className="text-[10px] text-[#777]">ALL për 1 njësi</span></div><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">TVSH (qindarka)</Label><Input name="vatAmount" min="0" type="number" defaultValue="0" className="mt-1 h-10" /></div><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Transportuesi</Label><Input name="carrierName" className="mt-1 h-10" placeholder="Emri i transportuesit" /></div><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Targa</Label><Input name="vehiclePlate" className="mt-1 h-10" placeholder="AA 000 AA" /></div><div><Label className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Referenca e inventarit</Label><Input name="inventoryReference" className="mt-1 h-10" placeholder="INV-0001" /></div></div><div className="border-t border-[#e9e5e9] px-5 py-3 text-sm text-[#777]">Fatura ruhet fillimisht si draft. Mund të postohen dhe pajtohen pagesat nga moduli Kontabilitet.</div></section></div></ScrollArea>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div data-alpha-purchase-register className="space-y-3">
            <PurchaseRegisterFilterBar filters={registerFilters} onChange={setRegisterFilters} />
            <PurchaseSupplierSummary rows={visibleRegisterRows} supplierQuery={registerFilters.supplier} />
            <PurchaseInvoiceRegisterCompact companyId={companyId} rows={visibleRegisterRows} search={registerSearch} status={registerStatus} onSearchChange={setRegisterSearch} onStatusChange={setRegisterStatus} onOpenInvoice={setSelectedInvoiceId} />
            <PurchaseRegisterTotals rows={visibleRegisterRows} />
          </div>
        </TabsContent>

        <TabsContent value="orders"><PurchaseOrdersWorkspace companyId={companyId} /></TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <div className="flex justify-end"><Dialog open={receiptOpen} onOpenChange={setReceiptOpen}><DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Pranim i ri</Button></DialogTrigger><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Regjistro pranim mallrash</DialogTitle></DialogHeader><ScrollArea className="max-h-[72vh] pr-4"><form className="space-y-4" onSubmit={submitReceipt}><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><Label>Nr. pranimi</Label><Input name="docNumber" required placeholder="PR-0001" /></div><div><Label>Data</Label><Input name="receiptDate" required type="date" defaultValue={today()} /></div></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><Label>Porosi e lidhur</Label><select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={receiptOrderId?.toString() ?? ""} onChange={event => setReceiptOrderId(event.target.value ? Number(event.target.value) : undefined)}><option value="">Pa porosi</option>{orders.filter(order => order.status === "CONFIRMED").map(order => <option key={order.id} value={order.id}>{order.docNumber} — {order.supplierName || "Furnitor"}</option>)}</select></div><div><Label>Magazina</Label><select name="warehouseId" className="mt-1 h-10 w-full rounded-md border px-3 text-sm"><option value="">Magazinë e përgjithshme</option>{warehouses.map(warehouse => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></div></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><Label>Furnitori</Label><select name="supplierId" className="mt-1 h-10 w-full rounded-md border px-3 text-sm" defaultValue={selectedReceiptOrder?.supplierId?.toString() ?? ""}><option value="">Zgjidh furnitorin</option>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div><div><Label>Ose emri i furnitorit</Label><Input name="supplierName" defaultValue={selectedReceiptOrder?.supplierName ?? ""} /></div></div><div><Label>Shënime</Label><Input name="notes" /></div><LineEditor companyId={companyId} lines={receiptLines} products={productOptions} showPrices={false} onChange={(index, patch) => mutateLine(setReceiptLines, index, patch)} onRemove={index => removeLine(setReceiptLines, index)} onAdd={() => setReceiptLines(lines => [...lines, blankLine()])} /><Button className="w-full" disabled={createReceipt.isPending}>{createReceipt.isPending ? "Po ruhet…" : "Ruaj si draft"}</Button></form></ScrollArea></DialogContent></Dialog></div>
          <DataCard title={`Pranimet e mallrave (${receipts.length})`}><table className="w-full min-w-[680px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="p-3">Nr.</th><th className="p-3">Furnitori</th><th className="p-3">Data</th><th className="p-3">Statusi</th><th className="p-3 text-right">Veprime</th></tr></thead><tbody>{receipts.length === 0 ? <EmptyRow columns={5} message="Nuk ka pranime të regjistruara." /> : receipts.map(receipt => <tr key={receipt.id} className="border-b last:border-0 hover:bg-slate-50"><td className="p-3 font-medium"><SourceDocumentLink label={receipt.docNumber} onOpen={() => setSelectedReceiptId(receipt.id)} ariaLabel={`Hap pranimin ${receipt.docNumber}`} /></td><td className="p-3">{receipt.supplierName || "—"}</td><td className="p-3">{dateText(receipt.receiptDate)}</td><td className="p-3"><PurchaseStatus status={receipt.status} /></td><td className="p-3 text-right">{receipt.status === "DRAFT" && <Button size="sm" disabled={validateReceipt.isPending} onClick={() => validateReceipt.mutate({ id: receipt.id })}>Valido dhe shto stokun</Button>}</td></tr>)}</tbody></table></DataCard>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <div className="flex justify-end"><Dialog open={returnOpen} onOpenChange={setReturnOpen}><DialogTrigger asChild><Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" />Kthim i ri</Button></DialogTrigger><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Regjistro kthim te furnitori</DialogTitle></DialogHeader><ScrollArea className="max-h-[72vh] pr-4"><form className="space-y-4" onSubmit={submitReturn}><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><Label>Nr. kthimi</Label><Input name="docNumber" required placeholder="KB-0001" /></div><div><Label>Data</Label><Input name="returnDate" required type="date" defaultValue={today()} /></div></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><Label>Furnitori</Label><select name="supplierId" className="mt-1 h-10 w-full rounded-md border px-3 text-sm"><option value="">Zgjidh furnitorin</option>{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div><div><Label>Pranimi origjinal</Label><select name="purchaseReceiptId" className="mt-1 h-10 w-full rounded-md border px-3 text-sm"><option value="">Pa dokument burimor</option>{receipts.filter(receipt => receipt.status === "VALIDATED").map(receipt => <option key={receipt.id} value={receipt.id}>{receipt.docNumber}</option>)}</select></div></div><div><Label>Ose emri i furnitorit</Label><Input name="supplierName" /></div><div><Label>Arsyeja e kthimit</Label><Input name="reason" placeholder="Mall i dëmtuar, gabim sasie…" /></div><LineEditor companyId={companyId} lines={returnLines} products={productOptions} showPrices={false} onChange={(index, patch) => mutateLine(setReturnLines, index, patch)} onRemove={index => removeLine(setReturnLines, index)} onAdd={() => setReturnLines(lines => [...lines, blankLine()])} /><Button className="w-full" disabled={createReturn.isPending}>{createReturn.isPending ? "Po ruhet…" : "Ruaj si draft"}</Button></form></ScrollArea></DialogContent></Dialog></div>
          <DataCard title={`Kthimet e blerjes (${returns.length})`}><table className="w-full min-w-[680px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="p-3">Nr.</th><th className="p-3">Furnitori</th><th className="p-3">Data</th><th className="p-3">Arsyeja</th><th className="p-3">Statusi</th><th className="p-3 text-right">Veprime</th></tr></thead><tbody>{returns.length === 0 ? <EmptyRow columns={6} message="Nuk ka kthime të regjistruara." /> : returns.map(item => <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50"><td className="p-3 font-medium"><SourceDocumentLink label={item.docNumber} onOpen={() => setSelectedReturnId(item.id)} ariaLabel={`Hap kthimin ${item.docNumber}`} /></td><td className="p-3">{item.supplierName || "—"}</td><td className="p-3">{dateText(item.returnDate)}</td><td className="p-3">{item.reason || "—"}</td><td className="p-3"><PurchaseStatus status={item.status} /></td><td className="p-3 text-right">{item.status === "DRAFT" && <Button size="sm" variant="outline" disabled={validateReturn.isPending} onClick={() => validateReturn.mutate({ id: item.id })}>Valido dhe zbrit stokun</Button>}</td></tr>)}</tbody></table></DataCard>
        </TabsContent>

      </Tabs>
      <PurchaseInvoiceDetailDialog companyId={companyId} invoiceId={selectedInvoiceId} onOpenChange={open => { if (!open) setSelectedInvoiceId(undefined); }} />
      {selectedReceipt && <PurchaseReceiptDetailDialog receipt={selectedReceipt} onOpenChange={open => { if (!open) setSelectedReceiptId(undefined); }} />}
      {selectedReturn && <PurchaseReturnDetailDialog item={selectedReturn} onOpenChange={open => { if (!open) setSelectedReturnId(undefined); }} />}
    </div>
  );
}

function PurchaseReceiptDetailDialog({ receipt, onOpenChange }: { receipt: { id: number; docNumber: string; receiptDate: Date | string; supplierName: string | null; warehouseId: number | null; purchaseOrderId: number | null; status: string; notes: string | null }; onOpenChange: (open: boolean) => void }) {
  return <Dialog open onOpenChange={onOpenChange}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Pranim mallrash — {receipt.docNumber}</DialogTitle></DialogHeader><div className="grid gap-3 text-sm md:grid-cols-2"><div><span className="text-slate-500">Data</span><p className="font-medium">{dateText(receipt.receiptDate)}</p></div><div><span className="text-slate-500">Statusi</span><p><PurchaseStatus status={receipt.status} /></p></div><div><span className="text-slate-500">Furnitori</span><p className="font-medium">{receipt.supplierName || "—"}</p></div><div><span className="text-slate-500">Magazina</span><p className="font-medium">{receipt.warehouseId || "Magazinë e përgjithshme"}</p></div><div className="md:col-span-2"><span className="text-slate-500">Porosia e lidhur</span><p className="font-medium">{receipt.purchaseOrderId || "—"}</p></div><div className="md:col-span-2"><span className="text-slate-500">Shënime</span><p className="font-medium">{receipt.notes || "—"}</p></div></div><div className="flex justify-end"><Button type="button" onClick={() => onOpenChange(false)}>Mbyll</Button></div></DialogContent></Dialog>;
}

function PurchaseReturnDetailDialog({ item, onOpenChange }: { item: { id: number; docNumber: string; returnDate: Date | string; supplierName: string | null; purchaseReceiptId: number | null; status: string; reason: string | null }; onOpenChange: (open: boolean) => void }) {
  return <Dialog open onOpenChange={onOpenChange}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Kthim te furnitori — {item.docNumber}</DialogTitle></DialogHeader><div className="grid gap-3 text-sm md:grid-cols-2"><div><span className="text-slate-500">Data</span><p className="font-medium">{dateText(item.returnDate)}</p></div><div><span className="text-slate-500">Statusi</span><p><PurchaseStatus status={item.status} /></p></div><div><span className="text-slate-500">Furnitori</span><p className="font-medium">{item.supplierName || "—"}</p></div><div><span className="text-slate-500">Pranimi burimor</span><p className="font-medium">{item.purchaseReceiptId || "—"}</p></div><div className="md:col-span-2"><span className="text-slate-500">Arsyeja</span><p className="font-medium">{item.reason || "—"}</p></div></div><div className="flex justify-end"><Button type="button" onClick={() => onOpenChange(false)}>Mbyll</Button></div></DialogContent></Dialog>;
}

function DataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="overflow-hidden border-slate-200 shadow-sm"><CardHeader className="border-b bg-slate-50/70 py-4"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto">{children}</div></CardContent></Card>;
}

function PurchaseRegisterActionDialog({ companyId, row, onOpenInvoice }: { companyId: number; row: PurchaseRegisterRow; onOpenInvoice: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const refresh = async () => { await Promise.all([utils.purchaseInvoice.list.invalidate({ companyId }), utils.purchaseInvoice.register.invalidate({ companyId })]); };
  const pay = trpc.purchaseInvoice.pay.useMutation({ onSuccess: async () => { await refresh(); setOpen(false); toast.success("Pagesa u postua."); }, onError: error => toast.error(error.message) });
  const cancel = trpc.purchaseInvoice.cancel.useMutation({ onSuccess: async () => { await refresh(); setOpen(false); toast.success("Fatura u anulua."); }, onError: error => toast.error(error.message) });
  const remove = trpc.purchaseInvoice.deleteDraft.useMutation({ onSuccess: async () => { await refresh(); setOpen(false); toast.success("Fatura Draft u fshi."); }, onError: error => toast.error(error.message) });
  const paid = row.status === "PAID" || row.paymentStatus === "PAID";
  const draft = row.status === "DRAFT";
  const cancelled = row.status === "CANCELLED";
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs">Veprime</Button></DialogTrigger><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Veprime — {row.docNumber}</DialogTitle></DialogHeader><div className="grid gap-2"><Button type="button" onClick={() => { setOpen(false); onOpenInvoice(row.invoiceId); }}>Hap faturën</Button><div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" disabled={paid || cancelled || pay.isPending} onClick={() => { if (window.confirm(`Posto pagesën Cash për ${row.docNumber}?`)) pay.mutate({ companyId, id: row.invoiceId, method: "CASH" }); }}>Paguaj Cash</Button><Button type="button" variant="outline" disabled={paid || cancelled || pay.isPending} onClick={() => { if (window.confirm(`Posto pagesën Bankë për ${row.docNumber}?`)) pay.mutate({ companyId, id: row.invoiceId, method: "BANK" }); }}>Paguaj Bankë</Button></div><Button type="button" variant="outline" disabled={paid || cancelled || cancel.isPending} onClick={() => { if (window.confirm(`Anulo faturën ${row.docNumber}?`)) cancel.mutate({ companyId, id: row.invoiceId }); }}>Anulo</Button><Button type="button" variant="outline" className="border-red-500 text-red-700 hover:bg-red-50" disabled={!draft || remove.isPending} onClick={() => { if (window.confirm(`Fshij fare faturën Draft ${row.docNumber}? Veprimi ruhet te Veprimet.`)) remove.mutate({ companyId, id: row.invoiceId }); }}><Trash2 className="mr-2 h-4 w-4" />Fshij</Button></div></DialogContent></Dialog>;
}

function PurchaseInvoiceRegisterCompact({ companyId, rows, search, status, onSearchChange, onStatusChange, onOpenInvoice }: { companyId: number; rows: PurchaseRegisterRow[]; search: string; status: string; onSearchChange: (value: string) => void; onStatusChange: (value: string) => void; onOpenInvoice: (id: number) => void }) {
  const filters = [{ value: "ALL", label: "Të gjitha" }, { value: "UNPAID", label: "E papaguar" }, { value: "LATER", label: "Më vonë" }, { value: "PAID", label: "E paguar" }];
  const headers = ["Data / Datë", "Nr.", "Veprime", "Statusi i pagesës", "Kodi i fermerit", "Furnitori", "Monedha", "Kursi", "Kodi i artikullit", "Artikulli", "Sasia / KG", "Çmimi", "Vlera pa TVSH", "TVSH", "Vlera me TVSH", "Vlera në Lek", "Transportuesi", "Targa", "Inventari"];
  const itemCounts = rows.reduce<Record<number, number>>((counts, row) => ({ ...counts, [row.invoiceId]: (counts[row.invoiceId] ?? 0) + 1 }), {});
  return <section className="overflow-hidden rounded-md border border-[#c8c1c3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"><div className="flex flex-col gap-3 border-b border-[#d8d0d2] bg-[#f8f6f7] px-4 py-3 lg:flex-row lg:items-center"><p className="min-w-0 text-[11px] font-bold uppercase tracking-[0.16em] text-[#714b67]">Regjistri i faturave të blerjes</p><div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row lg:justify-end"><div className="relative min-w-0 sm:w-72"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={search} onChange={event => onSearchChange(event.target.value)} className="h-9 bg-white pl-9 text-sm" placeholder="Kërko faturë, furnitor ose artikull…" /></div><div className="flex rounded-md border border-[#d9d1d4] bg-white p-0.5">{filters.map(filter => <button type="button" key={filter.value} onClick={() => onStatusChange(filter.value)} className={`rounded px-2.5 py-1.5 text-xs font-medium ${status === filter.value ? "bg-[#714b67] text-white" : "text-[#625c62] hover:bg-[#f6f0f5]"}`}>{filter.label}</button>)}</div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1740px] border-collapse text-[12px]"><thead className="bg-[#c9aba7] text-white"><tr>{headers.map(header => <th key={header} className="h-28 min-w-[72px] border border-[#8f746f] px-2 py-1 text-center align-middle text-[10px] font-semibold uppercase tracking-wide"><span className="inline-block [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{header}</span></th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={headers.length} className="h-36 border-b border-[#ded6d7] text-center text-sm text-[#777]">Nuk u gjet rresht në regjistrin e faturave të blerjes.</td></tr> : rows.map((row, index) => { const lineTotal = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0; const vatShare = Math.round((row.vatAmount ?? 0) / itemCounts[row.invoiceId]); const paymentStatus = row.status === "PAID" ? "PAID" : row.paymentStatus ?? "UNPAID"; const paymentLabel = paymentStatus === "PAID" ? "E paguar" : paymentStatus === "LATER" ? "Më vonë" : "E papaguar"; return <tr key={`${row.invoiceId}-${row.itemId ?? "pa-artikull"}-${index}`} className={`${paymentStatus === "PAID" ? "bg-[#d9eeaf]" : paymentStatus === "LATER" ? "bg-[#fff1bf]" : "bg-white"} border-b border-[#d4cdce] hover:bg-[#fff8e5]`}><td className="whitespace-nowrap border-r border-[#d4cdce] px-2 py-1.5 text-center">{dateText(row.date)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center font-semibold"><SourceDocumentLink label={row.docNumber} onOpen={() => onOpenInvoice(row.invoiceId)} ariaLabel={`Hap faturën ${row.docNumber}`} className="rounded border border-[#a6837e] bg-white px-2 py-1 no-underline shadow-sm hover:bg-[#714b67] hover:text-white" /></td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center"><PurchaseRegisterActionDialog companyId={companyId} row={row} onOpenInvoice={onOpenInvoice} /></td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center"><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${paymentStatus === "PAID" ? "bg-[#519e57] text-white" : paymentStatus === "LATER" ? "bg-[#eabf43] text-[#4f3a00]" : "bg-[#e8e4e6] text-[#625c62]"}`}>{paymentLabel}</span></td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.supplierId ? String(row.supplierId).padStart(3, "0") : "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 font-medium uppercase">{row.supplierName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center font-semibold">{currencyLabel(row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{Number(row.exchangeRate || 1).toFixed(6)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.productId ?? "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5">{row.productName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{row.quantity?.toLocaleString("sq-AL") ?? "—"} {row.unit || ""}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{row.unitPrice === null ? "—" : currencyMoney(row.unitPrice, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{currencyMoney(lineTotal, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{currencyMoney(vatShare, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{currencyMoney(lineTotal + vatShare, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{lekEquivalent(lineTotal + vatShare, row.exchangeRate)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5">{row.carrierName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.vehiclePlate || "—"}</td><td className="px-2 py-1.5 text-center">{row.inventoryReference || "—"}</td></tr>; })}</tbody></table></div><footer className="flex items-center justify-between border-t border-[#d8d0d2] bg-[#faf9fa] px-4 py-2 text-xs text-[#777]"><span>{rows.length} rreshta të shfaqur</span></footer></section>;
}

function PurchaseInvoiceRegister({ companyId, rows, search, status, onSearchChange, onStatusChange, onOpenInvoice }: { companyId: number; rows: PurchaseRegisterRow[]; search: string; status: string; onSearchChange: (value: string) => void; onStatusChange: (value: string) => void; onOpenInvoice: (id: number) => void }) {
  const filters = [{ value: "ALL", label: "Të gjitha" }, { value: "UNPAID", label: "E papaguar" }, { value: "LATER", label: "Më vonë" }, { value: "PAID", label: "E paguar" }];
  const headers = ["Data / Datë", "Nr.", "Statusi i pagesës", "Kodi i fermerit", "Furnitori", "Monedha", "Kursi", "Kodi i artikullit", "Artikulli", "Sasia / KG", "Çmimi", "Vlera pa TVSH", "TVSH", "Vlera me TVSH", "Vlera në Lek", "Transportuesi", "Targa", "Inventari", "Veprime"];
  const itemCounts = rows.reduce<Record<number, number>>((counts, row) => ({ ...counts, [row.invoiceId]: (counts[row.invoiceId] ?? 0) + 1 }), {});
  return <section className="overflow-hidden rounded-md border border-[#c8c1c3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"><div className="flex flex-col gap-3 border-b border-[#d8d0d2] bg-[#f8f6f7] px-4 py-3 lg:flex-row lg:items-center"><p className="min-w-0 text-[11px] font-bold uppercase tracking-[0.16em] text-[#714b67]">Regjistri i faturave të blerjes</p><div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row lg:justify-end"><div className="relative min-w-0 sm:w-72"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={search} onChange={event => onSearchChange(event.target.value)} className="h-9 bg-white pl-9 text-sm" placeholder="Kërko faturë, furnitor ose artikull…" /></div><div className="flex rounded-md border border-[#d9d1d4] bg-white p-0.5">{filters.map(filter => <button type="button" key={filter.value} onClick={() => onStatusChange(filter.value)} className={`rounded px-2.5 py-1.5 text-xs font-medium ${status === filter.value ? "bg-[#714b67] text-white" : "text-[#625c62] hover:bg-[#f6f0f5]"}`}>{filter.label}</button>)}</div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1740px] border-collapse text-[12px]"><thead className="bg-[#c9aba7] text-white"><tr>{headers.map(header => <th key={header} className="h-28 min-w-[72px] border border-[#8f746f] px-2 py-1 text-center align-middle text-[10px] font-semibold uppercase tracking-wide"><span className="inline-block [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{header}</span></th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={headers.length} className="h-36 border-b border-[#ded6d7] text-center text-sm text-[#777]">Nuk u gjet rresht në regjistrin e faturave të blerjes.</td></tr> : rows.map((row, index) => { const lineTotal = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0; const vatShare = Math.round((row.vatAmount ?? 0) / itemCounts[row.invoiceId]); const paymentStatus = row.status === "PAID" ? "PAID" : row.paymentStatus ?? "UNPAID"; const paymentLabel = paymentStatus === "PAID" ? "E paguar" : paymentStatus === "LATER" ? "Më vonë" : "E papaguar"; return <tr key={`${row.invoiceId}-${row.itemId ?? "pa-artikull"}-${index}`} className={`${paymentStatus === "PAID" ? "bg-[#d9eeaf]" : paymentStatus === "LATER" ? "bg-[#fff1bf]" : "bg-white"} border-b border-[#d4cdce] hover:bg-[#fff8e5]`}><td className="whitespace-nowrap border-r border-[#d4cdce] px-2 py-1.5 text-center">{dateText(row.date)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center font-semibold"><SourceDocumentLink label={row.docNumber} onOpen={() => onOpenInvoice(row.invoiceId)} ariaLabel={`Hap faturën ${row.docNumber}`} className="rounded border border-[#a6837e] bg-white px-2 py-1 no-underline shadow-sm hover:bg-[#714b67] hover:text-white" /></td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center"><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${paymentStatus === "PAID" ? "bg-[#519e57] text-white" : paymentStatus === "LATER" ? "bg-[#eabf43] text-[#4f3a00]" : "bg-[#e8e4e6] text-[#625c62]"}`}>{paymentLabel}</span></td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.supplierId ? String(row.supplierId).padStart(3, "0") : "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 font-medium uppercase">{row.supplierName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center font-semibold">{currencyLabel(row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{Number(row.exchangeRate || 1).toFixed(6)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.productId ?? "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5">{row.productName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{row.quantity?.toLocaleString("sq-AL") ?? "—"} {row.unit || ""}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{row.unitPrice === null ? "—" : currencyMoney(row.unitPrice, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{currencyMoney(lineTotal, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{currencyMoney(vatShare, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{currencyMoney(lineTotal + vatShare, row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{lekEquivalent(lineTotal + vatShare, row.exchangeRate)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5">{row.carrierName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.vehiclePlate || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.inventoryReference || "—"}</td><td className="px-2 py-1.5 text-center"><PurchaseRegisterActionDialog companyId={companyId} row={row} onOpenInvoice={onOpenInvoice} /></td></tr>; })}</tbody></table></div><footer className="flex items-center justify-between border-t border-[#d8d0d2] bg-[#faf9fa] px-4 py-2 text-xs text-[#777]"><span>{rows.length} rreshta të shfaqur</span></footer></section>;
}

function LegacyPurchaseInvoiceRegister({ rows, search, status, onSearchChange, onStatusChange, onOpenInvoice }: { rows: PurchaseRegisterRow[]; search: string; status: string; onSearchChange: (value: string) => void; onStatusChange: (value: string) => void; onOpenInvoice: (id: number) => void }) {
  const filters = [{ value: "ALL", label: "Të gjitha" }, { value: "UNPAID", label: "E papaguar" }, { value: "LATER", label: "Më vonë" }, { value: "PAID", label: "E paguar" }];
  const headers = ["Data / Datë", "Nr.", "Statusi i pagesës", "Kodi i fermerit", "Furnitori", "Monedha", "Kursi", "Kodi i artikullit", "Artikulli", "Sasia / KG", "Çmimi", "Vlera pa TVSH", "TVSH", "Vlera me TVSH", "Vlera në Lek", "Transportuesi", "Targa", "Inventari"];
  const itemCounts = rows.reduce<Record<number, number>>((counts, row) => ({ ...counts, [row.invoiceId]: (counts[row.invoiceId] ?? 0) + 1 }), {});
  return <section className="overflow-hidden rounded-md border border-[#c8c1c3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"><div className="flex flex-col gap-3 border-b border-[#d8d0d2] bg-[#f8f6f7] px-4 py-3 lg:flex-row lg:items-center"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#714b67]">Regjistri i faturave të blerjes</p></div><div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row lg:justify-end"><div className="relative min-w-0 sm:w-72"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={search} onChange={event => onSearchChange(event.target.value)} className="h-9 bg-white pl-9 text-sm" placeholder="Kërko faturë, furnitor ose artikull…" /></div><div className="flex rounded-md border border-[#d9d1d4] bg-white p-0.5">{filters.map(filter => <button type="button" key={filter.value} onClick={() => onStatusChange(filter.value)} className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${status === filter.value ? "bg-[#714b67] text-white" : "text-[#625c62] hover:bg-[#f6f0f5]"}`}>{filter.label}</button>)}</div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1620px] border-collapse text-[12px]"><thead className="bg-[#c9aba7] text-white"><tr>{headers.map(header => <th key={header} className="h-28 min-w-[72px] border border-[#8f746f] px-2 py-1 text-center align-middle text-[10px] font-semibold uppercase tracking-wide"><span className="inline-block [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">{header}</span></th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={headers.length} className="h-36 border-b border-[#ded6d7] text-center text-sm text-[#777]">Nuk u gjet rresht në regjistrin e faturave të blerjes.</td></tr> : rows.map((row, index) => { const lineTotal = row.lineTotalAmount ?? row.invoiceTotalAmount ?? 0; const vatShare = Math.round((row.vatAmount ?? 0) / itemCounts[row.invoiceId]); const paymentStatus = row.status === "PAID" ? "PAID" : row.paymentStatus ?? "UNPAID"; const paymentLabel = paymentStatus === "PAID" ? "E paguar" : paymentStatus === "LATER" ? "Më vonë" : "E papaguar"; return <tr key={`${row.invoiceId}-${row.itemId ?? "pa-artikull"}-${index}`} className={`border-b border-[#d4cdce] ${paymentStatus === "PAID" ? "bg-[#d9eeaf]" : paymentStatus === "LATER" ? "bg-[#fff1bf]" : "bg-white"} hover:bg-[#fff8e5]`}><td className="whitespace-nowrap border-r border-[#d4cdce] px-2 py-1.5 text-center">{dateText(row.date)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center font-semibold"><button type="button" onClick={() => onOpenInvoice(row.invoiceId)} className="rounded border border-[#a6837e] bg-white px-2 py-1 text-[#714b67] shadow-sm transition-colors hover:bg-[#714b67] hover:text-white" title={`Hap faturën ${row.docNumber}`}>{row.docNumber}</button></td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center"><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${paymentStatus === "PAID" ? "bg-[#519e57] text-white" : paymentStatus === "LATER" ? "bg-[#eabf43] text-[#4f3a00]" : "bg-[#e8e4e6] text-[#625c62]"}`}>{paymentLabel}</span></td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.supplierId ? String(row.supplierId).padStart(3, "0") : "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 font-medium uppercase">{row.supplierName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center font-semibold">{currencyLabel(row.currency)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{Number(row.exchangeRate || 1).toFixed(6)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.productId ?? "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5">{row.productName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{row.quantity?.toLocaleString("sq-AL") ?? "—"} {row.unit || ""}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{row.unitPrice === null ? "—" : money(row.unitPrice)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-medium">{money(lineTotal)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right">{money(vatShare)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-right font-semibold">{money(lineTotal + vatShare)}</td><td className="border-r border-[#d4cdce] px-2 py-1.5">{row.carrierName || "—"}</td><td className="border-r border-[#d4cdce] px-2 py-1.5 text-center">{row.vehiclePlate || "—"}</td><td className="px-2 py-1.5 text-center">{row.inventoryReference || "—"}</td></tr>; })}</tbody></table></div><footer className="flex items-center justify-between border-t border-[#d8d0d2] bg-[#faf9fa] px-4 py-2 text-xs text-[#777]"><span>{rows.length} rreshta të shfaqur</span></footer></section>;
}

function PurchaseInvoiceDialogBody({ invoice, invoiceForExport, isLoading, onOpenChange, onPay, onLater, onCancel, onDelete }: any) {
  const busy = onPay.isPending || onLater.isPending || onCancel.isPending || onDelete.isPending;
  return <Dialog open={Boolean(invoice || isLoading)} onOpenChange={onOpenChange}><DialogContent className="!left-0 !top-0 !flex !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 rounded-none border-0 bg-[#dfe7ec] p-0"><div className="flex items-center justify-between border-b border-[#7892a3] bg-gradient-to-b from-[#eef6fa] to-[#b9cfdb] px-3 py-1.5 pr-12"><DialogTitle className="text-[13px] font-bold text-[#234b67]">Regjistrim Faturë Blerje — {invoice?.docNumber || "Dokument i ri"}</DialogTitle><span className="text-[11px] font-semibold text-[#4c6573]">Alpha Business</span></div><div className="flex flex-wrap items-center gap-1 border-b border-[#a7b8c2] bg-[#edf2f5] px-2 py-1.5">{invoice && <><Button type="button" size="sm" variant="outline" className="h-7 border-[#9eafb9] bg-[#f8fbfc] px-2 text-xs" onClick={() => onOpenChange(false)}>Mbyll</Button>{invoice.status !== "PAID" && invoice.status !== "CANCELLED" && <><Button type="button" size="sm" className="h-7 bg-[#3b7f4f] px-2 text-xs text-white" disabled={busy} onClick={() => onPay.mutate({ id: invoice.id, method: "CASH" })}>Paguaj Cash</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={busy} onClick={() => onPay.mutate({ id: invoice.id, method: "BANK" })}>Paguaj Bankë</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={busy} onClick={() => onLater.mutate({ id: invoice.id, paymentStatus: "LATER" })}>Më vonë</Button></>}{invoice.status === "DRAFT" && <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs text-red-700" disabled={busy} onClick={() => { if (window.confirm(`Fshij fare faturën Draft ${invoice.docNumber}?`)) onDelete.mutate({ id: invoice.id }); }}><Trash2 className="mr-1 h-3.5 w-3.5" />Fshi</Button>}<Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => void exportPurchaseInvoiceDocumentToExcel(invoiceForExport)}><Download className="mr-1 h-3.5 w-3.5" />Excel</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => exportPurchaseInvoiceDocumentToPDF(invoiceForExport)}><FileText className="mr-1 h-3.5 w-3.5" />PDF</Button><Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { if (!printPurchaseInvoiceDocument(invoiceForExport)) toast.error("Shfletuesi bllokoi Print Preview."); }}><Printer className="mr-1 h-3.5 w-3.5" />Print</Button><PurchaseStatus status={invoice.status} /></>}</div>{isLoading ? <div className="grid flex-1 place-items-center text-sm text-[#536b79]">Po ngarkohet dokumenti…</div> : !invoice ? <div className="grid flex-1 place-items-center text-sm text-[#536b79]">Fatura nuk u gjet.</div> : <div className="flex-1 overflow-y-auto bg-[#dfe7ec] p-3 md:p-5"><div className="mx-auto max-w-[900px] border border-[#92a7b4] bg-white shadow-[2px_3px_8px_rgba(38,62,77,0.3)]"><iframe title={`Pamja reference e faturës ${invoice.docNumber}`} className="h-[calc(100dvh-92px)] min-h-[720px] w-full border-0" srcDoc={buildReferenceInvoicePrintHtml(invoiceForExport, { autoPrint: false })} /></div></div>}</DialogContent></Dialog>;
}

function PurchaseInvoiceDetailDialog({ companyId, invoiceId, onOpenChange }: { companyId: number; invoiceId?: number; onOpenChange: (open: boolean) => void }) {
  const { data: invoice, isLoading } = trpc.purchaseInvoice.get.useQuery({ id: invoiceId ?? 0, companyId }, { enabled: Boolean(invoiceId) });
  const { data: company } = trpc.company.get.useQuery({ companyId }, { enabled: Boolean(invoiceId) });
  const { data: suppliers = [] } = trpc.supplier.list.useQuery({ companyId }, { enabled: Boolean(invoiceId) });
  const { data: warehouses = [] } = trpc.warehouse.list.useQuery({ companyId }, { enabled: Boolean(invoiceId) });
  const invoiceForExport = invoice ? { ...invoice, company, supplier: suppliers.find(supplier => supplier.id === invoice.supplierId), warehouseName: warehouses.find(warehouse => warehouse.id === invoice.warehouseId)?.name } : null;
  const utils = trpc.useUtils();
  const payMutation = trpc.purchaseInvoice.pay.useMutation({ onSuccess: () => { void Promise.all([utils.purchaseInvoice.list.invalidate({ companyId }), utils.purchaseInvoice.register.invalidate({ companyId }), invoiceId ? utils.purchaseInvoice.get.invalidate({ id: invoiceId, companyId }) : Promise.resolve()]).catch(() => undefined); toast.success("Pagesa u postua dhe fatura kaloi te faturat e paguara."); }, onError: error => toast.error(error.message) });
  const laterMutation = trpc.purchaseInvoice.setPaymentStatus.useMutation({ onSuccess: async () => { await Promise.all([utils.purchaseInvoice.list.invalidate({ companyId }), utils.purchaseInvoice.register.invalidate({ companyId }), invoiceId ? utils.purchaseInvoice.get.invalidate({ id: invoiceId, companyId }) : Promise.resolve()]); toast.success("Fatura u vendos për pagesë të mëvonshme."); }, onError: error => toast.error(error.message) });
  const cancelMutation = trpc.purchaseInvoice.cancel.useMutation({ onSuccess: async () => { await Promise.all([utils.purchaseInvoice.list.invalidate({ companyId }), utils.purchaseInvoice.register.invalidate({ companyId }), invoiceId ? utils.purchaseInvoice.get.invalidate({ id: invoiceId, companyId }) : Promise.resolve()]); toast.success("Fatura u anulua."); }, onError: error => toast.error(error.message) });
  const deleteMutation = trpc.purchaseInvoice.deleteDraft.useMutation({ onSuccess: async () => { await Promise.all([utils.purchaseInvoice.list.invalidate({ companyId }), utils.purchaseInvoice.register.invalidate({ companyId })]); onOpenChange(false); toast.success("Fatura Draft u fshi."); }, onError: error => toast.error(error.message) });
  return <PurchaseInvoiceDialogBody invoice={invoice} invoiceForExport={invoiceForExport} isLoading={isLoading} onOpenChange={onOpenChange} onPay={{ ...payMutation, mutate: (input: { id: number; method: "CASH" | "BANK" }) => payMutation.mutate({ companyId, ...input }) }} onLater={{ ...laterMutation, mutate: (input: { id: number; paymentStatus: "LATER" }) => laterMutation.mutate({ companyId, ...input }) }} onCancel={{ ...cancelMutation, mutate: (input: { id: number }) => cancelMutation.mutate({ companyId, ...input }) }} onDelete={{ ...deleteMutation, mutate: (input: { id: number }) => deleteMutation.mutate({ companyId, ...input }) }} />;
  // Pamja legacy u hoq; dialogu aktiv përdor formatin reference të faturës.
}

function DetailField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-wide text-[#777]">{label}</p><p className="mt-1 text-sm font-medium text-[#343434]">{value}</p></div>;
}

function EmptyRow({ columns, message }: { columns: number; message: string }) {
  return <tr><td colSpan={columns} className="p-10 text-center text-slate-500">{message}</td></tr>;
}
