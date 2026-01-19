/**
 * AI Research Agent
 * Automatically discovers court URLs by researching court websites
 */

import axios from "axios";
import { JSDOM } from "jsdom";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export interface ResearchResult {
  courtId: string;
  courtName: string;
  circuit: string | null;
  discoveredUrls: Array<{
    category: string;
    url: string;
    title: string;
    description: string;
    confidenceScore: number;
  }>;
}

/**
 * Research a court website to discover URLs for rules and procedures
 */
export async function researchCourtWebsite(
  courtId: string,
  courtName: string,
  circuit: string | null
): Promise<ResearchResult> {
  console.log(`[AI Research] Starting research for ${courtName}`);
  
  const baseUrl = `https://${courtId}`;
  
  // Step 1: Fetch homepage HTML
  let homepageHtml: string;
  try {
    const response = await axios.get(baseUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FederalCourtRulesBot/1.0)",
      },
    });
    homepageHtml = response.data;
  } catch (error) {
    console.error(`[AI Research] Failed to fetch ${baseUrl}:`, error);
    throw new Error(`Could not access court website: ${baseUrl}`);
  }
  
  // Step 2: Extract text content and links from homepage
  const dom = new JSDOM(homepageHtml);
  const document = dom.window.document;
  
  // Get all links from the page
  const links = Array.from(document.querySelectorAll("a"))
    .map((a) => ({
      text: a.textContent?.trim() || "",
      href: a.getAttribute("href") || "",
    }))
    .filter((link) => link.href && link.text);
  
  // Get navigation text
  const navText = Array.from(document.querySelectorAll("nav, header, .menu, .navigation"))
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
    .join(" ");
  
  // Step 3: Use AI to analyze the page and identify relevant URLs
  const prompt = `You are analyzing a federal district court website to find URLs for legal rules and procedures.

Court: ${courtName}
Homepage: ${baseUrl}

Navigation text found on the page:
${navText}

Links found on the page (showing first 50):
${links.slice(0, 50).map((l, i) => `${i + 1}. ${l.text} -> ${l.href}`).join("\n")}

Your task: Identify URLs for the following categories:
1. **localRules** - Local Rules (Civil, Criminal, Patent, ADR, etc.)
2. **standingOrders** - Standing Orders or Judge-specific standing orders
3. **judges** - Judges directory or chambers rules page
4. **generalOrders** - General Orders
5. **procedures** - CM/ECF procedures, filing policies, or practice guidelines

For each category you find, provide:
- category: One of the 5 categories above
- url: The full URL (if relative, prepend ${baseUrl})
- title: A clear title for the link
- description: Brief description of what this page contains
- confidenceScore: Your confidence (0-100) that this URL is correct

Return your findings as a JSON array. If you cannot find a URL for a category, omit it from the array.

Example output format:
[
  {
    "category": "localRules",
    "url": "https://cand.uscourts.gov/rules-forms-fees/local-rules",
    "title": "Local Rules",
    "description": "Complete set of local rules for civil, criminal, and other proceedings",
    "confidenceScore": 95
  }
]`;

  const llmResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert at analyzing federal court websites. Return only valid JSON arrays.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "court_urls",
        strict: true,
        schema: {
          type: "object",
          properties: {
            urls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["localRules", "standingOrders", "judges", "generalOrders", "procedures"],
                  },
                  url: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  confidenceScore: { type: "integer", minimum: 0, maximum: 100 },
                },
                required: ["category", "url", "title", "description", "confidenceScore"],
                additionalProperties: false,
              },
            },
          },
          required: ["urls"],
          additionalProperties: false,
        },
      },
    },
  });
  
  const content = llmResponse.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI did not return any content");
  }
  
  const contentStr = typeof content === "string" ? content : JSON.stringify(content);
  const parsed = JSON.parse(contentStr);
  const discoveredUrls = parsed.urls || [];
  
  console.log(`[AI Research] Discovered ${discoveredUrls.length} URLs for ${courtName}`);
  
  return {
    courtId,
    courtName,
    circuit,
    discoveredUrls,
  };
}

/**
 * Save research results to pending_urls table for admin review
 */
export async function saveResearchResults(result: ResearchResult): Promise<void> {
  console.log(`[AI Research] Saving ${result.discoveredUrls.length} pending URLs for ${result.courtName}`);
  
  for (const url of result.discoveredUrls) {
    await db.insertPendingUrl({
      courtId: result.courtId,
      courtName: result.courtName,
      circuit: result.circuit,
      category: url.category,
      url: url.url,
      title: url.title,
      description: url.description,
      confidenceScore: url.confidenceScore,
      discoveredBy: "AI Agent",
      status: "pending",
    });
  }
  
  console.log(`[AI Research] Successfully saved pending URLs for ${result.courtName}`);
}
