import { useState } from "react";
import { Input } from "@/components/ui/input";

type Option = { id: number; name: string; abbreviation?: string | null };

type AlphaArticleFieldsProps = {
  categories?: Option[];
  units?: Option[];
  values?: Record<string, string | number | boolean>;
};

const fieldClass = "mt-1 h-8 w-full rounded-none border border-[#9fadb7] bg-white px-2 text-xs";
const labelClass = "text-[11px] font-semibold text-[#3d5568]";

export default function AlphaArticleFields({ categories = [], units = [], values = {} }: AlphaArticleFieldsProps) {
  const [tab, setTab] = useState<"card" | "accounts" | "extra">("card");
  const tabClass = (value: typeof tab) => `border px-2 py-1 text-[10px] ${tab === value ? "border-[#6f8fa4] bg-white font-bold text-[#234b67]" : "border-transparent text-[#587080] hover:bg-white"}`;
  const value = (name: string) => String(values[name] ?? "");
  return <>
    <div className="flex items-center gap-1 border-b border-[#9fb2bf] bg-[#e8f0f5] px-1 py-1">
      <button type="button" className={tabClass("card")} onClick={() => setTab("card")}>Kartela</button>
      <button type="button" className={tabClass("accounts")} onClick={() => setTab("accounts")}>Llogaritë</button>
      <button type="button" className={tabClass("extra")} onClick={() => setTab("extra")}>Fusha shtesë</button>
    </div>
    <div className={`${tab === "card" ? "" : "hidden"} grid gap-2 border border-[#b3c1cb] bg-[#f8fafb] p-2 md:grid-cols-4`}>

      <div className="col-span-4 border-b border-[#c3d0d8] pb-1 text-[10px] font-bold uppercase text-[#315a75]">Identifikuese</div>
      <label className={labelClass}>Kodi *<Input name="code" defaultValue={value("code")} required className={fieldClass} /></label>
      <label className={labelClass}>Referenca<Input name="reference" defaultValue={value("reference")} className={fieldClass} /></label>
      <label className={labelClass}>Kod Bar<Input name="barcode" defaultValue={value("barcode")} className={fieldClass} /></label>
      <label className={labelClass}>Kodi Doganor<Input name="customsCode" defaultValue={value("customsCode")} className={fieldClass} /></label>
      <label className="col-span-3 text-[11px] font-semibold text-[#3d5568]">Përshkrimi<Input name="name" defaultValue={value("name")} required className={fieldClass} /></label>
      <label className={`${labelClass} flex items-center gap-2 pt-5`}><input name="active" type="checkbox" defaultChecked={values.active !== false} /> Aktiv <input name="details" type="checkbox" defaultChecked={values.details === true} /> Me detajime</label>
      <div className="col-span-4 border-b border-[#c3d0d8] pb-1 pt-1 text-[10px] font-bold uppercase text-[#315a75]">Klasifikimi dhe magazina</div>
      <label className={labelClass}>Klasa<select name="itemType" defaultValue={value("itemType") || "QARKULLUES"} className={fieldClass}><option value="QARKULLUES">Inventar</option><option value="AFATGJATE">Afatgjatë</option><option value="SHERBIM">Shërbim</option></select></label>
      <label className={labelClass}>Grupi / Kategoria<select name="categoryId" defaultValue={value("categoryId")} className={fieldClass}><option value="">—</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className={labelClass}>Njësia bazë<select name="baseUnit" defaultValue={value("baseUnit")} className={fieldClass}><option value="">—</option>{units.map(unit => <option key={unit.id} value={unit.abbreviation || unit.name}>{unit.name}</option>)}</select></label>
      <label className={labelClass}>Magazina e çeljes<Input name="openingWarehouse" defaultValue={value("openingWarehouse")} className={fieldClass} /></label>
      <label className={labelClass}>Njësia II<Input name="secondaryUnit" defaultValue={value("secondaryUnit")} className={fieldClass} /></label>
      <label className={labelClass}>Koeficienti<Input name="coefficient" type="number" min="0" step="0.01" defaultValue={value("coefficient") || "1"} className={fieldClass} /></label>
      <label className={labelClass}>Metoda Kosto<select name="costMethod" defaultValue={value("costMethod")} className={fieldClass}><option value="">—</option><option>Mesatare</option><option>FIFO</option><option>LIFO</option></select></label>
      <label className={labelClass}>Niveli i TVSH<select name="vatLevel" defaultValue={value("vatLevel")} className={fieldClass}><option value="20">20%</option><option value="6">6%</option><option value="0">0%</option></select></label>
    </div>
    <div className={`${tab === "accounts" ? "" : "hidden"} grid gap-2 border border-[#b3c1cb] bg-[#f8fafb] p-2 md:grid-cols-3`}>

      <div className="col-span-3 text-[10px] font-bold uppercase text-[#315a75]">Llogaritë dhe kostot</div>
      <label className={labelClass}>Llogari inventari<Input name="inventoryAccount" defaultValue={value("inventoryAccount")} className={fieldClass} /></label>
      <label className={labelClass}>Llogari kundërparti<Input name="counterAccount" defaultValue={value("counterAccount")} className={fieldClass} /></label>
      <label className={labelClass}>Furnitori<Input name="supplier" defaultValue={value("supplier")} className={fieldClass} /></label>
      <label className={labelClass}>Pesha bruto<Input name="grossWeight" type="number" min="0" step="0.001" defaultValue={value("grossWeight")} className={fieldClass} /></label>
      <label className={labelClass}>Pesha neto<Input name="netWeight" type="number" min="0" step="0.001" defaultValue={value("netWeight")} className={fieldClass} /></label>
      <label className={labelClass}>Vendndodhja<Input name="location" defaultValue={value("location")} className={fieldClass} /></label>
      <label className={labelClass}>Minimumi<Input name="minStock" type="number" min="0" step="0.01" defaultValue={value("minStock")} className={fieldClass} /></label>
      <label className={labelClass}>Maksimumi<Input name="maxStock" type="number" min="0" step="0.01" defaultValue={value("maxStock")} className={fieldClass} /></label>
      <label className={labelClass}>Komenti<Input name="comment" defaultValue={value("comment")} className={fieldClass} /></label>
      <label className={labelClass}>Çmimi 1<Input name="price1" type="number" min="0" step="0.01" defaultValue={value("price1")} className={fieldClass} /></label>
      <label className={labelClass}>Çmimi 2<Input name="price2" type="number" min="0" step="0.01" defaultValue={value("price2")} className={fieldClass} /></label>
      <label className={labelClass}>Zbritja 1 (%)<Input name="discount1" type="number" min="0" max="100" step="0.01" defaultValue={value("discount1")} className={fieldClass} /></label>
      <label className={labelClass}>Zbritja 2 (%)<Input name="discount2" type="number" min="0" max="100" step="0.01" defaultValue={value("discount2")} className={fieldClass} /></label>
    </div>
    <div className={`${tab === "extra" ? "" : "hidden"} grid gap-2 border border-[#b3c1cb] bg-[#f8fafb] p-2 md:grid-cols-2`}>

      <div className="col-span-2 text-[10px] font-bold uppercase text-[#315a75]">Fusha shtesë të artikullit</div>
      <label className={labelClass}>Kodifikimi<Input name="classification" defaultValue={value("classification")} className={fieldClass} /></label>
      <label className={labelClass}>Origjina e mallit<Input name="origin" defaultValue={value("origin")} className={fieldClass} /></label>
      <label className={labelClass}>Funksioni<Input name="function" defaultValue={value("function")} className={fieldClass} /></label>
      <label className={labelClass}>Shpërndarje shpenzimesh<Input name="expenseDistribution" defaultValue={value("expenseDistribution")} className={fieldClass} /></label>
    </div>
  </>;
}
