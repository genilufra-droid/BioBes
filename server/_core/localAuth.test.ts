import express from "express";
import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import { ENV } from "./env";
import { hasValidSetupSecret, registerLocalAuthRoutes } from "./localAuth";

describe("LOCAL_AUTH_SETUP_SECRET", () => {
  it("validates the securely injected setup secret without exposing its value", async () => {
    expect(ENV.localAuthSetupSecret.length).toBeGreaterThanOrEqual(32);
    expect(hasValidSetupSecret(ENV.localAuthSetupSecret, ENV.localAuthSetupSecret)).toBe(true);
    expect(hasValidSetupSecret("incorrect-secret", ENV.localAuthSetupSecret)).toBe(false);

    const app = express();
    app.use(express.json());
    registerLocalAuthRoutes(app);
    const server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/local-auth/activate-existing-owner`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-local-auth-setup-secret": ENV.localAuthSetupSecret },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Email and a password with at least 12 characters are required" });
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
});
