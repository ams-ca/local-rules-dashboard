import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, courtUrls, CourtUrl, InsertCourtUrl } from "../drizzle/schema";
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
