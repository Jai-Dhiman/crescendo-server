import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { prettyJSON } from "hono/pretty-json";
import { healthCheck } from "./routes/health";
import piecesRouter from "./routes/pieces";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:8000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Requested-With"],
    maxAge: 86400,
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use("*", logger());
app.use("*", prettyJSON());

app.get("/health", healthCheck);
app.route("/api/pieces", piecesRouter);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
