import { Hono } from "hono";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { prettyJSON } from "hono/pretty-json";
import { healthCheck } from "./routes/health";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use("*", logger());
app.use("*", prettyJSON());

app.get("/health", healthCheck);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
