import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("AI Research & Verification Workflow", () => {
  it("admin can get all court URLs from database", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const urls = await caller.admin.getAllCourtUrls();

    expect(Array.isArray(urls)).toBe(true);
    expect(urls.length).toBeGreaterThan(0);
    
    // Verify URL structure
    const firstUrl = urls[0];
    expect(firstUrl).toHaveProperty("id");
    expect(firstUrl).toHaveProperty("courtId");
    expect(firstUrl).toHaveProperty("courtName");
    expect(firstUrl).toHaveProperty("category");
    expect(firstUrl).toHaveProperty("url");
    expect(firstUrl).toHaveProperty("title");
  });

  it("admin can get pending URLs for review", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const pendingUrls = await caller.admin.getPendingUrls();

    expect(Array.isArray(pendingUrls)).toBe(true);
    // Pending URLs may be empty initially
  });

  it("pending URL workflow: insert, approve, verify in database", async () => {
    // Insert a test pending URL
    const testPendingUrl = await db.insertPendingUrl({
      courtId: "test.uscourts.gov",
      courtName: "Test District Court",
      circuit: "Test Circuit",
      category: "localRules",
      url: "https://test.uscourts.gov/rules",
      title: "Test Local Rules",
      description: "Test description",
      confidenceScore: 95,
      discoveredBy: "Test Suite",
      status: "pending",
    });

    expect(testPendingUrl).not.toBeNull();
    expect(testPendingUrl?.status).toBe("pending");

    // Get pending URLs
    const pendingUrls = await db.getPendingUrls();
    const foundPending = pendingUrls.find((u) => u.id === testPendingUrl?.id);
    expect(foundPending).toBeDefined();

    // Approve the pending URL
    if (testPendingUrl) {
      const approved = await db.approvePendingUrl(testPendingUrl.id, "Test Admin");
      expect(approved).toBe(true);

      // Verify it was added to court_urls
      const courtUrls = await db.getCourtUrlsByCourtId("test.uscourts.gov");
      const foundCourtUrl = courtUrls.find((u) => u.url === "https://test.uscourts.gov/rules");
      expect(foundCourtUrl).toBeDefined();
      expect(foundCourtUrl?.title).toBe("Test Local Rules");
    }
  });

  it("non-admin users cannot access admin endpoints", async () => {
    const nonAdminUser: AuthenticatedUser = {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user", // Not admin
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user: nonAdminUser,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // Should throw FORBIDDEN error
    await expect(caller.admin.getAllCourtUrls()).rejects.toThrow("Admin access required");
  });
});
