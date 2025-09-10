import Fastify from 'fastify';
import cors from '@fastify/cors';
import sse from 'fastify-sse-v2';
import { z } from 'zod';
import { LeadQuerySchema, ParsePromptRequestSchema } from '@mothership/shared';
import OpenAI from 'openai';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
// Load dotenv only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
import { Client } from 'pg';
import { toCsv } from '@mothership/shared';

const app = Fastify({ logger: true });

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
console.log('Connecting to Redis:', redisUrl.replace(/:([^@]+)@/, ':****@'));

await app.register(cors, { origin: true });
await app.register(sse);

// BullMQ setup - NO FALLBACK
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});
const searchQueue = new Queue('search', { connection });
const searchEvents = new QueueEvents('search', { connection });

app.get('/', async () => ({ service: 'mothership-api', status: 'live', version: '1.0.0' }));
app.get('/health', async () => ({ ok: true }));
app.get('/api/job_health', async () => {
  // Minimal stub until full metrics: return queue counts
  const counts = await searchQueue.getJobCounts('waiting','active','completed','failed','delayed');
  return { queue: counts };
});

app.post('/api/parse_prompt', async (req, reply) => {
  const body = ParsePromptRequestSchema.safeParse(req.body);
  if (!body.success) {
    reply.code(400);
    return { error: 'Invalid request' };
  }
  if (!process.env.OPENAI_API_KEY) {
    const dsl = { version: 1, vertical: 'generic', geo: { city: 'Unknown', state: 'NA' }, sort_by: 'score_desc' as const, lead_profile: 'generic', output: { contract: 'csv' } };
    return { dsl, warnings: ['OPENAI_API_KEY missing; using generic defaults'] };
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let warnings: string[] = [];
  // Minimal structured prompt for JSON-only response
  const system = 'You convert user text into a LeadQuery DSL JSON that strictly matches the provided JSON Schema. Output ONLY JSON. If ambiguous, add conservative defaults and include a warnings array.';
  const user = `Schema (types concise): { version:1, vertical: one of dentist|law_firm|contractor|hvac|roofing|generic, geo:{city,state,radius_km?}, constraints:{must?:[],optional?:[]}, exclusions?:[], result_size?:{target}, sort_by?:"score_desc", lead_profile?:string, output?:{contract:"csv"|"json"}, notify?:{on_complete:boolean}, compliance_flags?:[] }\nPrompt: ${body.data.prompt}`;
  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    }, { timeout: 20000 });
    const text = resp.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);
    warnings = parsed.warnings || [];
    const validated = LeadQuerySchema.safeParse(parsed.dsl ?? parsed);
    if (!validated.success) {
      reply.code(400);
      return { error: 'Parser returned invalid DSL', issues: validated.error.issues };
    }
    return { dsl: validated.data, warnings };
  } catch (e) {
    // Fallback to generic DSL on failure
    const dsl = { version: 1, vertical: 'generic', geo: { city: 'Unknown', state: 'NA' }, sort_by: 'score_desc' as const, lead_profile: 'generic', output: { contract: 'csv' } };
    return { dsl, warnings: ['LLM parser timeout/failure; using generic defaults'] };
  }
});

app.post('/api/search_jobs', async (req, reply) => {
  const body = req.body as any;
  let dsl = body?.dsl;
  if (!dsl && body?.prompt) {
    // naive conversion via stub
    dsl = {
      version: 1,
      vertical: 'generic',
      geo: { city: 'Unknown', state: 'NA' }
    };
  }
  const parsed = LeadQuerySchema.safeParse(dsl);
  if (!parsed.success) {
    reply.code(400);
    return { error: 'Invalid DSL' };
  }
  const job = await searchQueue.add('start', { dsl: parsed.data });
  return { job_id: job.id, dsl: parsed.data, status: 'queued' };
});

app.get('/api/search_jobs/:id/stream', async (req, reply) => {
  const { id } = (req.params as any);
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.sse({ data: JSON.stringify({ type: 'job:status', status: 'running' }) });
  const onProgress = (event: any) => {
    if (event.jobId === id && event.data) {
      reply.sse({ data: JSON.stringify(event.data) });
    }
  };
  const onCompleted = (event: any) => {
    if (event.jobId === id) {
      reply.sse({ data: JSON.stringify({ type: 'job:complete', summary_stats: {} }) });
    }
  };
  searchEvents.on('progress', onProgress);
  searchEvents.on('completed', onCompleted);
  reply.raw.on('close', () => {
    searchEvents.off('progress', onProgress as any);
    searchEvents.off('completed', onCompleted as any);
  });
});

app.get('/api/export', async (req, reply) => {
  const searchJobId = (req.query as any).search_job_id as string | undefined;
  if (!searchJobId) {
    reply.code(400);
    return { error: 'search_job_id required' };
  }
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    reply.code(500);
    return { error: 'Database configuration error' };
  }
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  const res = await client.query(
    `SELECT b.name, b.vertical, b.phone, b.website,
            (b.address_json->>'street') as street,
            (b.address_json->>'city') as city,
            (b.address_json->>'state') as state,
            (b.address_json->>'zip') as zip,
            lv.score
       FROM lead_view lv
       JOIN business b ON b.id = lv.business_id
      WHERE lv.search_job_id = $1
      ORDER BY lv.score DESC`, [searchJobId]
  );
  await client.end();
  const rows = res.rows.map((r: any) => ({
    name: r.name,
    vertical: r.vertical || 'generic',
    phone: r.phone,
    website: r.website,
    street: r.street,
    city: r.city,
    state: r.state,
    zip: r.zip,
    score: r.score,
    signals: {},
    evidence_links: []
  }));
  const csv = toCsv(rows);
  reply.header('Content-Type', 'text/csv');
  reply.header('Content-Disposition', 'attachment; filename="export.csv"');
  return csv;
});

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});


