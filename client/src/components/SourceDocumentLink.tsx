import { ArrowUpRight } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export type SourceDocumentLinkProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  label: string;
  onOpen: () => void;
  ariaLabel?: string;
};

/** A compact PDF-style source-document arrow used consistently across registries and reports. */
export default function SourceDocumentLink({ label, onOpen, ariaLabel, className = "", ...props }: SourceDocumentLinkProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={ariaLabel ?? `Hap dokumentin ${label}`}
      title={ariaLabel ?? `Hap dokumentin ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-sm font-semibold text-[#714b67] underline decoration-[#b993ac] underline-offset-2 transition-colors hover:bg-[#f5eaf3] hover:text-[#4f3148] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#714b67] focus-visible:ring-offset-1 ${className}`}
      {...props}
    >
      <span aria-hidden="true" className="inline-grid h-4 w-4 shrink-0 place-items-center rounded-[3px] bg-[#714b67] text-[13px] font-bold leading-none text-white">↗</span>
      <span>{label}</span>
    </button>
  );
}
