export type PartnerTab = "suppliers" | "customers";

export function getPartnerTabFromSearch(search: string, fallback: PartnerTab = "suppliers"): PartnerTab {
  const requested = new URLSearchParams(search).get("type");
  return requested === "customer" || requested === "customers" ? "customers" : requested === "supplier" || requested === "suppliers" ? "suppliers" : fallback;
}
