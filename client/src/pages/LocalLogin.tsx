import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { KeyRound, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";

export type LocalAccountMode = "login" | "register" | "activate" | "help" | "change";

const modeTitles: Record<LocalAccountMode, { title: string; subtitle: string }> = {
  login: { title: "Hyr në sistem", subtitle: "Përdor emailin dhe fjalëkalimin e llogarisë lokale." },
  register: { title: "Hap llogari të re", subtitle: "Llogaria e re krijon vetëm ndërmarrjen tuaj dhe nuk merr të dhëna nga kompanitë ekzistuese." },
  activate: { title: "Aktivizo llogarinë ekzistuese", subtitle: "Cakto fjalëkalimin e parë lokal për llogarinë e pronarit." },
  help: { title: "Ndihmë për fjalëkalimin", subtitle: "Rivendosja me email nuk aktivizohet pa një kanal të verifikuar dërgimi." },
  change: { title: "Ndrysho fjalëkalimin", subtitle: "Për siguri, konfirmo fillimisht fjalëkalimin aktual." },
};

function Input({ label, type = "text", value, onChange, required = true, autoComplete, hint }: { label: string; type?: string; value: string; onChange: (value: string) => void; required?: boolean; autoComplete?: string; hint?: string }) {
  return <label className="block text-sm font-medium text-[#405363]">{label}<input required={required} type={type} value={value} autoComplete={autoComplete} onChange={event => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-sm border border-[#aebbc6] bg-white px-2.5 text-[#263b4b] outline-none transition focus:border-[#2b78b5] focus:ring-2 focus:ring-[#b9d9ef]" />{hint && <span className="mt-1 block text-[11px] font-normal leading-4 text-[#667684]">{hint}</span>}</label>;
}

export default function LocalLogin({ initialMode = "login" }: { initialMode?: LocalAccountMode }) {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<LocalAccountMode>(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nipt, setNipt] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const content = useMemo(() => modeTitles[mode], [mode]);

  useEffect(() => { setMode(initialMode); setMessage(""); setError(""); }, [initialMode]);

  function go(nextMode: LocalAccountMode, path: string) { setMode(nextMode); setMessage(""); setError(""); navigate(path); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(""); setError("");
    if ((mode === "register" || mode === "activate" || mode === "change") && password !== passwordConfirmation) { setError("Konfirmimi i fjalëkalimit nuk përputhet."); return; }
    setPending(true);
    try {
      if (mode === "help") { setMessage("Për të mbrojtur llogaritë, reset-i me email nuk dërgon lidhje pa konfigurim të shërbimit të emailit. Nëse mund të hyni, përdorni “Ndrysho fjalëkalimin”. Për aktivizimin e parë të pronarit përdorni sekretin e setup-it."); return; }
      const endpoint = mode === "login" ? "/api/local-auth/login" : mode === "register" ? "/api/local-auth/register" : mode === "activate" ? "/api/local-auth/activate-existing-owner" : "/api/local-auth/change-password";
      const body = mode === "login" ? { email, password } : mode === "register" ? { email, name, companyName, nipt, password } : mode === "activate" ? { email, password } : { currentPassword, newPassword: password };
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (mode === "activate") headers["x-local-auth-setup-secret"] = setupSecret;
      const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Veprimi dështoi");
      if (mode === "register") { setMessage(result.message ?? "Nëse emaili është i disponueshëm, llogaria është krijuar. Tani hyni me kredencialet tuaja."); setPassword(""); setPasswordConfirmation(""); return; }
      if (mode === "change") { setMessage("Fjalëkalimi u ndryshua. Sesioni lokal u rinovua."); setCurrentPassword(""); setPassword(""); setPasswordConfirmation(""); return; }
      navigate("/");
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Veprimi dështoi"); }
    finally { setPending(false); }
  }

  const showPassword = mode === "login" || mode === "register" || mode === "activate" || mode === "change";
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dcecf7,_#e8edf1_45%,_#dce5eb)] px-4 py-8 sm:py-14"><section className="mx-auto grid w-full max-w-4xl overflow-hidden border border-[#9dafbc] bg-white shadow-[0_16px_45px_rgba(41,77,101,0.19)] md:grid-cols-[0.9fr_1.1fr]"><aside className="bg-[#244f6d] p-7 text-white sm:p-10"><div className="flex h-10 w-10 items-center justify-center border border-white/45 bg-white/10 text-sm font-black">SG</div><h1 className="mt-7 text-2xl font-bold tracking-tight">Sistemi Genit Cloud</h1><p className="mt-3 max-w-xs text-sm leading-6 text-[#dbeaf4]">Ambient biznesi me llogari lokale, role dhe ndarje të sigurt sipas kompanisë.</p><div className="mt-10 space-y-4 text-xs text-[#dbeaf4]"><p className="flex gap-3"><ShieldCheck className="h-4 w-4 shrink-0 text-[#8fd0f5]" />Fjalëkalimet ruhen vetëm si hash të sigurt në server.</p><p className="flex gap-3"><UserPlus className="h-4 w-4 shrink-0 text-[#8fd0f5]" />Llogaria e re fillon me ndërmarrjen e vet, jo me të dhënat tuaja ekzistuese.</p><p className="flex gap-3"><KeyRound className="h-4 w-4 shrink-0 text-[#8fd0f5]" />Hyrja e zakonshme nuk kërkon llogari Manus.</p></div></aside><div className="p-6 sm:p-10"><div className="mb-6 flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-[#294d65]">{content.title}</h2><p className="mt-1 max-w-md text-sm leading-5 text-[#607383]">{content.subtitle}</p></div><LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[#2b6892]" /></div><form onSubmit={submit} className="space-y-4">{(mode === "login" || mode === "register" || mode === "activate") && <Input label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />}{mode === "register" && <><Input label="Emër dhe mbiemër" value={name} onChange={setName} autoComplete="name" /><Input label="Emri i ndërmarrjes" value={companyName} onChange={setCompanyName} autoComplete="organization" /><Input label="NIPT" value={nipt} onChange={setNipt} required={false} /></>}{mode === "activate" && <Input label="Sekreti i setup-it" type="password" value={setupSecret} onChange={setSetupSecret} autoComplete="off" hint="Përdoret vetëm një herë për të aktivizuar pronarin ekzistues." />}{mode === "change" && <Input label="Fjalëkalimi aktual" type="password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />}{showPassword && <Input label={mode === "change" ? "Fjalëkalimi i ri" : "Fjalëkalimi"} type="password" value={password} onChange={setPassword} autoComplete={mode === "login" ? "current-password" : "new-password"} hint={mode === "login" ? undefined : "Të paktën 12 karaktere."} />}{(mode === "register" || mode === "activate" || mode === "change") && <Input label="Konfirmo fjalëkalimin" type="password" value={passwordConfirmation} onChange={setPasswordConfirmation} autoComplete="new-password" />}{message && <p role="status" className="border border-[#b8d9c0] bg-[#f1faf3] px-3 py-2 text-sm leading-5 text-[#28603a]">{message}</p>}{error && <p role="alert" className="border border-[#e5b7b4] bg-[#fff4f3] px-3 py-2 text-sm text-[#a82f28]">{error}</p>}<button disabled={pending} className="h-10 w-full rounded-sm bg-[#2b6892] text-sm font-semibold text-white transition hover:bg-[#205474] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Po përpunohet…" : mode === "login" ? "Hyr" : mode === "register" ? "Krijo llogarinë" : mode === "activate" ? "Aktivizo dhe hyr" : mode === "change" ? "Ruaj fjalëkalimin" : "Lexo udhëzimin"}</button></form><div className="mt-6 border-t border-[#d5dfe6] pt-4 text-sm text-[#526a7b]">{mode === "login" && <p>Nuk keni llogari? <button onClick={() => go("register", "/register")} className="font-semibold text-[#226896] hover:underline">Hapni llogari të re</button></p>}{mode === "login" && <p className="mt-2">Nuk keni ende fjalëkalim lokal? <button onClick={() => go("activate", "/activate-local-account")} className="font-semibold text-[#226896] hover:underline">Aktivizo llogarinë ekzistuese</button></p>}{mode === "login" && <p className="mt-2"><button onClick={() => go("help", "/forgot-password")} className="font-semibold text-[#226896] hover:underline">Ndihmë për fjalëkalimin</button></p>}{mode !== "login" && mode !== "change" && <p>Keni llogari? <button onClick={() => go("login", "/login")} className="font-semibold text-[#226896] hover:underline">Kthehu te hyrja</button></p>}{mode === "change" && <p><button onClick={() => go("login", "/login")} className="font-semibold text-[#226896] hover:underline">Kthehu te hyrja</button></p>}</div></div></section></main>;
}
