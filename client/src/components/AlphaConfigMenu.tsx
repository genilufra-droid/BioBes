import { useEffect, useRef, useState, type ComponentType } from "react";
import { BarChart3, FileCog, FileText, Landmark, PackageSearch, Percent, Settings2, Tags, UsersRound } from "lucide-react";

export type ConfigAction = "company" | "articles" | "salesPrices" | "discounts" | "customers" | "suppliers" | "issuers" | "costCenters" | "documentGroups" | "backup" | "fields";
type Item = { label: string; icon: ComponentType<{ className?: string }>; color: string; action: ConfigAction; dividerBefore?: boolean };

const items: Item[] = [
  { label: "Ndërmarrja", icon: Landmark, color: "text-[#2d73ad]", action: "company" },
  { label: "Artikuj", icon: PackageSearch, color: "text-[#a06b20]", action: "articles", dividerBefore: true },
  { label: "Çmime Shitjeje", icon: Tags, color: "text-[#257a40]", action: "salesPrices" },
  { label: "Zbritje Analitike", icon: Percent, color: "text-[#b04f3e]", action: "discounts" },
  { label: "Klientë", icon: UsersRound, color: "text-[#2d73ad]", action: "customers", dividerBefore: true },
  { label: "Furnitorë", icon: UsersRound, color: "text-[#805d83]", action: "suppliers" },
  { label: "Emetuesit", icon: FileText, color: "text-[#6c6f78]", action: "issuers" },
  { label: "Qendra e Kostos", icon: BarChart3, color: "text-[#477c8d]", action: "costCenters", dividerBefore: true },
  { label: "Grupim Dokumentash", icon: FileCog, color: "text-[#7f6692]", action: "documentGroups" },
  { label: "Backup automatik", icon: Settings2, color: "text-[#236da0]", action: "backup", dividerBefore: true },
  { label: "Fusha shtesë", icon: FileCog, color: "text-[#6c6f78]", action: "fields" },
];

export default function AlphaConfigMenu({ onAction }: { onAction: (action: ConfigAction) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <div ref={ref} className="relative h-full">
    <button type="button" onClick={() => setOpen(value => !value)} className={`h-full border-x px-2.5 text-[12px] font-medium ${open ? "border-[#8da6b6] bg-white text-[#183f5e]" : "border-transparent text-[#253f53] hover:border-[#a1b2c0] hover:bg-white/75"}`} aria-haspopup="menu" aria-expanded={open}>Konfigurime</button>
    {open && <div className="alpha-file-menu absolute left-0 top-full z-[90] w-[226px]" role="menu">{items.map(item => { const Icon = item.icon; return <div key={item.label} className={item.dividerBefore ? "alpha-file-separator" : ""}><button type="button" role="menuitem" onClick={() => { onAction(item.action); setOpen(false); }} className="alpha-file-menu-row"><span className="alpha-file-menu-icon"><Icon className={`h-4 w-4 ${item.color}`} /></span><span className="flex-1">{item.label}</span></button></div>; })}</div>}
  </div>;
}
