/**
 * Court Website Scraper
 * Returns links to relevant court website pages based on user query
 * Now includes actual scraping to find direct judge chambers page URLs
 */

import type { SearchResultCategory, SearchResultLink } from "@shared/types";
import axios from "axios";
import { JSDOM } from "jsdom";

interface ScraperOptions {
  courtUrl: string;
  courtName: string;
  judgeName?: string;
  caseType?: string;
}

/**
 * Main scraper function that returns relevant court website links
 * Enhanced to actually scrape judge pages for direct links
 */
export async function scrapeCourtWebsite(options: ScraperOptions): Promise<SearchResultCategory[]> {
  const { courtUrl, courtName, judgeName, caseType } = options;
  
  const results: SearchResultCategory[] = [];
  
  // Local Rules
  const localRules = getLocalRulesLinks(courtUrl, courtName, caseType);
  if (localRules.links.length > 0) {
    results.push(localRules);
  }
  
  // Standing Orders and Judge Information (with actual scraping if judge specified)
  if (judgeName) {
    try {
      const judgeLinks = await scrapeJudgeLinks(courtUrl, courtName, judgeName);
      
      if (judgeLinks.standingOrders.links.length > 0) {
        results.push(judgeLinks.standingOrders);
      }
      
      if (judgeLinks.judgeInfo.links.length > 0) {
        results.push(judgeLinks.judgeInfo);
      }
    } catch (error) {
      console.error("Error scraping judge links:", error);
      // Fallback to generic links
      const standingOrders = getStandingOrdersLinks(courtUrl, courtName, judgeName);
      if (standingOrders.links.length > 0) {
        results.push(standingOrders);
      }
      
      const judgeInfo = getJudgeInformationLinks(courtUrl, courtName, judgeName);
      if (judgeInfo.links.length > 0) {
        results.push(judgeInfo);
      }
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
 * Scrape judge-specific links from court website
 * Finds direct links to judge chambers pages
 */
async function scrapeJudgeLinks(
  courtUrl: string,
  courtName: string,
  judgeName: string
): Promise<{
  standingOrders: SearchResultCategory;
  judgeInfo: SearchResultCategory;
}> {
  const standingOrdersLinks: SearchResultLink[] = [];
  const judgeInfoLinks: SearchResultLink[] = [];
  
  // Try to find judge's chambers page
  const judgesPageUrl = `${courtUrl}/judges`;
  
  try {
    const response = await axios.get(judgesPageUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CourtRulesBot/1.0)",
      },
    });
    
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Find all links on the judges page
    const allLinks = Array.from(document.querySelectorAll("a"));
    
    // Normalize judge name for matching (lowercase, remove titles)
    const normalizedJudgeName = judgeName.toLowerCase()
      .replace(/^(judge|magistrate judge|hon\.|honorable)\s+/i, "")
      .trim();
    
    // Find links that contain the judge's name
    const judgePageLinks = allLinks.filter(link => {
      const linkText = link.textContent?.toLowerCase() || "";
      const linkHref = link.getAttribute("href")?.toLowerCase() || "";
      
      // Check if link text or href contains judge's last name
      const lastName = normalizedJudgeName.split(" ").pop() || "";
      return linkText.includes(lastName) || linkHref.includes(lastName.replace(/\s+/g, "-"));
    });
    
    // Extract unique URLs
    const judgeUrls = new Set<string>();
    judgePageLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href) {
        const fullUrl = href.startsWith("http") ? href : `${courtUrl}${href.startsWith("/") ? "" : "/"}${href}`;
        judgeUrls.add(fullUrl);
      }
    });
    
    // If we found direct judge page links, add them
    if (judgeUrls.size > 0) {
      judgeUrls.forEach(url => {
        judgeInfoLinks.push({
          title: `${judgeName}'s Chambers Page`,
          url: url,
          description: `Direct link to ${judgeName}'s chambers information, including standing orders, calendar, staff directory, and procedural requirements.`,
        });
      });
    } else {
      // Fallback: generic judges page
      judgeInfoLinks.push({
        title: `${judgeName}'s Chambers Information`,
        url: judgesPageUrl,
        description: `Directory of judges in ${courtName}. Find ${judgeName}'s page for contact information, staff directory, courtroom location, calendar, and procedural requirements.`,
        context: `Look for ${judgeName} in the judges list`,
      });
    }
    
    // Try to find standing orders page
    const standingOrdersUrl = `${courtUrl}/judges/standing-orders`;
    standingOrdersLinks.push({
      title: "Standing Orders",
      url: standingOrdersUrl,
      description: `Standing orders from judges in ${courtName}. Look for ${judgeName}'s standing order on this page.`,
      context: `Search for ${judgeName}`,
    });
    
  } catch (error) {
    console.error("Error fetching judges page:", error);
    // Return fallback links
    judgeInfoLinks.push({
      title: `${judgeName}'s Chambers Information`,
      url: judgesPageUrl,
      description: `Directory of judges in ${courtName}. Find ${judgeName}'s page for contact information, staff directory, courtroom location, calendar, and procedural requirements.`,
      context: `Look for ${judgeName} in the judges list`,
    });
    
    standingOrdersLinks.push({
      title: "Standing Orders",
      url: `${courtUrl}/judges/standing-orders`,
      description: `Standing orders from judges in ${courtName}. Look for ${judgeName}'s standing order on this page.`,
      context: `Search for ${judgeName}`,
    });
  }
  
  return {
    standingOrders: {
      category: "STANDING ORDERS",
      links: standingOrdersLinks,
    },
    judgeInfo: {
      category: "JUDGE INFORMATION",
      links: judgeInfoLinks,
    },
  };
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
 * Get standing orders links (fallback)
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
 * Get judge information links (fallback)
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
