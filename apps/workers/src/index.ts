import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { z } from 'zod';
import { Client } from 'pg';

// Load dotenv only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Validate required environment variables
if (!process.env.REDIS_URL) {
  console.error('ERROR: REDIS_URL environment variable is required');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

// Log Redis URL for debugging (without exposing password)
const redisUrl = process.env.REDIS_URL;
console.log('Workers connecting to Redis:', redisUrl.replace(/:([^@]+)@/, ':****@'));

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

const searchQueue = new Queue('search', { connection });
const fetchQueue = new Queue('fetch', { connection });
const enrichQueue = new Queue('enrich', { connection });
const scoreQueue = new Queue('score', { connection });

// Simple Places textsearch → details pipeline (M1 subset)
const PlacesTextSearch = z.object({ results: z.array(z.object({ place_id: z.string() })), next_page_token: z.string().optional() });
const PlacesDetails = z.object({ result: z.object({ name: z.string(), formatted_address: z.string().optional(), website: z.string().optional(), formatted_phone_number: z.string().optional() }) });

async function googlePlacesTextSearch(query: string, pageToken?: string) {
  const params = new URLSearchParams({ query, key: process.env.GOOGLE_MAPS_API_KEY || '' });
  if (pageToken) params.set('pagetoken', pageToken);
  const resp = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
  const json = await resp.json();
  return PlacesTextSearch.parse(json);
}

async function googlePlacesDetails(placeId: string) {
  const params = new URLSearchParams({ place_id: placeId, key: process.env.GOOGLE_MAPS_API_KEY || '', fields: 'name,formatted_address,website,formatted_phone_number' });
  const resp = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const json = await resp.json();
  return PlacesDetails.parse(json);
}

new Worker('search', async (job) => {
  const dsl = (job.data as any).dsl as { vertical: string; geo: { city: string; state: string } };
  const query = `${dsl.vertical} in ${dsl.geo.city} ${dsl.geo.state}`;
  let pageToken: string | undefined = undefined;
  let count = 0;
  for (let page = 0; page < 1; page++) { // one page for MVP stub
    const pageData = await googlePlacesTextSearch(query, pageToken);
    for (const r of pageData.results) {
      const details = await googlePlacesDetails(r.place_id);
      await enrichQueue.add('business', { candidate: details.result, searchId: job.id });
      await job.updateProgress({ type: 'lead:add', business: details.result });
      count++;
      if (count >= 20) break;
    }
    if (count >= 20) break;
    pageToken = pageData.next_page_token;
    if (!pageToken) break;
    await new Promise((res) => setTimeout(res, 2000));
  }
}, { connection });

new Worker('fetch', async (job) => {
  await enrichQueue.add('business', { businessId: 'stub' });
}, { connection });

new Worker('enrich', async (job) => {
  await scoreQueue.add('business', { business: job.data.candidate, searchId: job.data.searchId });
}, { connection });

new Worker('score', async (job) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const b = job.data.business as { name: string; formatted_address?: string; website?: string; formatted_phone_number?: string };
  // Simple dedupe: by website or (name+phone)
  const existing = await client.query(
    'SELECT id FROM business WHERE (website = $1 AND website IS NOT NULL) OR (name = $2 AND phone = $3) LIMIT 1',
    [b.website ?? null, b.name, b.formatted_phone_number ?? null]
  );
  const parsedAddress = parseAddress(b.formatted_address);
  let businessId: string;
  if (existing.rows.length > 0) {
    businessId = existing.rows[0].id as string;
  } else {
    const ins = await client.query(
      'INSERT INTO business (id, name, website, phone, address_json) VALUES (uuid_generate_v4(), $1, $2, $3, $4) RETURNING id',
      [b.name, b.website ?? null, b.formatted_phone_number ?? null, parsedAddress]
    );
    businessId = ins.rows[0].id as string;
  }
  // Minimal score
  const ICP = 20;
  const Pain = b.website ? 10 : 20;
  const Reachability = b.formatted_phone_number ? 15 : 5;
  const ComplianceRisk = 0;
  const total = Math.min(100, ICP + Pain + Reachability - ComplianceRisk);
  await client.query(
    'INSERT INTO lead_view (id, search_job_id, business_id, score, subscores_json, rank) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)',
    [job.data.searchId ?? null, businessId, total, { ICP, Pain, Reachability, ComplianceRisk }, 0]
  );
  await client.end();
}, { connection });

function parseAddress(formatted?: string | null) {
  if (!formatted) return null;
  // Heuristic: "Street, City, ST ZIP, Country" or similar
  const parts = formatted.split(',').map((s) => s.trim());
  let street: string | undefined;
  let city: string | undefined;
  let state: string | undefined;
  let zip: string | undefined;
  let country: string | undefined;
  if (parts.length >= 3) {
    street = parts[0];
    city = parts[1];
    const stZip = parts[2].split(' ').filter(Boolean);
    state = stZip[0];
    zip = stZip[1];
    if (parts[3]) country = parts[3];
  } else if (parts.length === 2) {
    street = parts[0];
    city = parts[1];
  }
  return { street: street ?? null, city: city ?? null, state: state ?? null, zip: zip ?? null, country: country ?? null, formatted };
}

const qe = new QueueEvents('search', { connection });
qe.on('completed', ({ jobId }) => {
  console.log('search completed', jobId);
});

console.log('Workers started');

