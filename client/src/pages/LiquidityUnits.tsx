import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { FilePenLine, FilePlus2, Landmark, Printer, RefreshCw, Search, Trash2, WalletCards, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type AccountType = "BANK" | "CASH";
type EditorMode = "create" | "edit" | null;

function ToolbarButton({ icon, label, onClick, disabled = false, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`alpha-liquidity-toolbar-button ${danger ? "is-danger" : ""}`}><span>{icon}</span><small>{label}</small></button>;
}

export default function LiquidityUnits({ companyId }: { companyId: number }) {
  const [, navigate] = useLocation();
  const type: AccountType = new URLSearchParams(window.location.search).get("type") === "CASH" ? "CASH" : "BANK";
  const title = type === "CASH" ? "Lista e Arka" : "Lista e Banka";
  const typeLabel = type === "CASH" ? "Arkë" : "Bankë";
  const codeLabel = type === "CASH" ? "Kodi" : "Llogari bankare / IBAN";
  const utils = trpc.useUtils();
  const accountsQuery = trpc.bankAccount.list.useQuery({ companyId });
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const accounts = accountsQuery.data ?? [];
  const rows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("sq-AL");
    return accounts.filter(account => account.accountType === type).filter(account => !term || `${account.accountName} ${account.bankName ?? ""} ${account.iban ?? ""}`.toLocaleLowerCase("sq-AL").includes(term));
  }, [accounts, search, type]);
  const selected = rows.find(row => row.id === selectedId) ?? accounts.find(row => row.id === selectedId && row.accountType === type);
  const refresh = async () => { await utils.bankAccount.list.invalidate({ companyId }); await accountsQuery.refetch(); toast.success("Lista u rifreskua."); };
  const close = () => navigate("/");
  const create = trpc.bankAccount.create.useMutation({ onSuccess: async () => { await refresh(); setEditorMode(null); toast.success(`${typeLabel} u ruajt.`); }, onError: error => toast.error(error.message) });
  const update = trpc.bankAccount.update.useMutation({ onSuccess: async () => { await refresh(); setEditorMode(null); toast.success(`${typeLabel} u përditësua.`); }, onError: error => toast.error(error.message) });
  const remove = trpc.bankAccount.remove.useMutation({ onSuccess: async result => { setSelectedId(null); await refresh(); toast.success(result.mode === "DELETE" ? `${typeLabel} u fshi.` : `${typeLabel} ka veprime; u çaktivizua dhe ruhet në raporte.`); }, onError: error => toast.error(error.message) });
  const applySearch = () => setSearch(draftSearch);
  const openCreate = () => setEditorMode("create");
  const openEdit = () => selected ? setEditorMode("edit") : toast.error(`Zgjidhni një ${typeLabel.toLocaleLowerCase("sq-AL")} nga grila.`);
  const confirmRemove = () => {
    if (!selected) return toast.error(`Zgjidhni një ${typeLabel.toLocaleLowerCase("sq-AL")} nga grila.`);
    const confirmation = window.confirm(`Fshi ${typeLabel.toLocaleLowerCase("sq-AL")} “${selected.accountName}”?\n\nNëse ka veprime, sistemi nuk e fshin; e çaktivizon dhe e ruan në raporte.`);
    if (confirmation) remove.mutate({ companyId, id: selected.id });
  };
  const printList = () => {
    const popup = window.open("", "_blank", "width=950,height=700");
    if (!popup) return toast.error("Print Preview u bllokua nga shfletuesi.");
    popup.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font:12px Tahoma,Arial;padding:20px;color:#111}h1{font-size:16px;margin:0 0 14px;color:#174b72}table{width:100%;border-collapse:collapse}th{background:#d5e0e7;text-align:left}th,td{border:1px solid #9baab4;padding:5px 7px}</style></head><body><h1>${title}</h1><table><thead><tr><th>Nr.</th><th>Kodi</th><th>Përshkrimi</th><th>Lloji</th><th>Adresa</th></tr></thead><tbody>${rows.map((row, index) => `<tr><td>${index + 1}</td><td>${row.iban || ""}</td><td>${row.accountName}</td><td>${typeLabel}</td><td>${row.bankName || ""}</td></tr>`).join("")}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  };
  const initial = editorMode === "edit" ? selected : undefined;
  return <section className="alpha-liquidity-canvas" aria-label={title}>
    <div className="alpha-liquidity-window">
      <div className="alpha-liquidity-titlebar"><div className="flex items-center gap-1.5">{type === "CASH" ? <WalletCards className="h-4 w-4 text-[#718e2c]" /> : <Landmark className="h-4 w-4 text-[#216e9f]" />}<h1>{title}</h1></div><button type="button" onClick={close} title="Mbyll" className="alpha-liquidity-close">×</button></div>
      <div className="alpha-liquidity-toolbar print:hidden">
        <ToolbarButton icon={<FilePlus2 />} label="Shto" onClick={openCreate} />
        <ToolbarButton icon={<FilePenLine />} label="Modifiko" onClick={openEdit} disabled={!selected} />
        <ToolbarButton icon={<Trash2 />} label="Fshi" onClick={confirmRemove} disabled={!selected || remove.isPending} danger />
        <ToolbarButton icon={<RefreshCw />} label="Rifresko" onClick={() => void refresh()} />
        <ToolbarButton icon={<Printer />} label="Printo" onClick={printList} />
        <span className="mx-1 h-9 w-px bg-[#abb8c0]" />
        <ToolbarButton icon={<XCircle />} label="Mbyll" onClick={close} danger />
      </div>
      <form onSubmit={event => { event.preventDefault(); applySearch(); }} className="alpha-liquidity-search print:hidden"><label>Kërko:<Input value={draftSearch} onChange={event => setDraftSearch(event.target.value)} placeholder="Kodi ose përshkrimi" className="h-6 rounded-none border-[#8d9da8] bg-white px-1.5 text-[11px]" /></label><button type="submit"><Search className="h-3.5 w-3.5" />Kërko</button></form>
      <div className="alpha-liquidity-grid-wrap"><table className="alpha-liquidity-grid"><thead><tr><th className="w-[48px]">Nr.</th><th className="w-[150px]">Kodi</th><th>Përshkrimi</th><th className="w-[100px]">Lloji</th><th className="w-[220px]">Adresa</th></tr></thead><tbody>{accountsQuery.isLoading ? <tr><td colSpan={5} className="alpha-liquidity-empty">Po ngarkohet lista…</td></tr> : rows.length === 0 ? <tr><td colSpan={5} className="alpha-liquidity-empty">Nuk ka {type === "CASH" ? "arka" : "banka"} të regjistruara.</td></tr> : rows.map((row, index) => <tr key={row.id} onClick={() => setSelectedId(row.id)} onDoubleClick={openEdit} className={selectedId === row.id ? "is-selected" : ""}><td>{index + 1}</td><td>{row.iban || "—"}</td><td>{row.accountName}{row.active === 0 && <span className="ml-2 text-[10px] text-[#a74343]">Jo aktive</span>}</td><td>{typeLabel}</td><td>{row.bankName || "—"}</td></tr>)}</tbody></table></div>
      <footer className="alpha-liquidity-statusbar">{rows.length} {type === "CASH" ? "arkë" : "bankë"} · Zgjidhni një rresht për Modifiko ose Fshi.</footer>
    </div>
    <LiquidityEditor open={editorMode !== null} mode={editorMode} type={type} typeLabel={typeLabel} codeLabel={codeLabel} initial={initial} pending={create.isPending || update.isPending} onOpenChange={open => !open && setEditorMode(null)} onSave={data => { if (editorMode === "edit" && initial) update.mutate({ companyId, id: initial.id, ...data }); else create.mutate({ companyId, ...data, openingBalance: data.openingBalance, accountType: type }); }} />
  </section>;
}

function LiquidityEditor({ open, mode, type, typeLabel, codeLabel, initial, pending, onOpenChange, onSave }: { open: boolean; mode: EditorMode; type: AccountType; typeLabel: string; codeLabel: string; initial?: { id: number; accountName: string; bankName: string | null; iban: string | null; currency: string; openingBalance: number; active: number }; pending: boolean; onOpenChange: (open: boolean) => void; onSave: (data: { accountName: string; bankName?: string; iban?: string; currency: string; active: boolean; openingBalance: number }) => void }) {
  const editing = mode === "edit";
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="alpha-liquidity-editor p-0"><DialogHeader className="alpha-liquidity-titlebar"><DialogTitle>{editing ? `Modifiko ${typeLabel}` : type === "BANK" ? "Çelja e Bankës" : "Çelja e Arkës"}</DialogTitle><DialogDescription className="sr-only">Të dhënat e njësisë likuiduese.</DialogDescription></DialogHeader><form className="space-y-3 p-4" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); const accountName = String(form.get("accountName") || "").trim(); if (!accountName) return toast.error("Përshkrimi është i detyrueshëm."); onSave({ accountName, bankName: String(form.get("bankName") || "").trim() || undefined, iban: String(form.get("iban") || "").trim() || undefined, currency: String(form.get("currency") || "ALL"), active: form.get("active") === "on", openingBalance: Number(form.get("openingBalance")) || 0 }); }}><fieldset className="alpha-liquidity-fieldset"><legend>Të dhënat identifikuese</legend><div className="grid gap-x-3 gap-y-2 sm:grid-cols-2"><EditorField label={codeLabel} name="iban" defaultValue={initial?.iban || ""} readOnly={editing} /><EditorField label="Përshkrimi" name="accountName" defaultValue={initial?.accountName || ""} required /><EditorField label={type === "BANK" ? "Banka / Adresa" : "Adresa"} name="bankName" defaultValue={initial?.bankName || ""} /><label className="alpha-liquidity-label">Monedha<select name="currency" defaultValue={initial?.currency || "ALL"}><option value="ALL">ALL</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></label><label className="alpha-liquidity-check"><input type="checkbox" name="active" defaultChecked={initial ? initial.active === 1 : true} />Aktiv</label></div></fieldset>{!editing && <fieldset className="alpha-liquidity-fieldset"><legend>Gjendja fillestare</legend><div className="grid gap-3 sm:grid-cols-2"><EditorField label="Vlera fillestare" name="openingBalance" type="number" defaultValue="0" /><p className="self-end pb-1 text-[11px] text-[#596f7f]">Gjendja ruhet në monedhën e zgjedhur.</p></div></fieldset>}<div className="flex justify-end gap-2 border-t border-[#b9c5cc] pt-3"><button type="button" onClick={() => onOpenChange(false)} className="alpha-liquidity-action">Anullo</button><button type="submit" disabled={pending} className="alpha-liquidity-save">{pending ? "Po ruhet…" : "Ruaj"}</button></div></form></DialogContent></Dialog>;
}

function EditorField({ label, name, type = "text", defaultValue, required = false, readOnly = false }: { label: string; name: string; type?: string; defaultValue: string | number; required?: boolean; readOnly?: boolean }) {
  return <label className="alpha-liquidity-label">{label}<Input name={name} type={type} defaultValue={defaultValue} required={required} readOnly={readOnly} className="h-7 rounded-none border-[#8d9da8] bg-white px-1.5 text-[12px]" /></label>;
}
