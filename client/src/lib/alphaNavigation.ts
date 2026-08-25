import { BarChart3, ChartNoAxesCombined, Landmark, ShoppingCart, Truck, Users, WalletCards, Warehouse } from "lucide-react";
import type { ComponentType } from "react";

export type AlphaModuleItem = { id: string; label: string; icon: ComponentType<{ className?: string }>; path: string };

export const alphaModuleItems: AlphaModuleItem[] = [
  { id: "sales", label: "Klientë dhe Shitje", icon: Truck, path: "/" },
  { id: "purchase", label: "Furnitorë dhe Blerje", icon: ShoppingCart, path: "/purchase-invoices" },
  { id: "inventory", label: "Magazina", icon: Warehouse, path: "/inventory" },
  { id: "cash-bank", label: "Arka dhe Banka", icon: WalletCards, path: "/cash" },
  { id: "payroll", label: "Punonjësit", icon: Users, path: "/payroll" },
  { id: "cost", label: "Qendrat e Kostos", icon: BarChart3, path: "/accounting" },
  { id: "accounting", label: "Kontabiliteti", icon: Landmark, path: "/accounting" },
  { id: "analysis", label: "Analizat", icon: ChartNoAxesCombined, path: "/reports" },
];

export function resolveAlphaModule(location: string): AlphaModuleItem {
  return alphaModuleItems.find(item => item.path !== "/" && location.startsWith(item.path)) ?? alphaModuleItems[0];
}
