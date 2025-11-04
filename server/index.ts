import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { log } from "./vite.js";

const app = express();
const server = createServer(app);

(async () => {
  await registerRoutes(app);

  // ✅ Only import vite in development
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // ✅ Serve static files in production
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  }

  // ✅ Error handler
  app.use((err: any, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // ✅ Only listen when NOT on Vercel
  if (!process.env.VERCEL) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen(port, "0.0.0.0", () => log(`🚀 Server running on port ${port}`));
  }
})();

export default app;
