import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { log } from "./logger.js"; // ✅ safe standalone logger

const app = express();
const server = createServer(app);

(async () => {
  await registerRoutes(app);

  // ✅ Dynamically load vite only in dev
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // ✅ Serve static files in production
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  }

  // ✅ Centralized error handler
  app.use((err: any, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  // ✅ Only listen when NOT on Vercel
  if (!process.env.VERCEL) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen(port, "0.0.0.0", () => log(`🚀 Server running on port ${port}`));
  }
})();

export default app;
