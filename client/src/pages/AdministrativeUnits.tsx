import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { FilePlus2, FilePenLine, FileSpreadsheet, LogOut, Printer, RefreshCw, Save, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { exportToExcel } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type UnitType = "WAREHOUSE" | "POINT_OF_SALE" | "OFFICE" | "OTHER";
type InventoryMethod = "INTERMEDIATE" | "CONTINUOUS" | "INVENTORY";
type FormState = {
  id?: number;
  code: string;
  name: string;
  active: boolean;
  unitType: UnitType;
  address: string;
  location: string;
  contact: string;
  notes: string;
  inventoryMethod: InventoryMethod;
  supplyPointOfSale: boolean;
  allowNegativeStock: boolean;
};

const emptyForm = (): FormState => ({ code: "", name: "", active: true, unitType: "WAREHOUSE", address: "", location: "", contact: "", notes: "", inventoryMethod: "INTERMEDIATE", supplyPointOfSale: false, allowNegativeStock: false });
const unitTypeLabel: Record<UnitType, string> = { WAREHOUSE: "Magazinë", POINT_OF_SALE: "Pikë shitje", OFFICE: "Zyrë", OTHER: "Tjetër" };
const inventoryMethodLabel: Record<InventoryMethod, string> = { INTERMEDIATE: "Intermjetëm", CONTINUOUS: "I vazhdueshëm", INVENTORY: "Inventar" };

function fromRecord(row: any): FormState {
  return {
    id: row.id, code: row.code ?? "", name: row.name ?? "", active: Number(row.active ?? 1) === 1,
    unitType: row.unitType ?? "WAREHOUSE", address: row.address ?? "", location: row.location ?? "", contact: row.contact ?? "", notes: row.notes ?? "",
    inventoryMethod: row.inventoryMethod ?? "INTERMEDIATE", supplyPointOfSale: Number(row.supplyPointOfSale ?? 0) === 1, allowNegativeStock: Number(row.allowNegativeStock ?? 0) === 1,
  };
}

export default function AdministrativeUnits({ companyId }: { companyId: number }) {
  const [location, navigate] = useLocation();
  const query = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] ?? "");
  const adminKind = query.get("kind") ?? "";
  const structureMode = query.get("mode") === "structure";
  const adminTitle = structureMode ? "Strukturë Administrative" : (({ administrativeSales: "Pika Shitje", administrativeSupply: "Pika Furnizimi", administrativeWarehouse: "Magazinë", administrativeProduction: "Njësi Prodhim", administrativeOther: "Njësi të tjera" } as Record<string, string>)[adminKind] ?? "Njësi Administrative");
  const utils = trpc.useUtils();
  const unitsQuery = trpc.warehouse.list.useQuery({ companyId });
  const units = unitsQuery.data ?? [];
  const [codeFilter, setCodeFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [addressFilter, setAddressFilter] = useState("");
  const [searchAll, setSearchAll] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [intermediateConfirm, setIntermediateConfirm] = useState<{ mode: "close" | "new" } | null>(null);
  const selected = units.find(unit => unit.id === selectedId) ?? null;

  const visible = useMemo(() => {
    const allQuery = `${codeFilter} ${descriptionFilter} ${addressFilter}`.trim().toLocaleLowerCase("sq-AL");
    return units.filter(unit => {
      const typeMatches = typeFilter === "ALL" || unit.unitType === typeFilter;
      if (!typeMatches) return false;
      const kindMatches = !adminKind
        || (adminKind === "administrativeSales" && unit.unitType === "POINT_OF_SALE")
        || (adminKind === "administrativeSupply" && Number(unit.supplyPointOfSale ?? 0) === 1)
        || (adminKind === "administrativeWarehouse" && unit.unitType === "WAREHOUSE")
        || (adminKind === "administrativeProduction" && unit.unitType === "OTHER" && /prodhim/i.test(String(unit.name ?? "")))
        || (adminKind === "administrativeOther" && unit.unitType === "OTHER" && !/prodhim/i.test(String(unit.name ?? "")));
      if (!kindMatches) return false;
      const code = String(unit.code ?? "").toLocaleLowerCase("sq-AL");
      const name = String(unit.name ?? "").toLocaleLowerCase("sq-AL");
      const address = `${unit.address ?? ""} ${unit.location ?? ""}`.toLocaleLowerCase("sq-AL");
      const contact = `${unit.contact ?? ""} ${unit.notes ?? ""}`.toLocaleLowerCase("sq-AL");
      if (searchAll) return !allQuery || `${code} ${name} ${address} ${contact} ${unitTypeLabel[unit.unitType as UnitType] ?? ""}`.toLocaleLowerCase("sq-AL").includes(allQuery);
      return (!codeFilter || code.includes(codeFilter.toLocaleLowerCase("sq-AL")))
        && (!descriptionFilter || name.includes(descriptionFilter.toLocaleLowerCase("sq-AL")))
        && (!addressFilter || address.includes(addressFilter.toLocaleLowerCase("sq-AL")));
    });
  }, [addressFilter, adminKind, codeFilter, descriptionFilter, searchAll, structureMode, typeFilter, units]);

  const invalidate = async () => { await utils.warehouse.list.invalidate({ companyId }); };
  const create = trpc.warehouse.create.useMutation({ onSuccess: async () => { await invalidate(); toast.success("Njësia administrative u ruajt."); }, onError: error => toast.error(error.message) });
  const update = trpc.warehouse.update.useMutation({ onSuccess: async () => { await invalidate(); toast.success("Njësia administrative u ndryshua."); }, onError: error => toast.error(error.message) });
  const remove = trpc.warehouse.delete.useMutation({ onSuccess: async () => { await invalidate(); setSelectedId(null); setDeleteOpen(false); toast.success("Njësia administrative u fshi."); }, onError: error => { setDeleteOpen(false); toast.error(error.message); } });
  const pending = create.isPending || update.isPending;

  const startNew = () => { setForm(emptyForm()); setEditorOpen(true); };
  const startEdit = () => { if (!selected) return toast.error("Zgjidhni një njësi nga lista."); setForm(fromRecord(selected)); setEditorOpen(true); };
  const submit = (mode: "close" | "new") => {
    if (!form.code.trim()) return toast.error("Kodi është i detyrueshëm.");
    if (!form.name.trim()) return toast.error("Përshkrimi është i detyrueshëm.");
    if (form.inventoryMethod === "INTERMEDIATE") { setIntermediateConfirm({ mode }); return; }
    persist(mode);
  };
  const persist = (mode: "close" | "new") => {
    const payload = { companyId, name: form.name.trim(), code: form.code.trim(), unitType: form.unitType, active: form.active ? 1 : 0, address: form.address.trim() || undefined, location: form.location.trim() || undefined, contact: form.contact.trim() || undefined, notes: form.notes.trim() || undefined, inventoryMethod: form.inventoryMethod, supplyPointOfSale: form.supplyPointOfSale ? 1 : 0, allowNegativeStock: form.allowNegativeStock ? 1 : 0 };
    const afterSave = () => { setIntermediateConfirm(null); if (mode === "new") { setForm(emptyForm()); return; } setEditorOpen(false); };
    if (form.id) update.mutate({ ...payload, id: form.id }, { onSuccess: afterSave });
    else create.mutate(payload, { onSuccess: afterSave });
  };
  const printList = () => { window.print(); };
  const exportList = () => exportToExcel(visible.map(unit => ({ Kodi: unit.code || "", Përshkrimi: unit.name, Lloji: unitTypeLabel[unit.unitType as UnitType] ?? unit.unitType, Aktiv: Number(unit.active) === 1 ? "Po" : "Jo", Adresa: unit.address || unit.location || "" })), "Njesite_Administrative", "Njësitë");
  const patch = (value: Partial<FormState>) => setForm(current => ({ ...current, ...value }));

  return <div className="alpha-admin-window mx-auto max-w-[1240px] border border-[#8ea2b0] bg-[#f3f6f8] shadow-[2px_3px_9px_rgba(37,62,80,0.28)]">
    <div className="flex items-center justify-between border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-1.5"><h1 className="text-[13px] font-bold text-[#234b67]">Lista e {adminTitle}</h1><button type="button" onClick={() => navigate("/")} aria-label="Mbyll listën e njësive" className="grid h-5 w-5 place-items-center border border-[#a04f4f] bg-gradient-to-b from-[#e76d6d] to-[#b74141] text-xs font-bold text-white">×</button></div>
    <div className="flex flex-wrap gap-1 border-b border-[#afbdc7] bg-[#e9eff3] px-2 py-1.5 print:hidden">
      <ToolbarButton icon={<FilePlus2 />} label="I ri" onClick={startNew} />
      <ToolbarButton icon={<FilePenLine />} label="Ndrysho" onClick={startEdit} disabled={!selected} />
      <ToolbarButton icon={<Trash2 />} label="Fshi" onClick={() => selected ? setDeleteOpen(true) : toast.error("Zgjidhni një njësi nga lista.")} disabled={!selected} tone="danger" />
      <ToolbarButton icon={<RefreshCw />} label="Rifresko" onClick={() => void invalidate()} />
      <span className="mx-1 w-px bg-[#aebdc7]" />
      <ToolbarButton icon={<Printer />} label="Printo" onClick={printList} />
      <ToolbarButton icon={<FileSpreadsheet />} label="Eksporto" onClick={exportList} />
      <span className="mx-1 w-px bg-[#aebdc7]" />
      <ToolbarButton icon={<LogOut />} label="Dalje" onClick={() => navigate("/")} tone="danger" />
    </div>
    <div className="grid gap-2 border-b border-[#becbd4] bg-white p-2 md:grid-cols-[130px_1fr_165px_1fr_auto]">
      <FilterField label="Kodi" value={codeFilter} onChange={setCodeFilter} />
      <FilterField label="Përshkrimi" value={descriptionFilter} onChange={setDescriptionFilter} />
      <label className="block text-[11px] font-semibold text-[#3d5568]"><span>Lloji</span><select value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className="mt-0.5 h-7 w-full border border-[#9fadb7] bg-white px-1 text-xs"><option value="ALL">Të gjitha</option>{Object.entries(unitTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <FilterField label="Adresa" value={addressFilter} onChange={setAddressFilter} />
      <label className="flex items-end gap-1 pb-1 text-[11px] text-[#3d5568]"><input type="checkbox" checked={searchAll} onChange={event => setSearchAll(event.target.checked)} /><span>Kërko në të gjitha fushat</span></label>
    </div>
    <div className="overflow-x-auto bg-white p-2"><table className="w-full min-w-[710px] border-collapse text-xs"><thead><tr className="bg-gradient-to-b from-[#e8f0f5] to-[#ccdbe5] text-left text-[#264c66]"><th className="border border-[#aebdc7] px-2 py-1 font-bold">Kodi</th><th className="border border-[#aebdc7] px-2 py-1 font-bold">Përshkrimi</th><th className="border border-[#aebdc7] px-2 py-1 font-bold">Lloji</th><th className="w-16 border border-[#aebdc7] px-2 py-1 text-center font-bold">Aktive</th><th className="border border-[#aebdc7] px-2 py-1 font-bold">Adresa</th></tr></thead><tbody>{unitsQuery.isLoading ? <tr><td colSpan={5} className="border border-[#c2cbd2] p-7 text-center text-[#687986]">Po ngarkohet lista...</td></tr> : visible.length === 0 ? <tr><td colSpan={5} className="border border-[#c2cbd2] p-7 text-center text-[#687986]">Nuk u gjet asnjë njësi administrative.</td></tr> : visible.map(unit => <tr key={unit.id} onClick={() => setSelectedId(unit.id)} onDoubleClick={startEdit} className={`cursor-pointer ${selectedId === unit.id ? "bg-[#badcf0] text-[#173f5c]" : "hover:bg-[#eaf4fa]"}`}><td className="border border-[#c2cbd2] px-2 py-1">{unit.code || "—"}</td><td className="border border-[#c2cbd2] px-2 py-1 font-medium">{unit.name}</td><td className="border border-[#c2cbd2] px-2 py-1">{unitTypeLabel[unit.unitType as UnitType] ?? unit.unitType}</td><td className="border border-[#c2cbd2] px-2 py-1 text-center"><input type="checkbox" checked={Number(unit.active ?? 1) === 1} readOnly /></td><td className="border border-[#c2cbd2] px-2 py-1">{unit.address || unit.location || ""}</td></tr>)}</tbody></table></div>
    <div className="border-t border-[#c0ccd4] bg-[#e9eff3] px-3 py-1 text-[11px] text-[#596d7b]">{visible.length} {adminTitle.toLocaleLowerCase("sq-AL")} · Përzgjedhja ndryshohet me dy klikime ose me butonin Ndrysho.</div>

    <Dialog open={editorOpen} onOpenChange={setEditorOpen}><DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-sm border-[#8199aa] p-0"><DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-1.5"><DialogTitle className="text-[13px] text-[#234b67]">{adminTitle}</DialogTitle><DialogDescription className="sr-only">Krijoni ose ndryshoni një njësi administrative.</DialogDescription></DialogHeader><div className="flex flex-wrap gap-1 border-b border-[#afbdc7] bg-[#e9eff3] px-2 py-1.5"><ToolbarButton icon={<Save />} label="Ruaj" onClick={() => submit("close")} disabled={pending} /><ToolbarButton icon={<FilePlus2 />} label="Ruaj & I ri" onClick={() => submit("new")} disabled={pending} /><ToolbarButton icon={<XCircle />} label="Anullo" onClick={() => setEditorOpen(false)} tone="danger" /><ToolbarButton icon={<LogOut />} label="Dalje" onClick={() => setEditorOpen(false)} tone="danger" /></div><div className="space-y-4 p-4"><div className="grid gap-3 md:grid-cols-[160px_1fr_160px]"><label className="text-xs font-semibold text-[#3d5568]">Kodi<Input value={form.code} onChange={event => patch({ code: event.target.value })} className="mt-1 h-8 rounded-none border-[#9fadb7]" /></label><label className="flex items-end gap-2 pb-1 text-xs font-semibold text-[#3d5568]"><input type="checkbox" checked={form.active} onChange={event => patch({ active: event.target.checked })} />Aktive</label><label className="text-xs font-semibold text-[#3d5568]">Lloji<select value={form.unitType} onChange={event => patch({ unitType: event.target.value as UnitType })} className="mt-1 h-8 w-full border border-[#9fadb7] bg-white px-2 text-sm"><option value="WAREHOUSE">Magazinë</option><option value="POINT_OF_SALE">Pikë shitje</option><option value="OFFICE">Zyrë</option><option value="OTHER">Tjetër</option></select></label><label className="md:col-span-3 text-xs font-semibold text-[#3d5568]">Përshkrimi<Input value={form.name} onChange={event => patch({ name: event.target.value })} className="mt-1 h-8 rounded-none border-[#9fadb7]" /></label><label className="md:col-span-2 text-xs font-semibold text-[#3d5568]">Vendndodhja<Input value={form.location} onChange={event => patch({ location: event.target.value })} className="mt-1 h-8 rounded-none border-[#9fadb7]" /></label><label className="text-xs font-semibold text-[#3d5568]">Kontakti<Input value={form.contact} onChange={event => patch({ contact: event.target.value })} className="mt-1 h-8 rounded-none border-[#9fadb7]" /></label><label className="md:col-span-3 text-xs font-semibold text-[#3d5568]">Adresa<Input value={form.address} onChange={event => patch({ address: event.target.value })} className="mt-1 h-8 rounded-none border-[#9fadb7]" /></label><label className="md:col-span-3 text-xs font-semibold text-[#3d5568]">Shënime<textarea value={form.notes} onChange={event => patch({ notes: event.target.value })} className="mt-1 min-h-16 w-full border border-[#9fadb7] p-2 text-sm outline-none focus:border-[#2b78b5]" /></label></div><fieldset className="border border-[#9fadb7] bg-[#f8fbfd] p-3"><legend className="px-1 text-xs font-bold text-[#2d526d]">Opsione Magazine</legend><div className="grid gap-3 md:grid-cols-3"><label className="text-xs font-semibold text-[#3d5568]">Metoda Inventarizimit<select value={form.inventoryMethod} onChange={event => patch({ inventoryMethod: event.target.value as InventoryMethod })} className="mt-1 h-8 w-full border border-[#9fadb7] bg-white px-2 text-sm"><option value="INTERMEDIATE">Intermjetëm</option><option value="CONTINUOUS">I vazhdueshëm</option><option value="INVENTORY">Inventar</option></select></label><label className="flex items-end gap-2 pb-1 text-xs font-semibold text-[#3d5568]"><input type="checkbox" checked={form.supplyPointOfSale} onChange={event => patch({ supplyPointOfSale: event.target.checked })} />Pikë shitje furnizimi</label><label className="flex items-end gap-2 pb-1 text-xs font-semibold text-[#3d5568]"><input type="checkbox" checked={form.allowNegativeStock} onChange={event => patch({ allowNegativeStock: event.target.checked })} />Pa ndjekje gjendje</label></div></fieldset></div></DialogContent></Dialog>

    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Fshi njësinë administrative?</AlertDialogTitle><AlertDialogDescription>Do të fshihet “{selected?.name}”. Njësitë që përdoren nga dokumentet ose stoku nuk mund të fshihen.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Anullo</AlertDialogCancel><AlertDialogAction onClick={() => selected && remove.mutate({ companyId, id: selected.id })} className="bg-red-700 hover:bg-red-800">Fshi</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={Boolean(intermediateConfirm)} onOpenChange={open => !open && setIntermediateConfirm(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Metoda Intermjetëm</AlertDialogTitle><AlertDialogDescription>Kjo metodë përdoret për hyrje fillestare dhe nuk reflekton operacionet në kontabilitet. Dëshironi të vazhdoni?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Anullo</AlertDialogCancel><AlertDialogAction onClick={() => intermediateConfirm && persist(intermediateConfirm.mode)}>Po</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function ToolbarButton({ icon, label, onClick, disabled, tone }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; tone?: "danger" }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`flex min-w-[56px] flex-col items-center gap-0.5 border border-transparent px-1.5 py-0.5 text-[10px] hover:border-[#9ab2c4] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 ${tone === "danger" ? "text-[#9c3535]" : "text-[#315a75]"}`}><span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span><span>{label}</span></button>;
}

function FilterField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-[11px] font-semibold text-[#3d5568]"><span>{label}</span><input value={value} onChange={event => onChange(event.target.value)} className="mt-0.5 h-7 w-full border border-[#9fadb7] bg-white px-1 text-xs outline-none focus:border-[#2b78b5]" /></label>;
}
