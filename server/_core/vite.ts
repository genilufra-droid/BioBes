import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";

export function shouldUseViteMiddleware(nodeEnv: string | undefined, previewFlag: string | undefined) {
  return nodeEnv === "development" || previewFlag === "1";
}

export async function setupVite(app: Express, _server: Server) {
  const [{ createServer: createViteServer }, { default: viteConfig }] = await Promise.all([
    import("vite"),
    import("../../vite.config"),
  ]);
  const serverOptions = {
    middlewareMode: true,
    // Proxy-i i preview-it nuk pranon në mënyrë të besueshme WebSocket upgrade.
    // Çaktivizimi i HMR shmang gabimin e klientit; rifreskimi normal ngarkon ndryshimet.
    hmr: false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const transformed = await vite.transformIndexHtml(url, template);
      const page = transformed.replace(/<script[^>]*src=["'][^"']*@vite\/client[^"']*["'][^>]*><\/script>\s*/gi, "");
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-store, max-age=0" }).end(page);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "../..", "dist", "public")
    : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
