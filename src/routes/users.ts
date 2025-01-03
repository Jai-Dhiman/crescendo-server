import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const userRoutes = new Hono();

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

userRoutes.post("/", zValidator("json", createUserSchema), async (c) => {
  const data = c.req.valid("json");

  try {
    const [user] = await db.insert(users).values(data).returning();
    return c.json(user, 201);
  } catch (error) {
    return c.json({ error: "Failed to create user" }, 500);
  }
});

userRoutes.get("/", async (c) => {
  try {
    const allUsers = await db.select().from(users);
    return c.json(allUsers);
  } catch (error) {
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

userRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user.length) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user[0]);
  } catch (error) {
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

export { userRoutes };
