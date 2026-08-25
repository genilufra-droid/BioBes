import "dotenv/config";
import express from "express";
import { sql } from "drizzle-orm";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "http";
import net from "net";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerLocalAuthRoutes } from "./localAuth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { getDb } from "../db";
import { serveStatic, setupVite, shouldUseViteMiddleware } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function runAutoMigrations() {
  if (process.env.AUTO_MIGRATE !== "true") return;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("AUTO_MIGRATE=true kërkon DATABASE_URL");
  const pool = mysql.createPool(connectionString);
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
    console.log("Database migrations applied successfully");
  } finally {
    await pool.end();
  }
}

async function startServer() {
  await runAutoMigrations();
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerLocalAuthRoutes(app);
  app.get("/healthz", async (_req, res) => {
    try {
      const database = await getDb();
      if (!database) { res.status(503).json({ ok: false, database: false, migrations: false }); return; }
      await database.execute(sql`SELECT 1 AS ok`);
      const migrationRows = await database.execute(sql`SELECT COUNT(*) AS count FROM __drizzle_migrations`);
      const applied = Number((migrationRows as any)[0]?.[0]?.count ?? 0);
      const expected = readdirSync(resolve(process.cwd(), "drizzle")).filter(file => file.endsWith(".sql")).length;
      const migrationsReady = expected > 0 && applied >= expected;
      res.status(migrationsReady ? 200 : 503).json({ ok: migrationsReady, database: true, migrations: { applied, expected } });
    } catch { res.status(503).json({ ok: false, database: false, migrations: false }); }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Në development përdorim Vite middleware, i cili e lexon client/index.html
  // direkt nga source dhe nuk varet nga dist/public që mund të mungojë pas restart-it.
  // HMR mbetet i çaktivizuar në setupVite për të shmangur problemet e proxy-it.
  if (shouldUseViteMiddleware(process.env.NODE_ENV, process.env.USE_VITE_PREVIEW)) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
