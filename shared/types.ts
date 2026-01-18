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
  description: string;
  context?: string;
}

export interface SearchResultCategory {
  category: string;
  links: SearchResultLink[];
}

export interface SearchResponse {
  query: SearchQuery;
  results: SearchResultCategory[];
}
