# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Commands (pnpm workspace)
- `pnpm dev` - Start all services in parallel (API, workers, frontend stub)
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Run ESLint across all workspaces
- `pnpm typecheck` - Run TypeScript type checking across all workspaces
- `pnpm test` - Run Vitest tests across all workspaces
- `pnpm migrate` - Run database migrations
- `pnpm seed` - Seed the database (API only)
- `pnpm start` - Start the API server in production mode

### Per-App Commands
Navigate to `apps/api/`, `apps/workers/`, or `packages/shared/` and run:
- `pnpm dev` - Start development server with hot reload (tsx watch)
- `pnpm build` - Compile TypeScript to dist/
- `pnpm lint` - ESLint for this package
- `pnpm typecheck` - TypeScript type checking
- `pnpm test` - Run Vitest tests

### Database Operations
- `pnpm migrate` - Apply database migrations (uses packages/db/src/migrate.ts)
- `pnpm -C apps/api seed` - Run seed script from API

## Architecture Overview

### Project Structure
This is a pnpm workspace monorepo for "Mothership Leads" - an SMB lead finder application:

```
apps/
  api/          # Fastify REST API with SSE streaming
  workers/      # BullMQ background job processors  
  frontend/     # Next.js UI (currently stub)
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
Each app requires `.env` files (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection for BullMQ
- `OPENAI_API_KEY` - For prompt parsing
- `GOOGLE_MAPS_API_KEY` - For Places API
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
- Future: Evaluation framework in `packages/evals/`