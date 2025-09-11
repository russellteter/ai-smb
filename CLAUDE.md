# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Commands (pnpm workspace)
- `pnpm dev` - Start all services in parallel (API, workers, frontend)
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Run ESLint across all workspaces
- `pnpm typecheck` - Run TypeScript type checking across all workspaces
- `pnpm test` - Run Vitest tests across all workspaces
- `pnpm migrate` - Run database migrations (delegated to packages)
- `pnpm seed` - Seed the database (delegated to packages)
- `pnpm evals` - Run evaluation framework (golden tests)

### Service-Specific Start Commands
**IMPORTANT**: Never use a generic `pnpm start` from root. Use these instead:
- `pnpm start:api` - Start the API server in production mode
- `pnpm start:frontend` - Start the frontend Next.js server (uses start.sh script)
- `pnpm start:workers` - Start the background workers

### Per-App Commands
Navigate to `apps/api/`, `apps/workers/`, or `apps/frontend/` and run:
- `pnpm dev` - Start development server with hot reload (tsx watch for backend, next dev for frontend)
- `pnpm build` - Compile TypeScript to dist/ (or Next.js build)
- `pnpm lint` - ESLint for this package
- `pnpm typecheck` - TypeScript type checking
- `pnpm test` - Run Vitest tests (or echo for frontend)

### Database Operations
- `pnpm migrate` - Apply database migrations (uses packages/db/src/migrate.ts)
- `pnpm -C apps/api seed` - Run seed script from API

### Testing Single Files
- Frontend: `cd apps/frontend && pnpm test src/components/ComponentName.test.tsx`
- API: `cd apps/api && pnpm test src/routes/endpoint.test.ts`
- Worker: `cd apps/workers && pnpm test src/workers/worker-name.test.ts`
- Shared: `cd packages/shared && pnpm test src/module.test.ts`

## Architecture Overview

### Project Structure
This is a pnpm workspace monorepo for "Mothership Leads" - an SMB lead finder application:

```
apps/
  api/          # Fastify REST API with SSE streaming
  workers/      # BullMQ background job processors  
  frontend/     # Next.js UI with sophisticated component system
packages/
  shared/       # Shared types, schemas, utilities
  db/           # Database schema and migrations
  evals/        # Evaluation framework
```

### Technology Stack
- **Runtime**: Node.js 20 LTS with TypeScript and ESM modules
- **API**: Fastify with CORS and Server-Sent Events (SSE)
- **Database**: PostgreSQL with Drizzle ORM
- **Jobs**: BullMQ with Redis for background processing
- **Validation**: Zod schemas with JSON Schema generation
- **Frontend**: Next.js 14 with React 18, Tailwind CSS, Radix UI
- **Testing**: Vitest
- **Package Management**: pnpm workspaces

### Core Data Flow
1. **Prompt Parsing**: Natural language → LeadQuery DSL (via OpenAI API)
2. **Search Jobs**: Queue background jobs for lead discovery
3. **Connectors**: Fetch leads from APIs (Google Places, etc.)
4. **Enrichment**: Add signals (website tech, owner info, etc.)
5. **Scoring**: Rank leads by likelihood to buy AI services
6. **Streaming**: Real-time results via SSE to frontend

### Key Schemas and Types
- `LeadQuerySchema` - Structured query language for lead searches
- `ParsePromptRequestSchema` - Input validation for prompt parsing
- Located in `packages/shared/src/` with Zod definitions

### Environment Setup
Each app requires `.env` files (see `env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection for BullMQ
- `OPENAI_API_KEY` - For prompt parsing
- `GOOGLE_MAPS_API_KEY` - For Places API
- `WAPPALYZER_API_KEY` - Optional for tech detection
- `PORT` - Server port (defaults to 3001 for API)

### Development Workflow
1. Start dependencies: `docker-compose up -d` (Postgres + Redis)
2. Run migrations: `pnpm migrate`
3. Start development: `pnpm dev`
4. API runs on port 3001, workers process background jobs

### Future-Proofing Seams
The architecture includes thin seams for future features:
- **Event Log**: Append-only event storage for audit and bolt-on features
- **Artifact Registry**: Storage for generated assets (drafts, demos, scripts)

### API Endpoints
- `POST /api/parse_prompt` - Convert natural language to LeadQuery DSL
- `POST /api/search_jobs` - Start background lead search job
- `GET /api/search_jobs/:id/stream` - SSE stream of search progress
- `GET /api/export` - Export search results as CSV
- `GET /health` - Health check
- `GET /api/job_health` - BullMQ queue status

### Testing Strategy
- Unit tests with Vitest for business logic
- Integration tests for API endpoints
- Schema validation tests for Zod contracts
- Run tests with `pnpm test` at root or per-app
- Golden tests in packages/evals for prompt parsing

### Deployment (Render)
The application is configured for deployment on Render with:
- PostgreSQL database (starter plan)
- Redis instance for job queues (starter plan with noeviction policy)
- Web services for API and frontend (starter plan in oregon region)
- Worker service for background processing (starter plan)
- Migration job for database setup (runs on deploy)
- See `render.yaml` for full configuration

Service URLs:
- API: https://mothership-api.onrender.com
- Frontend: https://mothership-frontend.onrender.com

### Database Schema
Key tables (defined in `packages/db/src/schema.ts`):
- `search_job` - Search job metadata and DSL
- `business` - Core business entity
- `location` - Business locations
- `person` - Decision makers/owners
- `signal` - Enrichment data points
- `lead_view` - Scored leads for a search
- `event` - Event log for future features
- `artifact` - Asset registry for future features

## Frontend Architecture

### UI Component System
The frontend features a sophisticated component architecture with 30+ custom components:

**Component Categories:**
- `ui/` - Core UI components (buttons, cards, inputs, tables, animations, stats cards, progress charts, theme toggle)
- `layout/` - Page layout components (header with navigation and user menu)
- `leads/` - Lead management (lead-table with sorting/filtering, lead-detail-panel with full lead info)
- `mobile/` - Mobile-responsive components (mobile-navigation, mobile-cards with touch gestures)
- `analytics/` - Analytics dashboard components (dashboard with metrics)
- `search/` - Search interface components (advanced-search with filters, search-form, search-status)
- `streaming/` - Real-time SSE streaming components (stream-status with progress, live-feed with animations)
- `export/` - Export functionality (export-modal with CSV and CRM options)
- `contact/` - Contact management (contact-modal for outreach)

**Design System:**
- Glassmorphism effects with backdrop-blur and transparency
- Dark/light theme support with system preference detection
- Tailwind CSS v3 with custom gradient utilities and animations
- Custom components: AnimatedGradient, FloatingElements, StatsGrid, ProgressChart
- Mobile-first responsive design with dedicated mobile views
- Sophisticated animations: floating elements, gradient meshes, progress animations

**Key Features:**
- Real-time lead streaming with Server-Sent Events (SSE)
- Natural language search with OpenAI prompt parsing
- Lead scoring system (0-100) with visual indicators
- Export functionality (CSV, Salesforce, HubSpot integrations)
- Mobile-optimized with swipe gestures and touch interactions
- Dashboard with real-time metrics and progress visualization
- Advanced filtering and sorting capabilities

## Critical Deployment Issues & Solutions

### Known Render.com Deployment Problems

**1. Frontend Service Fails to Start**
- **Root Cause**: Render ignores `startCommand` and defaults to `pnpm start`
- **Solution**: Never have a generic `start` script in root package.json
- **Correct Start**: Use `bash apps/frontend/start.sh` in render.yaml
- **Start.sh Script**: Located at `apps/frontend/start.sh`, handles both standalone and regular Next.js builds

**2. TypeScript Not Found in Production**
- **Root Cause**: TypeScript in devDependencies
- **Solution**: Move TypeScript and @types to dependencies in frontend package.json

**3. ESLint Build Failures**
- **Root Cause**: Strict ESLint rules fail build
- **Solution**: Add `.eslintrc.json` with relaxed rules:
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**4. Path Alias (@/) Resolution Fails**
- **Root Cause**: Webpack doesn't resolve TypeScript paths
- **Solution**: Add webpack config to `next.config.js`:
```javascript
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': __dirname + '/src',
  };
  return config;
}
```

**5. Lockfile Outdated Errors**
- **Root Cause**: pnpm-lock.yaml out of sync
- **Solution**: Use `--no-frozen-lockfile` in build commands

## Development Gotchas

### Critical Rules
1. **NEVER add a generic `start` script to root package.json** - Breaks Render deployments
2. **Always use `--no-frozen-lockfile` for Render builds** - Prevents lockfile sync issues
3. **TypeScript must be in production dependencies** - Required for Render builds
4. **Frontend needs `output: 'standalone'` in next.config.js** - For optimized deployments
5. **Use `${PORT:-3000}` pattern for port binding** - Render provides PORT dynamically

### Build Commands for Production
```bash
# API Service
pnpm install --no-frozen-lockfile && \
pnpm -C packages/shared run build && \
pnpm -C packages/db run build && \
pnpm -C apps/api run build

# Frontend Service
pnpm install --no-frozen-lockfile && \
pnpm -C apps/frontend run build

# Worker Service
pnpm install --no-frozen-lockfile && \
pnpm -C packages/shared run build && \
pnpm -C packages/db run build && \
pnpm -C apps/workers run build
```

### Pre-Commit Checklist
Always run before committing:
```bash
pnpm typecheck   # Ensure TypeScript types are correct
pnpm lint        # Check ESLint rules
pnpm build       # Verify build succeeds
```

### Environment Variables (Render Dashboard)
Ensure these are set in Render for each service:

**API Service:**
- `DATABASE_URL` - Auto-provided by Render from database service
- `REDIS_URL` - Auto-provided by Render from Redis service
- `OPENAI_API_KEY` - Manual setup required
- `GOOGLE_MAPS_API_KEY` - Manual setup required

**Frontend Service:**
- `API_URL` - Set to `https://mothership-api.onrender.com`
- `NODE_ENV` - Set to `production`

**Worker Service:**
- Same as API service

### Common Fixes
- If frontend won't start: Check root package.json doesn't have `start` script
- If TypeScript errors: Ensure TypeScript is in dependencies, not devDependencies
- If ESLint fails: Add rules to `.eslintrc.json` to disable strict checks
- If imports fail: Check webpack config in `next.config.js` for path aliases
- If build fails on Render: Use `--no-frozen-lockfile` in build commands