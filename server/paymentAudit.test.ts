import { describe, expect, it } from "vitest";
import { paymentAuditDetails } from "./paymentAudit";

describe("paymentAuditDetails", () => {
  it("përshkruan krijimin dhe postimin e pagesës për Audit Log", () => {
    expect(paymentAuditDetails("PG-001", "CREATE")).toBe("U krijua pagesa PG-001.");
    expect(paymentAuditDetails("PG-001", "POST")).toBe("U postua pagesa PG-001.");
  });
});
