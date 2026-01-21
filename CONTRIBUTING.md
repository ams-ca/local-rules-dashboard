# Contributing to Federal Local Rules Dashboard

Thank you for your interest in contributing to the Federal Local Rules Dashboard! This document provides guidelines for adding new courts, resources, and features to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Adding New Courts](#adding-new-courts)
- [Adding Court Resources](#adding-court-resources)
- [Database Guidelines](#database-guidelines)
- [Code Contributions](#code-contributions)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm package manager
- MySQL/TiDB database access
- Familiarity with TypeScript, React, and tRPC

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/local-rules.git
cd local-rules

# Install dependencies
pnpm install

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

## Adding New Courts

### Federal District Courts

To add a new federal district court:

1. **Research the Court Website**
   - Identify the official court website (usually `[district].uscourts.gov`)
   - Locate pages for local rules, standing orders, general orders, procedures, and judges

2. **Create a Population Script**
   ```typescript
   // Example: populate-florida-federal.mjs
   import { db } from "./server/db.ts";
   import { courtUrls } from "./drizzle/schema.ts";
   
   const floridaCourts = [
     {
       courtId: "flmd.uscourts.gov",
       courtName: "Middle District of Florida",
       state: "FL",
       courtType: "federal",
       urls: [
         {
           category: "local_rules",
           url: "https://www.flmd.uscourts.gov/local-rules",
           description: "Local Rules of the Middle District of Florida"
         },
         // Add more URLs...
       ]
     }
   ];
   
   // Insert into database...
   ```

3. **Run the Population Script**
   ```bash
   pnpm exec tsx populate-florida-federal.mjs
   ```

4. **Verify the Data**
   - Test the court selection in the UI
   - Verify all URLs are accessible
   - Check that verification dates are current

### State Superior Courts

To add a new state's superior courts:

1. **Find the State Court Directory**
   - Most states have an official judicial website listing all courts
   - Example: California uses `courts.ca.gov`

2. **Extract Court Information**
   - Court names (usually "[County] County Superior Court")
   - Official website URLs
   - Local rules pages

3. **Create Population Script**
   ```typescript
   // Example: populate-texas-courts.mjs
   const texasCourts = [
     {
       courtId: "bexar.txcourts.gov",
       courtName: "Bexar County District Court",
       state: "TX",
       courtType: "state",
       urls: [
         {
           category: "local_rules",
           url: "https://www.bexar.txcourts.gov/local-rules",
           description: "Local Rules"
         }
       ]
     }
   ];
   ```

4. **Follow the Data Quality Guidelines** (see below)

## Adding Court Resources

### Resource Categories

The system supports multiple resource categories:

- **local_rules**: Court-wide procedural rules
- **standing_orders**: Temporary or permanent court directives
- **general_orders**: Administrative orders
- **procedures**: General court procedures
- **judges**: Judge listings and assignments
- **e_filing**: Electronic filing procedures
- **division_rules**: Division-specific rules (Civil, Criminal, Family, etc.)
- **judicial_assignments**: Judge department assignments
- **courtroom_guides**: Department-specific procedures

### Adding Comprehensive Resources

For detailed court coverage (like Monterey County example):

1. **Research All Resource Types**
   - Visit the court's main website
   - Check "Online Services" or "E-Filing" sections
   - Look for "Divisions" or "Departments" pages
   - Find "Judges" or "Judicial Officers" listings
   - Search for courtroom-specific guides

2. **Create Detailed Population Script**
   ```typescript
   const montereyResources = {
     courtId: "monterey.courts.ca.gov",
     courtName: "Monterey County Superior Court",
     state: "CA",
     courtType: "state",
     urls: [
       // E-Filing
       {
         category: "e_filing",
         url: "https://www.monterey.courts.ca.gov/online-services/electronic-filing-e-filing",
         description: "Electronic Filing Information"
       },
       // Division Rules
       {
         category: "division_rules",
         url: "https://www.monterey.courts.ca.gov/divisions/civil",
         description: "Civil Division"
       },
       {
         category: "division_rules",
         url: "https://www.monterey.courts.ca.gov/divisions/criminal",
         description: "Criminal Division"
       },
       // Judicial Assignments
       {
         category: "judicial_assignments",
         url: "https://www.monterey.courts.ca.gov/general-information/judicial-assignments",
         description: "2026 Judicial Assignments"
       },
       // ... more URLs
     ],
     judges: [
       {
         name: "Hon. Julie R. Culver",
         title: "Presiding Judge",
         department: "Department 1"
       },
       // ... more judges
     ]
   };
   ```

3. **Multiple URLs Per Category**
   - The system supports multiple URLs for the same category
   - Example: 6 division rule pages for different divisions
   - Each URL should have a descriptive `description` field

## Database Guidelines

### Data Quality Standards

1. **Court IDs**
   - Use domain-based IDs: `[court-domain].uscourts.gov` for federal
   - Use domain-based IDs: `[county].courts.[state].gov` for state
   - Keep IDs lowercase and consistent

2. **Court Names**
   - Use official court names
   - Federal: "[District] District of [State]"
   - State: "[County] County Superior Court" or official variant

3. **URLs**
   - Use HTTPS when available
   - Verify URLs are accessible before adding
   - Prefer official court websites over third-party sources

4. **Descriptions**
   - Provide clear, concise descriptions
   - Indicate division or department when applicable
   - Example: "Civil Division Rules" not just "Rules"

5. **Verification Dates**
   - Set `lastVerified` to current date when adding
   - Update when URLs are re-verified
   - Use ISO 8601 format: `YYYY-MM-DD`

### Database Schema

Key tables:

- **court_urls**: Main table for court resources
- **judges**: Judicial officer information
- **pending_urls**: Queue for unverified URLs
- **url_change_history**: Audit trail

See `drizzle/schema.ts` for complete schema definitions.

## Code Contributions

### Code Style

- Follow existing TypeScript conventions
- Use ESLint and Prettier for formatting
- Write descriptive variable and function names
- Add comments for complex logic

### Frontend Guidelines

- Use tRPC hooks for all API calls (`trpc.*.useQuery`, `trpc.*.useMutation`)
- Leverage shadcn/ui components for consistency
- Follow Tailwind CSS utility-first approach
- Ensure responsive design (mobile-first)
- Handle loading, error, and empty states

### Backend Guidelines

- Define new procedures in `server/routers.ts`
- Create database helpers in `server/db.ts`
- Use Drizzle ORM for all database operations
- Validate inputs with Zod schemas
- Return typed responses with proper error handling

### Adding New Features

1. **Update todo.md**
   - Add feature to the appropriate section
   - Mark as `[ ]` (uncompleted)

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Implement Feature**
   - Write code following guidelines above
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Thoroughly**
   - Run `pnpm test` to ensure all tests pass
   - Test in browser for UI changes
   - Verify database operations

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/search.test.ts

# Run tests in watch mode
pnpm test --watch
```

### Writing Tests

- Place tests in `server/*.test.ts` files
- Use Vitest for testing framework
- Test both success and error cases
- Mock external dependencies when appropriate

Example test structure:

```typescript
import { describe, it, expect } from "vitest";
import { db } from "./db";

describe("Court Search", () => {
  it("should return courts for a given state", async () => {
    const courts = await db.getCourtsByState("CA", "state");
    expect(courts.length).toBeGreaterThan(0);
    expect(courts[0].state).toBe("CA");
  });
});
```

## Pull Request Process

### Before Submitting

1. **Ensure Code Quality**
   - All tests pass (`pnpm test`)
   - No TypeScript errors
   - Code follows style guidelines

2. **Update Documentation**
   - Update README.md if adding major features
   - Add comments to complex code
   - Update DEMO_SCRIPT.md if changing UI

3. **Clean Commit History**
   - Use descriptive commit messages
   - Squash trivial commits if needed
   - Follow conventional commit format (optional)

### Submitting a Pull Request

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Provide clear title and description
   - Reference related issues if applicable
   - Include screenshots for UI changes

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] All tests pass
   - [ ] Added new tests for changes
   - [ ] Manually tested in browser
   
   ## Screenshots (if applicable)
   [Add screenshots here]
   ```

4. **Address Review Feedback**
   - Respond to reviewer comments
   - Make requested changes
   - Re-request review when ready

### After Merge

- Delete your feature branch
- Update your local main branch
- Mark related todo.md items as complete

## Questions?

If you have questions or need help:

1. Check existing documentation (README.md, code comments)
2. Search existing issues on GitHub
3. Open a new issue with the "question" label
4. Reach out to maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation (for major features)

Thank you for contributing to the Federal Local Rules Dashboard!
