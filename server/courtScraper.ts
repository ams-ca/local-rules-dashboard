/**
 * Court website scraper
 * Returns curated links to court rules and procedures
 * Dynamically detects which categories exist for each court from database
 */

import { SearchResultCategory, SearchResultLink } from "../shared/types";
import * as db from "./db";

/**
 * Scrape court website for relevant links
 * Returns organized categories of links based on what exists in the database
 */
export async function scrapeCourtWebsite(
  courtUrl: string,
  courtName: string
): Promise<SearchResultCategory[]> {
  const results: SearchResultCategory[] = [];
  
  // Extract court ID from court URL (domain without protocol/www)
  const courtId = courtUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  
  // Get all active URLs for this court from database
  const courtUrls = await db.getActiveCourtUrlsByCourtId(courtId);
  
  if (courtUrls.length === 0) {
    console.warn(`No URLs found in database for court: ${courtId}`);
    return results;
  }
  
  // Group URLs by category
  const categoryMap = new Map<string, typeof courtUrls>();
  for (const url of courtUrls) {
    const existing = categoryMap.get(url.category) || [];
    existing.push(url);
    categoryMap.set(url.category, existing);
  }
  
  // Build result categories dynamically based on what exists
  for (const [category, urls] of Array.from(categoryMap.entries())) {
    const links: SearchResultLink[] = urls.map((url) => ({
      title: url.title,
      url: url.url,
      description: url.description || undefined,
      verifiedDate: url.lastVerified ? new Date(url.lastVerified) : undefined,
    }));
    
    results.push({
      category: getCategoryDisplayName(category),
      links,
    });
  }
  
  return results;
}

/**
 * Convert database category name to display-friendly name
 */
function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    localRules: "Local Rules",
    standingOrders: "Standing Orders",
    judges: "Judge Information",
    generalOrders: "General Orders",
    procedures: "Procedures & Policies",
  };
  
  return displayNames[category] || category;
}
