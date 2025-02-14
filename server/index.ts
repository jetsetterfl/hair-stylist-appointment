import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add basic diagnostic route
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

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
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error('Server error:', err);
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = Number(process.env.PORT) || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server is running on port ${PORT}`);
      const replOwner = process.env.REPL_OWNER || 'amitshankar2';
      const replSlug = process.env.REPL_SLUG || 'workspace';
      const url = `https://${replOwner}.${replSlug}.repl.co`;
      log(`Application URL: ${url}`);
      log(`Please ensure your Repl is running and "Always On" is enabled in Replit`);

      // Add environment variable logging for debugging
      log('Environment variables:');
      log(`PORT: ${process.env.PORT}`);
      log(`REPL_OWNER: ${process.env.REPL_OWNER}`);
      log(`REPL_SLUG: ${process.env.REPL_SLUG}`);
      log(`NODE_ENV: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();