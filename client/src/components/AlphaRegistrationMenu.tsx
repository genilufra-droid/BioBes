import { useEffect, useRef, useState } from "react";
import { Archive, ArrowLeftRight, BookOpen, ClipboardList, FileCheck2, FileText, Package, ReceiptText, RotateCcw, ShoppingCart, WalletCards } from "lucide-react";
import { useLocation } from "wouter";
import type { ComponentType } from "react";

type RegistrationAction = { label: string; icon: ComponentType<{ className?: string }>; path: string };
type RegistrationGroup = { label: string; icon: ComponentType<{ className?: string }>; children: RegistrationAction[] };

const groups: RegistrationGroup[] = [
  { label: "Shitje", icon: ReceiptText, children: [
    { label: "Faturat e Shitjes", icon: FileText, path: "/registrations?register=sales" },
    { label: "Kthime Shitje", icon: RotateCcw, path: "/sales-invoices?tab=returns" },
    { label: "Dërgesa", icon: Package, path: "/sales-invoices?tab=deliveries" },
    { label: "Arkëtime", icon: WalletCards, path: "/accounting?tab=payments" },
  ] },
  { label: "Blerje", icon: ShoppingCart, children: [
    { label: "Faturat e Blerjes", icon: FileText, path: "/registrations?register=purchases" },
    { label: "Kthime Blerje", icon: RotateCcw, path: "/purchase-invoices?tab=returns" },
    { label: "Pagesa", icon: WalletCards, path: "/accounting?tab=payments" },
  ] },
  { label: "Magazinë", icon: Package, children: [
    { label: "Hyrje dhe Dalje", icon: ClipboardList, path: "/registrations?register=stock" },
    { label: "Transferta", icon: ArrowLeftRight, path: "/inventory?tab=transfers" },
    { label: "Inventarizime", icon: FileCheck2, path: "/inventory?tab=inventory" },
  ] },
  { label: "Kontabilitet", icon: BookOpen, children: [
    { label: "Ditarë dhe Hyrje", icon: BookOpen, path: "/registrations?register=accounting" },
  ] },
  { label: "Likuidim", icon: WalletCards, children: [
    { label: "Arkë dhe Bankë", icon: WalletCards, path: "/registrations?register=payments" },
  ] },
  { label: "Arkivë", icon: Archive, children: [
    { label: "Dokumente të Arkivuara", icon: Archive, path: "/registrations?register=archive" },
  ] },
];

export default function AlphaRegistrationMenu() {
  const [, navigate] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) { setOpen(false); setSubmenu(null); } };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); setSubmenu(null); } };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <div ref={menuRef} className="relative h-full" onMouseLeave={() => setSubmenu(null)}>
    <button type="button" onClick={() => { setOpen(value => !value); setSubmenu(null); }} className={`h-full border-x px-2.5 text-[12px] font-medium ${open ? "border-[#8da6b6] bg-white text-[#183f5e]" : "border-transparent text-[#253f53] hover:border-[#a1b2c0] hover:bg-white/75"}`} aria-haspopup="menu" aria-expanded={open}>Regjistrime</button>
    {open && <div className="alpha-file-menu absolute left-0 top-full z-[90] w-[226px]" role="menu">{groups.map(group => { const Icon = group.icon; const active = submenu === group.label; return <div key={group.label} className="relative" onMouseEnter={() => setSubmenu(group.label)}><button type="button" role="menuitem" onFocus={() => setSubmenu(group.label)} onClick={() => setSubmenu(group.label)} className="alpha-file-menu-row"><span className="alpha-file-menu-icon"><Icon className="h-4 w-4 text-[#356f8d]" /></span><span className="flex-1">{group.label}</span><span className="pr-0.5 text-[10px] text-black">▶</span></button>{active && <div role="menu" className="alpha-file-menu absolute left-full top-0 z-[91] w-[236px]">{group.children.map(child => { const ChildIcon = child.icon; return <button type="button" key={child.label} role="menuitem" onClick={() => { navigate(child.path); setOpen(false); setSubmenu(null); }} className="alpha-file-menu-row"><span className="alpha-file-menu-icon"><ChildIcon className="h-4 w-4 text-[#356f8d]" /></span><span className="flex-1">{child.label}</span></button>; })}</div>}</div>; })}</div>}
  </div>;
}
