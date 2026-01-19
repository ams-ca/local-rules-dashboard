import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: undefined,
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

describe("search.findRules", () => {
  it("returns search results with explanation for valid court query", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.findRules({
      court: "cand.uscourts.gov", // Northern District of California
    });

    // Verify response structure
    expect(result).toHaveProperty("explanation");
    expect(result).toHaveProperty("results");
    expect(result.explanation).toBeTruthy();
    expect(Array.isArray(result.results)).toBe(true);
    
    // Verify categories have expected structure
    if (result.results.length > 0) {
      const category = result.results[0];
      expect(category).toHaveProperty("category");
      expect(category).toHaveProperty("links");
      expect(Array.isArray(category.links)).toBe(true);
      
      // Verify links have required fields including verifiedDate
      if (category.links.length > 0) {
        const link = category.links[0];
        expect(link).toHaveProperty("title");
        expect(link).toHaveProperty("url");
        expect(link).toHaveProperty("description");
        expect(link).toHaveProperty("verifiedDate");
        expect(link.url).toMatch(/^https?:\/\//);
        // verifiedDate is a Date object from the database
        expect(link.verifiedDate).toBeInstanceOf(Date);
      }
    }
  }, 30000); // 30 second timeout for LLM

  it("returns results for multiple supported courts", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    
    const courts = [
      "cand.uscourts.gov", // Northern District of California
      "cacd.uscourts.gov", // Central District of California
    ];
    
    for (const court of courts) {
      const result = await caller.search.findRules({ court });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.explanation).toBeTruthy();
    }
  }, 60000); // 60 second timeout for multiple courts
});
