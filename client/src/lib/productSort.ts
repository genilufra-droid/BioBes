export type ProductSortKey = "code" | "name" | "stock" | "avgPrice";
export type ProductSort = { key: ProductSortKey; direction: "asc" | "desc" };

type SortableProduct = { code?: string | null; name?: string | null; stock?: number | null; avgPrice?: number | null };

export function sortProducts<T extends SortableProduct>(products: T[], sort: ProductSort): T[] {
  return [...products].sort((left, right) => {
    const leftValue = sort.key === "code" || sort.key === "name" ? String(left[sort.key] ?? "").toLocaleLowerCase("sq-AL") : Number(left[sort.key] ?? 0);
    const rightValue = sort.key === "code" || sort.key === "name" ? String(right[sort.key] ?? "").toLocaleLowerCase("sq-AL") : Number(right[sort.key] ?? 0);
    const result = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
    return sort.direction === "asc" ? result : -result;
  });
}
