import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
