import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, courtUrls, CourtUrl, InsertCourtUrl, pendingUrls, PendingUrl, InsertPendingUrl, judges, Judge, InsertJudge } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Court URL Management Functions
 */

export async function getAllCourtUrls() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get court URLs: database not available");
    return [];
  }
  
  const results = await db.select().from(courtUrls).orderBy(courtUrls.courtName, courtUrls.category);
  return results;
}

export async function getCourtUrlsByCourtId(courtId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get court URLs: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(courtUrls)
    .where(eq(courtUrls.courtId, courtId))
    .orderBy(courtUrls.category);
  
  return results;
}

export async function getActiveCourtUrlsByCourtId(courtId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get court URLs: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(courtUrls)
    .where(eq(courtUrls.courtId, courtId))
    .orderBy(courtUrls.category);
  
  return results.filter(url => url.isActive === 1);
}

export async function updateCourtUrl(id: number, updates: Partial<InsertCourtUrl>, updatedBy: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update court URL: database not available");
    return null;
  }
  
  await db
    .update(courtUrls)
    .set({ ...updates, updatedBy, updatedAt: new Date() })
    .where(eq(courtUrls.id, id));
  
  const result = await db.select().from(courtUrls).where(eq(courtUrls.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCourtUrl(data: InsertCourtUrl) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create court URL: database not available");
    return null;
  }
  
  const result = await db.insert(courtUrls).values(data);
  const insertedId = result[0].insertId;
  
  const inserted = await db.select().from(courtUrls).where(eq(courtUrls.id, insertedId)).limit(1);
  return inserted.length > 0 ? inserted[0] : null;
}

export async function deleteCourtUrl(id: number, updatedBy: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete court URL: database not available");
    return false;
  }
  
  // Soft delete by setting isActive to 0
  await db
    .update(courtUrls)
    .set({ isActive: 0, updatedBy, updatedAt: new Date() })
    .where(eq(courtUrls.id, id));
  
  return true;
}


// Pending URLs management

export async function insertPendingUrl(data: InsertPendingUrl) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert pending URL: database not available");
    return null;
  }
  
  const result = await db.insert(pendingUrls).values(data);
  const insertedId = result[0].insertId;
  
  const inserted = await db.select().from(pendingUrls).where(eq(pendingUrls.id, insertedId)).limit(1);
  return inserted.length > 0 ? inserted[0] : null;
}

export async function getPendingUrls() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending URLs: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(pendingUrls)
    .where(eq(pendingUrls.status, "pending"))
    .orderBy(pendingUrls.discoveredAt);
  
  return results;
}

export async function approvePendingUrl(id: number, reviewedBy: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot approve pending URL: database not available");
    return false;
  }
  
  // Get the pending URL
  const pending = await db.select().from(pendingUrls).where(eq(pendingUrls.id, id)).limit(1);
  if (pending.length === 0) {
    return false;
  }
  
  const url = pending[0];
  
  // Create court URL from pending URL
  await db.insert(courtUrls).values({
    courtId: url.courtId,
    courtName: url.courtName,
    circuit: url.circuit,
    category: url.category,
    url: url.url,
    title: url.title,
    description: url.description,
    lastVerified: new Date(),
    isActive: 1,
    updatedBy: reviewedBy,
    courtType: url.courtType,
  });
  
  // Mark pending URL as approved
  await db
    .update(pendingUrls)
    .set({ status: "approved", reviewedBy, reviewedAt: new Date() })
    .where(eq(pendingUrls.id, id));
  
  return true;
}

export async function rejectPendingUrl(id: number, reviewedBy: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reject pending URL: database not available");
    return false;
  }
  
  await db
    .update(pendingUrls)
    .set({ status: "rejected", reviewedBy, reviewedAt: new Date() })
    .where(eq(pendingUrls.id, id));
  
  return true;
}


/**
 * Get distinct states from court_urls table
 */
export async function getDistinctStates(): Promise<{ state: string; stateName: string }[]> {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .selectDistinct({ state: courtUrls.state })
    .from(courtUrls)
    .where(sql`${courtUrls.state} IS NOT NULL`);

  // Map state abbreviations to full names
  const stateNames: Record<string, string> = {
    CA: "California",
    NY: "New York",
    FL: "Florida",
  };

  return results
    .filter((r) => r.state)
    .map((r) => ({
      state: r.state!,
      stateName: stateNames[r.state!] || r.state!,
    }))
    .sort((a, b) => a.stateName.localeCompare(b.stateName));
}

/**
 * Get all courts list (distinct court IDs and names)
 */
export async function getAllCourtsList(): Promise<{ courtId: string; courtName: string; state: string | null }[]> {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .selectDistinct({
      courtId: courtUrls.courtId,
      courtName: courtUrls.courtName,
      state: courtUrls.state,
    })
    .from(courtUrls)
    .orderBy(courtUrls.courtName);

  return results;
}

/**
 * Get courts by state and type
 * @param state - State abbreviation (e.g., "CA", "NY")
 * @param courtType - "federal" for federal district courts, "state" for state courts
 */
export async function getCourtsByState(state: string, courtType: "federal" | "state"): Promise<{ courtId: string; courtName: string; state: string | null }[]> {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .selectDistinct({
      courtId: courtUrls.courtId,
      courtName: courtUrls.courtName,
      state: courtUrls.state,
    })
    .from(courtUrls)
    .where(sql`${courtUrls.state} = ${state} AND ${courtUrls.courtType} = '${sql.raw(courtType)}'`)
    .orderBy(courtUrls.courtName);

  return results;
}

/**
 * Get all federal courts (all states)
 */
export async function getAllFederalCourts(): Promise<{ courtId: string; courtName: string; state: string | null }[]> {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .selectDistinct({
      courtId: courtUrls.courtId,
      courtName: courtUrls.courtName,
      state: courtUrls.state,
    })
    .from(courtUrls)
    .where(eq(courtUrls.courtType, "federal"))
    .orderBy(courtUrls.courtName);

  return results;
}

/**
 * Judge Management Functions
 */

export async function insertJudge(judge: InsertJudge) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert judge: database not available");
    return null;
  }
  
  const result = await db.insert(judges).values(judge);
  return result;
}

export async function getJudgesByCourtId(courtId: string): Promise<Judge[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get judges: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(judges)
    .where(eq(judges.courtId, courtId))
    .orderBy(judges.fullName);
  
  return results;
}

export async function getAllJudges(): Promise<Judge[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all judges: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(judges)
    .orderBy(judges.courtId, judges.fullName);
  
  return results;
}

/**
 * Get court URLs by court ID and category
 * Supports multiple URLs per category
 */
export async function getCourtUrlsByCategory(courtId: string, category: string): Promise<CourtUrl[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get court URLs by category: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(courtUrls)
    .where(sql`${courtUrls.courtId} = ${courtId} AND ${courtUrls.category} = ${category} AND ${courtUrls.isActive} = 1`)
    .orderBy(courtUrls.title);
  
  return results;
}

/**
 * Get all URLs for a specific court (all categories)
 */
export async function getAllCourtUrlsByCourtId(courtId: string): Promise<CourtUrl[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get court URLs: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(courtUrls)
    .where(sql`${courtUrls.courtId} = ${courtId} AND ${courtUrls.isActive} = 1`)
    .orderBy(courtUrls.category, courtUrls.title);
  
  return results;
}
