# ADR-002: Jobs Orchestration and SSE Event Taxonomy

Status: Accepted  
Date: 2025-09-09

## Context
We need predictable background processing to fetch, enrich, score, and dedupe leads, and a way to progressively stream results to the UI. Reliability, backpressure handling, and explainable provenance are required.

## Decision
- Job system: BullMQ (Redis) with explicit queues for `search`, `fetch`, `enrich`, `score`, `finalize`.
- Idempotency: deterministic job IDs per entity (e.g., `${searchId}:${businessId}`) and dedupe checks in code.
- Concurrency: global caps and per-connector caps; exponential backoff on 429/5xx.
- Retry policy: capped retries with jitter; DLQ for poison messages.
- Streaming: Server-Sent Events endpoint per `search_job` that emits typed events.
- Provenance: record durations per stage and connectors used; attach to `lead_view` or provenance map.

## Queues and Workers
- `search:start` → seeds Places queries and enqueues `fetch:candidate_batch`.
- `fetch:candidate_batch` → upsert `business` basics; enqueue `enrich:business`.
- `enrich:business` → detect signals with evidence; enqueue `score:business`.
- `score:business` → compute subscores and total; write `lead_view`; emit `lead:add|update`.
- `job:finalize` → compute summary stats; emit `job:complete`.

## SSE Event Taxonomy
- `job:status` `{status: queued|running|completed|failed, counts, backoff}`
- `lead:add` `{business_id, rank, score, signals, owner, review_count}`
- `lead:update` `{business_id, score, signals_delta}`
- `job:complete` `{summary_stats}`
- `error` `{message, code, stage}` (rare, non-fatal)

## Rationale
- BullMQ is simple and proven for Redis-centric job queues, matching our cache needs.
- SSE is trivial to integrate, firewall-friendly, and ideal for one-way progress updates.

## Consequences
- Requires careful attention to idempotency and dedupe to avoid duplicate rows.
- Need to surface backpressure state to UI (job health widget) as per PRD.

## Operational Defaults
- Queue concurrency defaults (tunable via config): fetch 8, enrich 6, score 12.
- Per-connector rate limits enforced pre-enqueue to avoid burst 429s.

## Open Questions
- Whether to add a `replay` queue that re-enriches/ rescopes leads on schema/prompt changes.

