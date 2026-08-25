import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";

export function GlobalSearch({ companyId, placeholder = "Kërko faturë, partner ose artikull..." }: { companyId: number; placeholder?: string }) {
  const [, setLocation] = useLocation();
  const [term, setTerm] = useState("");
  const input = useMemo(() => ({ companyId, term }), [companyId, term]);
  const search = trpc.globalSearch.query.useQuery(input, { enabled: term.trim().length >= 2 });
  const results = search.data ?? [];

  return <div className="relative"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={term} onChange={event => setTerm(event.target.value)} className="h-10 w-full pl-9 pr-9" placeholder={placeholder} aria-label="Live Search" />{term && <button className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setTerm("")} aria-label="Pastro kërkimin"><X className="h-4 w-4" /></button>}</div>{term.trim().length >= 2 && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-md border border-[#d9d4da] bg-popover text-popover-foreground shadow-lg">{search.isLoading ? <p className="p-4 text-sm text-muted-foreground">Po kërkohet...</p> : results.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Nuk u gjet asnjë rezultat.</p> : <div className="max-h-80 overflow-y-auto">{results.map((result, index) => <button key={`${result.type}-${result.title}-${index}`} onClick={() => { setLocation(result.path); setTerm(""); }} className="flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-[#f8f5f8]"><span className="mt-0.5 rounded bg-[#f2eaf1] px-2 py-0.5 text-[10px] font-semibold text-[#714b67]">{result.type}</span><span><span className="block text-sm font-medium">{result.title}</span><span className="block text-xs text-muted-foreground">{result.subtitle}</span></span></button>)}</div>}</div>}</div>;
}
