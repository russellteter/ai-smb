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

// Enhanced health check with service connectivity verification
app.get('/health', async () => {
  const health: any = {
    ok: true,
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
      openai: { configured: false },
      google_maps: { configured: false }
    }
  };

  // Check database connectivity
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    health.services.database.status = 'connected';
  } catch (err: any) {
    health.services.database.status = 'error';
    health.services.database.error = err.message;
    health.ok = false;
  }

  // Check Redis connectivity
  try {
    if (process.env.REDIS_URL) {
      const testConnection = new IORedis(process.env.REDIS_URL);
      await testConnection.ping();
      await testConnection.quit();
      health.services.redis.status = 'connected';
    } else {
      health.services.redis.status = 'error';
      health.services.redis.error = 'REDIS_URL not configured';
      health.ok = false;
    }
  } catch (err: any) {
    health.services.redis.status = 'error';
    health.services.redis.error = err.message;
    health.ok = false;
  }

  // Check API keys configuration
  health.services.openai.configured = !!process.env.OPENAI_API_KEY;
  if (!process.env.OPENAI_API_KEY) {
    health.services.openai.warning = 'OPENAI_API_KEY not set - prompt parsing will use fallback';
  }

  health.services.google_maps.configured = !!process.env.GOOGLE_MAPS_API_KEY;
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    health.services.google_maps.warning = 'GOOGLE_MAPS_API_KEY not set - location search disabled';
  }

  return health;
});

app.get('/api/job_health', async () => {
  try {
    // Get comprehensive queue metrics
    const counts = await searchQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
    
    // Get recent jobs for additional insights
    const [waiting, active, completed, failed] = await Promise.all([
      searchQueue.getJobs(['waiting'], 0, 5),
      searchQueue.getJobs(['active'], 0, 5),
      searchQueue.getJobs(['completed'], 0, 5),
      searchQueue.getJobs(['failed'], 0, 5)
    ]);
    
    // Calculate success rate
    const totalProcessed = counts.completed + counts.failed;
    const successRate = totalProcessed > 0 ? (counts.completed / totalProcessed) * 100 : 0;
    
    // Get worker info
    const workers = await searchQueue.getWorkers();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queue: {
        name: 'search',
        counts,
        success_rate: `${successRate.toFixed(1)}%`,
        workers: {
          count: workers.length,
          active: workers.filter(w => w.currentJobId).length
        }
      },
      recent_jobs: {
        waiting: waiting.map(j => ({
          id: j.id,
          created_at: new Date(j.timestamp).toISOString(),
          data: j.data
        })),
        active: active.map(j => ({
          id: j.id,
          started_at: j.processedOn ? new Date(j.processedOn).toISOString() : null,
          progress: j.progress
        })),
        completed: completed.slice(0, 3).map(j => ({
          id: j.id,
          completed_at: j.finishedOn ? new Date(j.finishedOn).toISOString() : null,
          duration_ms: j.finishedOn && j.processedOn ? j.finishedOn - j.processedOn : null
        })),
        failed: failed.slice(0, 3).map(j => ({
          id: j.id,
          failed_at: j.finishedOn ? new Date(j.finishedOn).toISOString() : null,
          reason: j.failedReason
        }))
      },
      recommendations: [
        counts.failed > counts.completed ? 'High failure rate detected - check worker logs' : null,
        counts.waiting > 100 ? 'Large queue backlog - consider scaling workers' : null,
        workers.length === 0 ? 'No workers detected - ensure worker service is running' : null
      ].filter(Boolean)
    };
  } catch (e: any) {
    app.log.error({ error: e.message }, 'Failed to get job health metrics');
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to retrieve queue metrics',
      details: e.message
    };
  }
});

app.post('/api/parse_prompt', async (req, reply) => {
  // Log incoming request
  app.log.info({ body: req.body }, 'Received parse_prompt request');
  
  // Validate request body
  const body = ParsePromptRequestSchema.safeParse(req.body);
  if (!body.success) {
    app.log.warn({ errors: body.error.issues }, 'Invalid parse_prompt request');
    reply.code(400);
    return { 
      error: 'Invalid request', 
      details: body.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    };
  }
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    app.log.warn('OPENAI_API_KEY not configured - using fallback DSL');
    const fallbackDsl = {
      version: 1,
      vertical: 'generic' as const,
      geo: { city: 'San Francisco', state: 'CA', radius_km: 10 },
      sort_by: 'score_desc' as const,
      lead_profile: 'ai_services_buyer',
      output: { contract: 'csv' as const },
      result_size: { target: 50 },
      constraints: { must: [], optional: [] },
      exclusions: [],
      notify: { on_complete: false },
      compliance_flags: []
    };
    return { 
      dsl: fallbackDsl, 
      warnings: ['OPENAI_API_KEY not configured. Using default DSL. Set OPENAI_API_KEY environment variable for AI-powered parsing.'] 
    };
  }
  
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let warnings: string[] = [];
  
  // Enhanced prompt with complete schema definition and state mapping
  const system = `You are a lead query parser. Convert user prompts into a LeadQuery DSL JSON object.

The DSL must strictly match this schema:
{
  "version": 1,
  "vertical": "dentist" | "law_firm" | "contractor" | "hvac" | "roofing" | "generic",
  "geo": {
    "city": string,
    "state": string (MUST be exactly 2 letter code like "SC", "CA", "TX"),
    "radius_km": number (optional, default 10, max 200)
  },
  "constraints": {
    "must": array of key-value objects (optional),
    "optional": array of key-value objects (optional)
  },
  "exclusions": array of strings or objects (optional),
  "result_size": { "target": number (default 50, max 500) },
  "sort_by": "score_desc",
  "lead_profile": string (REQUIRED, default "ai_services_buyer"),
  "output": { "contract": "csv" | "json" },
  "notify": { "on_complete": boolean },
  "compliance_flags": array of strings
}

CRITICAL Rules:
1. Output ONLY valid JSON
2. Always include ALL required fields: version, vertical, geo, lead_profile
3. state MUST be exactly 2 letters (convert "South Carolina" to "SC", "California" to "CA", etc.)
4. lead_profile is REQUIRED - always include it (default: "ai_services_buyer")
5. Parse location carefully - extract city and state separately
6. For appointment booking/website features, add to constraints.must

State abbreviation examples:
- South Carolina = SC
- North Carolina = NC  
- California = CA
- Texas = TX
- New York = NY
- Florida = FL`;
  
  const user = `Convert this prompt to LeadQuery DSL: "${body.data.prompt}"
  
Example: "Dentists in Charleston, South Carolina without an appointment booker" should produce:
{
  "version": 1,
  "vertical": "dentist",
  "geo": { "city": "Charleston", "state": "SC" },
  "lead_profile": "ai_services_buyer",
  "constraints": { "must": [{"key": "no_appointment_booker", "value": true}] },
  "sort_by": "score_desc",
  "output": { "contract": "csv" }
}`;
  
  try {
    app.log.info({ prompt: body.data.prompt }, 'Sending prompt to OpenAI');
    
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    }, { timeout: 20000 });
    
    const text = resp.choices[0]?.message?.content || '{}';
    app.log.debug({ response: text }, 'OpenAI response received');
    
    const parsed = JSON.parse(text);
    warnings = parsed.warnings || [];
    
    // Extract DSL from response (handle both direct DSL and nested structure)
    const dslCandidate = parsed.dsl || parsed;
    delete dslCandidate.warnings; // Remove warnings from DSL object
    
    // Apply defaults and validate
    const validated = LeadQuerySchema.safeParse(dslCandidate);
    
    if (!validated.success) {
      app.log.error({ 
        issues: validated.error.issues,
        candidate: dslCandidate 
      }, 'OpenAI returned invalid DSL');
      
      // Try to fix common issues
      const fixedDsl = {
        ...dslCandidate,
        version: 1,
        vertical: dslCandidate.vertical || 'generic',
        geo: {
          city: dslCandidate.geo?.city || 'San Francisco',
          state: dslCandidate.geo?.state?.substring(0, 2).toUpperCase() || 'CA',
          radius_km: dslCandidate.geo?.radius_km || 10
        },
        lead_profile: dslCandidate.lead_profile || 'ai_services_buyer',
        sort_by: dslCandidate.sort_by || 'score_desc',
        output: dslCandidate.output || { contract: 'csv' }
      };
      
      const retryValidation = LeadQuerySchema.safeParse(fixedDsl);
      if (retryValidation.success) {
        warnings.push('DSL required automatic corrections');
        app.log.info({ dsl: retryValidation.data }, 'DSL fixed and validated');
        return { dsl: retryValidation.data, warnings };
      }
      
      reply.code(400);
      return { 
        error: 'Parser returned invalid DSL', 
        issues: validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        warnings
      };
    }
    
    app.log.info({ dsl: validated.data, warnings }, 'Successfully parsed prompt to DSL');
    return { dsl: validated.data, warnings };
    
  } catch (e: any) {
    app.log.error({ error: e.message, stack: e.stack }, 'Failed to parse prompt');
    
    // Enhanced fallback DSL based on any keywords in the prompt
    const prompt = body.data.prompt.toLowerCase();
    let vertical: 'dentist' | 'law_firm' | 'contractor' | 'hvac' | 'roofing' | 'generic' = 'generic';
    
    if (prompt.includes('dentist') || prompt.includes('dental')) vertical = 'dentist';
    else if (prompt.includes('law') || prompt.includes('lawyer') || prompt.includes('attorney')) vertical = 'law_firm';
    else if (prompt.includes('contractor') || prompt.includes('construction')) vertical = 'contractor';
    else if (prompt.includes('hvac') || prompt.includes('heating') || prompt.includes('cooling')) vertical = 'hvac';
    else if (prompt.includes('roof')) vertical = 'roofing';
    
    const fallbackDsl = {
      version: 1,
      vertical,
      geo: { city: 'San Francisco', state: 'CA', radius_km: 10 },
      sort_by: 'score_desc' as const,
      lead_profile: 'ai_services_buyer',
      output: { contract: 'csv' as const },
      result_size: { target: 50 },
      constraints: { must: [], optional: [] },
      exclusions: [],
      notify: { on_complete: false },
      compliance_flags: []
    };
    
    const errorMessage = e.name === 'AbortError' ? 'OpenAI request timeout' : `OpenAI error: ${e.message}`;
    return { 
      dsl: fallbackDsl, 
      warnings: [errorMessage, 'Using fallback DSL with keyword detection'] 
    };
  }
});

app.post('/api/search_jobs', async (req, reply) => {
  app.log.info({ body: req.body }, 'Received search_jobs request');
  
  const body = req.body as any;
  let dsl = body?.dsl;
  
  // If no DSL but prompt provided, try to parse it first
  if (!dsl && body?.prompt) {
    app.log.info('No DSL provided, attempting to parse prompt');
    
    if (!process.env.OPENAI_API_KEY) {
      app.log.warn('Cannot parse prompt without OPENAI_API_KEY');
      reply.code(400);
      return { 
        error: 'DSL required when OPENAI_API_KEY not configured',
        hint: 'Either provide a DSL object or configure OPENAI_API_KEY for prompt parsing'
      };
    }
    
    // Parse the prompt to DSL
    try {
      const parseResponse = await fetch(`http://localhost:${port}/api/parse_prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: body.prompt })
      });
      
      if (!parseResponse.ok) {
        throw new Error(`Parse prompt failed: ${parseResponse.statusText}`);
      }
      
      const parsed = await parseResponse.json();
      dsl = parsed.dsl;
      app.log.info({ dsl, warnings: parsed.warnings }, 'Successfully parsed prompt to DSL');
    } catch (e: any) {
      app.log.error({ error: e.message }, 'Failed to parse prompt');
      reply.code(500);
      return { error: 'Failed to parse prompt', details: e.message };
    }
  }
  
  // Validate DSL
  const parsed = LeadQuerySchema.safeParse(dsl);
  if (!parsed.success) {
    app.log.warn({ errors: parsed.error.issues, dsl }, 'Invalid DSL provided');
    reply.code(400);
    return { 
      error: 'Invalid DSL', 
      issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    };
  }
  
  // Check for Google Maps API key if needed
  if (!process.env.GOOGLE_MAPS_API_KEY && parsed.data.vertical !== 'generic') {
    app.log.warn('GOOGLE_MAPS_API_KEY not configured - search may be limited');
  }
  
  try {
    // Add job to queue with metadata
    const job = await searchQueue.add('search', { 
      dsl: parsed.data,
      metadata: {
        created_at: new Date().toISOString(),
        source: body?.prompt ? 'prompt' : 'dsl',
        user_agent: req.headers['user-agent']
      }
    });
    
    app.log.info({ job_id: job.id, dsl: parsed.data }, 'Search job queued successfully');
    
    return { 
      job_id: job.id, 
      dsl: parsed.data, 
      status: 'queued',
      stream_url: `/api/search_jobs/${job.id}/stream`
    };
  } catch (e: any) {
    app.log.error({ error: e.message }, 'Failed to queue search job');
    reply.code(500);
    return { error: 'Failed to queue job', details: e.message };
  }
});

app.get('/api/search_jobs/:id/stream', async (req, reply) => {
  const { id } = (req.params as any);
  app.log.info({ job_id: id }, 'SSE stream requested');
  
  // Validate job exists
  const job = await searchQueue.getJob(id);
  if (!job) {
    reply.code(404);
    return { error: 'Job not found' };
  }
  
  // Set up SSE headers
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  // Send initial connection event
  reply.sse({ 
    event: 'connected',
    data: JSON.stringify({ 
      type: 'connection',
      job_id: id,
      timestamp: new Date().toISOString()
    })
  });
  
  // Send current job status
  const jobState = await job.getState();
  const progress = job.progress;
  
  reply.sse({ 
    event: 'status',
    data: JSON.stringify({ 
      type: 'job:status', 
      job_id: id,
      status: jobState,
      progress: typeof progress === 'object' ? progress : { percent: progress || 0 },
      timestamp: new Date().toISOString()
    }) 
  });
  
  // Keep-alive ping every 15 seconds
  const pingInterval = setInterval(() => {
    try {
      reply.sse({ 
        event: 'ping',
        data: JSON.stringify({ 
          type: 'keep-alive',
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      // Client disconnected
      clearInterval(pingInterval);
    }
  }, 15000);
  
  // Event handlers
  const onProgress = async (event: any) => {
    if (event.jobId === id && event.data) {
      app.log.debug({ job_id: id, progress: event.data }, 'Sending progress event');
      
      reply.sse({ 
        event: 'progress',
        data: JSON.stringify({
          type: 'job:progress',
          job_id: id,
          ...event.data,
          timestamp: new Date().toISOString()
        })
      });
      
      // If data contains leads, send them as separate events
      if (event.data.leads && Array.isArray(event.data.leads)) {
        for (const lead of event.data.leads) {
          reply.sse({
            event: 'lead',
            data: JSON.stringify({
              type: 'lead:found',
              job_id: id,
              lead,
              timestamp: new Date().toISOString()
            })
          });
        }
      }
    }
  };
  
  const onCompleted = async (event: any) => {
    if (event.jobId === id) {
      app.log.info({ job_id: id }, 'Job completed, sending completion event');
      
      // Get final job data
      const completedJob = await searchQueue.getJob(id);
      const result = completedJob?.returnvalue || {};
      
      reply.sse({ 
        event: 'completed',
        data: JSON.stringify({ 
          type: 'job:complete',
          job_id: id,
          summary_stats: {
            total_leads: result.total_leads || 0,
            total_scored: result.total_scored || 0,
            average_score: result.average_score || 0,
            processing_time_ms: result.processing_time_ms || 0,
            sources_queried: result.sources_queried || []
          },
          timestamp: new Date().toISOString()
        }) 
      });
      
      // Clean up
      clearInterval(pingInterval);
      searchEvents.off('progress', onProgress as any);
      searchEvents.off('completed', onCompleted as any);
      searchEvents.off('failed', onFailed as any);
      
      // Close stream after a delay
      setTimeout(() => {
        reply.raw.end();
      }, 1000);
    }
  };
  
  const onFailed = async (event: any) => {
    if (event.jobId === id) {
      app.log.error({ job_id: id, error: event.failedReason }, 'Job failed');
      
      reply.sse({ 
        event: 'error',
        data: JSON.stringify({ 
          type: 'job:failed',
          job_id: id,
          error: event.failedReason || 'Job processing failed',
          timestamp: new Date().toISOString()
        }) 
      });
      
      // Clean up
      clearInterval(pingInterval);
      searchEvents.off('progress', onProgress as any);
      searchEvents.off('completed', onCompleted as any);
      searchEvents.off('failed', onFailed as any);
      
      // Close stream after a delay
      setTimeout(() => {
        reply.raw.end();
      }, 1000);
    }
  };
  
  // Register event listeners
  searchEvents.on('progress', onProgress);
  searchEvents.on('completed', onCompleted);
  searchEvents.on('failed', onFailed);
  
  // Clean up on client disconnect
  reply.raw.on('close', () => {
    app.log.info({ job_id: id }, 'SSE client disconnected');
    clearInterval(pingInterval);
    searchEvents.off('progress', onProgress as any);
    searchEvents.off('completed', onCompleted as any);
    searchEvents.off('failed', onFailed as any);
  });
  
  // Handle errors
  reply.raw.on('error', (err: any) => {
    app.log.error({ job_id: id, error: err.message }, 'SSE stream error');
    clearInterval(pingInterval);
    searchEvents.off('progress', onProgress as any);
    searchEvents.off('completed', onCompleted as any);
    searchEvents.off('failed', onFailed as any);
  });
});

app.get('/api/export', async (req, reply) => {
  const searchJobId = (req.query as any).search_job_id as string | undefined;
  const format = ((req.query as any).format as string) || 'csv';
  
  app.log.info({ search_job_id: searchJobId, format }, 'Export requested');
  
  if (!searchJobId) {
    reply.code(400);
    return { error: 'search_job_id required', hint: 'Provide search_job_id as query parameter' };
  }
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    app.log.error('DATABASE_URL not configured');
    reply.code(500);
    return { error: 'Database configuration error' };
  }
  
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    
    // Enhanced query with more fields and signal data
    const res = await client.query(
      `SELECT 
        b.id as business_id,
        b.name,
        b.vertical,
        b.phone,
        b.website,
        b.email,
        (b.address_json->>'street') as street,
        (b.address_json->>'city') as city,
        (b.address_json->>'state') as state,
        (b.address_json->>'zip') as zip,
        b.hours_json,
        b.attributes_json,
        lv.score,
        lv.score_breakdown_json,
        lv.created_at,
        -- Aggregate signals
        COALESCE(
          json_agg(
            json_build_object(
              'type', s.signal_type,
              'value', s.signal_value,
              'confidence', s.confidence_score
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as signals
       FROM lead_view lv
       JOIN business b ON b.id = lv.business_id
       LEFT JOIN signal s ON s.business_id = b.id
      WHERE lv.search_job_id = $1
      GROUP BY b.id, lv.score, lv.score_breakdown_json, lv.created_at
      ORDER BY lv.score DESC
      LIMIT 1000`,
      [searchJobId]
    );
    
    app.log.info({ search_job_id: searchJobId, row_count: res.rowCount }, 'Export query completed');
    
    if (res.rowCount === 0) {
      reply.code(404);
      return { 
        error: 'No results found', 
        search_job_id: searchJobId,
        hint: 'Ensure the search job has completed and produced results'
      };
    }
    
    const rows = res.rows.map((r: any) => {
      // Parse signals for better formatting
      const signals = Array.isArray(r.signals) ? r.signals : [];
      const signalsSummary = signals.reduce((acc: any, sig: any) => {
        acc[sig.type] = sig.value;
        return acc;
      }, {});
      
      return {
        // Basic info
        business_id: r.business_id,
        name: r.name,
        vertical: r.vertical || 'generic',
        score: Math.round(r.score),
        
        // Contact info
        phone: r.phone,
        website: r.website,
        email: r.email || '',
        
        // Address
        street: r.street || '',
        city: r.city || '',
        state: r.state || '',
        zip: r.zip || '',
        
        // Enriched data
        has_online_booking: signalsSummary.has_online_booking || false,
        has_chat_widget: signalsSummary.has_chat_widget || false,
        tech_stack: signalsSummary.tech_stack || '',
        estimated_employees: signalsSummary.estimated_employees || '',
        
        // Metadata
        found_at: r.created_at ? new Date(r.created_at).toISOString() : '',
        signals_count: signals.length,
        
        // For JSON format only
        ...(format === 'json' && {
          hours: r.hours_json,
          attributes: r.attributes_json,
          score_breakdown: r.score_breakdown_json,
          all_signals: signals
        })
      };
    });
    
    // Return based on format
    if (format === 'json') {
      reply.header('Content-Type', 'application/json');
      return {
        search_job_id: searchJobId,
        export_date: new Date().toISOString(),
        total_results: rows.length,
        results: rows
      };
    } else {
      // Default to CSV
      const csv = toCsv(rows);
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="leads_${searchJobId}_${Date.now()}.csv"`);
      return csv;
    }
    
  } catch (e: any) {
    app.log.error({ error: e.message, search_job_id: searchJobId }, 'Export failed');
    reply.code(500);
    return { 
      error: 'Export failed', 
      details: e.message,
      search_job_id: searchJobId 
    };
  } finally {
    await client.end();
  }
});

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});


