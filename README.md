# Mothership — SMB AI Services (Exec Summary + PRD)

This folder contains everything you need to kick off development in Cursor.

## What's inside
- `docs/Executive_Summary_and_PRD.md` — **Full** Executive Summary and the **complete PRD** for Part 1 (SMB Lead Finder). No shortening.
- `README.md` — This file, with a minimal Quick Start.

## Quick Start in Cursor
1) **Open this folder in Cursor** (File → Open Folder…).
2) Create a new repo (optional):
   ```bash
   git init && git add . && git commit -m "seed: exec summary + PRD"
   ```
3) **Decide your API stack** (per PRD §9):
   - Fast path: Node + Fastify (TypeScript) for REST, BullMQ for workers.
   - Or NestJS if you prefer structured modules.
4) **Scaffold the app** (suggested structure):
   ```text
   apps/
     api/            # REST API + job enqueuers
     workers/        # BullMQ workers (fetch, enrich, score, dedupe)
     frontend/       # Next.js UI (prompt, results table, lead card, board view)
   packages/
     shared/         # types (LeadQuery DSL), detectors config, scoring profiles
   ```
5) **First implementation targets** (map to PRD §21 Milestones):
   - M0: JSON Schema for LeadQuery DSL, `/api/parse_prompt`, `/api/search_jobs` skeleton.
   - M1: Google Places connector + basic dedupe + persistence.
   - M2: HTTP fetcher + detectors (chat/booking/owner) + signals table.
   - M3: Scoring + streaming results + mini-CRM UI + CSV export.
   - M4: Event & Artifact seams + job health widget + acceptance tests.
6) **Env setup** (create `.env` files per service):
   ```bash
   DATABASE_URL=postgres://...
   REDIS_URL=redis://...
   OPENAI_API_KEY=...
   GOOGLE_MAPS_API_KEY=...
   WAPPALYZER_API_KEY=... # optional
   ```
7) Use Cursor to generate scaffolds/tests by referencing the PRD section numbers.

> Tip: Begin by implementing the **LeadQuery JSON Schema** and **parser endpoint**; it unlocks the rest of the pipeline.
