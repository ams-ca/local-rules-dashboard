import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Two-Tier Court Selection", () => {
  it("should return distinct states from database", async () => {
    const states = await db.getDistinctStates();
    
    expect(states).toBeDefined();
    expect(Array.isArray(states)).toBe(true);
    
    // Should have at least CA and NY
    const stateAbbrs = states.map(s => s.state);
    expect(stateAbbrs).toContain("CA");
    expect(stateAbbrs).toContain("NY");
    
    // Should have full state names
    const stateNames = states.map(s => s.stateName);
    expect(stateNames).toContain("California");
    expect(stateNames).toContain("New York");
  });

  it("should return all courts when no state filter is provided", async () => {
    const courts = await db.getAllCourtsList();
    
    expect(courts).toBeDefined();
    expect(Array.isArray(courts)).toBe(true);
    expect(courts.length).toBeGreaterThan(0);
    
    // Should have courts from multiple states
    const states = new Set(courts.map(c => c.state));
    expect(states.size).toBeGreaterThan(1);
  });

  it("should return only California courts when CA state is selected", async () => {
    const courts = await db.getCourtsByState("CA");
    
    expect(courts).toBeDefined();
    expect(Array.isArray(courts)).toBe(true);
    expect(courts.length).toBeGreaterThan(0);
    
    // All courts should be from California
    courts.forEach(court => {
      expect(court.state).toBe("CA");
    });
    
    // Should have multiple CA districts
    const courtIds = courts.map(c => c.courtId);
    expect(courtIds).toContain("cand.uscourts.gov"); // Northern District
    expect(courtIds).toContain("cacd.uscourts.gov"); // Central District
  });

  it("should return only New York courts when NY state is selected", async () => {
    const courts = await db.getCourtsByState("NY");
    
    expect(courts).toBeDefined();
    expect(Array.isArray(courts)).toBe(true);
    expect(courts.length).toBeGreaterThan(0);
    
    // All courts should be from New York
    courts.forEach(court => {
      expect(court.state).toBe("NY");
    });
    
    // Should have multiple NY districts
    const courtIds = courts.map(c => c.courtId);
    expect(courtIds).toContain("nysd.uscourts.gov"); // Southern District
    expect(courtIds).toContain("nyed.uscourts.gov"); // Eastern District
  });

  it("should return court URLs for a specific court", async () => {
    const courtUrls = await db.getActiveCourtUrlsByCourtId("cand.uscourts.gov");
    
    expect(courtUrls).toBeDefined();
    expect(Array.isArray(courtUrls)).toBe(true);
    expect(courtUrls.length).toBeGreaterThan(0);
    
    // All URLs should be for the same court
    courtUrls.forEach(url => {
      expect(url.courtId).toBe("cand.uscourts.gov");
      expect(url.courtName).toContain("Northern District of California");
      expect(url.isActive).toBe(1);
    });
    
    // Should have multiple categories
    const categories = new Set(courtUrls.map(u => u.category));
    expect(categories.size).toBeGreaterThan(1);
  });
});
