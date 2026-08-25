import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export type RecordSearchItem = { id: number; label: string; detail?: string };

export default function RecordLiveSearch({ name, value, items, onChange, placeholder, emptyLabel = "Nuk u gjet rezultat.", clearLabel = "Pa lidhje" }: { name?: string; value?: number; items: RecordSearchItem[]; onChange: (id?: number) => void; placeholder: string; emptyLabel?: string; clearLabel?: string }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const selected = items.find(item => item.id === value);
  const results = useMemo(() => {
    const query = text.trim().toLocaleLowerCase("sq-AL");
    return query ? items.filter(item => `${item.label} ${item.detail || ""}`.toLocaleLowerCase("sq-AL").includes(query)).slice(0, 7) : items.slice(0, 7);
  }, [items, text]);
  const select = (id?: number) => { onChange(id); setText(""); setFocused(false); };
  return <div className="relative">{name && <input type="hidden" name={name} value={value ?? ""} />}<div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={selected?.label || text} onFocus={() => setFocused(true)} onChange={event => { setText(event.target.value); onChange(undefined); }} className="h-10 bg-white pl-9 pr-9" placeholder={placeholder} />{(selected || text) && <button type="button" aria-label="Pastro zgjedhjen" onClick={() => select(undefined)} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded text-[#777] hover:bg-[#f0edf0]"><X className="h-3.5 w-3.5" /></button>}</div>{focused && <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-[#d9d4da] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.13)]"><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => select(undefined)} className="block w-full border-b border-[#eee9ee] px-3 py-2 text-left text-sm text-[#777] hover:bg-[#faf7fa]">{clearLabel}</button>{results.map(item => <button key={item.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => select(item.id)} className="block w-full px-3 py-2.5 text-left hover:bg-[#faf5f9]"><span className="block text-sm font-medium text-[#343434]">{item.label}</span>{item.detail && <span className="mt-0.5 block text-xs text-[#777]">{item.detail}</span>}</button>)}{results.length === 0 && <p className="px-3 py-3 text-sm text-[#777]">{emptyLabel}</p>}</div>}</div>;
}
