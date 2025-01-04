import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import { healthCheck } from "./routes/health";
import piecesRouter from "./routes/pieces";
import { auth } from "./lib/auth";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:3001"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Requested-With"],
    maxAge: 86400,
    credentials: true,
  })
);

app.use("*", authMiddleware);
app.use("*", logger());
app.use("*", prettyJSON());

app.get("/health", healthCheck);
app.route("/api/pieces", piecesRouter);

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
