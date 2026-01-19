/**
 * Court-specific URL mappings
 * These are manually verified working URLs for each court
 */

export interface CourtUrls {
  localRules: string;
  generalOrders: string;
  standingOrders: string;
  judges: string;
  miscOrders?: string;
  forms?: string;
  procedures?: string;
  lastVerified: string; // ISO date string when URLs were last verified
}

/**
 * Verified working URLs for each supported court
 */
export const COURT_URLS: Record<string, CourtUrls> = {
  // Northern District of California
  "cand.uscourts.gov": {
    localRules: "https://cand.uscourts.gov/rules-forms-fees/local-rules",
    generalOrders: "https://cand.uscourts.gov/rules-forms-fees/general-orders",
    standingOrders: "https://cand.uscourts.gov/judges/standing-orders",
    judges: "https://cand.uscourts.gov/judges",
    miscOrders: "https://cand.uscourts.gov/rules-forms-fees/miscellaneous-orders",
    forms: "https://cand.uscourts.gov/rules-forms-fees/forms",
    procedures: "https://cand.uscourts.gov/cases-e-filing",
    lastVerified: "2026-01-18",
  },
  
  // Southern District of California
  "casd.uscourts.gov": {
    localRules: "https://www.casd.uscourts.gov/rules/local-rules.aspx",
    generalOrders: "https://www.casd.uscourts.gov/rules/general-orders.aspx",
    standingOrders: "https://www.casd.uscourts.gov/judges/chambers-rules.aspx",
    judges: "https://www.casd.uscourts.gov/Judges.aspx",
    procedures: "https://www.casd.uscourts.gov/cmecf.aspx#undefined2",
    lastVerified: "2026-01-18",
  },
  
  // Central District of California
  "cacd.uscourts.gov": {
    localRules: "https://www.cacd.uscourts.gov/rules/local-rules",
    generalOrders: "https://www.cacd.uscourts.gov/rules/general-orders-and-notices",
    standingOrders: "https://apps.cacd.uscourts.gov/Jps/",
    judges: "https://www.cacd.uscourts.gov/judges-and-staff/judges",
    procedures: "https://www.cacd.uscourts.gov/",
    lastVerified: "2026-01-18",
  },
  
  // Eastern District of California
  "caed.uscourts.gov": {
    localRules: "https://www.caed.uscourts.gov/caednew/index.cfm/rules/local-rules/",
    generalOrders: "https://www.caed.uscourts.gov/caednew/index.cfm/rules/general-orders/",
    standingOrders: "https://www.caed.uscourts.gov/caednew/index.cfm/judges/",
    judges: "https://www.caed.uscourts.gov/caednew/index.cfm/judges/",
    procedures: "https://www.caed.uscourts.gov/",
    lastVerified: "2026-01-18",
  },
  
  // Southern District of New York
  "nysd.uscourts.gov": {
    localRules: "https://www.nysd.uscourts.gov/rules/local-rules",
    generalOrders: "https://www.nysd.uscourts.gov/rules/general-orders",
    standingOrders: "https://www.nysd.uscourts.gov/judges/judges-individual-rules-practice",
    judges: "https://www.nysd.uscourts.gov/judges",
    procedures: "https://www.nysd.uscourts.gov/",
    lastVerified: "2026-01-18",
  },
  
  // Northern District of New York
  "nynd.uscourts.gov": {
    localRules: "https://www.nynd.uscourts.gov/rules-orders",
    generalOrders: "https://www.nynd.uscourts.gov/rules-orders",
    standingOrders: "https://www.nynd.uscourts.gov/judges",
    judges: "https://www.nynd.uscourts.gov/judges",
    procedures: "https://www.nynd.uscourts.gov/",
    lastVerified: "2026-01-18",
  },
  
  // Eastern District of New York
  "nyed.uscourts.gov": {
    localRules: "https://www.nyed.uscourts.gov/rules/local-rules",
    generalOrders: "https://www.nyed.uscourts.gov/rules/general-orders",
    standingOrders: "https://www.nyed.uscourts.gov/judges",
    judges: "https://www.nyed.uscourts.gov/judges",
    procedures: "https://www.nyed.uscourts.gov/",
    lastVerified: "2026-01-18",
  },
  
  // Western District of New York
  "nywd.uscourts.gov": {
    localRules: "https://www.nywd.uscourts.gov/local-rules",
    generalOrders: "https://www.nywd.uscourts.gov/general-orders",
    standingOrders: "https://www.nywd.uscourts.gov/judges",
    judges: "https://www.nywd.uscourts.gov/judges",
    procedures: "https://www.nywd.uscourts.gov/",
    lastVerified: "2026-01-18",
  },
};

/**
 * Get verified URLs for a specific court
 */
export function getCourtUrls(courtDomain: string): CourtUrls | null {
  return COURT_URLS[courtDomain] || null;
}
