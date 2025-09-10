export interface Candidate {
  id: string;
  name: string;
  address?: string;
  website?: string | null;
  phone?: string | null;
}

export interface SignalRecord {
  type: string;
  value_json: unknown;
  confidence: number; // 0..1
  evidence_url: string;
  evidence_snippet: string; // ≤200 chars
  source_key: string; // connector key
  detected_at: string; // ISO timestamp
}

export interface ConnectorMetadata {
  rateLimit: string;
  tosUrl: string;
  version: string;
}

export interface Connector<TQuery = unknown> {
  key: 'google_places' | 'http_fetch' | 'wappalyzer' | 'whois';
  search(dsl: TQuery): AsyncGenerator<Candidate>;
  enrich(business: { id: string; name: string; website?: string | null }): Promise<SignalRecord[]>;
  metadata(): ConnectorMetadata;
}

