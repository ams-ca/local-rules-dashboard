import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Court URLs table for managing federal court website links.
 * Stores URLs for different categories (local rules, standing orders, etc.) per court.
 */
export const courtUrls = mysqlTable("court_urls", {
  id: int("id").autoincrement().primaryKey(),
  /** Court identifier (domain), e.g., "cand.uscourts.gov" */
  courtId: varchar("courtId", { length: 64 }).notNull(),
  /** Full court name, e.g., "Northern District of California" */
  courtName: varchar("courtName", { length: 255 }).notNull(),
  /** Circuit name, e.g., "Ninth Circuit" */
  circuit: varchar("circuit", { length: 64 }),
  /** Category type: local_rules, standing_orders, judges, general_orders, procedures */
  category: varchar("category", { length: 64 }).notNull(),
  /** Full URL to the court resource */
  url: text("url").notNull(),
  /** Display title for the link */
  title: varchar("title", { length: 255 }).notNull(),
  /** Description of what this link contains */
  description: text("description"),
  /** Date when this URL was last verified as working */
  lastVerified: timestamp("lastVerified"),
  /** Whether this URL is currently active */
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  /** User who last updated this record */
  updatedBy: varchar("updatedBy", { length: 255 }),
});

export type CourtUrl = typeof courtUrls.$inferSelect;
export type InsertCourtUrl = typeof courtUrls.$inferInsert;