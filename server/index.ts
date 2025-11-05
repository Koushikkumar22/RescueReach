import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { log } from "./logger.js"; // ✅ no vite import

const app = express();

// ✅ Add body parsers BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);

(async () => {
  // ✅ Register your API routes
  await registerRoutes(app);

  if (process.env.NODE_ENV === "development") {
    // ✅ vite used only in dev
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // ✅ only static serving in prod
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  }

  // ✅ Global error handler (keep this at the bottom)
  app.use((err: any, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  // ✅ Only run local server when not on Vercel
  if (!process.env.VERCEL) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen(port, "0.0.0.0", () =>
      log(`🚀 Server running on port ${port}`)
    );
  }
})();

export default app;
