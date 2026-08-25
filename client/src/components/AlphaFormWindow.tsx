import type { ReactNode } from "react";
import { HelpCircle, LogOut, Save, FileText } from "lucide-react";

type AlphaFormWindowProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSave?: () => void;
  onDocument?: () => void;
  children: ReactNode;
};

export default function AlphaFormWindow({ title, subtitle, onClose, onSave, onDocument, children }: AlphaFormWindowProps) {
  return (
    <section className="alpha-form-window mx-auto w-full max-w-[980px] overflow-hidden border border-[#8098a8] bg-[#edf2f5] shadow-[2px_3px_10px_rgba(37,62,80,0.32)]">
      <div className="flex items-center justify-between border-b border-[#8198a8] bg-gradient-to-b from-[#dcebf3] to-[#a9c5d5] px-2 py-1 text-[11px] text-[#234b67]">
        <div className="min-w-0"><h2 className="truncate font-bold">{title}</h2>{subtitle && <p className="truncate text-[10px] text-[#4c6878]">{subtitle}</p>}</div>
        <button type="button" onClick={onClose} aria-label={`Mbyll ${title}`} className="grid h-5 w-5 shrink-0 place-items-center border border-[#9c3e3e] bg-gradient-to-b from-[#e66c6c] to-[#b13b3b] font-bold text-white">×</button>
      </div>
      <div className="flex items-center gap-1 border-b border-[#aabac4] bg-[#e7edf1] px-2 py-1 print:hidden">
        <button type="button" onClick={onClose} className="alpha-form-tool"><LogOut className="h-4 w-4" />Mbyll</button>
        <button type="button" onClick={onSave} disabled={!onSave} className="alpha-form-tool"><Save className="h-4 w-4" />Ruaj</button>
        <button type="button" onClick={onDocument} disabled={!onDocument} className="alpha-form-tool"><FileText className="h-4 w-4" />Dok</button>
        <button type="button" className="alpha-form-tool"><HelpCircle className="h-4 w-4" />Ndihmë</button>
      </div>
      <div className="p-2">{children}</div>
    </section>
  );
}

export type { AlphaFormWindowProps };
