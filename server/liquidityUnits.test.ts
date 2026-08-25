import { describe, expect, it } from "vitest";
import { liquidityRemovalMessage, resolveLiquidityRemovalMode } from "./liquidityUnits";

describe("liquidity unit removal", () => {
  it("deletes only an unused cash or bank unit", () => {
    expect(resolveLiquidityRemovalMode({ statementCount: 0, transferCount: 0 })).toBe("DELETE");
  });

  it("deactivates a unit referenced by accounting operations", () => {
    expect(resolveLiquidityRemovalMode({ statementCount: 1, transferCount: 0 })).toBe("DEACTIVATE");
    expect(resolveLiquidityRemovalMode({ statementCount: 0, transferCount: 2 })).toBe("DEACTIVATE");
    expect(liquidityRemovalMessage("DEACTIVATE", "BKT EUR")).toContain("çaktivizua");
  });
});
