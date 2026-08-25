import { describe, expect, it } from "vitest";
import { hashLocalPassword, isValidLocalBootstrapInput, verifyLocalPassword } from "./_core/localAuth";

describe("local auth password adapter", () => {
  it("hashes and verifies the correct password without storing plaintext", async () => {
    const hash = await hashLocalPassword("test-password");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("test-password");
    await expect(verifyLocalPassword("test-password", hash)).resolves.toBe(true);
    await expect(verifyLocalPassword("wrong-password", hash)).resolves.toBe(false);
  });
});

describe("local auth first-run bootstrap validation", () => {
  it("accepts a valid owner and company payload", () => {
    expect(isValidLocalBootstrapInput({ email: "owner@example.com", password: "correct-horse", name: "Owner", companyName: "Genit sh.p.k." })).toBe(true);
  });

  it("rejects weak or incomplete first-run payloads", () => {
    expect(isValidLocalBootstrapInput({ email: "bad", password: "correct-horse", name: "Owner", companyName: "Company" })).toBe(false);
    expect(isValidLocalBootstrapInput({ email: "owner@example.com", password: "short", name: "Owner", companyName: "Company" })).toBe(false);
    expect(isValidLocalBootstrapInput({ email: "owner@example.com", password: "correct-horse", name: "", companyName: "Company" })).toBe(false);
    expect(isValidLocalBootstrapInput({ email: "owner@example.com", password: "correct-horse", name: "Owner", companyName: "" })).toBe(false);
  });
});
