import { Hono } from "hono";
import { db } from "../db";
import { pieces } from "../db/schema";
import { eq } from "drizzle-orm";
import { uploadToS3, deleteFromS3 } from "../lib/s3";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const pieces = new Hono();

const createPieceSchema = z.object({
  title: z.string().min(1),
});

pieces.get("/", async (c) => {
  const userPieces = await db.query.pieces.findMany({
    orderBy: (pieces, { desc }) => [desc(pieces.createdAt)],
  });

  return c.json({ pieces: userPieces });
});

pieces.get("/:id", async (c) => {
  const pieceId = c.req.param("id");

  const piece = await db.query.pieces.findFirst({
    where: eq(pieces.id, pieceId),
  });

  if (!piece) {
    return c.json({ error: "Piece not found" }, 404);
  }

  return c.json({ piece });
});

pieces.post("/", async (c) => {
  const formData = await c.req.formData();
  const title = formData.get("title") as string;
  const pdf = formData.get("pdf") as File;

  const result = createPieceSchema.safeParse({ title });
  if (!result.success) {
    return c.json({ error: "Invalid input" }, 400);
  }

  if (!pdf) {
    return c.json({ error: "PDF file is required" }, 400);
  }

  try {
    const { s3Key, cdnUrl } = await uploadToS3(pdf);

    const newPiece = await db
      .insert(pieces)
      .values({
        title,
        s3Key,
        cdnUrl,
        pdfUrl: cdnUrl,
        userId: "temp-user",
      })
      .returning();

    return c.json({ piece: newPiece[0] }, 201);
  } catch (error) {
    console.error("Error creating piece:", error);
    return c.json({ error: "Failed to create piece" }, 500);
  }
});

pieces.delete("/:id", async (c) => {
  const pieceId = c.req.param("id");

  const piece = await db.query.pieces.findFirst({
    where: eq(pieces.id, pieceId),
  });

  if (!piece) {
    return c.json({ error: "Piece not found" }, 404);
  }

  try {
    await deleteFromS3(piece.s3Key);
    await db.delete(pieces).where(eq(pieces.id, pieceId));

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Error deleting piece:", error);
    return c.json({ error: "Failed to delete piece" }, 500);
  }
});

export default pieces;