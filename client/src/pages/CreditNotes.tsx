import { useMemo, useState } from "react";
import { Download, FilePlus2, FileText, Printer, Search, Send, Trash2, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { buildCreditNoteExportRows, creditNoteSourceLabel, creditNoteStatusLabel, filterCreditNotes, type CreditNoteExportRow, type CreditNoteRecord, type CreditNoteSourceType, type CreditNoteStatus } from "@/lib/creditNotes";
import { toast } from "sonner";
import { useLocation } from "wouter";
import SourceDocumentLink from "@/components/SourceDocumentLink";

type CreditNote = CreditNoteRecord & { id: number; sourceInvoiceId: number | null };
type SourceDocument = { id: number; number: string; partner: string; amount: number; vatAmount: number };
type NoteForm = { creditNoteNumber: string; noteDate: string; sourceType: CreditNoteSourceType; sourceInvoiceId?: number; sourceInvoiceNumber: string; partnerName: string; amount: string; vatAmount: string; reason: string };

const columns: Array<{ key: keyof CreditNoteExportRow; label: string }> = [
  { key: "Nr.", label: "Nr." },
  { key: "Data", label: "Data" },
  { key: "Lloji", label: "Lloji" },
  { key: "Fatura Burimore", label: "Fatura Burimore" },
  { key: "Partneri", label: "Partneri" },
  { key: "Shuma", label: "Shuma" },
  { key: "TVSH", label: "TVSH" },
  { key: "Arsyeja", label: "Arsyeja" },
  { key: "Statusi", label: "Statusi" },
];

const formatMoney = (cents: number | null | undefined) => new Intl.NumberFormat("sq-AL", { style: "currency", currency: "ALL", maximumFractionDigits: 2 }).format((cents || 0) / 100);
const formatDate = (value: Date | string) => new Date(value).toLocaleDateString("sq-AL");
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] || char);
const createEmptyForm = (): NoteForm => ({
  creditNoteNumber: `NK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
  noteDate: new Date().toISOString().slice(0, 10),
  sourceType: "PURCHASE",
  sourceInvoiceId: undefined,
  sourceInvoiceNumber: "",
  partnerName: "",
  amount: "",
  vatAmount: "",
  reason: "",
});

function statusClass(status: CreditNoteStatus) {
  if (status === "POSTED") return "bg-emerald-100 text-emerald-800";
  if (status === "CANCELLED") return "bg-red-100 text-red-700";
  return "bg-[#f2eaf1] text-[#714b67]";
}

function PrintPreview({ rows, title }: { rows: CreditNoteExportRow[]; title: string }) {
  const open = () => {
    const popup = window.open("", "_blank", "width=1400,height=860");
    if (!popup) return;
    const head = columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("");
    const body = rows.map(row => `<tr>${columns.map(column => `<td>${escapeHtml(row[column.key])}</td>`).join("")}</tr>`).join("");
    popup.document.write(`<!doctype html><html lang="sq"><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;color:#332d33;padding:28px}h1{color:#714b67;font-size:22px;margin:0 0 18px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#714b67;color:#fff;text-align:left;padding:9px;white-space:nowrap}td{border:1px solid #ded8df;padding:8px;vertical-align:top}@media print{body{padding:0}}</style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length}">Nuk ka dokumente.</td></tr>`}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  };
  return <Button size="sm" variant="outline" disabled={!rows.length} onClick={open}><Printer className="mr-1.5 h-4 w-4" />Print Preview</Button>;
}

function CreditNoteForm({ form, setForm, sourceSearch, setSourceSearch, sourceDocuments, onChooseSource, pending, onClose, onSubmit }: { form: NoteForm; setForm: React.Dispatch<React.SetStateAction<NoteForm>>; sourceSearch: string; setSourceSearch: (value: string) => void; sourceDocuments: SourceDocument[]; onChooseSource: (document: SourceDocument) => void; pending: boolean; onClose: () => void; onSubmit: (event: React.FormEvent) => void }) {
  const resetSource = (sourceType: CreditNoteSourceType) => {
    setForm(current => ({ ...current, sourceType, sourceInvoiceId: undefined, sourceInvoiceNumber: "", partnerName: "", amount: "", vatAmount: "" }));
    setSourceSearch("");
  };
  return <div className="fixed inset-0 z-[70] bg-slate-950/45"><form onSubmit={onSubmit} className="flex h-full w-full flex-col bg-[#f8f8f8]"><header className="flex shrink-0 items-center gap-3 border-b border-[#ded8df] bg-white px-4 py-3 shadow-sm"><Button type="button" size="sm" variant="outline" onClick={onClose}><X className="mr-1 h-4 w-4" />Mbyll</Button><h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-[#332d33]">Nota e Kreditit</h2><Button type="submit" disabled={pending} className="bg-[#714b67] text-white hover:bg-[#5f3d58]">{pending ? "Po ruhet…" : "Ruaj Draft"}</Button></header><main className="mx-auto grid w-full max-w-6xl flex-1 gap-5 overflow-y-auto p-4 md:grid-cols-2"><section className="space-y-4 rounded-md border border-[#ded8df] bg-white p-5"><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="credit-number">Nr. Nota Krediti</Label><Input id="credit-number" value={form.creditNoteNumber} onChange={event => setForm(current => ({ ...current, creditNoteNumber: event.target.value }))} className="mt-1.5" required /></div><div><Label htmlFor="credit-date">Data</Label><Input id="credit-date" type="date" value={form.noteDate} onChange={event => setForm(current => ({ ...current, noteDate: event.target.value }))} className="mt-1.5" required /></div></div><div><Label>Lloji</Label><div className="mt-1.5 flex gap-2"><button type="button" onClick={() => resetSource("PURCHASE")} className={`rounded px-4 py-2 text-sm font-semibold ${form.sourceType === "PURCHASE" ? "bg-[#714b67] text-white" : "border border-[#ded8df] bg-white text-[#625c62]"}`}>Blerje</button><button type="button" onClick={() => resetSource("SALE")} className={`rounded px-4 py-2 text-sm font-semibold ${form.sourceType === "SALE" ? "bg-[#714b67] text-white" : "border border-[#ded8df] bg-white text-[#625c62]"}`}>Shitje</button></div></div><div><Label htmlFor="source-search">Fatura Burimore</Label><Input id="source-search" value={sourceSearch} onChange={event => setSourceSearch(event.target.value)} className="mt-1.5" placeholder="Kërko numër fature ose partner…" required />{sourceSearch && <div className="mt-1 rounded border border-[#ded8df] bg-white">{sourceDocuments.length ? sourceDocuments.map(document => <button key={document.id} type="button" onClick={() => onChooseSource(document)} className="flex w-full items-center justify-between gap-3 border-b border-[#eee9ee] px-3 py-2 text-left text-sm last:border-0 hover:bg-[#f7f0f6]"><span><b>{document.number}</b> · {document.partner}</span><span>{formatMoney(document.amount)}</span></button>) : <div className="px-3 py-2 text-sm text-[#777]">Nuk u gjet faturë.</div>}</div>}</div><div><Label htmlFor="partner">Partneri</Label><Input id="partner" value={form.partnerName} readOnly className="mt-1.5 bg-slate-50" placeholder="Zgjidhet nga fatura burimore" /></div></section><section className="space-y-4 rounded-md border border-[#ded8df] bg-white p-5"><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="amount">Shuma</Label><Input id="amount" inputMode="decimal" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} className="mt-1.5" placeholder="0.00" required /></div><div><Label htmlFor="vat">TVSH</Label><Input id="vat" inputMode="decimal" value={form.vatAmount} onChange={event => setForm(current => ({ ...current, vatAmount: event.target.value }))} className="mt-1.5" placeholder="0.00" required /></div></div><div><Label htmlFor="reason">Arsyeja</Label><Textarea id="reason" value={form.reason} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))} className="mt-1.5 min-h-36" placeholder="Arsyeja e notës së kreditit" /></div></section></main></form></div>;
}

function CreditNoteDetail({ note, onClose, onSetStatus, onDelete, pending }: { note: CreditNote; onClose: () => void; onSetStatus: (status: "POSTED" | "CANCELLED") => void; onDelete: () => void; pending: boolean }) {
  const rows = buildCreditNoteExportRows([note], formatMoney);
  const canChangeStatus = note.status === "DRAFT";
  return <div className="fixed inset-0 z-[70] bg-slate-950/45"><section className="flex h-full w-full flex-col bg-[#f8f8f8]"><header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#ded8df] bg-white px-4 py-3 shadow-sm"><Button size="sm" variant="outline" onClick={onClose}><X className="mr-1 h-4 w-4" />Mbyll</Button><h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-[#332d33]">{note.creditNoteNumber}</h2><span className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(note.status)}`}>{creditNoteStatusLabel[note.status]}</span>{canChangeStatus && <><Button size="sm" disabled={pending} onClick={() => onSetStatus("POSTED")} className="bg-[#714b67] text-white hover:bg-[#5f3d58]"><Send className="mr-1 h-4 w-4" />Posto</Button><Button size="sm" variant="outline" disabled={pending} onClick={() => onSetStatus("CANCELLED")} className="border-red-200 text-red-700 hover:bg-red-50"><XCircle className="mr-1 h-4 w-4" />Anulo</Button><Button size="sm" variant="outline" disabled={pending} onClick={onDelete} className="border-red-200 text-red-700 hover:bg-red-50"><Trash2 className="mr-1 h-4 w-4" />Fshij</Button></>}<Button size="sm" variant="outline" onClick={() => exportToExcel(rows, note.creditNoteNumber, "Nota e Kreditit", columns)}><Download className="mr-1 h-4 w-4" />Excel</Button><Button size="sm" variant="outline" onClick={() => exportToPDF(rows, note.creditNoteNumber, note.creditNoteNumber, columns)}><FileText className="mr-1 h-4 w-4" />PDF</Button><PrintPreview rows={rows} title={note.creditNoteNumber} /></header><main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-5"><div className="overflow-x-auto rounded-md border border-[#ded8df] bg-white"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-[#714b67] text-left text-xs font-semibold uppercase tracking-wide text-white"><tr>{columns.map(column => <th key={column.key} className="px-4 py-3">{column.label}</th>)}</tr></thead><tbody><tr>{columns.map(column => <td key={column.key} className="border-t border-[#eee9ee] px-4 py-4">{rows[0][column.key]}</td>)}</tr></tbody></table></div></main></section></div>;
}

export default function CreditNotes({ companyId }: { companyId: number }) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: notes = [], isLoading } = trpc.creditNotes.list.useQuery({ companyId });
  const { data: purchaseInvoices = [] } = trpc.purchaseInvoice.list.useQuery({ companyId });
  const { data: salesInvoices = [] } = trpc.salesInvoice.list.useQuery({ companyId });
  const [search, setSearch] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<CreditNote>();
  const [form, setForm] = useState<NoteForm>(createEmptyForm);

  const visible = useMemo(() => filterCreditNotes(notes as CreditNote[], search), [notes, search]);
  const rows = useMemo(() => buildCreditNoteExportRows(visible, formatMoney), [visible]);
  const sourceDocuments = useMemo<SourceDocument[]>(() => {
    const documents = form.sourceType === "PURCHASE" ? purchaseInvoices.map(invoice => ({ id: invoice.id, number: invoice.docNumber, partner: invoice.supplierName || "—", amount: invoice.totalAmount || 0, vatAmount: invoice.vatAmount || 0 })) : salesInvoices.map(invoice => ({ id: invoice.id, number: invoice.docNumber, partner: invoice.customerName || "—", amount: invoice.totalAmount || 0, vatAmount: 0 }));
    const term = sourceSearch.trim().toLocaleLowerCase("sq-AL");
    return documents.filter(document => !term || `${document.number} ${document.partner}`.toLocaleLowerCase("sq-AL").includes(term)).slice(0, 8);
  }, [form.sourceType, purchaseInvoices, salesInvoices, sourceSearch]);

  const createNote = trpc.creditNotes.create.useMutation({
    onSuccess: async () => { await utils.creditNotes.list.invalidate({ companyId }); setFormOpen(false); setForm(createEmptyForm()); setSourceSearch(""); toast.success("Nota e kreditit u ruajt si Draft."); },
    onError: error => toast.error(error.message),
  });
  const setStatus = trpc.creditNotes.setStatus.useMutation({
    onSuccess: async note => { await utils.creditNotes.list.invalidate({ companyId }); setSelected(note as CreditNote); toast.success(note.status === "POSTED" ? "Nota e kreditit u postua." : "Nota e kreditit u anulua."); },
    onError: error => toast.error(error.message),
  });
  const deleteDraft = trpc.creditNotes.deleteDraft.useMutation({
    onSuccess: async () => { await utils.creditNotes.list.invalidate({ companyId }); setSelected(undefined); toast.success("Nota e kreditit Draft u fshi."); },
    onError: error => toast.error(error.message),
  });
  const openForm = () => { setForm(createEmptyForm()); setSourceSearch(""); setFormOpen(true); };
  const chooseSource = (document: SourceDocument) => { setForm(current => ({ ...current, sourceInvoiceId: document.id, sourceInvoiceNumber: document.number, partnerName: document.partner === "—" ? "" : document.partner, amount: (document.amount / 100).toFixed(2), vatAmount: (document.vatAmount / 100).toFixed(2) })); setSourceSearch(document.number); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Math.round(Number(form.amount.replace(",", ".")) * 100);
    const vatAmount = Math.round(Number(form.vatAmount.replace(",", ".")) * 100);
    if (!form.sourceInvoiceId || !form.sourceInvoiceNumber.trim() || !form.partnerName.trim()) { toast.error("Zgjidh faturën burimore nga kërkimi."); return; }
    if (!form.creditNoteNumber.trim() || !Number.isFinite(amount) || amount < 0 || !Number.isFinite(vatAmount) || vatAmount < 0) { toast.error("Plotëso numrin, shumën dhe TVSH-në."); return; }
    createNote.mutate({ companyId, creditNoteNumber: form.creditNoteNumber.trim(), noteDate: new Date(`${form.noteDate}T12:00:00`), sourceType: form.sourceType, sourceInvoiceId: form.sourceInvoiceId, sourceInvoiceNumber: form.sourceInvoiceNumber.trim(), partnerName: form.partnerName.trim(), amount, vatAmount, reason: form.reason.trim() || undefined });
  };
  const confirmStatus = (status: "POSTED" | "CANCELLED") => {
    if (!selected || !window.confirm(status === "POSTED" ? "Të postohet nota e kreditit?" : "Të anulohet nota e kreditit?")) return;
    setStatus.mutate({ companyId, id: selected.id, status });
  };
  const confirmDelete = () => {
    if (!selected || !window.confirm("Të fshihet përgjithmonë Nota e Kreditit Draft?")) return;
    deleteDraft.mutate({ companyId, id: selected.id });
  };

  return <section className="space-y-4"><header className="flex flex-col gap-3 border-b border-[#ded8df] pb-4 md:flex-row md:items-center md:justify-between"><h1 className="text-xl font-semibold text-[#332d33]">Notat e Kreditit</h1><div className="flex flex-wrap items-center gap-2"><Button size="sm" onClick={openForm} className="bg-[#714b67] text-white hover:bg-[#5f3d58]"><FilePlus2 className="mr-1.5 h-4 w-4" />Krijo</Button><Button size="sm" variant="outline" disabled={!rows.length} onClick={() => exportToExcel(rows, "Notat-e-Kreditit", "Notat e Kreditit", columns)}><Download className="mr-1.5 h-4 w-4" />Excel</Button><Button size="sm" variant="outline" disabled={!rows.length} onClick={() => exportToPDF(rows, "Notat-e-Kreditit", "Notat e Kreditit", columns)}><FileText className="mr-1.5 h-4 w-4" />PDF</Button><PrintPreview rows={rows} title="Notat e Kreditit" /><div className="relative min-w-[260px]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={search} onChange={event => setSearch(event.target.value)} className="h-9 bg-white pl-9" placeholder="Kërko numër, faturë ose partner…" /></div></div></header><div className="overflow-x-auto rounded-md border border-[#ded8df] bg-white"><table className="w-full min-w-[1100px] text-sm"><thead className="bg-[#f8f7f8] text-left text-xs font-semibold uppercase tracking-wide text-[#625c62]"><tr>{columns.map(column => <th key={column.key} className="px-4 py-3">{column.label}</th>)}</tr></thead><tbody>{isLoading ? <tr><td colSpan={columns.length} className="p-10 text-center text-[#777]">Po ngarkohen notat e kreditit…</td></tr> : visible.length === 0 ? <tr><td colSpan={columns.length} className="p-10 text-center text-[#777]">Nuk ka nota krediti që përputhen.</td></tr> : visible.map(note => <tr className="border-t border-[#eee9ee]" key={note.id}><td className="px-4 py-3"><SourceDocumentLink label={note.creditNoteNumber} onOpen={() => setSelected(note)} ariaLabel={`Hap notën e kreditit ${note.creditNoteNumber}`} /></td><td className="whitespace-nowrap px-4 py-3">{formatDate(note.noteDate)}</td><td className="px-4 py-3">{creditNoteSourceLabel[note.sourceType]}</td><td className="px-4 py-3">{note.sourceInvoiceId && note.sourceInvoiceNumber ? <SourceDocumentLink label={note.sourceInvoiceNumber} onOpen={() => setLocation(note.sourceType === "PURCHASE" ? `/purchase-invoices?openInvoice=${note.sourceInvoiceId}` : `/sales-invoices?openInvoice=${note.sourceInvoiceId}`)} ariaLabel={`Hap faturën burimore ${note.sourceInvoiceNumber}`} /> : note.sourceInvoiceNumber || "—"}</td><td className="px-4 py-3">{note.partnerName || "—"}</td><td className="whitespace-nowrap px-4 py-3 font-medium">{formatMoney(note.amount)}</td><td className="whitespace-nowrap px-4 py-3">{formatMoney(note.vatAmount)}</td><td className="max-w-64 px-4 py-3">{note.reason || "—"}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(note.status)}`}>{creditNoteStatusLabel[note.status]}</span></td></tr>)}</tbody></table></div>{formOpen && <CreditNoteForm form={form} setForm={setForm} sourceSearch={sourceSearch} setSourceSearch={setSourceSearch} sourceDocuments={sourceDocuments} onChooseSource={chooseSource} pending={createNote.isPending} onClose={() => setFormOpen(false)} onSubmit={submit} />}{selected && <CreditNoteDetail note={selected} onClose={() => setSelected(undefined)} onSetStatus={confirmStatus} onDelete={confirmDelete} pending={setStatus.isPending || deleteDraft.isPending} />}</section>;
}
