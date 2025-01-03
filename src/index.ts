import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { healthCheck } from "./routes/health";

const app = new Hono();

app.use("*", logger());
app.use("*", prettyJSON());

app.get("/health", healthCheck);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
