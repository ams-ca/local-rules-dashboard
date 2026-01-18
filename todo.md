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
