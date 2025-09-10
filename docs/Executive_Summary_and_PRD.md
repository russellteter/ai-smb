# Executive Summary — “Mothership” SMB AI Services (Vision & Context)

## Vision & Positioning  
Build a single-user “**Mothership**” web app that becomes your home base to **find, qualify, and win** higher-ticket SMB clients—then deliver compact AI solutions that save them time and make them money. The platform has two enduring pillars:  
1) a **world-class Lead Finder** that behaves like an expert researcher (the “brain/engine”), and  
2) a **Builder/Automation workbench** that spins up proof-of-concepts, demo assets, and, eventually, production deliverables (voice reception, AI SDR follow-ups, instant websites, quote calculators).  
Everything lives behind a single, elegant dashboard designed for **one operator: you**.

## Who We Serve (and the Problems We Solve)  
Target **higher-ticket, local/regional SMBs**—dentists, law firms, specialty contractors, and regional chains—who say “we need to do something with AI,” but lack an execution partner. Their pains: missed calls, slow follow-up, no online booking, manual quoting, and scattered lead handling. Your core outcome: **more booked appointments, faster responses, and automated intake/quoting**—with clear ROI and minimal disruption.

## Product & Roadmap (at a glance)  
- **Phase 1 — SMB Lead Finder (now):** A prompt-first research agent that turns plain English into a structured query, aggregates candidates from trusted sources, **enriches**, **dedupes**, and **scores** leads, then returns an **explainable, ranked list** into a mini-CRM view (notes, tags, statuses, CSV).  
- **Phase 2 — Outreach Planner (later):** Draft outbound plans and assets (email first lines, voicemail scripts, voice-agent openers) as **Artifacts**, without sending. Compliance-aware defaults (TCPA disclosures, opt-outs).  
- **Phase 3 — POC/Asset Factory (later):** Spin up **demoable** voice receptionists, AI follow-up flows, instant websites, and quote calculators. Package and measure pilots → retainers.  
- **Phase 4 — Delivery & Reporting (later):** Lightweight monitoring, weekly impact summaries (calls answered, replies, bookings, quotes sent), and case-study generation.

## Architecture Principles (foundation you won’t outgrow)  
- **Simple now, extensible later:** typed **LeadQuery DSL**, modular **connectors** (APIs over scraping), and **explainable signals** with evidence.  
- **Event & Artifact seams from day one:** an append-only **event log** (e.g., `SearchCompleted`, `LeadStarred`) and an **artifact registry** (drafts, demo zips, scripts). These enable future bolt-ons without refactors.  
- **Operator-fast UX:** one page, progressive streaming of results, keyboard-first, board view for quick triage.  
- **Trust & compliance baked-in:** source URLs/snippets for every claim; data minimization; flags for Do-Not-Call and two-party recording states; HIPAA-adjacent and state-bar awareness for dental/law work.

## Go-to-Market & Business Model  
Start **narrow and local** (one or two verticals in a defined geo) and dogfood the Lead Finder to generate your own pipeline. Sales motion: short **diagnostic discovery → fast pilot → retainer**. Offer **productized services**:  
- AI receptionist & booking, AI SDR follow-ups, instant website/quote calculators.  
Pricing will evolve, but aim for **setup + monthly retainer** with clear SLAs and proof metrics. Early target: **$10k–$20k MRR** from 2–4 retained clients; margin protected via careful vendor usage, caching, and clear scope.

## Success Metrics & Moat  
- **Lead precision @ top-50 ≥80%**, **time-to-first-20 ≤2 min**, **≥70% owner/decision-maker coverage**, **meeting conversion from top-ranked leads**, **pilot→retainer rate**.  
Your moat: repeatable **lead profiles**, an **evidence-first ranking** other agencies can’t replicate easily, and a tight feedback loop that tunes scoring to niches you win.

## Risks & Mitigations  
- **Data/API shifts:** connector abstraction, per-vendor toggles, caching, graceful degradation.  
- **False positives:** dual detection (Wappalyzer + DOM heuristics), visible evidence, one-click corrections feed back into scoring.  
- **Compliance & reputation:** defaults that force proper disclosures/opt-outs; store only minimal, business-relevant contact data; clear boundaries for regulated niches.  
- **Scope creep (solo operator):** mono-repo, typed contracts, acceptance tests, and strict Phase gates.

---

### Implementation Focus (Phase 1)  
Proceed with the **SMB Lead Finder PRD** as the initial deliverable: prompt→DSL parsing, connectors (Google Places, lightweight web fetch, Wappalyzer, optional WHOIS), explainable signals, deterministic scoring, streaming results, mini-CRM (notes/tags/status), saved searches/board view, CSV export—**plus** the thin **event** and **artifact** seams for future modules. All other features wait until Phase 1 acceptance criteria are met.


---

# PRD — SMB Lead Finder (“Mothership · Leads”)

## 0) Executive Summary
Build a **single-user, prompt-first lead finder** that turns plain English (e.g., *“dentists in Columbia, SC with no chat widget and owner identifiable”*) into a structured query, fetches candidates from trusted sources, **enriches**, **dedupes**, **scores**, and returns **explainable, ranked leads** in a lightweight, personal **mini-CRM**.  
Future features (outreach, POCs, website/quote builders) will attach via an **event log** and an **artifact store**—added now as thin seams, not active features.

## 1) Goals, Non-Goals, Principles

### Goals (MVP+)
- **Prompt → Query**: Parse a natural-language prompt into a validated **LeadQuery DSL**.
- **Find & Enrich**: Pull SMBs from APIs, enrich with website/tech/owner signals, dedupe, normalize.
- **Score & Explain**: Rank by “likelihood to buy” your AI services; show **exact signals and evidence**.
- **Work the list**: Triage (New, Qualified, Ignored), notes, tags, saved searches, CSV export.
- **Composable core**: Include **event log** & **artifact registry** (no UI yet) to enable future bolt-ons.

### Non-Goals (for Part 1)
- Sending emails/SMS/calls, campaign automation.  
- Multi-user features, permissions, or shared workspaces.  
- Full CRM (pipelines/forecasts).  
- Paid data enrichers (optional later).

### Design Principles
- **Single screen, minimal clicks**.  
- **Evidence-first**: Every claim ties to a URL/snippet.  
- **APIs over scraping**; respect ToS, throttle, cache.  
- **Typed contracts** (schema-first, testable).  
- **Small prompts**; deterministic behavior.

## 2) Primary Persona & JTBD
**Persona**: Solo founder/operator (you).  
**JTBD**: “When I describe a niche + location + constraints, give me a **clean, evidence-backed list** of **high-probability SMB buyers** in minutes, so I can start selling.”

## 3) Success Metrics (product-visible)
- **Precision@50**: ≥80% of top-50 leads truly meet hard constraints on manual audit.  
- **Enrichment coverage**: ≥70% of leads have **owner name OR direct email/phone** (where permissible).  
- **Time-to-first 20 leads**: ≤2 minutes per search (stream progressively).  
- **Explainability**: 100% of positive/negative signals have evidence (URL + snippet).  
- **Operator effort**: ≤3 clicks to export a clean CSV.

## 4) User Flows

### 4.1 Prompt → Results
1. User types prompt (chips show examples) → optional “Advanced” drawer (location, vertical, constraints).  
2. **Parser agent** produces a **LeadQuery DSL**; preview shown; user can edit.  
3. **Search job** starts: connectors fetch candidates → enrichers attach signals → dedupe → score.  
4. Results stream into a table; user triages leads; opens right-side **lead card** for details.  
5. User saves search, tags leads, writes notes, exports CSV.

### 4.2 Saved Search as a Board
- Open a saved search to a Kanban-like board (columns: New, Qualified, Ignored). Drag to update `status`.

## 5) Information Architecture
- **Search Jobs**: immutable snapshots of a run, bound to a specific DSL.
- **Leads**: canonical `business` + `location(s)` + `people`.
- **Signals**: typed facts with value, confidence, evidence.
- **Lead Views**: scored, per-search projection of a business.
- **Lists/Tags/Notes/Status**: personal workflow metadata.
- **Events** *(thin seam)*: append-only log for future automations.
- **Artifacts** *(thin seam)*: references to generated assets (draft outreach, demo zips, etc.).

## 6) LeadQuery DSL (v1)

**Purpose**: Deterministic, editable representation of a search.

```yaml
version: 1
vertical: "dentist"            # enum: dentist | law_firm | contractor | hvac | roofing | generic
geo:
  city: "Columbia"
  state: "SC"
  radius_km: 40                # optional; if absent, city+state only
constraints:
  must:
    - no_website: true         # missing or non-functional
    - has_chatbot: false
    - owner_identified: true
  optional:
    - has_online_booking: false
exclusions:
  - franchise: true
result_size:
  target: 250                  # soft cap
sort_by: "score_desc"
lead_profile: "generic"        # selects weight preset
output:
  contract: "csv"              # csv | json
notify:
  on_complete: true
compliance_flags:
  - respect_dnc                # future use
  - two_party_recording_state_notes
```

**Validation**: Required fields present; enums valid; numeric ranges sane; ambiguous text flagged.

## 7) Signals & Scoring

### 7.1 Signals (MVP set)
- **Website presence**: `no_website: boolean` (+/-).  
- **Chat widget**: `has_chatbot: boolean` (detect via API/DOM heuristics).  
- **Online booking**: `has_online_booking: boolean` (Calendly, LocalMed, NexHealth, Doctible, Zocdoc, Setmore, Acuity, Square Appointments, Mindbody, Jane, Tebra; contractors: Jobber, Housecall Pro, ServiceTitan).  
- **Owner identified**: `owner_identified: boolean` (About/Team/contact page patterns; “Owner/Principal/Dr./DDS/DMD/Esq.”).  
- **Domain age (optional)**: `domain_age_years: number` (WHOIS, if inexpensive) → P1.  
- **Review count**: `review_count: number` (no text storage in MVP).  
- **Franchise guess**: `franchise_guess: boolean` (brand list + “locations” page heuristic).

Each signal has: `type, value_json, confidence (0..1), evidence_url, evidence_snippet(≤200 chars), detected_at, source_key`.

### 7.2 Lead Score (0–100)
```
Score = 0.35*ICP + 0.35*Pain + 0.20*Reachability - 0.10*ComplianceRisk
```
- **ICP**: geo & vertical match, non-franchise, review_count within niche norms.  
- **Pain**: `no_website`, `has_chatbot=false`, `has_online_booking=false`, `franchise_guess=false`.  
- **Reachability**: `owner_identified`, direct contact fields present.  
- **ComplianceRisk**: flags for future outreach (minimal now).

**Weights** in a JSON config; **profiles** (e.g., `dentist-intake`, `contractor-quote`) are just alternate weight sets.  
**Feedback**: user can mark a signal incorrect; that signal’s weight zeroes for that lead (recorded as `overridden_by_user`).

## 8) Data Sources & Connectors (MVP)
- **Google Places / Place Details API**: name, address, website, phone, rating, review count.  
- **HTTP fetch (site home, About/Team/Contact)**: basic DOM checks (chat widgets, booking links, owner patterns).  
- **Wappalyzer** *(preferred)*: tech detection; or **lightweight heuristics config** as fallback.  
- **WHOIS** *(P1 optional, if low cost)*: domain age.

**Connector contract**
```ts
interface Connector {
  key: "google_places" | "http_fetch" | "wappalyzer" | "whois";
  search(dsl: LeadQuery): AsyncGenerator<Candidate>;     // id, name, address, website?, phone?
  enrich(biz: Business): Promise<Signal[]>;               // returns detected signals with evidence
  metadata(): { rateLimit: string, tosUrl: string, version: string };
}
```

**ToS posture**: Prefer APIs; obey rate limits; cache responses; for HTML, follow robots.txt; store **only short snippets**.

## 9) System Architecture

### 9.1 High-level
- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind.  
- **API**: Node (NestJS) or Fastify + TypeScript; REST for MVP.  
- **Workers**: BullMQ (Redis) jobs for `fetch`, `enrich`, `score`, `dedupe`.  
- **DB**: PostgreSQL (no PostGIS for MVP; Haversine in code).  
- **Cache**: Redis (per-URL/content hash TTL).  
- **LLM**: provider-agnostic (small prompts) for parse -> DSL and summarizing snippets.  
- **Headless browser**: Playwright for tricky pages (toggleable, low concurrency).

### 9.2 Key Services
- **Parser agent** (LLM): prompt → DSL JSON (with strict schema validation).  
- **Fetcher(s)**: Google Places search + Place Details; optional Bing/alt search avoided for ToS simplicity.  
- **Enricher(s)**: website fetcher → DOM heuristics (booking/chat links), Wappalyzer (if enabled), owner extraction via simple patterns.  
- **Classifier**: vertical sanity check (regex/category mapping), franchise heuristic.  
- **Scorer**: compute subscores & total; attach to `lead_view`.  
- **Compliance checker**: map state → one/two-party recording tag (static config).  
- **Event writer**: logs `SearchStarted`, `LeadAdded`, `LeadUpdated`, `SearchCompleted`.

## 10) Data Model (PostgreSQL)

```sql
-- core
TABLE search_job(
  id UUID PK,
  dsl_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT CHECK (status IN ('queued','running','completed','failed')) NOT NULL,
  summary_stats JSONB,
  error_text TEXT
);

TABLE business(
  id UUID PK,
  name TEXT NOT NULL,
  vertical TEXT,                  -- 'dentist','law_firm','contractor','generic'
  website TEXT,
  phone TEXT,
  address_json JSONB,             -- {street, city, state, zip, country}
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  franchise_bool BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

TABLE location(
  id UUID PK,
  business_id UUID REFERENCES business(id),
  address_json JSONB,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

TABLE person(
  id UUID PK,
  business_id UUID REFERENCES business(id),
  name TEXT,
  role TEXT,                      -- 'Owner','Principal','Dr.','Attorney', etc.
  email TEXT,
  phone TEXT,
  source_url TEXT,
  confidence NUMERIC,             -- 0..1
  created_at TIMESTAMPTZ DEFAULT now()
);

TABLE signal(
  id UUID PK,
  business_id UUID REFERENCES business(id),
  type TEXT,                      -- 'no_website','has_chatbot','has_online_booking',...
  value_json JSONB,
  confidence NUMERIC,
  evidence_url TEXT,
  evidence_snippet TEXT,
  source_key TEXT,                -- connector key
  detected_at TIMESTAMPTZ DEFAULT now(),
  overridden_by_user BOOLEAN DEFAULT FALSE
);

TABLE lead_view(
  id UUID PK,
  search_job_id UUID REFERENCES search_job(id),
  business_id UUID REFERENCES business(id),
  score INT,
  subscores_json JSONB,
  rank INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

TABLE note(
  id UUID PK,
  business_id UUID REFERENCES business(id),
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

TABLE tag(id UUID PK, label TEXT UNIQUE);
TABLE business_tag(business_id UUID REFERENCES business(id), tag_id UUID REFERENCES tag(id), PRIMARY KEY(business_id, tag_id));

TABLE status_log(
  id UUID PK,
  business_id UUID REFERENCES business(id),
  status TEXT CHECK (status IN ('new','qualified','ignored')) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- seams for future modules
TABLE event(
  id UUID PK,
  type TEXT,                      -- 'SearchStarted','LeadStarred','SearchCompleted',...
  entity_type TEXT,               -- 'business','search_job'
  entity_id UUID,
  payload_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_flags JSONB
);

TABLE artifact(
  id UUID PK,
  business_id UUID REFERENCES business(id),
  type TEXT,                      -- 'draft_outreach','demo_zip', etc.
  uri TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- helpful indexes
CREATE INDEX idx_business_name ON business USING gin (to_tsvector('simple', name));
CREATE INDEX idx_business_geo ON business(lat, lng);
CREATE INDEX idx_signal_business_type ON signal(business_id, type);
CREATE INDEX idx_lead_view_rank ON lead_view(search_job_id, rank);
```

## 11) API Surface (MVP)

### 11.1 REST (JSON)
- `POST /api/search_jobs`  
  **Body**: `{ prompt?: string, dsl?: LeadQuery }`  
  **Return**: `{ job_id, dsl, status }` (starts async job; stream results via SSE)

- `GET /api/search_jobs/:id`  
  **Return**: `{ job, summary_stats }`

- `GET /api/search_jobs/:id/stream` (SSE)  
  Events: `lead:add`, `lead:update`, `job:status`, `job:complete`

- `GET /api/leads?search_job_id=...&status=...&q=...&limit=...&offset=...`  
  **Return**: array of rows (joined with latest `lead_view` for that job)

- `GET /api/leads/:business_id` → full lead card (business + people + signals + notes + tags + history)

- `PATCH /api/leads/:business_id/status` → `{status}` → writes `status_log`, emits `event`

- `POST /api/notes` → `{business_id, text}`

- `POST /api/tags` / `POST /api/leads/:business_id/tags`  

- `GET /api/export?search_job_id=...&format=csv` → curated CSV (see §11.3)

### 11.2 Parser
- `POST /api/parse_prompt`  
  **Body**: `{ prompt: string }`  
  **Return**: `{ dsl, warnings[] }` (uses LLM + JSON schema validation)

### 11.3 CSV Export Columns (initial)
`name, vertical, phone, website, street, city, state, zip, owner_name, owner_email, owner_phone, score, signals(no_website,has_chatbot,has_online_booking,owner_identified,review_count,franchise_guess), evidence_links`

## 12) Frontend (UI/UX)

### 12.1 Layout
- **Header**: App name, Saved Searches dropdown.  
- **Left panel**:  
  - Prompt box with starter chips (e.g., *Dentists w/o chat*, *Remodelers w/o site*).  
  - “Advanced” drawer: vertical, location, radius, constraints (checkboxes), exclusions, result size.  
  - DSL preview (read-only with an “Edit DSL” toggle).
- **Main**:  
  - Results table (TanStack Table). Columns: Rank, Score, Name, City, Signals (chips), Owner, Contact, Review#, Website, Actions.  
  - Infinite scroll/“Load more”; top-20 stream in first.  
- **Right drawer (Lead Card)**:  
  - Summary; subscores; signal list with evidence tooltips; people/contacts; notes; tags; status buttons; provenance (“connectors used”).  
  - **Artifacts tab** (empty view for now).

### 12.2 Interactions
- Keyboard: ⌘K global search; ↑/↓ move selection; Enter opens lead card.  
- Bulk actions: Select rows → “Tag”, “Export selection”.  
- Evidence: hover chip → snippet; click → source URL in new tab.  
- Saved search = **Board view** (columns by status).

## 13) Prompts (LLM) — Minimal & Deterministic

### 13.1 Parser Prompt (system)
> Convert the user’s text into a **LeadQuery DSL JSON** that matches this JSON Schema: [embed schema]. If ambiguous, make conservative choices and include `warnings[]`. Do not invent fields. Output ONLY JSON.

**Few-shot examples** (store with tests):  
- *“dentists in columbia sc with no chat widget and owner identified”* → DSL with `vertical: dentist`, `geo: {city: Columbia, state: SC}`, `constraints.must: [has_chatbot:false, owner_identified:true]`.

### 13.2 Evidence Summarizer (optional)
> Given HTML text and the signal type, extract a ≤200-char snippet that supports the signal; never include secrets or long quotes.

## 14) Heuristics (Detectors) — Config-driven

### 14.1 Chatbot
- **Script src/domain matches** (examples): `intercom.`, `drift.`, `tidio.`, `crisp.`, `livechat.`, `zopim/zendesk.`, `hubspot/js/hs-chat`, `botpress.`, `manychat.`, `smartsupp.`, `tawk.to`.  
- **DOM selectors**: elements with aria-labels “chat”, widgets with fixed bottom-right footprints.

### 14.2 Online Booking
- Link contains: `calendly.com`, `localmed.com`, `nexhealth.com`, `doctible.com`, `zocdoc.com`, `setmore.com`, `acuityscheduling.com`, `squareup.com/appointments`, `mindbodyonline.com`, `jane.app`, `tebra.com`, `housecallpro.com`, `getjobber.com`, `servicetitan.com`.  
- Button text matches: “Book Online”, “Schedule Now”, “Request Appointment”.

### 14.3 Owner Identification
- “About/Our team/Meet the doctor/Attorney” pages contain role keywords: Owner, Principal, Founder, Managing Partner, Dr., DDS, DMD, Esq.  
- For dental/law, if solo practice name matches person name (e.g., “Maria Vega DDS”), set positive with medium confidence.

## 15) Jobs & Orchestration

### 15.1 Job Types
- `search_job:start` → enqueue `fetch` tasks  
- `fetch:candidate_batch` → write/update `business` rows + enqueue `enrich`  
- `enrich:business` → emit `signal[]` → enqueue `score`  
- `score:business` → write `lead_view`  
- `job:finalize` → compute `summary_stats`, emit `SearchCompleted` event

### 15.2 Concurrency & Backpressure
- Global concurrency cap; per-connector caps; exponential backoff on 429/5xx.  
- Stream first 20 results ASAP; remaining pages in background until `target` met or sources exhausted.

## 16) Config, Secrets, and Cost Controls

### 16.1 Env Vars
```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
OPENAI_API_KEY=...              # or alt provider
GOOGLE_MAPS_API_KEY=...
WAPPALYZER_API_KEY=...          # optional
SENTRY_DSN=...                  # optional
```

### 16.2 Tunables (JSON in repo)
- `CONNECTOR_LIMITS`: per-minute caps.  
- `CACHE_TTLS`: places 7d, wappalyzer 14d, http_fetch 3d, whois 30d.  
- `SCORING_PROFILES`: weight sets by `lead_profile`.  
- `DETECTORS`: lists for chat/booking vendors, owner keywords.  
- `TWO_PARTY_STATES`: static array for compliance flagging.

## 17) Observability & Debuggability
- **Job health** widget in UI: fetched/enriched/scored counts; errors; backoffs.  
- **Per-lead provenance**: show connectors used + processing times.  
- **Replayability**: “Re-run with same DSL” captures prompt & component versions in `search_job.summary_stats`.

## 18) Security, Privacy, ToS
- Respect robots.txt and API ToS; throttle; backoff.  
- Store **URLs + short evidence snippets** only; avoid wholesale content storage.  
- PII minimization: show contacts only after you mark a lead `Qualified` (configurable).  
- Single-user auth (simple password or local passkey); keys stored server-side; frontend never sees API keys.

## 19) Acceptance Criteria (must pass before you “ship”)

1. **Filter correctness**  
   - On three golden queries (Dentist/Columbia; Remodel/Charleston; Law/Dallas), **≥80%** of top-20 satisfy hard constraints.

2. **Evidence coverage**  
   - **≥95%** of signals displayed include **evidence_url + snippet**; broken links ≤2%.

3. **Latency / Streaming**  
   - First **20** results appear in ≤2 minutes on a warm cache with default concurrency.

4. **Determinism**  
   - Re-running the same saved search within 24h yields **≥90% identical** top-50 (allowing source churn).

5. **UX**  
   - Keyboard navigation works; CSV exports open cleanly in Sheets/Excel; Board view drag-and-drop updates `status_log`.

## 20) Test Plan

### 20.1 Unit
- Parser: prompt → DSL → schema validates; ambiguous prompts produce `warnings[]`.  
- Detectors: given synthetic HTML, chat/booking/owner detection returns expected booleans.

### 20.2 Integration
- Connector contract: mock Google Places; ensure pagination & backoff respected.  
- End-to-end: start job → stream → verify `lead_view` ranks and signals present.

### 20.3 “Golden Set” Manual QA
- Create 20 hand-labeled truths per golden query; audit top-20 results against labels.

### 20.4 Regression
- Snapshot tests for scoring: same inputs → same subscores.  
- Nightly dry run (cache-only) to catch breaking changes.

## 21) Milestones (phase-based, no dates)

**M0 – Skeleton**  
- Repo scaffolding (mono-repo), types, env, health checks.  
- Parser endpoint + JSON Schema.  
- Search job creation + SSE stream placeholder.

**M1 – Find**  
- Google Places connector (text & details).  
- Business persistence, dedupe (normalize LLC/Inc, Jaro-Winkler name+phone+address).

**M2 – Enrich**  
- HTTP fetcher + detectors (chat/booking/owner).  
- Wappalyzer (if API key present).  
- Signals table with evidence.

**M3 – Score & UX**  
- Scoring service + weight profiles.  
- Results table + lead card + notes/tags/status.  
- CSV export + saved searches + Board view.

**M4 – Quality & Seams**  
- Acceptance tests pass.  
- Event log writes; Artifact table visible (empty tab).  
- Job health widget; replay run.

## 22) Deliverables to Implement (Cursor-friendly Checklist)

- [ ] JSON Schema for **LeadQuery DSL** + TypeScript types.  
- [ ] Parser agent with minimal few-shots + hard validation.  
- [ ] Connector interface + Google Places connector + unit tests.  
- [ ] HTTP fetcher with: robots check, per-domain throttle, caching, DOM detectors.  
- [ ] Wappalyzer integration (feature-flag).  
- [ ] Dedupe utilities (normalize name, phone E.164, address standardizer).  
- [ ] Scoring engine + profiles config.  
- [ ] REST endpoints + SSE stream; auth (single-user).  
- [ ] Frontend: Prompt/Advanced → DSL preview; Results/Lead Card; Board view; CSV export.  
- [ ] Postgres migrations; seed scripts for detectors/weights config.  
- [ ] Observability: structured logs, error boundary, job health widget.  
- [ ] Golden queries + manual audit doc.

## 23) Example Responses (for Cursor to aim at)

### 23.1 `POST /api/parse_prompt`
```json
{
  "dsl": {
    "version": 1,
    "vertical": "dentist",
    "geo": {"city":"Columbia","state":"SC","radius_km":40},
    "constraints":{"must":[{"no_website":true},{"has_chatbot":false},{"owner_identified":true}]},
    "exclusions":["franchise"],
    "result_size":{"target":250},
    "sort_by":"score_desc",
    "lead_profile":"generic",
    "output":{"contract":"csv"},
    "notify":{"on_complete":true},
    "compliance_flags":["respect_dnc","two_party_recording_state_notes"]
  },
  "warnings":[]
}
```

### 23.2 Lead row (table)
```json
{
  "rank": 3,
  "score": 86,
  "name": "Lakefront Dental",
  "city": "Columbia",
  "state": "SC",
  "website": null,
  "phone": "+1-803-555-0199",
  "signals": {"no_website": true, "has_chatbot": false, "has_online_booking": false, "owner_identified": true},
  "owner": "Dr. Maria Vega",
  "review_count": 112
}
```

### 23.3 Lead card (details)
```json
{
  "business": {...},
  "subscores":{"ICP":30,"Pain":42,"Reachability":18,"ComplianceRisk":4},
  "signals": [
    {"type":"no_website","value_json":true,"confidence":0.93,"evidence_url":"https://maps.google.com/...","evidence_snippet":"Google profile has no website."},
    {"type":"has_chatbot","value_json":false,"confidence":0.88,"evidence_url":"https://lakefrontdental.com","evidence_snippet":"No chat widget scripts found."},
    {"type":"owner_identified","value_json":true,"confidence":0.77,"evidence_url":"https://lakefrontdental.com/about","evidence_snippet":"About: 'Dr. Maria Vega, Owner'"}
  ],
  "people":[{"name":"Dr. Maria Vega","role":"Owner","email":"maria@...","confidence":0.7,"source_url":"..."}],
  "notes":[...],
  "tags":["Dentist-Columbia-NoSite"],
  "provenance":{"connectors":["google_places","http_fetch","wappalyzer"],"durations_ms":{"fetch":643,"enrich":981,"score":22}}
}
```

## 24) Out-of-Scope (explicit)
- Any automated contact (email/SMS/calls).  
- Third-party contact databases that require complex contracts.  
- Persistent storage of full review texts or scraped page bodies.  
- Multi-user/team features.

**This PRD is intentionally “MVP+”**: it gives you a working, elegant lead finder with **evidence, scoring, saved searches, and a board view**—while quietly laying down **event** and **artifact** seams so you can later attach Outreach, POC generators, and build automations without re-architecting.
