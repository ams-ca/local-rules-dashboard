import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Federal vs State Court System", () => {
  it("should return all federal courts when calling getAllFederalCourts", async () => {
    const courts = await db.getAllFederalCourts();
    
    expect(courts.length).toBeGreaterThan(0);
    
    // All courts should be federal district courts (or test courts)
    courts.forEach((court) => {
      expect(court.courtName).toMatch(/District (of|Court)/);
    });
  });

  it("should return only CA state courts when calling getCourtsByState with CA and state type", async () => {
    const courts = await db.getCourtsByState("CA", "state");
    
    expect(courts.length).toBeGreaterThanOrEqual(58); // At least 58 CA Superior Courts
    // All courts should be Superior Courts of California
    courts.forEach((court) => {
      // Accept both "Superior Court of California, {County}" and "{County} Superior Court" formats
      const isValidFormat = 
        court.courtName.includes("Superior Court of California") ||
        court.courtName.includes("Superior Court");
      expect(isValidFormat).toBe(true);
      expect(court.state).toBe("CA");
    });
  });

  it("should return only CA federal courts when calling getCourtsByState with CA and federal type", async () => {
    const courts = await db.getCourtsByState("CA", "federal");
    
    expect(courts.length).toBeGreaterThan(0);
    
    // All courts should be federal district courts in CA
    courts.forEach((court) => {
      expect(court.courtName).toMatch(/District of California/);
      expect(court.state).toBe("CA");
    });
  });

  it("should distinguish between federal and state courts in the same state", async () => {
    const federalCourts = await db.getCourtsByState("CA", "federal");
    const stateCourts = await db.getCourtsByState("CA", "state");
    
    // Should have both types of courts
    expect(federalCourts.length).toBeGreaterThan(0);
    expect(stateCourts.length).toBeGreaterThan(0);
    
    // Should be completely different sets
    const federalIds = new Set(federalCourts.map(c => c.courtId));
    const stateIds = new Set(stateCourts.map(c => c.courtId));
    
    // No overlap between federal and state court IDs
    federalIds.forEach(id => {
      expect(stateIds.has(id)).toBe(false);
    });
  });

  it("should return federal courts from multiple states", async () => {
    const allFederal = await db.getAllFederalCourts();
    
    // Should have courts from multiple states
    const states = new Set(allFederal.map(c => c.state).filter(Boolean));
    expect(states.size).toBeGreaterThan(1);
    
    // Should include both CA and NY
    expect(Array.from(states)).toContain("CA");
    expect(Array.from(states)).toContain("NY");
  });

  it("should have correct courtId format for state courts", async () => {
    const stateCourts = await db.getCourtsByState("CA", "state");
    
    expect(stateCourts.length).toBeGreaterThan(0);
    
    // State court IDs should either be domain names ending in .courts.ca.gov (new format)
    // or superior-{county} format (legacy format)
    stateCourts.forEach((court) => {
      const isNewFormat = court.courtId.endsWith('.courts.ca.gov');
      const isLegacyFormat = court.courtId.startsWith('superior-');
      expect(isNewFormat || isLegacyFormat).toBe(true);
    });
    
    // Verify at least one court uses the new domain format (e.g., Monterey)
    const newFormatCourts = stateCourts.filter(c => c.courtId.endsWith('.courts.ca.gov'));
    expect(newFormatCourts.length).toBeGreaterThan(0);
  });

  it("should have correct courtId format for federal courts", async () => {
    const federalCourts = await db.getAllFederalCourts();
    
    // Federal court IDs should contain .uscourts.gov
    federalCourts.forEach((court) => {
      expect(court.courtId).toMatch(/\.uscourts\.gov$/);
    });
  });
});
