# ADR-003: Data Boundaries and Evidence Policy

Status: Accepted  
Date: 2025-09-09

## Context
The PRD emphasizes evidence-first explainability, ToS compliance, and PII minimization. We must define exactly what we store, for how long, and how we reference sources.

## Decision
- Store only: normalized business records, minimal people fields, and signals with `type, value_json, confidence, evidence_url, evidence_snippet(≤200 chars), source_key, detected_at`.
- Do not store: full page bodies, long quotes, or review texts. Keep short snippets only.
- Evidence snippet length cap: ≤200 chars, plain text; no secrets/sensitive tokens.
- Contact gating: show people/contact fields only after lead marked `Qualified` (configurable flag).
- Robots/ToS: respect robots.txt; prefer official APIs; backoff on 429/5xx; cache with TTLs per connector.
- Caching: store hashed content fingerprints and parsed features; avoid archiving raw HTML beyond short-lived cache where necessary.
- Events/artifacts: append-only; artifacts store URIs and metadata, not large binaries in DB.

## Rationale
This preserves explainability while minimizing legal/compliance risk and storage costs.

## Consequences
- Some debugging may require on-demand refetch rather than reading stored HTML.
- Evidence collection must include robust selectors and summarization to stay under limits.

## Operational Defaults
- `CACHE_TTLS`: places 7d, wappalyzer 14d, http_fetch 3d, whois 30d.
- `TWO_PARTY_STATES` list baked in config.

## Open Questions
- Whether to add per-connector allowlists for snippet sources.
- Whether to encrypt contact fields at rest despite single-user scope.

