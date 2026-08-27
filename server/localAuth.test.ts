import { describe, expect, it } from "vitest";
import { consumeLocalAuthRateLimit, hashLocalPassword, hasValidSetupSecret, isValidLocalBootstrapInput, verifyLocalPassword } from "./_core/localAuth";
import { ENV } from "./_core/env";
import { getAffectedRowCount } from "./db";

describe("local auth password adapter", () => {
  it("hashes and verifies the correct password without storing plaintext", async () => {
    const hash = await hashLocalPassword("test-password");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("test-password");
    await expect(verifyLocalPassword("test-password", hash)).resolves.toBe(true);
    await expect(verifyLocalPassword("wrong-password", hash)).resolves.toBe(false);
  });
});

describe("local owner activation database result", () => {
  it("accepts both mysql result header shapes", () => {
    expect(getAffectedRowCount({ affectedRows: 1 })).toBe(1);
    expect(getAffectedRowCount([{ affectedRows: 1 }])).toBe(1);
    expect(getAffectedRowCount({ rowsAffected: 1 })).toBe(1);
    expect(getAffectedRowCount([])).toBe(0);
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

  it("requires the configured setup secret and compares it without plaintext equality", () => {
    const setupSecret = "setup-secret-with-at-least-32-characters";
    expect(hasValidSetupSecret(setupSecret, setupSecret)).toBe(true);
    expect(hasValidSetupSecret("wrong-secret", setupSecret)).toBe(false);
    expect(hasValidSetupSecret(undefined, setupSecret)).toBe(false);
    expect(hasValidSetupSecret("setup-secret", "")).toBe(false);
    expect(hasValidSetupSecret("setup-secret", "too-short-secret")).toBe(false);
  });

  it("limits repeated attempts and resets after the window", () => {
    const key = `local-auth-test-${Date.now()}`;
    for (let index = 0; index < 10; index += 1) expect(consumeLocalAuthRateLimit(key, 1_000)).toBe(true);
    expect(consumeLocalAuthRateLimit(key, 1_000)).toBe(false);
    expect(consumeLocalAuthRateLimit(key, 1_000 + 15 * 60 * 1000)).toBe(true);
  });

  it("validates the configured setup secret when supplied by the runtime", () => {
    if (!ENV.localAuthSetupSecret) return;
    expect(hasValidSetupSecret(ENV.localAuthSetupSecret, ENV.localAuthSetupSecret)).toBe(true);
  });
});
