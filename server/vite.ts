import type { Express } from "express";
import { log } from "./logger.js"; // ✅ lightweight logger only

// ✅ Development-only Vite setup
export async function setupVite(app: Express, server: any) {
  const { createServer: createViteServer } = await import("vite"); // dynamic import
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: "custom",
  });

  app.use(vite.middlewares);
  log("🧩 Vite dev server loaded", "vite");
}

// ✅ Production-only static serving
export function serveStatic(app: Express) {
  // Dynamic imports so Vite/Rollup aren't bundled
  import("path").then((path) => {
    import("express").then((express) => {
      const staticPath = path.join(process.cwd(), "client", "dist");
      app.use(express.static(staticPath));

      // Serve index.html for all routes
      app.get("*", (_req, res) => {
        res.sendFile(path.join(staticPath, "index.html"));
      });

      log("📦 Serving static build", "express");
    });
  });
}
