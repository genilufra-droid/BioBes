import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import type { ReactNode } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompanyProvider, useCompany } from "./contexts/CompanyContext";
import Home from "./pages/Home";
import Accounting from "./pages/Accounting";
import Banks from "./pages/Banks";
import CRM from "./pages/CRM";
import ReportsCenter from "./pages/ReportsCenter";
import Registrations from "./pages/Registrations";
import Settings from "./pages/Settings";
import Partners from "./pages/Partners";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import SalesInvoices from "./pages/SalesInvoices";
import WeightForms from "./pages/WeightForms";
import Agents from "./pages/Agents";
import Vehicles from "./pages/Vehicles";
import CargoLoads from "./pages/CargoLoads";
import Actions from "./pages/Actions";
import Payroll from "./pages/Payroll";
import CreditNotes from "./pages/CreditNotes";
import Cash from "./pages/Cash";
import UsersRoles from "./pages/UsersRoles";
import AdministrativeUnits from "./pages/AdministrativeUnits";
import LiquidityUnits from "./pages/LiquidityUnits";
import MeasurementUnits from "./pages/MeasurementUnits";
import ReferenceCatalog from "./pages/ReferenceCatalog";
import ConfigPricingCatalog from "./pages/ConfigPricingCatalog";
import PostingWindow from "./pages/PostingWindow";
import { getPartnerTabFromSearch } from "./lib/partnerRoute";

function Workspace({ children }: { children: (companyId: number) => ReactNode }) {
  const { companyId, isLoading } = useCompany();
  return <DashboardLayout>{isLoading || !companyId ? <div className="grid min-h-[420px] place-items-center text-sm text-[#777]">Po hapet workspace-i...</div> : children(companyId)}</DashboardLayout>;
}

function Router() {
  return <Switch>
    <Route path="/" component={() => <Workspace>{companyId => <Home companyId={companyId} />}</Workspace>} />
    <Route path="/partners" component={() => <Workspace>{companyId => <Partners companyId={companyId} defaultTab={getPartnerTabFromSearch(window.location.search)} />}</Workspace>} />
    <Route path="/suppliers" component={() => <Workspace>{companyId => <Partners companyId={companyId} defaultTab="suppliers" />}</Workspace>} />
    <Route path="/customers" component={() => <Workspace>{companyId => <Partners companyId={companyId} defaultTab="customers" />}</Workspace>} />
    <Route path="/products" component={() => <Workspace>{companyId => <Products companyId={companyId} />}</Workspace>} />
    <Route path="/inventory" component={() => <Workspace>{companyId => <Inventory companyId={companyId} />}</Workspace>} />
    <Route path="/accounting" component={() => <Workspace>{companyId => <Accounting companyId={companyId} />}</Workspace>} />
    <Route path="/crm" component={() => <Workspace>{companyId => <CRM companyId={companyId} />}</Workspace>} />
    <Route path="/banks" component={() => <Workspace>{companyId => <Banks companyId={companyId} />}</Workspace>} />
    <Route path="/reports" component={() => <Workspace>{companyId => <ReportsCenter companyId={companyId} />}</Workspace>} />
    <Route path="/registrations" component={() => <Workspace>{companyId => <Registrations companyId={companyId} />}</Workspace>} />
    <Route path="/settings" component={() => <Workspace>{companyId => <Settings companyId={companyId} />}</Workspace>} />
    <Route path="/administrative-units" component={() => <Workspace>{companyId => <AdministrativeUnits companyId={companyId} />}</Workspace>} />
    <Route path="/liquidity-units" component={() => <Workspace>{companyId => <LiquidityUnits companyId={companyId} />}</Workspace>} />
    <Route path="/measurement-units" component={() => <Workspace>{companyId => <MeasurementUnits companyId={companyId} />}</Workspace>} />
    <Route path="/reference-catalog" component={() => <Workspace>{companyId => <ReferenceCatalog companyId={companyId} />}</Workspace>} />
    <Route path="/config-pricing" component={() => <Workspace>{companyId => <ConfigPricingCatalog companyId={companyId} />}</Workspace>} />
    <Route path="/posting" component={() => <Workspace>{() => <PostingWindow />}</Workspace>} />
    <Route path="/purchase-invoices" component={() => <Workspace>{companyId => <PurchaseInvoices companyId={companyId} />}</Workspace>} />
    <Route path="/sales-invoices" component={() => <Workspace>{companyId => <SalesInvoices companyId={companyId} />}</Workspace>} />
    <Route path="/weight-forms" component={() => <Workspace>{companyId => <WeightForms companyId={companyId} />}</Workspace>} />
    <Route path="/agents" component={() => <Workspace>{companyId => <Agents companyId={companyId} />}</Workspace>} />
    <Route path="/vehicles" component={() => <Workspace>{companyId => <Vehicles companyId={companyId} />}</Workspace>} />
    <Route path="/cargo-loads" component={() => <Workspace>{companyId => <CargoLoads companyId={companyId} />}</Workspace>} />
    <Route path="/actions" component={() => <Workspace>{companyId => <Actions companyId={companyId} />}</Workspace>} />
    <Route path="/audit-log" component={() => <Workspace>{companyId => <Actions companyId={companyId} title="Audit Log" />}</Workspace>} />
    <Route path="/payroll" component={() => <Workspace>{companyId => <Payroll companyId={companyId} />}</Workspace>} />
    <Route path="/credit-notes" component={() => <Workspace>{companyId => <CreditNotes companyId={companyId} />}</Workspace>} />
    <Route path="/cash" component={() => <Workspace>{companyId => <Cash companyId={companyId} />}</Workspace>} />
    <Route path="/users-roles" component={() => <Workspace>{companyId => <UsersRoles companyId={companyId} />}</Workspace>} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><CompanyProvider><Router /></CompanyProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
