export type LiquidityUsage = {
  statementCount: number;
  transferCount: number;
};

export function resolveLiquidityRemovalMode(usage: LiquidityUsage): "DELETE" | "DEACTIVATE" {
  return usage.statementCount === 0 && usage.transferCount === 0 ? "DELETE" : "DEACTIVATE";
}

export function liquidityRemovalMessage(mode: "DELETE" | "DEACTIVATE", label: string) {
  return mode === "DELETE"
    ? `${label} u fshi sepse nuk ka veprime të regjistruara.`
    : `${label} ka veprime të regjistruara; u çaktivizua dhe ruhet në raporte.`;
}
