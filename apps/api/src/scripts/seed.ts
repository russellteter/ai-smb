import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL not set');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const base = path.join(process.cwd(), '..', '..', 'packages', 'shared', 'config');
  const detectors = JSON.parse(fs.readFileSync(path.join(base, 'DETECTORS.json'), 'utf8'));
  const profiles = JSON.parse(fs.readFileSync(path.join(base, 'SCORING_PROFILES.json'), 'utf8'));
  // Store configs as events for visibility (simple seed)
  await client.query('INSERT INTO event (id, type, entity_type, payload_json) VALUES (uuid_generate_v4(), $1, $2, $3)', ['seed:detectors', 'config', detectors]);
  await client.query('INSERT INTO event (id, type, entity_type, payload_json) VALUES (uuid_generate_v4(), $1, $2, $3)', ['seed:scoring_profiles', 'config', profiles]);
  await client.end();
  console.log('Seeds written');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

