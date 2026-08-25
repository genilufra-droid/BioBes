import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCompany } from "@/contexts/CompanyContext";
import SourceDocumentLink from "@/components/SourceDocumentLink";
import { ArrowRight, BarChart3, ClipboardList, FileText, Mail, PackageCheck, ReceiptText, RotateCcw, Settings, ShoppingCart, Truck, Users, WalletCards } from "lucide-react";

const money = (value: number, currency = "ALL") => `${(value / 100).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
const dateText = (value: Date | string) => new Date(value).toLocaleDateString("sq-AL");

export default function Home(_props?: { companyId?: number }) {
  const { user, loading } = useAuth();
  const { companyId, companies, isLoading } = useCompany();
  if (loading || !user || isLoading || !companyId) return <div className="grid min-h-[360px] place-items-center text-sm text-[#5e7180]">Po hapet kompania...</div>;
  const companyName = companies.find(company => company.id === companyId)?.name || "Kompania aktive";
  return <AlphaMainDashboard companyId={companyId} companyName={companyName} />;
}

function AlphaMainDashboard({ companyId, companyName }: { companyId: number; companyName: string }) {
  const [, setLocation] = useLocation();
  const { data: salesInvoices = [] } = trpc.salesInvoice.list.useQuery({ companyId });
  const { data: customers = [] } = trpc.customer.list.useQuery({ companyId });
  const [partner, setPartner] = useState("");
  const [currency, setCurrency] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const filteredSales = useMemo(() => salesInvoices.filter(invoice => {
    const matchesPartner = !partner || `${invoice.customerName || ""} ${invoice.docNumber}`.toLocaleLowerCase("sq-AL").includes(partner.toLocaleLowerCase("sq-AL"));
    const matchesCurrency = currency === "ALL" || invoice.currency === currency;
    const timestamp = new Date(invoice.date).getTime();
    const matchesFrom = !from || timestamp >= new Date(`${from}T00:00:00`).getTime();
    const matchesTo = !to || timestamp <= new Date(`${to}T23:59:59`).getTime();
    const matchesValue = !value || String(Math.round((invoice.totalAmount || 0) / 100)).includes(value);
    return matchesPartner && matchesCurrency && matchesFrom && matchesTo && matchesValue;
  }), [salesInvoices, partner, currency, from, to, value]);
  const months = useMemo(() => {
    const result = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("sq-AL", { month: "short" }), amount: 0 };
    });
    salesInvoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const record = result.find(item => item.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (record) record.amount += invoice.totalAmount || 0;
    });
    return result;
  }, [salesInvoices]);
  const maxMonthAmount = Math.max(1, ...months.map(item => item.amount));
  const totalSales = filteredSales.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  const processes = [
    { label: "Klientë", icon: Users, path: "/customers", tone: "#2a78a9" },
    { label: "Shitje", icon: ReceiptText, path: "/sales-invoices", tone: "#348a55" },
    { label: "Veprime Klientë", icon: WalletCards, path: "/cash", tone: "#9a6f2e" },
    { label: "Shitje Analitike", icon: BarChart3, path: "/reports", tone: "#75619b" },
  ];

  return <div className="alpha-main-dashboard">
    <section className="alpha-main-title"><div><p>ALPHA BUSINESS / KLIENTË DHE SHITJE</p><h1>Ambienti kryesor i shitjeve</h1></div><div className="alpha-company-chip"><span>Ndërmarrja aktive</span><b>{companyName}</b></div></section>
    <div className="alpha-dashboard-grid">
      <section className="alpha-process-panel">
        <div className="alpha-panel-heading"><span>Procesi i punës</span><small>Klientë dhe Shitje</small></div>
        <div className="alpha-process-map">
          <div className="alpha-process-row">{processes.map((step, index) => { const Icon = step.icon; return <div className="contents" key={step.label}><button onClick={() => setLocation(step.path)} className="alpha-process-node"><span style={{ background: step.tone }}><Icon className="h-6 w-6" /></span><b>{step.label}</b></button>{index < processes.length - 1 && <ArrowRight className="alpha-process-arrow" />}</div>; })}</div>
          <div className="alpha-process-subrow"><AlphaShortcut icon={RotateCcw} label="Kthim Shitje" onClick={() => setLocation("/sales-invoices?tab=returns")} /><ArrowRight className="alpha-process-arrow" /><AlphaShortcut icon={PackageCheck} label="Dërgesa" onClick={() => setLocation("/sales-invoices?tab=deliveries")} /><ArrowRight className="alpha-process-arrow" /><AlphaShortcut icon={Mail} label="Dërgesa E-mail" onClick={() => setLocation("/crm")} /><ArrowRight className="alpha-process-arrow" /><AlphaShortcut icon={WalletCards} label="Arkëtime" onClick={() => setLocation("/cash")} /></div>
          <div className="alpha-process-footer"><button onClick={() => setLocation("/settings")}><Settings className="h-4 w-4" />Konfigurime</button><button onClick={() => setLocation("/reports")}><FileText className="h-4 w-4" />Raporte</button><button onClick={() => setLocation("/purchase-invoices")}><ShoppingCart className="h-4 w-4" />Furnitorë dhe Blerje</button></div>
        </div>
      </section>
      <section className="alpha-register-panel">
        <div className="alpha-panel-heading"><span>Dokumentet e shitjes</span><small>{filteredSales.length} dokumente</small></div>
        <div className="alpha-filter-strip"><label>Partnerë<input value={partner} onChange={event => setPartner(event.target.value)} placeholder="Klient / dokument" /></label><label>Nga data<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label><label>Deri më<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label><label>Monedha<select value={currency} onChange={event => setCurrency(event.target.value)}><option value="ALL">Të gjitha</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></label><label>Vlera<input value={value} onChange={event => setValue(event.target.value)} placeholder="Vlerë" /></label><button type="button" onClick={() => { setPartner(""); setCurrency("ALL"); setFrom(""); setTo(""); setValue(""); }}>Pastro</button></div>
        <div className="alpha-register-table-wrap"><table className="alpha-register-table"><thead><tr><th>Nr.</th><th>Data</th><th>Dok.</th><th>Partneri</th><th>Lloji</th><th>Klienti</th><th>Monedha</th><th>Vlera</th><th>Statusi</th></tr></thead><tbody>{filteredSales.slice(0, 18).map((invoice, index) => <tr key={invoice.id}><td>{index + 1}</td><td>{dateText(invoice.date)}</td><td><SourceDocumentLink label={invoice.docNumber} onOpen={() => setLocation(`/sales-invoices?openInvoice=${invoice.id}`)} ariaLabel={`Hap faturën ${invoice.docNumber}`} /></td><td>{invoice.customerName || "—"}</td><td>{invoice.invoiceFormat === "EXPORT" ? "Eksport" : "Faturë Shitje"}</td><td>{invoice.customerName || "—"}</td><td>{invoice.currency || "ALL"}</td><td className="text-right">{money(invoice.totalAmount || 0, invoice.currency || "ALL")}</td><td>{invoice.status || "DRAFT"}</td></tr>)}{filteredSales.length === 0 && <tr><td colSpan={9} className="alpha-empty">Nuk ka dokumente për filtrat e zgjedhur.</td></tr>}</tbody><tfoot><tr><td colSpan={7}>TOTALI I DOKUMENTEVE</td><td className="text-right">{money(totalSales)}</td><td>{filteredSales.length}</td></tr></tfoot></table></div>
      </section>
    </div>
    <div className="alpha-dashboard-bottom">
      <section className="alpha-quick-reports"><div className="alpha-panel-heading"><span>Raporte</span><small>Kërkesa të shpejta</small></div><div className="alpha-report-list"><button onClick={() => setLocation("/reports?module=sales&report=sales_book")}>LIBRI I SHITJEVE</button><button onClick={() => setLocation("/reports?module=sales&report=sales_customers")}>AFATET E PAGESAVE</button><button onClick={() => setLocation("/reports?module=sales&report=sales_products")}>SHITJET SIPAS ARTIKUJVE</button><button onClick={() => setLocation("/reports?module=sales&report=sales_customer_card")}>SITUACIONI I KLIENTËVE</button><button onClick={() => setLocation("/reports?module=inventory")}>ARTIKUJT E SHITUR</button></div></section>
      <section className="alpha-chart-panel"><div className="alpha-panel-heading"><span>Shitje sipas muajve (pa TVSH)</span><small>Faturat reale</small></div><div className="alpha-bars">{months.map(month => <div className="alpha-bar-column" key={month.key}><span className="alpha-bar-value">{month.amount ? Math.round(month.amount / 100).toLocaleString("sq-AL") : ""}</span><div className="alpha-bar-track"><div className="alpha-bar" style={{ height: `${Math.max(month.amount ? 9 : 0, Math.round((month.amount / maxMonthAmount) * 100))}%` }} /></div><span>{month.label}</span></div>)}</div></section>
    </div>
  </div>;
}

function AlphaShortcut({ icon: Icon, label, onClick }: { icon: typeof Truck; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="alpha-process-small"><span><Icon className="h-4 w-4" /></span>{label}</button>;
}
