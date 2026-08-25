import { describe, expect, it } from "vitest";
import { shouldUseViteMiddleware } from "./_core/vite";

describe("development server mode", () => {
  it("uses Vite middleware in development even when the dist directory is absent", () => {
    expect(shouldUseViteMiddleware("development", undefined)).toBe(true);
    expect(shouldUseViteMiddleware("development", "0")).toBe(true);
  });

  it("allows the explicit preview flag outside development", () => {
    expect(shouldUseViteMiddleware("production", "1")).toBe(true);
  });

  it("uses static serving only for production without preview mode", () => {
    expect(shouldUseViteMiddleware("production", undefined)).toBe(false);
    expect(shouldUseViteMiddleware("test", "0")).toBe(false);
  });
});
