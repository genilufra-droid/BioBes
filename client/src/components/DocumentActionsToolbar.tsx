import { Download, FileText, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DocumentActionsToolbarProps = {
  onExcel?: () => void;
  onPdf?: () => void;
  onPrint?: () => void;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
  compact?: boolean;
};

export function DocumentActionsToolbar({ onExcel, onPdf, onPrint, disabled = false, busy = false, className = "", compact = false }: DocumentActionsToolbarProps) {
  const buttonClass = compact ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-xs";
  const isDisabled = disabled || busy;
  return (
    <div className={`inline-flex flex-wrap items-center gap-1 rounded-lg border border-[#d7dee8] bg-[#f8fafc] p-1 shadow-sm ${className}`} aria-label="Veprimet e dokumentit">
      {onExcel && <Button type="button" size="sm" variant="outline" className={`${buttonClass} border-transparent bg-white text-[#276749] hover:border-[#b7d9c5] hover:bg-[#eef9f1]`} onClick={onExcel} disabled={isDisabled} title="Eksporto në Excel">
        {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} Excel
      </Button>}
      {onPdf && <Button type="button" size="sm" variant="outline" className={`${buttonClass} border-transparent bg-white text-[#9a3412] hover:border-[#f1c3a8] hover:bg-[#fff4ed]`} onClick={onPdf} disabled={isDisabled} title="Shkarko PDF">
        <FileText className="mr-1.5 h-3.5 w-3.5" /> PDF
      </Button>}
      {onPrint && <Button type="button" size="sm" variant="outline" className={`${buttonClass} border-transparent bg-white text-[#334155] hover:border-[#b9c4d1] hover:bg-[#eef2f6]`} onClick={onPrint} disabled={isDisabled} title="Hap Print Preview">
        <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Preview
      </Button>}
    </div>
  );
}
