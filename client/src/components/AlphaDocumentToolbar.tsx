import { FilePlus2, HelpCircle, RotateCcw, Save, Search, Trash2, X } from "lucide-react";

type AlphaDocumentToolbarProps = {
  onClose: () => void;
  onNew: () => void;
  onFind: () => void;
  onClear: () => void;
  savePending?: boolean;
};

export default function AlphaDocumentToolbar({ onClose, onNew, onFind, onClear, savePending = false }: AlphaDocumentToolbarProps) {
  const buttons = [
    { label: "Mbyll", icon: X, onClick: onClose, tone: "text-[#943d3d]" },
    { label: "Ruaj", icon: Save, submit: true, tone: "text-[#1b5f38]", disabled: savePending },
    { label: "I ri", icon: FilePlus2, onClick: onNew, tone: "text-[#19538e]" },
    { label: "Kërko", icon: Search, onClick: onFind, tone: "text-[#51425a]" },
    { label: "Fshi draft", icon: Trash2, onClick: onClear, tone: "text-[#943d3d]" },
    { label: "Rifresko", icon: RotateCcw, onClick: onNew, tone: "text-[#51425a]" },
  ];

  return (
    <div className="flex shrink-0 items-stretch overflow-x-auto border-b border-[#aeb7c2] bg-[#dbe5f0] px-2 py-1 shadow-inner">
      {buttons.map(({ label, icon: Icon, onClick, submit, tone, disabled }) => (
        <button
          key={label}
          type={submit ? "submit" : "button"}
          onClick={onClick}
          disabled={disabled}
          className="group flex min-w-[54px] flex-col items-center gap-0.5 border-r border-[#b8c3d0] px-2 py-1 text-[10px] font-medium text-[#263746] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Icon className={`h-4 w-4 ${tone}`} strokeWidth={1.9} />
          <span>{savePending && submit ? "Ruhet" : label}</span>
        </button>
      ))}
      <div className="my-1 ml-auto flex items-center gap-1 px-2 text-[10px] text-[#5b6773]">
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Fatura me artikuj</span>
      </div>
    </div>
  );
}
