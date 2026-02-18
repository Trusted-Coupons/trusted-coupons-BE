import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./routes";
const cors = require("cors");
require("dotenv").config({ path: ".env" });

// Log memory usage periodically — reference kept so we can clear it on shutdown
const memoryLogInterval = setInterval(() => {
  const used = process.memoryUsage();
  console.log(
    `Heap used: ${Math.round(used.heapUsed / 1024 / 1024)} MB` +
      ` | RSS: ${Math.round(used.rss / 1024 / 1024)} MB`
  );
}, 60000);

AppDataSource.initialize()
  .then(() => {
    const app = express();
    app.use(
      cors({
        origin: "https://clownfish-app-uq5u9.ondigitalocean.app",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    app.use(bodyParser.json());

    // Instantiate controllers once and reuse them across all requests.
    // Creating a new instance per request wastes memory and GC time.
    const controllerInstances = new Map<Function, any>();
    function getController(ControllerClass: Function) {
      if (!controllerInstances.has(ControllerClass)) {
        controllerInstances.set(ControllerClass, new (ControllerClass as any)());
      }
      return controllerInstances.get(ControllerClass);
    }

    Routes.forEach((route) => {
      app[route.method](
        route.route,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const controller = getController(route.controller);
            const result = await controller[route.action](req, res, next);
            if (res.headersSent) return;
            if (result !== null && result !== undefined) {
              res.json(result);
            } else {
              res.status(204).send();
            }
          } catch (error) {
            console.error(`Error in ${route.method} ${route.route}:`, error);
            if (!res.headersSent) {
              res.status(500).json({ error: "Internal server error" });
            }
          }
        }
      );
    });

    // Global error middleware
    app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      console.error(`Global error in ${req.method} ${req.path}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Something went wrong" });
      }
    });

    const server = app.listen(3010, () => {
      console.log("Server running on port 3010");
    });

    // Graceful shutdown: close HTTP server, DB pool, and timers
    const shutdown = async (signal: string) => {
      console.log(`${signal} received — shutting down gracefully...`);
      clearInterval(memoryLogInterval);
      server.close(async () => {
        await AppDataSource.destroy();
        console.log("Shutdown complete.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((error) => {
    clearInterval(memoryLogInterval);
    console.error("Database initialization error:", error);
    process.exit(1);
  });
