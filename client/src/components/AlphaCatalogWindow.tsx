import type { ReactNode } from "react";
import { FilePlus2, FileSpreadsheet, LogOut, Printer, RefreshCw } from "lucide-react";

type AlphaCatalogWindowProps = {
  title: string;
  subtitle?: string;
  count?: number;
  onClose: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onNew?: () => void;
  children: ReactNode;
};

function Tool({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return <button type="button" onClick={onClick} disabled={!onClick} className="flex min-w-[58px] flex-col items-center gap-0.5 border border-transparent px-1.5 py-0.5 text-[10px] text-[#315a75] hover:border-[#9ab2c4] hover:bg-white disabled:cursor-default disabled:opacity-45"><span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span><span>{label}</span></button>;
}

export default function AlphaCatalogWindow({ title, subtitle, count, onClose, onRefresh, onPrint, onExport, onNew, children }: AlphaCatalogWindowProps) {
  return <section className="alpha-admin-window mx-auto max-w-[1240px] border border-[#8ea2b0] bg-[#f3f6f8] shadow-[2px_3px_9px_rgba(37,62,80,0.28)]"><div className="flex items-center justify-between border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-1.5"><div><h1 className="text-[13px] font-bold text-[#234b67]">{title}</h1>{subtitle && <p className="text-[10px] text-[#587080]">{subtitle}</p>}</div><button type="button" onClick={onClose} aria-label={`Mbyll ${title}`} className="grid h-5 w-5 place-items-center border border-[#a04f4f] bg-gradient-to-b from-[#e76d6d] to-[#b74141] text-xs font-bold text-white">×</button></div><div className="flex flex-wrap items-center gap-1 border-b border-[#afbdc7] bg-[#e9eff3] px-2 py-1.5 print:hidden"><Tool icon={<FilePlus2 />} label="I ri" onClick={onNew} /><Tool icon={<RefreshCw />} label="Rifresko" onClick={onRefresh} /><Tool icon={<Printer />} label="Printo" onClick={onPrint} /><Tool icon={<FileSpreadsheet />} label="Eksporto" onClick={onExport} /><span className="mx-1 h-7 w-px bg-[#aebdc7]" /><Tool icon={<LogOut />} label="Dalje" onClick={onClose} /></div>{count !== undefined && <div className="border-b border-[#becbd4] bg-white px-3 py-1 text-[11px] text-[#687986]">Regjistrime: <strong>{count}</strong></div>}{children}</section>;
}
