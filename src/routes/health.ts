import type { Context } from "hono";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const healthCheck = async (c: Context) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({
      server: "healthy",
      database: "connected",
    });
  } catch (err) {
    const error = err as Error;
    return c.json(
      {
        server: "healthy",
        database: "disconnected",
        error: error.message,
      },
      503
    );
  }
};
