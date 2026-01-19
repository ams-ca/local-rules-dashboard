import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Comprehensive Court Resources", () => {
  it("should retrieve multiple URLs for division_rules category", async () => {
    const courtId = "monterey.courts.ca.gov";
    const divisionRules = await db.getCourtUrlsByCategory(courtId, "division_rules");
    
    expect(divisionRules.length).toBeGreaterThan(1);
    expect(divisionRules.length).toBe(6); // Civil, Criminal, Family, Probate, Traffic, Small Claims
    
    // Verify all are active
    divisionRules.forEach(rule => {
      expect(rule.isActive).toBe(1);
      expect(rule.category).toBe("division_rules");
    });
  });
  
  it("should retrieve all URLs for a specific court", async () => {
    const courtId = "monterey.courts.ca.gov";
    const allUrls = await db.getAllCourtUrlsByCourtId(courtId);
    
    expect(allUrls.length).toBeGreaterThanOrEqual(11); // At least 11 URLs
    
    // Verify multiple categories exist
    const categories = new Set(allUrls.map(u => u.category));
    expect(categories.has("division_rules")).toBe(true);
    expect(categories.has("e_filing")).toBe(true);
    expect(categories.has("judicial_assignments")).toBe(true);
    expect(categories.has("local_rules")).toBe(true);
    expect(categories.has("courtroom_guides")).toBe(true);
  });
  
  it("should retrieve judges for Monterey Superior Court", async () => {
    const courtId = "monterey.courts.ca.gov";
    const judges = await db.getJudgesByCourtId(courtId);
    
    expect(judges.length).toBeGreaterThanOrEqual(20); // At least 20 judges
    
    // Verify judge data structure
    judges.forEach(judge => {
      expect(judge.courtId).toBe(courtId);
      expect(judge.fullName).toBeTruthy();
      expect(judge.title).toMatch(/^(judge|commissioner|magistrate|magistrate_judge)$/);
      expect(judge.isActive).toBe(1);
    });
    
    // Verify some judges have departments
    const judgesWithDepts = judges.filter(j => j.department);
    expect(judgesWithDepts.length).toBeGreaterThan(0);
    
    // Verify some judges have divisions
    const judgesWithDivisions = judges.filter(j => j.division);
    expect(judgesWithDivisions.length).toBeGreaterThan(0);
  });
  
  it("should support new resource categories", async () => {
    const courtId = "monterey.courts.ca.gov";
    
    // Test e_filing category
    const eFiling = await db.getCourtUrlsByCategory(courtId, "e_filing");
    expect(eFiling.length).toBeGreaterThan(0);
    expect(eFiling[0].category).toBe("e_filing");
    
    // Test judicial_assignments category
    const judicialAssignments = await db.getCourtUrlsByCategory(courtId, "judicial_assignments");
    expect(judicialAssignments.length).toBeGreaterThan(0);
    expect(judicialAssignments[0].category).toBe("judicial_assignments");
    
    // Test courtroom_guides category
    const courtroomGuides = await db.getCourtUrlsByCategory(courtId, "courtroom_guides");
    expect(courtroomGuides.length).toBeGreaterThan(0);
    expect(courtroomGuides[0].category).toBe("courtroom_guides");
  });
  
  it("should handle state courts correctly", async () => {
    const courtId = "monterey.courts.ca.gov";
    const allUrls = await db.getAllCourtUrlsByCourtId(courtId);
    
    // Verify all URLs are for state court
    allUrls.forEach(url => {
      expect(url.courtType).toBe("state");
      expect(url.state).toBe("CA");
    });
  });
});
