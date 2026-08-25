import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type CompanyOption = { id: number; name: string };
type CompanyContextValue = { companyId: number | null; companies: CompanyOption[]; selectCompany: (companyId: number) => void; isLoading: boolean };

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: rawCompanies = [], isLoading } = trpc.company.list.useQuery(undefined, { enabled: Boolean(user) });
  const companies = useMemo(() => rawCompanies.filter((company): company is NonNullable<typeof company> => company !== undefined).map(company => ({ id: company.id, name: company.name })), [rawCompanies]);
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    if (!companies.length) return;
    const saved = Number(window.localStorage.getItem("genit-active-company"));
    setCompanyId(current => current && companies.some(company => company.id === current) ? current : companies.some(company => company.id === saved) ? saved : companies[0].id);
  }, [companies]);

  const selectCompany = (nextCompanyId: number) => {
    setCompanyId(nextCompanyId);
    window.localStorage.setItem("genit-active-company", String(nextCompanyId));
  };

  return <CompanyContext.Provider value={{ companyId, companies, selectCompany, isLoading }}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error("useCompany duhet të përdoret brenda CompanyProvider.");
  return context;
}
