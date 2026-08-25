import { describe, expect, it } from "vitest";
import { canCancelInventoryDocument, canDeleteInventoryDraft, canTransferBetweenWarehouses, canValidateInventoryDocument, calculateInventoryDifference, hasWarehouseSelection, validateRequiredWarehouseId } from "./inventory";

describe("inventory workflow helpers", () => {
  it("permits validation only for draft stock documents", () => {
    expect(canValidateInventoryDocument("DRAFT")).toBe(true);
    expect(canValidateInventoryDocument("VALIDATED")).toBe(false);
    expect(canValidateInventoryDocument("CANCELLED")).toBe(false);
  });

  it("allows destructive actions only for draft stock documents", () => {
    expect(canCancelInventoryDocument("DRAFT")).toBe(true);
    expect(canCancelInventoryDocument("VALIDATED")).toBe(false);
    expect(canCancelInventoryDocument("CANCELLED")).toBe(false);
    expect(canDeleteInventoryDraft("DRAFT")).toBe(true);
    expect(canDeleteInventoryDraft("VALIDATED")).toBe(false);
  });

  it("requires a valid warehouse selection", () => {
    expect(hasWarehouseSelection(1)).toBe(true);
    expect(hasWarehouseSelection(0)).toBe(false);
    expect(hasWarehouseSelection(null)).toBe(false);
    expect(hasWarehouseSelection(undefined)).toBe(false);
    expect(hasWarehouseSelection(1.5)).toBe(false);
  });

  it("rejects invoices without a required warehouse id", () => {
    expect(validateRequiredWarehouseId(7)).toBe(7);
    expect(() => validateRequiredWarehouseId(undefined)).toThrow("Zgjidhni një magazinë");
    expect(() => validateRequiredWarehouseId(null)).toThrow("Zgjidhni një magazinë");
    expect(() => validateRequiredWarehouseId(0)).toThrow("Zgjidhni një magazinë");
  });

  it("requires distinct source and destination warehouses", () => {
    expect(canTransferBetweenWarehouses(1, 2)).toBe(true);
    expect(canTransferBetweenWarehouses(1, 1)).toBe(false);
    expect(canTransferBetweenWarehouses(0, 2)).toBe(false);
  });

  it("calculates inventory corrections from the counted quantity", () => {
    expect(calculateInventoryDifference(10, 13)).toBe(3);
    expect(calculateInventoryDifference(10, 7)).toBe(-3);
    expect(calculateInventoryDifference(10, 10)).toBe(0);
  });
});
