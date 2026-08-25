import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw, Printer, FileSpreadsheet, LogOut, Save, FileText, HelpCircle, ArrowDownUp } from "lucide-react";
import { toast } from "sonner";
import { getOpenProductId } from "@/lib/productActions";
import AlphaArticleFields from "@/components/AlphaArticleFields";
import { sortProducts, type ProductSort } from "@/lib/productSort";

export default function Products({ companyId }: { companyId: number }) {
  const [newProductOpen, setNewProductOpen] = useState(() => new URLSearchParams(window.location.search).get("new") === "1");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ code: "", name: "", barcode: "", categoryId: "", baseUnit: "", itemType: "QARKULLUES", price1: "", price2: "", discount1: "", discount2: "" });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>({ key: "name", direction: "asc" });
  const [location, setLocation] = useLocation();
  const productQuery = location.includes("?") ? location.slice(location.indexOf("?")) : window.location.search;
  const requestedOpenProductId = getOpenProductId(productQuery);
  const [cardDismissed, setCardDismissed] = useState(false);
  const openProductId = cardDismissed ? 0 : requestedOpenProductId;

  // Fetch data
  const { data: products } = trpc.product.list.useQuery({ companyId });
  const { data: categories } = trpc.category.list.useQuery({ companyId });
  const { data: units } = trpc.unit.list.useQuery({ companyId });

  // Mutations
  const utils = trpc.useUtils();
  const createProduct = trpc.product.create.useMutation();
  const updateProduct = trpc.product.update.useMutation();
  const deleteProduct = trpc.product.delete.useMutation();

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const moneyToCents = (value: FormDataEntryValue | null) => {
      const parsed = Number(value ?? "");
      return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined;
    };
    const percentToBasisPoints = (value: FormDataEntryValue | null) => {
      const parsed = Number(value ?? "");
      return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined;
    };
    await createProduct.mutateAsync({
      companyId,
      code: String(formData.get("code") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      barcode: String(formData.get("barcode") ?? "").trim() || undefined,
      categoryId: formData.get("categoryId") ? parseInt(String(formData.get("categoryId")), 10) : undefined,
      baseUnit: String(formData.get("baseUnit") ?? "").trim() || undefined,
      itemType: (String(formData.get("itemType") ?? "QARKULLUES") as "QARKULLUES" | "AFATGJATE" | "SHERBIM"),
      price1: moneyToCents(formData.get("price1")),
      price2: moneyToCents(formData.get("price2")),
      discount1: percentToBasisPoints(formData.get("discount1")),
      discount2: percentToBasisPoints(formData.get("discount2")),
    });

    setNewProductOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const lowStockProducts = products?.filter(p => (p.stock ?? 0) <= (p.minStock ?? 0)) || [];
  const filteredProducts = (products ?? []).filter(product => { const query = search.trim().toLocaleLowerCase("sq-AL"); return !query || [product.code, product.name, product.barcode, product.baseUnit, product.itemType].some(value => String(value ?? "").toLocaleLowerCase("sq-AL").includes(query)); });
  const visibleProducts = sortProducts(filteredProducts, sort);
  const toggleSort = (key: ProductSort["key"]) => setSort(current => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  const sortLabel = (key: typeof sort.key) => sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕";
  const refreshProducts = () => void utils.product.list.invalidate({ companyId });
  const printProducts = () => window.print();
  const exportProducts = () => { const rows = visibleProducts.map(product => ({ Kodi: product.code || "", Emri: product.name, Barkodi: product.barcode || "", Njësia: product.baseUnit || "", Lloji: product.itemType || "QARKULLUES", Stoku: product.stock ?? 0, "Stoku minimal": product.minStock ?? 0, "Çmimi mesatar": `${((product.avgPrice ?? 0) / 100).toFixed(2)} L` })); const csv = [Object.keys(rows[0] ?? { Kodi: "", Emri: "", Barkodi: "", Njësia: "", Lloji: "", Stoku: "", "Stoku minimal": "", "Çmimi mesatar": "" }).join(";"), ...rows.map(row => Object.values(row).map(value => `"${String(value).replaceAll('"', '""')}"`).join(";"))].join("\n"); const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "Artikujt.csv"; link.click(); URL.revokeObjectURL(url); };
  const openedProduct = products?.find(product => Number(product.id) === openProductId);
  const productBeingEdited = products?.find(product => Number(product.id) === editingProductId);

  const openEditDialog = (product: NonNullable<typeof products>[number]) => {
    setEditForm({
      code: product.code || "",
      name: product.name || "",
      barcode: product.barcode || "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
      baseUnit: product.baseUnit || "",
      itemType: product.itemType || "QARKULLUES",
      price1: product.price1 ? String(product.price1 / 100) : "",
      price2: product.price2 ? String(product.price2 / 100) : "",
      discount1: product.discount1 ? String(product.discount1 / 100) : "",
      discount2: product.discount2 ? String(product.discount2 / 100) : "",
    });
    setEditingProductId(product.id);
  };

  const handleEditProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProductId) return;
    const formData = new FormData(event.currentTarget);
    const moneyToCents = (value: FormDataEntryValue | null) => { const parsed = Number(value ?? ""); return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined; };
    const percentToBasisPoints = (value: FormDataEntryValue | null) => { const parsed = Number(value ?? ""); return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined; };
    try {
      await updateProduct.mutateAsync({
        companyId, id: editingProductId,
        code: String(formData.get("code") ?? "").trim() || undefined,
        name: String(formData.get("name") ?? "").trim(),
        barcode: String(formData.get("barcode") ?? "").trim() || undefined,
        categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : undefined,
        baseUnit: String(formData.get("baseUnit") ?? "").trim() || undefined,
        itemType: String(formData.get("itemType") ?? "QARKULLUES") as "QARKULLUES" | "AFATGJATE" | "SHERBIM",
        price1: moneyToCents(formData.get("price1")), price2: moneyToCents(formData.get("price2")),
        discount1: percentToBasisPoints(formData.get("discount1")), discount2: percentToBasisPoints(formData.get("discount2")),
      });
      await utils.product.list.invalidate({ companyId }); setEditingProductId(null); toast.success("Artikulli u përditësua me sukses.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Përditësimi i artikullit dështoi."); }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProduct.mutateAsync({ companyId, id: deleteProductId });
      await utils.product.list.invalidate({ companyId });
      setDeleteProductId(null);
      toast.success("Artikulli u fshi me sukses.");
    } catch (error) {
      setDeleteProductId(null);
      toast.error(error instanceof Error ? error.message : "Artikulli nuk mund të fshihet.");
    }
  };

  const closeProductCard = () => {
    setCardDismissed(true);
    setLocation("/products");
  };

  return (
    <div className="alpha-admin-window mx-auto max-w-[1240px] border border-[#8ea2b0] bg-[#f3f6f8] shadow-[2px_3px_9px_rgba(37,62,80,0.28)]">
      <div className="flex items-center justify-between border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-1.5"><div><h1 className="text-[13px] font-bold text-[#234b67]">Lista e Artikujve</h1><p className="text-[10px] text-[#587080]">Katalogu i artikujve — kompania aktive</p></div><button type="button" onClick={() => setLocation("/")} aria-label="Mbyll listën e artikujve" className="grid h-5 w-5 place-items-center border border-[#a04f4f] bg-gradient-to-b from-[#e76d6d] to-[#b74141] text-xs font-bold text-white">×</button></div><div className="flex flex-wrap items-center gap-1 border-b border-[#afbdc7] bg-[#e9eff3] px-2 py-1.5 print:hidden"><Button type="button" variant="ghost" className="h-auto min-w-[55px] flex-col gap-0 px-1 py-0.5 text-[10px] text-[#315a75]" onClick={() => setNewProductOpen(true)}><Plus className="h-4 w-4" />I ri</Button><Button type="button" variant="ghost" className="h-auto min-w-[55px] flex-col gap-0 px-1 py-0.5 text-[10px] text-[#315a75]" onClick={refreshProducts}><RefreshCw className="h-4 w-4" />Rifresko</Button><Button type="button" variant="ghost" className="h-auto min-w-[55px] flex-col gap-0 px-1 py-0.5 text-[10px] text-[#315a75]" onClick={printProducts}><Printer className="h-4 w-4" />Printo</Button><Button type="button" variant="ghost" className="h-auto min-w-[55px] flex-col gap-0 px-1 py-0.5 text-[10px] text-[#315a75]" onClick={exportProducts}><FileSpreadsheet className="h-4 w-4" />Eksporto</Button><span className="mx-1 h-7 w-px bg-[#aebdc7]" /><Button type="button" variant="ghost" className="h-auto min-w-[55px] flex-col gap-0 px-1 py-0.5 text-[10px] text-[#9c3535]" onClick={() => setLocation("/")}><LogOut className="h-4 w-4" />Dalje</Button></div><div className="grid gap-2 border-b border-[#becbd4] bg-white p-2 md:grid-cols-[1fr_auto]"><label className="text-[11px] font-semibold text-[#3d5568]">Kërko në të gjitha fushat<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Kodi, emri, barkodi ose njësia" className="mt-0.5 h-7 w-full border border-[#9fadb7] px-1 text-xs outline-none focus:border-[#2b78b5]" /></label><span className="self-end pb-1 text-[11px] text-[#687986]">{visibleProducts.length} nga {products?.length ?? 0} artikuj</span></div><Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
          <DialogContent className="!fixed !inset-0 !left-0 !top-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 border-[#8199aa] bg-[#f3f6f8] p-0">
            <DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-2">
              <DialogTitle className="text-[13px] text-[#234b67]">Artikull i Ri — Regjistrim</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-1 border-b border-[#aabac4] bg-[#e7edf1] px-2 py-1 print:hidden"><button type="button" className="alpha-form-tool" onClick={() => setNewProductOpen(false)}><LogOut className="h-4 w-4" />Mbyll</button><button type="submit" form="new-product-form" className="alpha-form-tool"><Save className="h-4 w-4" />Ruaj</button><button type="button" className="alpha-form-tool"><FileText className="h-4 w-4" />Dok</button><button type="button" className="alpha-form-tool"><HelpCircle className="h-4 w-4" />Ndihmë</button></div>
            <form id="new-product-form" onSubmit={handleAddProduct} className="space-y-3 overflow-y-auto p-3">
              <AlphaArticleFields categories={categories} units={units} />
              <div className="flex justify-end gap-2 border-t border-[#c3d0d8] pt-3"><Button type="button" variant="outline" className="h-8 rounded-sm border-[#9fadb7]" onClick={() => setNewProductOpen(false)}>Anullo</Button><Button type="submit" className="h-8 rounded-sm bg-[#2b6892]" disabled={createProduct.isPending}>{createProduct.isPending ? "Po ruhet..." : "Ruaj dhe Mbyll"}</Button></div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editingProductId !== null} onOpenChange={open => { if (!open) setEditingProductId(null); }}>
          <DialogContent className="!fixed !inset-0 !left-0 !top-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-0 border-[#8199aa] bg-[#f3f6f8] p-0">
            <DialogHeader className="border-b border-[#92a8b7] bg-gradient-to-b from-[#eaf3f8] to-[#c9dbe6] px-3 py-2">
              <DialogTitle className="text-[13px] text-[#234b67]">Artikull — Ndryshim</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-1 border-b border-[#aabac4] bg-[#e7edf1] px-2 py-1 print:hidden"><button type="button" className="alpha-form-tool" onClick={() => setEditingProductId(null)}><LogOut className="h-4 w-4" />Mbyll</button><button type="submit" form="edit-product-form" className="alpha-form-tool"><Save className="h-4 w-4" />Ruaj</button><button type="button" className="alpha-form-tool"><FileText className="h-4 w-4" />Dok</button><button type="button" className="alpha-form-tool"><HelpCircle className="h-4 w-4" />Ndihmë</button></div>
            <form id="edit-product-form" onSubmit={handleEditProduct} className="space-y-3 overflow-y-auto p-3">
              <AlphaArticleFields key={editingProductId ?? "empty"} categories={categories} units={units} values={editForm} />
              <div className="flex justify-end gap-2 border-t border-[#c3d0d8] pt-3"><Button type="button" variant="outline" className="h-8 rounded-sm border-[#9fadb7]" onClick={() => setEditingProductId(null)}>Anullo</Button><Button type="submit" className="h-8 rounded-sm bg-[#2b6892]" disabled={updateProduct.isPending || !productBeingEdited}>{updateProduct.isPending ? "Po ruhet..." : "Ruaj ndryshimet"}</Button></div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteProductId !== null} onOpenChange={open => { if (!open) setDeleteProductId(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fshi artikullin?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">Ky veprim lejohet vetëm kur artikulli nuk ka stok, lëvizje ose dokumente të lidhura. Të dhënat e dokumenteve ekzistuese nuk fshihen.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteProductId(null)}>Anulo</Button>
              <Button type="button" variant="destructive" onClick={() => void handleDeleteProduct()} disabled={deleteProduct.isPending}>
                {deleteProduct.isPending ? "Po fshihet..." : "Konfirmo fshirjen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      <Dialog open={Boolean(openProductId)} onOpenChange={open => { if (!open) closeProductCard(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kartela e Artikullit</DialogTitle>
          </DialogHeader>
          {openedProduct ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-500">Kodi</p><p className="mt-1 text-lg font-semibold">{openedProduct.code || "—"}</p></div>
              <div className="rounded-md border bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-500">Emërtimi</p><p className="mt-1 text-lg font-semibold">{openedProduct.name || "—"}</p></div>
              <div className="rounded-md border p-4"><p className="text-xs font-semibold uppercase text-slate-500">Barkodi</p><p className="mt-1">{openedProduct.barcode || "—"}</p></div>
              <div className="rounded-md border p-4"><p className="text-xs font-semibold uppercase text-slate-500">Njësia</p><p className="mt-1">{openedProduct.baseUnit || "—"}</p></div>
              <div className="rounded-md border p-4"><p className="text-xs font-semibold uppercase text-slate-500">Gjendja</p><p className="mt-1">{openedProduct.stock ?? 0}</p></div>
              <div className="rounded-md border p-4"><p className="text-xs font-semibold uppercase text-slate-500">Çmimi mesatar</p><p className="mt-1">{((openedProduct.avgPrice ?? 0) / 100).toFixed(2)} L</p></div>
            </div>
          ) : <p className="py-6 text-center text-sm text-slate-500">Produkti nuk u gjet në kompaninë aktive.</p>}
        </DialogContent>
      </Dialog>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">{lowStockProducts.length} artikuj me stok të ulët</p>
              <p className="text-sm text-orange-700">Këto artikuj kanë arritur ose janë nën stokun minimal</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card className="rounded-none border-0 shadow-none">
        <CardHeader className="border-b border-[#becbd4] bg-[#edf2f5] py-2">
          <CardTitle className="text-[13px] text-[#294d65]">Lista e Artikujve ({visibleProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {visibleProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nuk ka artikuj të regjistruar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-xs">
                <thead>
                  <tr className="bg-gradient-to-b from-[#e8f0f5] to-[#ccdbe5] text-left text-[#264c66]">
                    <th className="border border-[#aebdc7] px-2 py-1 text-left font-bold"><button type="button" onClick={() => toggleSort("code")} className="inline-flex items-center gap-1 font-bold" aria-label="Rendit sipas Kodit">Kodi {sortLabel("code")}</button></th>
                    <th className="border border-[#aebdc7] px-2 py-1 text-left font-bold"><button type="button" onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 font-bold" aria-label="Rendit sipas Emrit">Emri {sortLabel("name")}</button></th>
                    <th className="border border-[#aebdc7] px-2 py-1 text-left font-bold">Kategoria</th>
                    <th className="border border-[#aebdc7] px-2 py-1 text-left font-bold">Lloji</th>
                    <th className="border border-[#aebdc7] px-2 py-1 text-right font-bold"><button type="button" onClick={() => toggleSort("stock")} className="inline-flex items-center gap-1 font-bold" aria-label="Rendit sipas Stokut">Stoku {sortLabel("stock")}</button></th>
                    <th className="border border-[#aebdc7] px-2 py-1 text-right font-bold">Min. Stok</th>
                    <th className="border border-[#aebdc7] px-2 py-1 text-right font-bold"><button type="button" onClick={() => toggleSort("avgPrice")} className="inline-flex items-center gap-1 font-bold" aria-label="Rendit sipas Çmimit Mesatar">Çmimi Mesatar {sortLabel("avgPrice")}</button></th>
                    <th className="border border-[#aebdc7] px-2 py-1 font-bold">Aksione</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => {
                    const isLowStock = (product.stock ?? 0) <= (product.minStock ?? 0);
                    return (
                      <tr 
                        key={product.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${isLowStock ? 'bg-orange-50' : ''}`}
                      >
                        <td className="py-2 px-2">{product.code}</td>
                        <td className="py-2 px-2 font-medium">{product.name}</td>
                        <td className="py-2 px-2 text-gray-600">{product.categoryId ? "—" : "—"}</td>
                        <td className="py-2 px-2">{product.itemType === "AFATGJATE" ? "Afatgjatë" : product.itemType === "SHERBIM" ? "Shërbim" : "Qarkullues"}</td>
                        <td className="py-2 px-2 text-right">
                          <span className={isLowStock ? "text-orange-600 font-semibold" : ""}>
                            {product.stock ?? 0}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">{product.minStock ?? 0}</td>
                        <td className="py-2 px-2 text-right">{((product.avgPrice ?? 0) / 100).toFixed(2)} L</td>
                        <td className="py-2 px-2 flex gap-2">
                          <button type="button" aria-label={`Edito ${product.name}`} title={`Edito ${product.name}`} data-testid={`edit-product-${product.id}`} className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded border border-slate-200 bg-white shadow-sm transition hover:bg-gray-100 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-400" onClick={() => openEditDialog(product)}>
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button type="button" aria-label={`Fshi ${product.name}`} title={`Fshi ${product.name}`} data-testid={`delete-product-${product.id}`} className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded border border-red-200 bg-white shadow-sm transition hover:bg-red-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-red-400" onClick={() => setDeleteProductId(product.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="border-t border-[#c0ccd4] bg-[#e9eff3] px-3 py-1 text-[11px] text-[#596d7b]">{visibleProducts.length} artikuj të shfaqur · Dy klikime/veprimet hapin formën e artikullit.</div>
    </div>
  );
}
