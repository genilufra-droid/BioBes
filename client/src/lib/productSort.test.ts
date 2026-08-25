import { describe, expect, it } from "vitest";
import { sortProducts } from "./productSort";

describe("sortProducts", () => {
  const products = [
    { id: 1, code: "B", name: "Ferre", stock: 10, avgPrice: 400 },
    { id: 2, code: "A", name: "Ana", stock: -2, avgPrice: 120 },
    { id: 3, code: "C", name: "Murriz", stock: 4, avgPrice: 900 },
  ];

  it("sorton emrin në rritje dhe ruan artikujt e filtruar", () => {
    expect(sortProducts(products, { key: "name", direction: "asc" }).map(item => item.name)).toEqual(["Ana", "Ferre", "Murriz"]);
  });

  it("sorton stokun dhe çmimin në zbritje", () => {
    expect(sortProducts(products, { key: "stock", direction: "desc" }).map(item => item.id)).toEqual([1, 3, 2]);
    expect(sortProducts(products, { key: "avgPrice", direction: "desc" }).map(item => item.id)).toEqual([3, 1, 2]);
  });

  it("nuk ndryshon array-n burimor", () => {
    const input = [...products];
    sortProducts(input, { key: "code", direction: "asc" });
    expect(input.map(item => item.id)).toEqual([1, 2, 3]);
  });
});
