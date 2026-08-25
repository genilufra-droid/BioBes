import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { FileSpreadsheet, LogOut, RefreshCw, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { exportToExcel } from "@/lib/export";

type Mode = "prices" | "discounts";

export default function ConfigPricingCatalog({ companyId }: { companyId: number }) {
  const [location, navigate] = useLocation();
  const mode: Mode = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] ?? "").get("mode") === "discounts" ? "discounts" : "prices";
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const products = trpc.product.list.useQuery({ companyId });
  const categories = trpc.category.list.useQuery({ companyId });
  const updateProduct = trpc.product.update.useMutation();
  const rows = useMemo(() => (products.data ?? []).filter(product => {
    const needle = search.trim().toLocaleLowerCase("sq-AL");
    return (!needle || `${product.code ?? ""} ${product.name}`.toLocaleLowerCase("sq-AL").includes(needle)) && (categoryId === "all" || String(product.categoryId ?? "") === categoryId);
  }), [categoryId, products.data, search]);
  const title = mode === "prices" ? "Përcaktim Çmimesh Shitjeje" : "Përcaktim Zbritjesh për Artikuj";
  const save = async (product: NonNullable<typeof products.data>[number], field: "price1" | "price2" | "discount1" | "discount2", value: string) => {
    const numeric = Math.max(0, Math.round(Number(value.replace(",", ".")) * (field.startsWith("discount") ? 100 : 100)));
    try {
      await updateProduct.mutateAsync({ companyId, id: product.id, name: product.name, [field]: Number.isFinite(numeric) ? numeric : 0 });
      await products.refetch();
      toast.success(`${title}: ${product.name} u ruajt.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Ruajtja dështoi."); }
  };
  const exportRows = () => exportToExcel(rows.map(product => ({ Kodi: product.code ?? "", Emërtimi: product.name, Njësia: product.baseUnit ?? "", "Çmimi 1": ((product.price1 ?? 0) / 100).toFixed(2), "Çmimi 2": ((product.price2 ?? 0) / 100).toFixed(2), "Zbritja 1 %": ((product.discount1 ?? 0) / 100).toFixed(2), "Zbritja 2 %": ((product.discount2 ?? 0) / 100).toFixed(2) })), mode === "prices" ? "Cmimet_Shitjes" : "Zbritjet_Analitike", title);
  return <div className="alpha-admin-window mx-auto max-w-[1180px] border border-[#8ea2b0] bg-[#f3f6f8] shadow-[2px_3px_9px_rgba(37,62,80,0.28)]">
    <div className="flex items-center justify-between border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-1.5"><h1 className="text-[13px] font-bold text-[#234b67]">{title}</h1><button type="button" onClick={() => navigate("/")} aria-label="Mbyll katalogun" className="grid h-5 w-5 place-items-center border border-[#a04f4f] bg-gradient-to-b from-[#e76d6d] to-[#b74141] text-xs font-bold text-white">×</button></div>
    <div className="flex flex-wrap gap-1 border-b border-[#afbdc7] bg-[#e9eff3] px-2 py-1.5 print:hidden"><button type="button" onClick={() => void products.refetch()} className="alpha-toolbar-button"><RefreshCw className="h-3.5 w-3.5" />Rifresko</button><button type="button" onClick={exportRows} className="alpha-toolbar-button"><FileSpreadsheet className="h-3.5 w-3.5" />Eksporto</button><button type="button" onClick={() => navigate("/")} className="alpha-toolbar-button text-[#8d3333]"><LogOut className="h-3.5 w-3.5" />Mbyll</button></div>
    <div className="grid gap-2 border-b border-[#becbd4] bg-white p-2 md:grid-cols-3"><label className="text-[11px] font-semibold text-[#3d5568]">Grupi<select value={categoryId} onChange={event => setCategoryId(event.target.value)} className="mt-0.5 h-7 w-full border border-[#9fadb7] bg-white px-2 text-xs"><option value="all">Të gjitha grupet</option>{(categories.data ?? []).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-[11px] font-semibold text-[#3d5568] md:col-span-2">Artikulli<input value={search} onChange={event => setSearch(event.target.value)} className="mt-0.5 h-7 w-full border border-[#9fadb7] px-2 text-xs outline-none focus:border-[#2b78b5]" placeholder="Kërko sipas kodit ose emërtimit..." /></label><span className="text-[11px] text-[#667887]"><Search className="mr-1 inline h-3.5 w-3.5" />{rows.length} artikuj të filtruar</span></div>
    <div className="overflow-x-auto bg-white p-2"><table className="w-full min-w-[920px] border-collapse text-xs"><thead><tr className="bg-gradient-to-b from-[#e8f0f5] to-[#ccdbe5] text-left text-[#264c66]"><th className="border border-[#aebdc7] px-2 py-1">Kodi</th><th className="border border-[#aebdc7] px-2 py-1">Emërtimi</th><th className="border border-[#aebdc7] px-2 py-1">Njësia</th><th className="border border-[#aebdc7] px-2 py-1">Çmimi 1</th><th className="border border-[#aebdc7] px-2 py-1">Çmimi 2</th><th className="border border-[#aebdc7] px-2 py-1">Zbritja 1 %</th><th className="border border-[#aebdc7] px-2 py-1">Zbritja 2 %</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={7} className="border border-[#c2cbd2] p-8 text-center text-[#687986]">Nuk u gjetën artikuj në filtrat e zgjedhur.</td></tr> : rows.map(product => <tr key={product.id} className="hover:bg-[#eaf4fa]"><td className="border border-[#c2cbd2] px-2 py-1 font-semibold">{product.code ?? "—"}</td><td className="border border-[#c2cbd2] px-2 py-1">{product.name}</td><td className="border border-[#c2cbd2] px-2 py-1">{product.baseUnit ?? "—"}</td>{(["price1", "price2", "discount1", "discount2"] as const).map(field => <td key={field} className="border border-[#c2cbd2] px-1 py-1"><div className="flex items-center gap-1"><input defaultValue={((product[field] ?? 0) / 100).toFixed(2)} aria-label={`${field} ${product.name}`} className="h-7 w-full min-w-20 border border-[#aebdc7] px-2 text-right text-xs outline-none focus:border-[#2b78b5]" /><button type="button" title="Ruaj vlerën" onClick={event => { const input = event.currentTarget.previousElementSibling as HTMLInputElement | null; if (input) void save(product, field, input.value); }} className="grid h-7 w-7 place-items-center border border-[#9fadb7] bg-[#eaf3f8] text-[#285b79] hover:bg-[#d7eafa]"><Save className="h-3.5 w-3.5" /></button></div></td>)}</tr>)}</tbody></table></div>
    <div className="border-t border-[#c0ccd4] bg-[#e9eff3] px-3 py-1 text-[11px] text-[#596d7b]">{title} · Kompania aktive · Të dhëna reale nga artikujt</div>
  </div>;
}
