import { describe, expect, it } from "vitest";
import { calculatePurchaseOrderCargoWeightKg, canCancelCargoLoad, canDeleteCargoLoadDraft, shouldCreateCargoLoad } from "./transportActions";

describe("veprimet e ngarkesave", () => {
  it("lejon anulimin para dorëzimit dhe e bllokon pas dorëzimit", () => {
    expect(canCancelCargoLoad("DRAFT")).toBe(true);
    expect(canCancelCargoLoad("IN_TRANSIT")).toBe(true);
    expect(canCancelCargoLoad("DELIVERED")).toBe(false);
    expect(canCancelCargoLoad("CANCELLED")).toBe(false);
  });

  it("lejon fshirjen vetëm për ngarkesat Draft", () => {
    expect(canDeleteCargoLoadDraft("DRAFT")).toBe(true);
    expect(canDeleteCargoLoadDraft("ASSIGNED")).toBe(false);
    expect(canDeleteCargoLoadDraft("IN_TRANSIT")).toBe(false);
  });

  it("krijon vetëm një ngarkesë për një porosi të kaluar në Ngarkuar", () => {
    expect(shouldCreateCargoLoad([], " PO-17 ")).toBe(true);
    expect(shouldCreateCargoLoad(["po-17"], "PO-17")).toBe(false);
    expect(shouldCreateCargoLoad(["PO-18"], "PO-17")).toBe(true);
  });

  it("llogarit peshën e ngarkesës nga neto, bruto ose sasitë rezervë", () => {
    expect(calculatePurchaseOrderCargoWeightKg([{ netWeightKg: 120 }, { grossWeightKg: 80 }, { loadedQuantity: 5 }, { quantity: 3 }])).toBe(208);
  });
});
