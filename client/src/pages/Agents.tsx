import { useMemo, useState } from "react";
import { Plus, Search, Truck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Agents({ companyId }: { companyId: number }) {
  const utils = trpc.useUtils();
  const { data: agents = [], isLoading } = trpc.agent.list.useQuery({ companyId });
  const createAgent = trpc.agent.create.useMutation({ onSuccess: () => utils.agent.list.invalidate({ companyId }) });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const visibleAgents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("sq-AL");
    return query ? agents.filter(agent => [agent.name, agent.code, agent.phone, agent.licenseNumber].some(value => value?.toLocaleLowerCase("sq-AL").includes(query))) : agents;
  }, [agents, search]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createAgent.mutateAsync({ companyId, code: String(form.get("code") || "").trim() || undefined, name: String(form.get("name") || "").trim(), phone: String(form.get("phone") || "").trim() || undefined, licenseNumber: String(form.get("licenseNumber") || "").trim() || undefined });
      toast.success("Shoferi u ruajt.");
      setOpen(false);
      event.currentTarget.reset();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Shoferi nuk u ruajt."); }
  };

  return <div className="space-y-4"><div className="flex flex-col gap-3 border-b border-[#ded8df] pb-4 md:flex-row md:items-center md:justify-between"><div><div className="mb-1 text-xs font-medium text-[#777]">Transport / Shoferë</div><h1 className="text-xl font-semibold text-[#332d33]">Shoferë</h1></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative min-w-[260px]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#777]" /><Input value={search} onChange={event => setSearch(event.target.value)} className="h-9 bg-white pl-9" placeholder="Kërko emër, kod, telefon…" /></div><Button onClick={() => setOpen(true)} className="h-9 bg-[#714b67] text-white hover:bg-[#5f3d58]"><Plus className="mr-1.5 h-4 w-4" />Shto shofer</Button></div></div><div className="flex items-center gap-2 text-sm text-[#777]"><UserRound className="h-4 w-4 text-[#714b67]" /><span>{agents.length} shoferë të regjistruar</span></div><div className="overflow-hidden rounded-md border border-[#ded8df] bg-white"><table className="w-full text-sm"><thead className="bg-[#f8f7f8] text-left text-xs font-semibold uppercase tracking-wide text-[#625c62]"><tr><th className="px-4 py-3">Kodi</th><th className="px-4 py-3">Shoferi</th><th className="px-4 py-3">Telefoni</th><th className="px-4 py-3">Patenta</th><th className="px-4 py-3">Statusi</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-[#777]">Po ngarkohen shoferët…</td></tr> : visibleAgents.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center"><Truck className="mx-auto mb-2 h-7 w-7 text-[#a39ca3]" /><p className="text-[#777]">Nuk u gjet asnjë shofer.</p><Button variant="link" onClick={() => setOpen(true)} className="mt-1 h-auto p-0 text-[#714b67]">+ Shto shofer</Button></td></tr> : visibleAgents.map(agent => <tr key={agent.id} className="border-t border-[#eee9ee] hover:bg-[#fcf9fc]"><td className="px-4 py-3 text-[#625c62]">{agent.code || "—"}</td><td className="px-4 py-3 font-medium text-[#332d33]">{agent.name}</td><td className="px-4 py-3 text-[#625c62]">{agent.phone || "—"}</td><td className="px-4 py-3 text-[#625c62]">{agent.licenseNumber || "—"}</td><td className="px-4 py-3"><span className="rounded bg-[#eaf5ee] px-2 py-1 text-xs font-medium text-[#28713e]">Aktiv</span></td></tr>)}</tbody></table></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Shto shofer të ri</DialogTitle><DialogDescription>Regjistro të dhënat e identifikimit dhe kontaktit për shoferin.</DialogDescription></DialogHeader><form onSubmit={save} className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="agent-code">Kodi</Label><Input id="agent-code" name="code" placeholder="SH-001" /></div><div><Label htmlFor="agent-name">Emri dhe mbiemri *</Label><Input id="agent-name" name="name" required placeholder="Emri i shoferit" /></div><div><Label htmlFor="agent-phone">Telefoni</Label><Input id="agent-phone" name="phone" placeholder="+355…" /></div><div><Label htmlFor="agent-license">Nr. i patentës</Label><Input id="agent-license" name="licenseNumber" placeholder="AL-123456" /></div></div><div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Anulo</Button><Button type="submit" className="bg-[#714b67] text-white hover:bg-[#5f3d58]" disabled={createAgent.isPending}>{createAgent.isPending ? "Po ruhet…" : "Ruaj shoferin"}</Button></div></form></DialogContent></Dialog></div>;
}
