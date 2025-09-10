CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS search_job(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dsl_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('queued','running','completed','failed')),
  summary_stats JSONB,
  error_text TEXT
);

CREATE TABLE IF NOT EXISTS business(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  vertical TEXT,
  website TEXT,
  phone TEXT,
  address_json JSONB,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  franchise_bool BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS location(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business(id),
  address_json JSONB,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS person(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business(id),
  name TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  source_url TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signal(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business(id),
  type TEXT,
  value_json JSONB,
  confidence NUMERIC,
  evidence_url TEXT,
  evidence_snippet TEXT,
  source_key TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  overridden_by_user BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS lead_view(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_job_id UUID REFERENCES search_job(id),
  business_id UUID REFERENCES business(id),
  score INT,
  subscores_json JSONB,
  rank INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS note(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business(id),
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tag(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS business_tag(
  business_id UUID REFERENCES business(id),
  tag_id UUID REFERENCES tag(id),
  PRIMARY KEY(business_id, tag_id)
);

CREATE TABLE IF NOT EXISTS status_log(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business(id),
  status TEXT NOT NULL CHECK (status IN ('new','qualified','ignored')),
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT,
  entity_type TEXT,
  entity_id UUID,
  payload_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_flags JSONB
);

CREATE TABLE IF NOT EXISTS artifact(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES business(id),
  type TEXT,
  uri TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_name ON business USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_business_geo ON business(lat, lng);
CREATE INDEX IF NOT EXISTS idx_signal_business_type ON signal(business_id, type);
CREATE INDEX IF NOT EXISTS idx_lead_view_rank ON lead_view(search_job_id, rank);

