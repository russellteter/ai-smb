export type Artifact = {
  id: string;
  business_id: string;
  type: string; // 'draft_outreach' | 'demo_zip' etc.
  uri: string;
  metadata_json?: Record<string, unknown>;
  created_at: string; // ISO
};

export async function registerArtifact(_artifact: Omit<Artifact, 'id' | 'created_at'>): Promise<Artifact> {
  // Stub registrar seam; actual persistence happens in API service
  const now = new Date().toISOString();
  return { id: 'stub', created_at: now, ..._artifact } as Artifact;
}

