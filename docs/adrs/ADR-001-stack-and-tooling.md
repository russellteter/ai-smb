# ADR-001: Stack and Tooling Decisions

Status: Accepted  
Date: 2025-09-09

## Context
The PRD for Phase 1 (Lead Finder) requires a fast, single-user web app with deterministic data contracts, background jobs, streaming results, and future-proof seams (events, artifacts). We need a minimal-but-extensible stack with strong typing, simple ops, and low vendor lock-in.

## Decision
- Language/runtime: TypeScript on Node.js (LTS 20)
- Package/workspace: pnpm workspaces (mono-repo)
- API framework: Fastify (REST-first, low overhead) over NestJS for lighter footprint
- Validation: Zod for runtime validation; JSON Schema for the LeadQuery contract (zod-to-json-schema where helpful)
- ORM/migrations: Drizzle ORM + drizzle-kit for typed SQL and explicit migrations
- DB: PostgreSQL (managed in prod; Docker locally)
- Queue: BullMQ (Redis) for fetch → enrich → score → dedupe pipelines
- Cache: Redis (per-URL/content hash with TTLs per connector)
- Frontend: Next.js (App Router) + React + TypeScript + Tailwind CSS
- Streaming: Server-Sent Events (SSE) for progressive results
- HTTP/headless: undici for HTTP; Playwright (feature-flagged) for tricky pages
- Testing: Vitest + tsx; MSW/nock for HTTP; Playwright (optional) for e2e UI later
- Lint/format: ESLint + Prettier; commit hooks via simple npm scripts (no heavy Husky gating)
- CI: GitHub Actions (lint, typecheck, test, build, migrations check, evals gate)
- Observability: pino structured logs; basic metrics via counters/histograms; Sentry optional
- Conventions: Conventional Commits; .env per app; docker-compose for local Postgres/Redis

## Rationale
- Fastify + Drizzle keep the codebase lean and explicit while preserving type-safety.
- BullMQ provides simple, proven job orchestration on Redis with backoff/retries.
- SSE is simpler than WebSockets for unidirectional streaming and fits our needs.
- Zod + JSON Schema enables schema-first contracts and strong validation at the edges.

## Consequences
- Slightly more wiring vs. NestJS, but lower complexity for a solo operator app.
- Redis becomes a required dependency (queues + cache); docker-compose will provide both Redis and Postgres locally.
- Playwright is off by default (costly); can be toggled per PRD.

## Operational Defaults
- Node 20 LTS, pnpm v9
- Directory layout:
  - apps/api, apps/workers, apps/frontend
  - packages/shared (types, schemas, configs)
- Env keys managed in .env files (local) and secret store in CI/CD (prod)

## Alternatives Considered
- NestJS + Prisma: more batteries-included and baked DI, but heavier abstractions and slower iteration.
- WebSockets: richer duplex channel, but unnecessary for our one-way streaming of results.
- TypeORM/Prisma: convenient, but Drizzle offers more explicit SQL control and smaller runtime.

## Open Questions
- Whether to add tRPC later for internal API ergonomics between frontend and API.
- Whether to standardize on a metrics backend (e.g., Prometheus) vs. minimal counters only at MVP.

