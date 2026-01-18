/**
 * Court Website Scraper
 * Returns links to relevant court website pages based on user query
 */

import type { SearchResultCategory, SearchResultLink } from "@shared/types";

interface ScraperOptions {
  courtUrl: string;
  courtName: string;
  judgeName?: string;
  caseType?: string;
}

/**
 * Main scraper function that returns relevant court website links
 * This is a fast, lightweight approach that returns known page URLs
 * rather than deeply scraping content
 */
export async function scrapeCourtWebsite(options: ScraperOptions): Promise<SearchResultCategory[]> {
  const { courtUrl, courtName, judgeName, caseType } = options;
  
  const results: SearchResultCategory[] = [];
  
  // Local Rules
  const localRules = getLocalRulesLinks(courtUrl, courtName, caseType);
  if (localRules.links.length > 0) {
    results.push(localRules);
  }
  
  // Standing Orders (judge-specific)
  if (judgeName) {
    const standingOrders = getStandingOrdersLinks(courtUrl, courtName, judgeName);
    if (standingOrders.links.length > 0) {
      results.push(standingOrders);
    }
    
    // Judge Information
    const judgeInfo = getJudgeInformationLinks(courtUrl, courtName, judgeName);
    if (judgeInfo.links.length > 0) {
      results.push(judgeInfo);
    }
  }
  
  // General Orders
  const generalOrders = getGeneralOrdersLinks(courtUrl, courtName);
  if (generalOrders.links.length > 0) {
    results.push(generalOrders);
  }
  
  // Administrative Orders
  const adminOrders = getAdministrativeOrdersLinks(courtUrl, courtName);
  if (adminOrders.links.length > 0) {
    results.push(adminOrders);
  }
  
  return results;
}

/**
 * Get local rules links
 */
function getLocalRulesLinks(courtUrl: string, courtName: string, caseType?: string): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  // Main local rules page
  links.push({
    title: "Local Rules",
    url: `${courtUrl}/rules`,
    description: `Complete local rules for ${courtName}. Includes civil, criminal, and other procedural rules.`,
  });
  
  // Case-type specific rules
  if (caseType) {
    const lowerCase = caseType.toLowerCase();
    
    if (lowerCase.includes("civil")) {
      links.push({
        title: "Local Civil Rules",
        url: `${courtUrl}/rules/local-rules`,
        description: "Local rules governing civil procedure in this district.",
        context: "Civil cases",
      });
    }
    
    if (lowerCase.includes("criminal")) {
      links.push({
        title: "Local Criminal Rules",
        url: `${courtUrl}/rules/criminal-rules`,
        description: "Local rules governing criminal procedure in this district.",
        context: "Criminal cases",
      });
    }
    
    if (lowerCase.includes("bankruptcy")) {
      links.push({
        title: "Local Bankruptcy Rules",
        url: `${courtUrl}/rules/bankruptcy-rules`,
        description: "Local rules governing bankruptcy procedure in this district.",
        context: "Bankruptcy cases",
      });
    }
  }
  
  return {
    category: "LOCAL RULES",
    links,
  };
}

/**
 * Get standing orders links
 */
function getStandingOrdersLinks(courtUrl: string, courtName: string, judgeName: string): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  // Main standing orders page
  links.push({
    title: "Standing Orders",
    url: `${courtUrl}/judges/standing-orders`,
    description: `Standing orders from judges in ${courtName}. Look for ${judgeName}'s standing order on this page.`,
    context: `Search for ${judgeName}`,
  });
  
  // Alternative URL patterns
  links.push({
    title: "Judges' Individual Rules",
    url: `${courtUrl}/judges`,
    description: `Individual judges' practices and procedures. Navigate to ${judgeName}'s page for chambers-specific rules.`,
    context: `Find ${judgeName}'s chambers page`,
  });
  
  return {
    category: "STANDING ORDERS",
    links,
  };
}

/**
 * Get judge information links
 */
function getJudgeInformationLinks(courtUrl: string, courtName: string, judgeName: string): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  links.push({
    title: `${judgeName}'s Chambers Information`,
    url: `${courtUrl}/judges`,
    description: `Directory of judges in ${courtName}. Find ${judgeName}'s page for contact information, staff directory, courtroom location, calendar, and procedural requirements.`,
    context: `Look for ${judgeName} in the judges list`,
  });
  
  return {
    category: "JUDGE INFORMATION",
    links,
  };
}

/**
 * Get general orders links
 */
function getGeneralOrdersLinks(courtUrl: string, courtName: string): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  links.push({
    title: "General Orders",
    url: `${courtUrl}/general-orders`,
    description: `Administrative orders and court-wide policies for ${courtName}.`,
  });
  
  links.push({
    title: "Administrative Orders",
    url: `${courtUrl}/orders`,
    description: "Court orders affecting all cases or specific categories of cases.",
  });
  
  return {
    category: "GENERAL ORDERS",
    links,
  };
}

/**
 * Get administrative orders links
 */
function getAdministrativeOrdersLinks(courtUrl: string, courtName: string): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  links.push({
    title: "Court Procedures",
    url: `${courtUrl}/court-info`,
    description: `Filing procedures, electronic filing requirements, and administrative information for ${courtName}.`,
  });
  
  links.push({
    title: "Filing Policies",
    url: `${courtUrl}/filing`,
    description: "Electronic filing policies, deadlines, and technical requirements.",
  });
  
  return {
    category: "PROCEDURES & POLICIES",
    links,
  };
}
