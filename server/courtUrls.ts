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
  },
  
  // Southern District of California
  "casd.uscourts.gov": {
    localRules: "https://www.casd.uscourts.gov/rules/local-rules",
    generalOrders: "https://www.casd.uscourts.gov/rules/general-orders",
    standingOrders: "https://www.casd.uscourts.gov/judges/chambers-rules.aspx",
    judges: "https://www.casd.uscourts.gov/judges.aspx",
    procedures: "https://www.casd.uscourts.gov/",
  },
  
  // Central District of California
  "cacd.uscourts.gov": {
    localRules: "https://www.cacd.uscourts.gov/rules/local-rules",
    generalOrders: "https://www.cacd.uscourts.gov/rules/general-orders-and-notices",
    standingOrders: "https://www.cacd.uscourts.gov/judges-and-staff/judges",
    judges: "https://www.cacd.uscourts.gov/judges-and-staff/judges",
    procedures: "https://www.cacd.uscourts.gov/",
  },
  
  // Eastern District of California
  "caed.uscourts.gov": {
    localRules: "https://www.caed.uscourts.gov/caednew/index.cfm/rules/local-rules/",
    generalOrders: "https://www.caed.uscourts.gov/caednew/index.cfm/rules/general-orders/",
    standingOrders: "https://www.caed.uscourts.gov/caednew/index.cfm/judges/",
    judges: "https://www.caed.uscourts.gov/caednew/index.cfm/judges/",
    procedures: "https://www.caed.uscourts.gov/",
  },
  
  // Southern District of New York
  "nysd.uscourts.gov": {
    localRules: "https://www.nysd.uscourts.gov/rules/local-rules",
    generalOrders: "https://www.nysd.uscourts.gov/rules/general-orders",
    standingOrders: "https://www.nysd.uscourts.gov/judges/judges-individual-rules-practice",
    judges: "https://www.nysd.uscourts.gov/judges",
    procedures: "https://www.nysd.uscourts.gov/",
  },
  
  // Northern District of New York
  "nynd.uscourts.gov": {
    localRules: "https://www.nynd.uscourts.gov/rules-orders",
    generalOrders: "https://www.nynd.uscourts.gov/rules-orders",
    standingOrders: "https://www.nynd.uscourts.gov/judges",
    judges: "https://www.nynd.uscourts.gov/judges",
    procedures: "https://www.nynd.uscourts.gov/",
  },
  
  // Eastern District of New York
  "nyed.uscourts.gov": {
    localRules: "https://www.nyed.uscourts.gov/rules/local-rules",
    generalOrders: "https://www.nyed.uscourts.gov/rules/general-orders",
    standingOrders: "https://www.nyed.uscourts.gov/judges",
    judges: "https://www.nyed.uscourts.gov/judges",
    procedures: "https://www.nyed.uscourts.gov/",
  },
  
  // Western District of New York
  "nywd.uscourts.gov": {
    localRules: "https://www.nywd.uscourts.gov/local-rules",
    generalOrders: "https://www.nywd.uscourts.gov/general-orders",
    standingOrders: "https://www.nywd.uscourts.gov/judges",
    judges: "https://www.nywd.uscourts.gov/judges",
    procedures: "https://www.nywd.uscourts.gov/",
  },
};

/**
 * Get verified URLs for a specific court
 */
export function getCourtUrls(courtDomain: string): CourtUrls | null {
  return COURT_URLS[courtDomain] || null;
}
