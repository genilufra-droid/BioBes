import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Configuration menu routing", () => {
  it("routes every non-payroll catalog to its real window", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/DashboardLayout.tsx"), "utf8");
    expect(source).toContain('action === "articles"');
    expect(source).toContain('action === "issuers"');
    expect(source).toContain('reference-catalog?type=cost-centers');
    expect(source).toContain('reference-catalog?type=document-groups');
    expect(source).not.toContain('action === "payroll"');
  });
});
