/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Search Assistant Types
export interface SearchQuery {
  judgeName?: string;
  court: string;
  caseType?: string;
}

export interface SearchResultLink {
  title: string;
  url: string;
  description?: string;
  context?: string;
  verifiedDate?: Date; // Date when link was last verified
}

export interface SearchResultCategory {
  category: string;
  links: SearchResultLink[];
}

export interface SearchResponse {
  query: SearchQuery;
  explanation: string; // AI-generated explanation of court structure
  results: SearchResultCategory[];
}
