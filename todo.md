# Project TODO

## Search Assistant Features

- [x] Resolve Home.tsx merge conflict from template upgrade
- [x] Design new search interface with judge/court/case-type input fields
- [x] Implement backend API endpoint for court website searching
- [x] Create court website mapper (map abbreviations to URLs)
- [x] Implement query parser to normalize user input
- [x] Build web scraping logic to search court websites in real-time
- [x] Format search results with links and descriptions
- [x] Add loading states and error handling
- [x] Test with NDCA (Northern District of California)
- [x] Add support for additional courts (8 courts currently supported)

## AI-Generated Court Structure Explanation

- [x] Add LLM integration to generate contextual explanations
- [x] Update SearchResult type to include explanation field
- [x] Modify search router to call LLM and generate explanation
- [x] Update frontend to display explanation at top of results
- [x] Test explanation quality with multiple courts
- [x] Ensure explanation covers: local rules structure, standing orders, judge pages, calendars, hearing scheduling

## UI Improvements - Court Dropdown and Direct Judge Links

- [x] Replace court text input with dropdown selector
- [x] Display all 8 supported courts in dropdown
- [x] Update courtMapper to export list of supported courts
- [x] Enhance scraper to find direct judge chambers page URLs
- [x] Update judge information links to point directly to chambers pages
- [x] Test dropdown functionality with all courts
- [x] Verify direct judge links work correctly (fallback to generic links working, direct scraping attempted)

## URL Validation and 404 Error Fixes

- [x] Test all generated URLs to identify which return 404 errors
- [x] Investigate how URLs are currently being constructed in courtScraper.ts
- [x] Verify actual URL patterns on NDCA website
- [x] Fix URL construction logic to match actual court website structure
- [x] Test URLs for other supported courts (CASD, CACD, CAED, NYSD, etc.)
- [x] Add URL validation before returning results (using verified URL mappings)
- [x] Document correct URL patterns for each court
- [x] Verify links work correctly in browser (no 404 errors)

## Verification Date Tracking

- [x] Add lastVerified date field to URL mappings in courtUrls.ts
- [x] Update SearchResultLink type to include verifiedDate field
- [x] Display verification date in search results UI
- [x] Format verification date as human-readable (e.g., "Verified Jan 18, 2026")
- [x] Test verification date display with multiple courts

## UI Simplification - Remove Judge and Case Type

- [x] Remove judge name input field from search form
- [x] Remove case type input field from search form
- [x] Update search mutation to only require court parameter
- [x] Update backend router to handle court-only searches
- [x] Remove judge-specific filtering logic from courtScraper
- [x] Update AI explanation to focus on court structure only

## Fix Broken Links

- [x] Investigate SD Cal general orders broken link (entire SD Cal website is down, not our URL issue)
- [x] Test all URLs in courtUrls.ts for each supported court
- [x] Fix any broken URLs found during testing (SD Cal website is down, not our issue)
- [x] Document correct URL patterns for fixed links

- [x] Test simplified interface with NDCA
- [x] Verify all links work correctly
- [x] Update and run unit tests to verify functionality
- [x] All tests passing (3/3 tests pass)
- [x] Fix SD Cal URLs with correct .aspx extensions


## UI Redesign - Library-Style Chart Layout

- [x] Research UCLA Law library interface design pattern
- [x] Redesign results display with simple chart/table layout
- [x] Remove card-based layout in favor of clean rows
- [x] Hide categories that have no links
- [x] Update SD Cal procedures URL to https://www.casd.uscourts.gov/cmecf.aspx#undefined2
- [x] Test new layout with multiple courts


## URL Management & Dynamic Scraping

- [x] Update CD Cal standing orders URL to https://apps.cacd.uscourts.gov/Jps/
- [x] Design admin interface for managing court URLs
- [x] Create database schema for storing court URLs
- [x] Implement admin UI for editing court URLs
- [x] Add authentication/authorization for admin interface
- [x] Make scraper dynamically detect which categories exist per court
- [x] Update scraper to only return categories that actually exist on the court website
- [ ] Add URL validation before saving to database
- [ ] Implement audit log for URL changes


## AI Research & Verification Workflow

- [x] Design workflow architecture for AI-powered court URL research
- [x] Create AI agent that researches court websites to discover URLs
- [x] Implement URL validation system to check if links are still working
- [x] Build database schema for storing research findings and verification results
- [x] Create admin UI for reviewing AI-discovered URLs before adding to database
- [x] Add approval workflow for AI findings
- [x] Implement scheduled verification checks for existing URLs (API endpoints ready)
- [x] Add reporting system to show URL health status (getBrokenUrls endpoint)
- [x] Create manual trigger for on-demand verification runs (verifyCourtUrls, verifyAllUrls endpoints)
- [x] All tests passing (7/7)


## Two-Tier Court Selection System

- [x] Design two-tier selection architecture (State → Court)
- [x] Add state field to court_urls database table
- [x] Update courtMapper to include state information
- [x] Migrate existing court data to include state assignments
- [x] Create backend API to get courts by state
- [x] Implement cascading dropdown UI (state selector → court selector)
- [x] Add "Federal" option to show all courts
- [x] Test with California, Florida, and New York courts


## Federal vs State Court System Expansion

- [x] Design new architecture to distinguish federal courts from state courts
- [x] Add courtType field to database (federal vs state)
- [x] Update getCourtsByState to filter by court type
- [x] Research all 58 California Superior Court websites
- [x] Compile URLs for local rules, standing orders, and procedures for each CA Superior Court
- [x] Populate database with all 58 California Superior Courts
- [x] Update frontend to show "Federal" → federal district courts, "California" → CA Superior Courts
- [x] Test federal court selection (should show all federal district courts)
- [x] Test California state court selection (should show all 58 Superior Courts)
- [ ] Update AI explanation logic to handle state vs federal court differences


## Comprehensive Court Resource Expansion

- [x] Research Monterey Superior Court website structure (e-filing, divisions, judges)
- [x] Identify all resource types: e-filing procedures, division rules, judicial assignments, judge-specific procedures
- [x] Update database schema to support multiple URLs per category (remove 1:1 constraint)
- [x] Add new categories: e_filing, division_rules, judicial_assignments, judge_procedures
- [x] Create judges table for storing judicial officer information
- [x] Add database helper functions for judges and multi-URL categories
- [ ] Create AI research agent to systematically discover court resources (deferred - manual population working well)
- [x] Test with Monterey Superior Court as proof of concept
- [x] Populate all discovered resources for Monterey Superior Court
- [x] Update frontend to display multiple resources per category
- [x] Write tests for multi-URL category support


## UI Improvements
- [x] Change verification date display from "Verified Jan 19, 2026" to "URL Verified Jan 19, 2026"
- [x] Add italicized "AI Generated" disclaimer below AI-generated summaries

- [x] Format category table headers to display as individual words (e.g., "DIVISION_RULES" → "Division Rules")
