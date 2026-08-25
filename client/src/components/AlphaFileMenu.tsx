import { useEffect, useRef, useState, type ComponentType } from "react";
import { Archive, ArrowRight, Building2, CalendarCheck2, DatabaseBackup, DoorOpen, Factory, FileInput, FolderTree, Home, Landmark, MapPin, PackageSearch, Percent, Ruler, Settings2, Tag, Wrench } from "lucide-react";
import { alphaFileMenuLabels, alphaFileMenuShortcuts, alphaFileMenuSubmenus } from "@/lib/alphaFileMenu";

export { alphaFileMenuLabels, alphaFileMenuShortcuts, alphaFileMenuSubmenus } from "@/lib/alphaFileMenu";

export type FileAction = "editCompany" | "selectCompany" | "backup" | "administrativeStructure" | "administrativeSales" | "administrativeSupply" | "administrativeWarehouse" | "administrativeProduction" | "administrativeOther" | "liquidityCash" | "liquidityBank" | "fieldsConfig" | "itemGroups" | "itemUnits" | "itemCoding" | "itemDetails" | "vatLevels" | "stockLimit" | "cities" | "partnerCategories" | "dueDates" | "discountCategories" | "postIrreversible" | "postReversible" | "postReverse" | "archive" | "importStandard" | "importSheet" | "importFormat" | "importGroups" | "importRun" | "yearClose" | "logout";
type Item = { label: string; icon: ComponentType<{ className?: string }>; iconClass: string; action?: FileAction; dividerBefore?: boolean; submenu?: Item[] };

const items: Item[] = [
  { label: "Ndrysho Ndërmarrje", icon: Building2, iconClass: "text-[#257a40]", action: "editCompany" },
  { label: "Zgjidh Ndërmarrje", icon: Building2, iconClass: "text-[#2d73ad]", action: "selectCompany" },
  { label: "Backup Restore", icon: DatabaseBackup, iconClass: "text-[#236da0]", action: "backup", dividerBefore: true },
  { label: "Strukturë Administrative", icon: FolderTree, iconClass: "text-[#a46a24]", action: "administrativeStructure", dividerBefore: true },
  { label: "Njësi Administrative", icon: Home, submenu: [
    { label: "Pika Shitje", icon: Tag, iconClass: "text-[#8c5e24]", action: "administrativeSales" },
    { label: "Pika Furnizimi", icon: PackageSearch, iconClass: "text-[#8a6522]", action: "administrativeSupply" },
    { label: "Magazina", icon: Home, iconClass: "text-[#257a40]", action: "administrativeWarehouse" },
    { label: "Njësi Prodhim", icon: Factory, iconClass: "text-[#934c37]", action: "administrativeProduction" },
    { label: "Njësi të tjera", icon: FolderTree, iconClass: "text-[#537690]", action: "administrativeOther" },
  ], iconClass: "text-[#257a40]" },
  { label: "Njësi Likujdimi", icon: Landmark, submenu: [
    { label: "Arka", icon: Archive, iconClass: "text-[#7b8d2a]", action: "liquidityCash" },
    { label: "Banka", icon: Landmark, iconClass: "text-[#286c9e]", action: "liquidityBank" },
  ], iconClass: "text-[#286c9e]" },
  { label: "Konfigurim fushash", icon: Settings2, iconClass: "text-[#6c6f78]", action: "fieldsConfig" },
  { label: "Grup & Njësi Artikulli", icon: PackageSearch, submenu: [
    { label: "Grupe / NënGrupe", icon: PackageSearch, iconClass: "text-[#a06b20]", action: "itemGroups" },
    { label: "Njësi Matje", icon: Ruler, iconClass: "text-[#496f8c]", action: "itemUnits" },
    { label: "Kodifikim Artikulli", icon: Tag, iconClass: "text-[#875a2e]", action: "itemCoding" },
    { label: "Detajimi Artikullit", icon: Archive, iconClass: "text-[#56708b]", action: "itemDetails" },
    { label: "Nivelet e TVSH", icon: Percent, iconClass: "text-[#b84c34]", action: "vatLevels" },
    { label: "Kufiri i gjendjes", icon: Wrench, iconClass: "text-[#6d7780]", action: "stockLimit" },
  ], iconClass: "text-[#a06b20]" },
  { label: "Qytete & Kategori", icon: MapPin, submenu: [
    { label: "Qytete", icon: MapPin, iconClass: "text-[#458363]", action: "cities" },
    { label: "Kategori Klienti/Furnitori", icon: Tag, iconClass: "text-[#805d83]", action: "partnerCategories" },
    { label: "Afate Maturimi", icon: CalendarCheck2, iconClass: "text-[#447e98]", action: "dueDates" },
    { label: "Kategori Zbritje", icon: Percent, iconClass: "text-[#b04f3e]", action: "discountCategories" },
  ], iconClass: "text-[#458363]" },
  { label: "Postimi", icon: Wrench, submenu: [
    { label: "Postimi i Pakthyeshëm", icon: Wrench, iconClass: "text-[#9b523a]", action: "postIrreversible" },
    { label: "Postimi i Kthyeshëm", icon: Wrench, iconClass: "text-[#477c8d]", action: "postReversible" },
    { label: "Kthim Postimi", icon: Wrench, iconClass: "text-[#7d6d46]", action: "postReverse" },
  ], iconClass: "text-[#9b523a]" },
  { label: "Arkiva e Dokumentave", icon: Archive, iconClass: "text-[#6a7892]", action: "archive" },
  { label: "Import të dhënash", icon: FileInput, submenu: [
    { label: "Importi standard", icon: FileInput, iconClass: "text-[#3c759e]", action: "importStandard" },
    { label: "Import Nga Skeda", icon: FileInput, iconClass: "text-[#317e67]", action: "importSheet" },
    { label: "Konfigurim Format Importi", icon: Settings2, iconClass: "text-[#64737c]", action: "importFormat" },
    { label: "Grupon Importin", icon: Archive, iconClass: "text-[#7f6692]", action: "importGroups" },
    { label: "Importim", icon: FileInput, iconClass: "text-[#3d759b]", action: "importRun" },
  ], iconClass: "text-[#3d759b]" },
  { label: "Mbyllje Viti", icon: CalendarCheck2, iconClass: "text-[#9c5a2d]", action: "yearClose" },
  { label: "Dalje", icon: DoorOpen, iconClass: "text-[#9a3333]", action: "logout", dividerBefore: true },
];

export default function AlphaFileMenu({ onAction }: { onAction: (action: FileAction) => void }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) { setOpen(false); setOpenSubmenu(null); } };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); setOpenSubmenu(null); } };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    const openFromShortcut = () => { setOpen(true); setOpenSubmenu(null); };
    window.addEventListener("genit:open-file-menu", openFromShortcut);
    return () => window.removeEventListener("genit:open-file-menu", openFromShortcut);
  }, []);
  const choose = (action?: FileAction) => { if (!action) return; onAction(action); setOpen(false); setOpenSubmenu(null); };
  return <div ref={menuRef} className="relative h-full" onMouseLeave={() => setOpenSubmenu(null)}>
    <button type="button" onClick={() => { setOpen(value => !value); setOpenSubmenu(null); }} className={`h-full border-x px-2.5 text-[12px] font-medium ${open ? "border-[#8da6b6] bg-white text-[#183f5e]" : "border-transparent text-[#253f53] hover:border-[#a1b2c0] hover:bg-white/75"}`} aria-haspopup="menu" aria-expanded={open}>Skedarë</button>
    {open && <div className="alpha-file-menu absolute left-0 top-full z-[90] w-[226px]" role="menu">
      {items.map(item => { const Icon = item.icon; const submenuOpen = openSubmenu === item.label; return <div key={item.label} className={`relative ${item.dividerBefore ? "alpha-file-separator" : ""}`} onMouseEnter={() => item.submenu && setOpenSubmenu(item.label)}><button type="button" role="menuitem" onFocus={() => item.submenu && setOpenSubmenu(item.label)} onClick={() => item.submenu ? setOpenSubmenu(item.label) : choose(item.action)} className="alpha-file-menu-row"><span className="alpha-file-menu-icon"><Icon className={`h-4 w-4 ${item.iconClass}`} /></span><span className="flex-1">{item.label}</span>{item.submenu && <span className="pr-0.5 text-[10px] text-black">▶</span>}</button>{item.submenu && submenuOpen && <div role="menu" className="alpha-file-menu absolute left-full top-0 z-[91] w-[236px]">{item.submenu.map(child => { const ChildIcon = child.icon; return <button type="button" key={child.label} role="menuitem" onClick={() => choose(child.action)} className="alpha-file-menu-row"><span className="alpha-file-menu-icon"><ChildIcon className={`h-4 w-4 ${child.iconClass}`} /></span><span className="flex-1">{child.label}</span></button>; })}</div>}</div>; })}
    </div>}
  </div>;
}
