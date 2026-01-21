# Federal Local Rules Dashboard

A comprehensive web application for navigating local rules, standing orders, and judge-specific procedures from federal and state courts across the United States.

## Overview

The Federal Local Rules Dashboard streamlines legal research by aggregating court resources from multiple jurisdictions into a single, searchable interface. The system distinguishes between federal district courts and state superior courts, providing comprehensive coverage of procedural rules, judicial assignments, e-filing procedures, and division-specific guidelines.

## Features

### Two-Tier Court Selection
- **Federal Courts**: Access all federal district courts organized by state
- **State Courts**: Browse state-level superior courts by county (currently California)

### Comprehensive Resource Coverage
- **Local Rules**: Court-wide procedural rules and regulations
- **Standing Orders**: Temporary or permanent directives from the court
- **General Orders**: Administrative orders affecting court operations
- **Division Rules**: Specific rules for Civil, Criminal, Family, Probate, Traffic, and Small Claims divisions
- **E-Filing Procedures**: Electronic filing requirements and guidelines
- **Judicial Assignments**: Complete lists of judges and their department assignments
- **Courtroom Guides**: Department-specific procedures and expectations
- **Judge-Specific Procedures**: Individual judge standing orders and preferences

### AI-Powered Summaries
- Contextual explanations of court organizational structures
- AI-generated summaries with clear disclaimers
- Helps users understand court hierarchy and jurisdiction

### URL Verification
- All links display last verification dates
- Ensures reliability and currency of information
- Systematic verification workflow for maintaining data accuracy

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **tRPC** for type-safe API calls
- **TanStack Query** for data fetching

### Backend
- **Express 4** with TypeScript
- **tRPC 11** for end-to-end type safety
- **Drizzle ORM** for database operations
- **MySQL/TiDB** database
- **Superjson** for serialization

### Infrastructure
- **Manus OAuth** for authentication
- **S3** for file storage
- **Vitest** for testing
- **GitHub** integration for version control

## Project Structure

```
local-rules-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client and utilities
│   │   └── _core/         # Core hooks and utilities
│   └── public/            # Static assets
├── server/                # Backend Express application
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database query helpers
│   ├── storage.ts         # S3 storage helpers
│   └── _core/             # Core server utilities
├── drizzle/               # Database schema and migrations
│   ├── schema.ts          # Table definitions
│   └── migrations/        # Migration files
├── shared/                # Shared types and constants
└── DEMO_SCRIPT.md         # Presentation demo script
```

## Database Schema

### Core Tables

**court_urls**: Stores court resource URLs with metadata
- `courtId`: Unique court identifier (domain-based)
- `courtName`: Human-readable court name
- `state`: Two-letter state code
- `courtType`: "federal" or "state"
- `category`: Resource type (local_rules, standing_orders, etc.)
- `url`: Resource URL
- `description`: Optional description
- `lastVerified`: Last verification timestamp

**judges**: Stores judicial officer information
- `judgeId`: Unique identifier
- `courtId`: Associated court
- `name`: Judge's full name
- `title`: Official title (Judge, Magistrate Judge, etc.)
- `department`: Department/courtroom assignment

**pending_urls**: Queue for URLs awaiting verification

**url_change_history**: Audit trail for URL modifications

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database

### Installation

```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

Required environment variables are automatically injected by the Manus platform:
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Session signing secret
- `VITE_APP_ID`: OAuth application ID
- `OAUTH_SERVER_URL`: OAuth backend URL
- `BUILT_IN_FORGE_API_KEY`: API key for Manus services

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/search.test.ts
```

## Current Coverage

### Federal Courts
- **California**: 4 district courts (Central, Eastern, Northern, Southern)
- **New York**: 4 district courts (Eastern, Northern, Southern, Western)

### State Courts
- **California**: 59 Superior Courts (one per county)
  - Comprehensive data for Monterey County (e-filing, divisions, judges)
  - Basic local rules for remaining 58 counties

## Roadmap

### Short Term
- [ ] Add comprehensive resources for remaining 57 CA Superior Courts
- [ ] Expand federal coverage to Florida, Texas, and other major states
- [ ] Implement resource filtering by category
- [ ] Add export functionality (PDF, CSV)

### Medium Term
- [ ] Add judge-specific procedure URLs
- [ ] Implement automated URL verification workflow
- [ ] Add court search/filter within dropdowns
- [ ] Create admin interface for managing court data

### Long Term
- [ ] Expand to all 50 states
- [ ] Add federal appellate courts
- [ ] Implement user favorites and recent searches
- [ ] Add email notifications for rule changes

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and TypeScript conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Manus](https://manus.im) platform
- Court data sourced from official federal and state court websites
- UI components from [shadcn/ui](https://ui.shadcn.com)

## Support

For questions, issues, or feature requests, please open an issue on GitHub.


