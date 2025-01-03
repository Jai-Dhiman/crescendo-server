import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

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
    .references(() => user.id, { onDelete: "cascade" }),
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
    .references(() => user.id, { onDelete: "cascade" }),
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
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(user, ({ many }) => ({
  pieces: many(pieces),
  practiceSessions: many(practiceSessions),
  recordings: many(recordings),
}));

export const piecesRelations = relations(pieces, ({ one, many }) => ({
  user: one(user, {
    fields: [pieces.userId],
    references: [user.id],
  }),
  practiceSessions: many(practiceSessions),
  recordings: many(recordings),
}));

export const practiceSessionsRelations = relations(practiceSessions, ({ one }) => ({
  user: one(user, {
    fields: [practiceSessions.userId],
    references: [user.id],
  }),
  piece: one(pieces, {
    fields: [practiceSessions.pieceId],
    references: [pieces.id],
  }),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  user: one(user, {
    fields: [recordings.userId],
    references: [user.id],
  }),
  piece: one(pieces, {
    fields: [recordings.pieceId],
    references: [pieces.id],
  }),
}));
