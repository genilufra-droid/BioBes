import { FormEvent, useState } from "react";
import { useLocation } from "wouter";

export default function LocalLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const response = await fetch("/api/local-auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error ?? "Hyrja dështoi"); }
      navigate("/"); window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Hyrja dështoi"); }
    finally { setPending(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-[#e8edf1] p-4"><form onSubmit={submit} className="w-full max-w-sm space-y-4 border border-[#aebbc6] bg-white p-6 shadow-sm"><div><h1 className="text-lg font-bold text-[#294d65]">Sistemi Genit Cloud</h1><p className="mt-1 text-sm text-[#607383]">Hyrje self-hosted</p></div><label className="block text-sm text-[#405363]">Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 h-9 w-full border border-[#aebbc6] px-2" /></label><label className="block text-sm text-[#405363]">Password<input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 h-9 w-full border border-[#aebbc6] px-2" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={pending} className="h-9 w-full bg-[#2b6892] text-sm font-semibold text-white disabled:opacity-60">{pending ? "Po kontrollohet…" : "Hyr"}</button></form></main>;
}
