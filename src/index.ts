import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { db } from "./db";
import { userRoutes } from "./routes/users";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/api/users", userRoutes);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
