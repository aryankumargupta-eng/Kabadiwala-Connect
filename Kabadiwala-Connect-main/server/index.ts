import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";

import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/trpc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const forgeApiOrigin =
  process.env.NODE_ENV === "production"
    ? new URL(
        process.env.VITE_FRONTEND_FORGE_API_URL ||
          "https://forge.butterfly-effect.dev"
      ).origin
    : "https://forge.butterfly-effect.dev";

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? {
            directives: {
              "connect-src": [
                "'self'",
                forgeApiOrigin,
                "https://maps.googleapis.com",
                "https://maps.gstatic.com",
              ],
              "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
              "img-src": [
                "'self'",
                "data:",
                "blob:",
                "https://*.tile.openstreetmap.org",
                "https://github.com",
                "https://avatars.githubusercontent.com",
                "https://maps.googleapis.com",
                "https://maps.gstatic.com",
              ],
              "script-src": [
                "'self'",
                forgeApiOrigin,
                "https://maps.googleapis.com",
                "https://maps.gstatic.com",
              ],
              "style-src": [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
            },
          }
        : false,
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// tRPC API Route
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve static files from dist/public in production
const staticPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

app.use(express.static(staticPath));

// Handle client-side routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// Local dev ke liye listen karega, Vercel par direct export use hoga
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

export default app;
