import { pgTable, text, timestamp, boolean, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => ({
    tokenIdx: uniqueIndex("token_idx").on(table.token),
  })
);

export const pieces = pgTable("piece", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  s3Key: text("s3_key").notNull(),
  cdnUrl: text("cdn_url").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const practiceSessions = pgTable("practice_session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  duration: integer("duration").notNull(),
  notes: text("notes"),
  pieceId: text("piece_id")
    .notNull()
    .references(() => pieces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recordings = pgTable("recording", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  s3Key: text("s3_key").notNull(),
  cdnUrl: text("cdn_url").notNull(),
  audioUrl: text("audio_url").notNull(),
  notes: text("notes"),
  pieceId: text("piece_id")
    .notNull()
    .references(() => pieces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  pieces: many(pieces),
  practiceSessions: many(practiceSessions),
  recordings: many(recordings),
}));

export const piecesRelations = relations(pieces, ({ one, many }) => ({
  user: one(users, {
    fields: [pieces.userId],
    references: [users.id],
  }),
  practiceSessions: many(practiceSessions),
  recordings: many(recordings),
}));

export const practiceSessionsRelations = relations(practiceSessions, ({ one }) => ({
  user: one(users, {
    fields: [practiceSessions.userId],
    references: [users.id],
  }),
  piece: one(pieces, {
    fields: [practiceSessions.pieceId],
    references: [pieces.id],
  }),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  user: one(users, {
    fields: [recordings.userId],
    references: [users.id],
  }),
  piece: one(pieces, {
    fields: [recordings.pieceId],
    references: [pieces.id],
  }),
}));
