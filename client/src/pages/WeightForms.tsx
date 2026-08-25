import { useState } from "react";
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
import { Plus, Eye, Edit2, Trash2, Scale } from "lucide-react";
import EntityLiveSearch from "@/components/EntityLiveSearch";
import ProductLiveSearch from "@/components/ProductLiveSearch";
import SourceDocumentLink from "@/components/SourceDocumentLink";

export default function WeightForms({ companyId }: { companyId: number }) {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<{ productId?: number; productName: string; unit: string; unitPrice: number }>({ productName: "", unit: "copë", unitPrice: 0 });

  // Fetch data
  const { data: forms } = trpc.weightForm.list.useQuery({ companyId });
  const { data: suppliers } = trpc.supplier.list.useQuery({ companyId });
  const { data: products } = trpc.product.list.useQuery({ companyId });

  // Mutations
  const createForm = trpc.weightForm.create.useMutation();

  const handleAddForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createForm.mutateAsync({
      companyId,
      docNumber: formData.get("docNumber") as string,
      date: new Date(formData.get("date") as string),
      supplierId: formData.get("supplierId") ? parseInt(formData.get("supplierId") as string) : undefined,
      productId: formData.get("productId") ? parseInt(formData.get("productId") as string) : undefined,
    });

    setNewFormOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700",
      POSTED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">⚖️ Formularet e Peshave</h1>
          <p className="text-gray-600 text-sm mt-1">Menaxhim i dokumenteve të peshimit</p>
        </div>
        <Dialog open={newFormOpen} onOpenChange={setNewFormOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Formular i Ri
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Krijo Formular Peshe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nr. Dokumentit *</label>
                <Input name="docNumber" placeholder="PES-2024-001" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data *</label>
                <Input name="date" type="date" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Furnitori</label>
                <EntityLiveSearch idName="supplierId" nameName="supplierName" items={suppliers ?? []} placeholder="Kërko ose shto furnitorin..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Artikulli</label>
                <ProductLiveSearch companyId={companyId} products={products ?? []} value={selectedProduct} onSelect={setSelectedProduct} inputName="productId" />
              </div>
              <Button type="submit" className="w-full" disabled={createForm.isPending}>
                {createForm.isPending ? "Po ruhet..." : "Krijo Formularin"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Draftet"
          value={`${forms?.filter(f => f.status === "DRAFT").length || 0}`}
          color="gray"
        />
        <SummaryCard
          label="Të Postuar"
          value={`${forms?.filter(f => f.status === "POSTED").length || 0}`}
          color="green"
        />
        <SummaryCard
          label="Anuluar"
          value={`${forms?.filter(f => f.status === "CANCELLED").length || 0}`}
          color="red"
        />
      </div>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex gap-2">
            <Scale className="w-5 h-5" />
            Lista e Formulareve ({forms?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!forms || forms.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nuk ka formulare të regjistruara.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-semibold">Nr. Dokumentit</th>
                    <th className="text-left py-2 px-2 font-semibold">Data</th>
                    <th className="text-left py-2 px-2 font-semibold">Furnitori</th>
                    <th className="text-left py-2 px-2 font-semibold">Artikulli</th>
                    <th className="text-left py-2 px-2 font-semibold text-right">Peshë Bruto</th>
                    <th className="text-left py-2 px-2 font-semibold">Statusi</th>
                    <th className="text-left py-2 px-2 font-semibold">Aksione</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium"><SourceDocumentLink label={form.docNumber} onOpen={() => setSelectedForm(form)} ariaLabel={`Hap formularin ${form.docNumber}`} /></td>
                      <td className="py-2 px-2">{new Date(form.date as any).toLocaleDateString('sq-AL')}</td>
                      <td className="py-2 px-2">{form.supplierName || "—"}</td>
                      <td className="py-2 px-2">{form.productName || "—"}</td>
                      <td className="py-2 px-2 text-right">{(form.grossWeightTotal ?? 0) / 1000} kg</td>
                      <td className="py-2 px-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadge(form.status || 'DRAFT')}`}>
                          {form.status || 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-2 px-2 flex gap-2">
                        <button type="button" onClick={() => setSelectedForm(form)} className="p-1 hover:bg-gray-100 rounded" title="Shiko" aria-label={`Shiko formularin ${form.docNumber}`}>
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Redakto">
                          <Edit2 className="w-4 h-4 text-orange-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Fshi">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
      <Dialog open={Boolean(selectedForm)} onOpenChange={open => { if (!open) setSelectedForm(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Formular peshe — {selectedForm?.docNumber ?? ""}</DialogTitle></DialogHeader>
          {selectedForm && <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="Data" value={new Date(selectedForm.date).toLocaleDateString("sq-AL")} />
            <Detail label="Furnitori" value={selectedForm.supplierName || "—"} />
            <Detail label="Artikulli" value={selectedForm.productName || "—"} />
            <Detail label="Peshë bruto" value={`${((selectedForm.grossWeightTotal ?? 0) / 1000).toLocaleString("sq-AL")} kg`} />
            <Detail label="Statusi" value={selectedForm.status || "DRAFT"} />
          </div>}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border bg-slate-50 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    gray: "border-l-gray-400 bg-gray-50",
    green: "border-l-green-600 bg-green-50",
    red: "border-l-red-600 bg-red-50",
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
