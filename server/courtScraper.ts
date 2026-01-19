/**
 * Court website scraper
 * Returns curated links to court rules and procedures
 * Uses verified URL mappings instead of guessing URL patterns
 */

import axios from "axios";
import { JSDOM } from "jsdom";
import { SearchResultCategory, SearchResultLink } from "../shared/types";
import { getCourtUrls } from "./courtUrls";

/**
 * Scrape court website for relevant links
 * Returns organized categories of links based on user query
 */
export async function scrapeCourtWebsite(
  courtUrl: string,
  courtName: string,
  judgeName?: string,
  caseType?: string
): Promise<SearchResultCategory[]> {
  const results: SearchResultCategory[] = [];
  
  // Extract domain from court URL
  const domain = courtUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  
  // Get verified URLs for this court
  const courtUrls = getCourtUrls(domain);
  
  if (!courtUrls) {
    console.warn(`No URL mappings found for court: ${domain}`);
    return results;
  }
  
  // Local Rules
  const localRules = getLocalRulesLinks(courtUrls, courtName, caseType);
  if (localRules.links.length > 0) {
    results.push(localRules);
  }
  
  // Standing Orders (if judge specified)
  if (judgeName) {
    const standingOrders = getStandingOrdersLinks(courtUrls, courtName, judgeName);
    if (standingOrders.links.length > 0) {
      results.push(standingOrders);
    }
    
    // Judge Information
    const judgeInfo = getJudgeInfoLinks(courtUrls, courtName, judgeName);
    if (judgeInfo.links.length > 0) {
      results.push(judgeInfo);
    }
  }
  
  // General Orders
  const generalOrders = getGeneralOrdersLinks(courtUrls, courtName);
  if (generalOrders.links.length > 0) {
    results.push(generalOrders);
  }
  
  // Procedures & Policies
  const procedures = getProceduresLinks(courtUrls, courtName);
  if (procedures.links.length > 0) {
    results.push(procedures);
  }
  
  return results;
}

/**
 * Get local rules links
 */
function getLocalRulesLinks(
  courtUrls: ReturnType<typeof getCourtUrls>,
  courtName: string,
  caseType?: string
): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  if (!courtUrls) return { category: "LOCAL RULES", links };
  
  // Main local rules page
  links.push({
    title: "Local Rules",
    url: courtUrls.localRules,
    description: `Complete local rules for ${courtName}. Includes civil, criminal, and other procedural rules.`,
    verifiedDate: courtUrls.lastVerified,
  });
  
  // Add context about case type if specified
  if (caseType) {
    const lowerCase = caseType.toLowerCase();
    let context = "";
    
    if (lowerCase.includes("civil")) {
      context = "Look for Civil Local Rules on this page";
    } else if (lowerCase.includes("criminal")) {
      context = "Look for Criminal Local Rules on this page";
    } else if (lowerCase.includes("bankruptcy")) {
      context = "Look for Bankruptcy Local Rules on this page";
    }
    
    if (context) {
      links[0]!.context = context;
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
function getStandingOrdersLinks(
  courtUrls: ReturnType<typeof getCourtUrls>,
  courtName: string,
  judgeName: string
): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  if (!courtUrls) return { category: "STANDING ORDERS", links };
  
  links.push({
    title: "Standing Orders",
    url: courtUrls.standingOrders,
    description: `Standing orders from judges in ${courtName}. Look for ${judgeName}'s standing order on this page.`,
    context: `Search for ${judgeName}`,
    verifiedDate: courtUrls.lastVerified,
  });
  
  return {
    category: "STANDING ORDERS",
    links,
  };
}

/**
 * Get judge information links
 */
function getJudgeInfoLinks(
  courtUrls: ReturnType<typeof getCourtUrls>,
  courtName: string,
  judgeName: string
): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  if (!courtUrls) return { category: "JUDGE INFORMATION", links };
  
  links.push({
    title: `${judgeName}'s Chambers Information`,
    url: courtUrls.judges,
    description: `Directory of judges in ${courtName}. Find ${judgeName}'s page for contact information, staff directory, courtroom location, calendar, and procedural requirements.`,
    context: `Look for ${judgeName} in the judges list`,
    verifiedDate: courtUrls.lastVerified,
  });
  
  return {
    category: "JUDGE INFORMATION",
    links,
  };
}

/**
 * Get general orders links
 */
function getGeneralOrdersLinks(
  courtUrls: ReturnType<typeof getCourtUrls>,
  courtName: string
): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  if (!courtUrls) return { category: "GENERAL ORDERS", links };
  
  links.push({
    title: "General Orders",
    url: courtUrls.generalOrders,
    description: `Administrative orders and court-wide policies for ${courtName}.`,
    verifiedDate: courtUrls.lastVerified,
  });
  
  if (courtUrls.miscOrders) {
    links.push({
      title: "Miscellaneous Orders",
      url: courtUrls.miscOrders,
      description: "Additional court orders and administrative notices.",
      verifiedDate: courtUrls.lastVerified,
    });
  }
  
  return {
    category: "GENERAL ORDERS",
    links,
  };
}

/**
 * Get procedures and policies links
 */
function getProceduresLinks(
  courtUrls: ReturnType<typeof getCourtUrls>,
  courtName: string
): SearchResultCategory {
  const links: SearchResultLink[] = [];
  
  if (!courtUrls) return { category: "PROCEDURES & POLICIES", links };
  
  if (courtUrls.procedures) {
    links.push({
      title: "Court Procedures",
      url: courtUrls.procedures,
      description: `Filing procedures, electronic filing requirements, and administrative information for ${courtName}.`,
      verifiedDate: courtUrls.lastVerified,
    });
  }
  
  if (courtUrls.forms) {
    links.push({
      title: "Court Forms",
      url: courtUrls.forms,
      description: "Official court forms and filing templates.",
      verifiedDate: courtUrls.lastVerified,
    });
  }
  
  return {
    category: "PROCEDURES & POLICIES",
    links,
  };
}
