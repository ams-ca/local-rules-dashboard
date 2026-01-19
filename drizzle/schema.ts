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

/**
 * Pending URLs table for AI-discovered URLs awaiting admin review.
 */
export const pendingUrls = mysqlTable("pending_urls", {
  id: int("id").autoincrement().primaryKey(),
  courtId: varchar("courtId", { length: 64 }).notNull(),
  courtName: varchar("courtName", { length: 255 }).notNull(),
  circuit: varchar("circuit", { length: 64 }),
  category: varchar("category", { length: 64 }).notNull(),
  url: text("url").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  /** AI confidence score 0-100 */
  confidenceScore: int("confidenceScore"),
  discoveredAt: timestamp("discoveredAt").defaultNow().notNull(),
  discoveredBy: varchar("discoveredBy", { length: 255 }).default("AI Agent").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  reviewedAt: timestamp("reviewedAt"),
});

export type PendingUrl = typeof pendingUrls.$inferSelect;
export type InsertPendingUrl = typeof pendingUrls.$inferInsert;

/**
 * URL verification log for tracking health checks of court URLs.
 */
export const urlVerificationLog = mysqlTable("url_verification_log", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to court_urls table */
  courtUrlId: int("courtUrlId").notNull(),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
  /** HTTP status code returned */
  statusCode: int("statusCode"),
  /** Whether URL was accessible */
  isAccessible: int("isAccessible").notNull(), // 1 = accessible, 0 = not accessible
  /** Redirect URL if redirected */
  redirectUrl: text("redirectUrl"),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Response time in milliseconds */
  responseTime: int("responseTime"),
});

export type UrlVerificationLog = typeof urlVerificationLog.$inferSelect;
export type InsertUrlVerificationLog = typeof urlVerificationLog.$inferInsert;

/**
 * URL change history for audit trail of modifications.
 */
export const urlChangeHistory = mysqlTable("url_change_history", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to court_urls table */
  courtUrlId: int("courtUrlId").notNull(),
  oldUrl: text("oldUrl"),
  newUrl: text("newUrl"),
  changedBy: varchar("changedBy", { length: 255 }).notNull(),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
  reason: text("reason"),
});

export type UrlChangeHistory = typeof urlChangeHistory.$inferSelect;
export type InsertUrlChangeHistory = typeof urlChangeHistory.$inferInsert;