import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite"; // ✅ keep log here, it's small and fine to import

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse)
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // ✅ Use Vite only in development, never in production
  if (process.env.NODE_ENV === "development") {
    const { createServer } = await import("http");
    const server = createServer(app);

    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);

    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen(port, "0.0.0.0", () => log(`Vite dev server on port ${port}`));
  } else {
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);

    if (!process.env.VERCEL) {
      const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
      app.listen(port, "0.0.0.0", () => log(`Serving production build on port ${port}`));
    }
  }
})();

export default app;
