import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

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
    log("Starting server initialization...");
    const server = registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error('Server error:', err);
    });

    // Explicitly set port to 5000
    const PORT = 5000;
    const NODE_ENV = process.env.NODE_ENV || 'development';
    log(`Environment: ${NODE_ENV}`);
    log(`Configuring server for port ${PORT}`);

    // Temporarily disable Vite integration
    if (false && NODE_ENV === "development") {
      log("Setting up Vite integration...");
      try {
        await setupVite(app, server);
        log("Vite integration completed successfully");
      } catch (error) {
        console.error("Failed to setup Vite:", error);
        throw error;
      }
    } else {
      log("Setting up static file serving...");
      // Serve static files from dist/public
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const distPath = path.resolve(__dirname, "..", "dist", "public");
      log(`Serving static files from: ${distPath}`);
      app.use(express.static(distPath));

      // Serve index.html for all routes except /api
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
          return next();
        }
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    // Start the server
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server is running on port ${PORT}`);
      const replSlug = process.env.REPL_SLUG;
      const replOwner = process.env.REPL_OWNER;
      const url = replSlug && replOwner 
        ? `https://${replSlug}.${replOwner}.repl.co`
        : `http://localhost:${PORT}`;

      log(`Application URL: ${url}`);
      log("Please ensure your Repl is running and 'Always On' is enabled in Replit");

      // Log all relevant environment variables for debugging
      log('Environment variables:');
      log(`PORT: ${PORT}`);
      log(`REPL_OWNER: ${process.env.REPL_OWNER}`);
      log(`REPL_SLUG: ${process.env.REPL_SLUG}`);
      log(`NODE_ENV: ${NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();