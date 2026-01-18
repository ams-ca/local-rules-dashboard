/**
 * Court Website Mapper
 * Maps court abbreviations and names to official website URLs
 */

interface CourtInfo {
  id: string;
  name: string;
  abbreviations: string[];
  url: string;
  circuit: string;
}

// Federal District Courts mapping
const COURTS: CourtInfo[] = [
  {
    id: "cand",
    name: "Northern District of California",
    abbreviations: ["cand", "ndca", "nd cal", "n.d. cal", "northern district of california"],
    url: "https://cand.uscourts.gov",
    circuit: "Ninth Circuit",
  },
  {
    id: "casd",
    name: "Southern District of California",
    abbreviations: ["casd", "sdca", "sd cal", "s.d. cal", "southern district of california"],
    url: "https://casd.uscourts.gov",
    circuit: "Ninth Circuit",
  },
  {
    id: "cacd",
    name: "Central District of California",
    abbreviations: ["cacd", "cdca", "cd cal", "c.d. cal", "central district of california"],
    url: "https://cacd.uscourts.gov",
    circuit: "Ninth Circuit",
  },
  {
    id: "caed",
    name: "Eastern District of California",
    abbreviations: ["caed", "edca", "ed cal", "e.d. cal", "eastern district of california"],
    url: "https://caed.uscourts.gov",
    circuit: "Ninth Circuit",
  },
  {
    id: "nysd",
    name: "Southern District of New York",
    abbreviations: ["nysd", "sdny", "sd ny", "s.d.n.y.", "southern district of new york"],
    url: "https://nysd.uscourts.gov",
    circuit: "Second Circuit",
  },
  {
    id: "nynd",
    name: "Northern District of New York",
    abbreviations: ["nynd", "ndny", "nd ny", "n.d.n.y.", "northern district of new york"],
    url: "https://nynd.uscourts.gov",
    circuit: "Second Circuit",
  },
  {
    id: "nyed",
    name: "Eastern District of New York",
    abbreviations: ["nyed", "edny", "ed ny", "e.d.n.y.", "eastern district of new york"],
    url: "https://nyed.uscourts.gov",
    circuit: "Second Circuit",
  },
  {
    id: "nywd",
    name: "Western District of New York",
    abbreviations: ["nywd", "wdny", "wd ny", "w.d.n.y.", "western district of new york"],
    url: "https://nywd.uscourts.gov",
    circuit: "Second Circuit",
  },
  // Add more courts as needed
];

/**
 * Find court information by name or abbreviation
 */
export function findCourt(query: string): CourtInfo | null {
  const normalized = query.toLowerCase().trim();
  
  for (const court of COURTS) {
    if (court.abbreviations.some(abbr => abbr === normalized)) {
      return court;
    }
  }
  
  return null;
}

/**
 * Get all supported courts
 */
export function getAllCourts(): CourtInfo[] {
  return COURTS;
}

/**
 * Normalize judge name to standard format
 */
export function normalizeJudgeName(name: string): string {
  // Remove common titles
  let normalized = name
    .replace(/^(judge|magistrate judge|hon\.|honorable)\s+/i, "")
    .trim();
  
  // If it's just a last name, return as-is
  if (!normalized.includes(" ")) {
    return normalized;
  }
  
  return normalized;
}

/**
 * Normalize case type
 */
export function normalizeCaseType(caseType: string): string {
  const normalized = caseType.toLowerCase().trim();
  
  const mapping: Record<string, string> = {
    "civ": "civil",
    "civl": "civil",
    "crim": "criminal",
    "cr": "criminal",
    "bk": "bankruptcy",
    "bky": "bankruptcy",
    "adm": "admiralty",
    "pat": "patent",
    "adr": "alternative dispute resolution",
  };
  
  return mapping[normalized] || normalized;
}
