import { useMemo } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, CheckCircle2, LogOut, RefreshCw } from "lucide-react";

const labels = { postIrreversible: "Postimi i Pakthyeshëm", postReversible: "Postimi i Kthyeshëm", postReverse: "Kthim Postimi" } as const;
type PostingMode = keyof typeof labels;

export default function PostingWindow() {
  const [location, navigate] = useLocation();
  const mode = (new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] ?? "").get("mode") ?? "postIrreversible") as PostingMode;
  const title = labels[mode] ?? labels.postIrreversible;
  const note = useMemo(() => mode === "postReverse" ? "Zgjidhni dokumentet e postuara për t’i kthyer pas kontrollit të gjurmës së auditit." : mode === "postReversible" ? "Postimi i kthyeshëm lejon rikthim vetëm me dokumentacion dhe kontroll të autorizuar." : "Postimi i pakthyeshëm mbyll veprimin kontabël dhe kërkon verifikim të plotë të dokumenteve.", [mode]);
  return <div className="alpha-admin-window mx-auto max-w-[1120px] border border-[#8ea2b0] bg-[#f3f6f8] shadow-[2px_3px_9px_rgba(37,62,80,0.28)]">
    <div className="flex items-center justify-between border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-1.5"><h1 className="text-[13px] font-bold text-[#234b67]">{title}</h1><button type="button" onClick={() => navigate("/")} aria-label="Mbyll postimin" className="grid h-5 w-5 place-items-center border border-[#a04f4f] bg-gradient-to-b from-[#e76d6d] to-[#b74141] text-xs font-bold text-white">×</button></div>
    <div className="flex flex-wrap gap-1 border-b border-[#afbdc7] bg-[#e9eff3] px-2 py-1.5 print:hidden"><button type="button" className="alpha-toolbar-button"><RefreshCw className="h-3.5 w-3.5" />Rifresko</button><button type="button" className="alpha-toolbar-button"><CheckCircle2 className="h-3.5 w-3.5" />Kontrollo</button><button type="button" onClick={() => navigate("/")} className="alpha-toolbar-button text-[#8d3333]"><LogOut className="h-3.5 w-3.5" />Mbyll</button></div>
    <div className="p-3"><div className="flex items-start gap-3 border border-[#d7c69d] bg-[#fff9e7] p-3 text-xs text-[#705719]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Kontroll i detyrueshëm</p><p className="mt-1 leading-5">{note} Ky ekran nuk poston apo kthen dokumente automatikisht.</p></div></div><div className="mt-3 overflow-x-auto bg-white"><table className="w-full min-w-[700px] border-collapse text-xs"><thead><tr className="bg-gradient-to-b from-[#e8f0f5] to-[#ccdbe5] text-left text-[#264c66]"><th className="border border-[#aebdc7] px-2 py-1">Nr.</th><th className="border border-[#aebdc7] px-2 py-1">Dokumenti</th><th className="border border-[#aebdc7] px-2 py-1">Data</th><th className="border border-[#aebdc7] px-2 py-1">Gjendja</th></tr></thead><tbody><tr><td colSpan={4} className="border border-[#c2cbd2] p-8 text-center text-[#687986]">Nuk ka dokumente të përzgjedhura për këtë veprim.</td></tr></tbody></table></div></div>
    <div className="border-t border-[#c0ccd4] bg-[#e9eff3] px-3 py-1 text-[11px] text-[#596d7b]">{title} · Dokumentet nuk ndryshohen pa kontroll dhe autorizim.</div>
  </div>;
}
