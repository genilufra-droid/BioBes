import { FormEvent, useState } from "react";
import { trpc } from "@/lib/trpc";

type Props = { onCreated: (companyId: number) => void };
export default function FirstRunSetup({ onCreated }: Props) {
  const [name, setName] = useState(""); const [nipt, setNipt] = useState(""); const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const create = trpc.company.create.useMutation({ onSuccess: async result => { await utils.company.list.invalidate(); onCreated(result.companyId); }, onError: cause => setError(cause.message) });
  function submit(event: FormEvent) { event.preventDefault(); setError(""); create.mutate({ name, nipt: nipt || undefined }); }
  return <main className="grid min-h-[420px] place-items-center bg-[#e8edf1] p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-4 border border-[#aebbc6] bg-white p-6 shadow-sm"><h1 className="text-xl font-bold text-[#294d65]">Konfigurimi i parë</h1><p className="text-sm text-[#607383]">Krijo pronarin dhe kompaninë e parë për të nisur workspace-in.</p><label className="block text-sm text-[#405363]">Emri i kompanisë<input required value={name} onChange={event => setName(event.target.value)} className="mt-1 h-9 w-full border border-[#aebbc6] px-2" /></label><label className="block text-sm text-[#405363]">NIPT (opsional)<input value={nipt} onChange={event => setNipt(event.target.value)} className="mt-1 h-9 w-full border border-[#aebbc6] px-2" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={create.isPending} className="h-9 bg-[#2b6892] px-4 text-sm font-semibold text-white disabled:opacity-60">{create.isPending ? "Po krijohet…" : "Krijo kompaninë"}</button></form></main>;
}
