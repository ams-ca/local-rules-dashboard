# Federal Local Rules Dashboard
INCOMPLETE, DO NOT RELY ON THIS. This is a prototype for a comprehensive web application for navigating local rules, standing orders, and judge-specific procedures from federal and state courts across the United States. The Federal Local Rules Dashboard streamlines legal research by aggregating court resources from multiple jurisdictions into a single, searchable interface. 

This prototype was built for LegalQuants hackathon January 2026 on Manus AI. No guarantees are made regarding the code in the repository.

## Features

### Two-Tier Court Selection
- **Federal Courts**: Access all federal district courts, organized by state (currently California and New York district courts only)
- **State Courts**: Browse state-level superior courts, organized by county (currently California only, with only full local rules access built out for Monterey County)

### Comprehensive Resource Coverage
The app intends to catalog the court rules most widely used by attorneys including local rules, standing orders, general orders, judge- or courtroom-specific rules and guidelines, division rules, judicial assignments, and e-filing procedures. 

### AI-Powered Summaries
- Contextual explanations of court organizational structures
- AI-generated summaries with clear disclaimers
- Helps users understand get context for court procedures at a glance

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


