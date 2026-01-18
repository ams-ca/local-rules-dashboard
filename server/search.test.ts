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
  it("should find court by abbreviation", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.findRules({
      court: "ND Cal",
    });

    expect(result.query.court).toBe("Northern District of California");
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
  }, 30000); // 30 second timeout for web scraping

  it("should normalize judge name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.findRules({
      court: "NDCA",
      judgeName: "Judge Orrick",
    });

    expect(result.query.judgeName).toBe("Orrick");
    expect(result.query.court).toBe("Northern District of California");
  }, 30000);

  it("should normalize case type", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.findRules({
      court: "cand",
      caseType: "civ",
    });

    expect(result.query.caseType).toBe("civil");
  }, 30000);

  it("should throw error for unknown court", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.search.findRules({
        court: "Unknown Court XYZ",
      })
    ).rejects.toThrow("not found");
  });
});
