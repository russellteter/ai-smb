import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { z } from 'zod';
import { Client } from 'pg';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

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

// Enhanced Places API schemas with more fields
const PlacesTextSearch = z.object({ 
  results: z.array(z.object({ 
    place_id: z.string(),
    name: z.string().optional(),
    formatted_address: z.string().optional(),
    rating: z.number().optional(),
    user_ratings_total: z.number().optional(),
    types: z.array(z.string()).optional()
  })), 
  next_page_token: z.string().optional(),
  status: z.string()
});

const PlacesDetails = z.object({ 
  result: z.object({ 
    name: z.string(), 
    formatted_address: z.string().optional(), 
    website: z.string().optional(), 
    formatted_phone_number: z.string().optional(),
    rating: z.number().optional(),
    user_ratings_total: z.number().optional(),
    opening_hours: z.object({
      open_now: z.boolean().optional(),
      weekday_text: z.array(z.string()).optional()
    }).optional(),
    types: z.array(z.string()).optional(),
    business_status: z.string().optional()
  }),
  status: z.string()
});

// Retry wrapper for API calls
async function withRetry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3, 
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn({ attempt: i + 1, error }, 'API call failed, retrying');
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

async function googlePlacesTextSearch(query: string, pageToken?: string) {
  return withRetry(async () => {
    const params = new URLSearchParams({ 
      query, 
      key: process.env.GOOGLE_MAPS_API_KEY || '',
      language: 'en'
    });
    if (pageToken) params.set('pagetoken', pageToken);
    
    const resp = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
    const json = await resp.json();
    
    if (json.status === 'REQUEST_DENIED' || json.status === 'INVALID_REQUEST') {
      throw new Error(`Google Places API error: ${json.status} - ${json.error_message || 'Unknown error'}`);
    }
    
    return PlacesTextSearch.parse(json);
  });
}

async function googlePlacesDetails(placeId: string) {
  return withRetry(async () => {
    const params = new URLSearchParams({ 
      place_id: placeId, 
      key: process.env.GOOGLE_MAPS_API_KEY || '', 
      fields: 'name,formatted_address,website,formatted_phone_number,rating,user_ratings_total,opening_hours,types,business_status',
      language: 'en'
    });
    
    const resp = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    const json = await resp.json();
    
    if (json.status === 'REQUEST_DENIED' || json.status === 'INVALID_REQUEST') {
      throw new Error(`Google Places API error: ${json.status} - ${json.error_message || 'Unknown error'}`);
    }
    
    return PlacesDetails.parse(json);
  });
}

// Enhanced search worker with pagination and progress reporting
const searchWorker = new Worker('search', async (job) => {
  const { dsl, metadata } = job.data as any;
  const targetResults = dsl.result_size?.target || 50;
  
  logger.info({ job_id: job.id, dsl }, 'Starting search job');
  
  // Build search query based on vertical and location
  const verticalQuery = dsl.vertical === 'generic' ? 'businesses' : dsl.vertical.replace('_', ' ');
  const query = `${verticalQuery} in ${dsl.geo.city}, ${dsl.geo.state}`;
  
  let pageToken: string | undefined = undefined;
  let totalProcessed = 0;
  let totalFound = 0;
  const maxPages = Math.ceil(targetResults / 20); // Google returns ~20 per page
  
  try {
    // Report initial progress
    await job.updateProgress({ 
      type: 'job:progress',
      status: 'fetching',
      message: `Searching for ${verticalQuery} in ${dsl.geo.city}, ${dsl.geo.state}`,
      processed: 0,
      total: targetResults
    });
    
    for (let page = 0; page < maxPages; page++) {
      logger.debug({ page, pageToken }, 'Fetching page from Google Places');
      
      // Check if Google Maps API key is configured
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        logger.warn('GOOGLE_MAPS_API_KEY not configured, using mock data');
        // Generate mock data for testing
        for (let i = 0; i < Math.min(20, targetResults - totalFound); i++) {
          const mockBusiness = {
            name: `${verticalQuery} Business ${totalFound + i + 1}`,
            formatted_address: `${100 + i} Main St, ${dsl.geo.city}, ${dsl.geo.state}`,
            website: Math.random() > 0.3 ? `https://business${i}.com` : undefined,
            formatted_phone_number: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            rating: 3.5 + Math.random() * 1.5,
            user_ratings_total: Math.floor(Math.random() * 500)
          };
          
          await enrichQueue.add('business', { 
            candidate: mockBusiness, 
            searchId: job.id,
            dsl 
          });
          
          totalFound++;
          totalProcessed++;
          
          // Report progress
          await job.updateProgress({ 
            type: 'job:progress',
            status: 'processing',
            message: `Found ${totalFound} businesses, enriching data...`,
            processed: totalProcessed,
            total: targetResults,
            leads: [mockBusiness]
          });
        }
        break;
      }
      
      try {
        const pageData = await googlePlacesTextSearch(query, pageToken);
        
        if (pageData.results.length === 0) {
          logger.info('No more results from Google Places');
          break;
        }
        
        // Process each result
        for (const place of pageData.results) {
          if (totalFound >= targetResults) break;
          
          try {
            // Fetch detailed information
            const details = await googlePlacesDetails(place.place_id);
            
            // Skip if business is permanently closed
            if (details.result.business_status === 'CLOSED_PERMANENTLY') {
              logger.debug({ place_id: place.place_id }, 'Skipping permanently closed business');
              continue;
            }
            
            // Add to enrichment queue
            await enrichQueue.add('business', { 
              candidate: details.result, 
              searchId: job.id,
              dsl,
              placeId: place.place_id
            });
            
            totalFound++;
            totalProcessed++;
            
            // Report progress with lead data
            await job.updateProgress({ 
              type: 'job:progress',
              status: 'processing',
              message: `Found ${totalFound} businesses, enriching data...`,
              processed: totalProcessed,
              total: targetResults,
              leads: [details.result]
            });
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            logger.error({ error, place_id: place.place_id }, 'Failed to fetch place details');
            totalProcessed++;
          }
        }
        
        if (totalFound >= targetResults) break;
        
        // Check for next page
        pageToken = pageData.next_page_token;
        if (!pageToken) {
          logger.info('No more pages available');
          break;
        }
        
        // Google requires a delay before using next_page_token
        logger.debug('Waiting before next page request');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        logger.error({ error, page }, 'Failed to fetch search page');
        // Continue to next page on error
      }
    }
    
    // Final progress update
    await job.updateProgress({ 
      type: 'job:complete',
      status: 'completed',
      message: `Search completed. Found ${totalFound} businesses.`,
      processed: totalProcessed,
      total: totalFound
    });
    
    logger.info({ job_id: job.id, totalFound, totalProcessed }, 'Search job completed');
    
    return {
      total_leads: totalFound,
      total_processed: totalProcessed,
      sources_queried: ['google_places']
    };
    
  } catch (error) {
    logger.error({ error, job_id: job.id }, 'Search job failed');
    throw error;
  }
}, { 
  connection,
  concurrency: 2 // Limit concurrent search jobs
});

new Worker('fetch', async (job) => {
  await enrichQueue.add('business', { businessId: 'stub' });
}, { connection });

// Enhanced enrichment worker with signal detection
const enrichWorker = new Worker('enrich', async (job) => {
  const { candidate, searchId, dsl, placeId } = job.data;
  
  logger.info({ business: candidate.name, searchId }, 'Starting enrichment');
  
  const signals: any[] = [];
  
  try {
    // Extract signals from existing data
    if (candidate.website) {
      signals.push({
        type: 'has_website',
        value: true,
        confidence: 1.0,
        source: 'google_places'
      });
      
      // TODO: Fetch website to detect tech stack
      // For now, add mock signals
      if (Math.random() > 0.5) {
        signals.push({
          type: 'has_online_booking',
          value: true,
          confidence: 0.8,
          source: 'website_scan'
        });
      }
      
      if (Math.random() > 0.6) {
        signals.push({
          type: 'has_chat_widget',
          value: true,
          confidence: 0.9,
          source: 'website_scan'
        });
      }
    }
    
    // Rating signals
    if (candidate.rating && candidate.user_ratings_total) {
      signals.push({
        type: 'google_rating',
        value: candidate.rating,
        confidence: 1.0,
        source: 'google_places'
      });
      
      signals.push({
        type: 'review_count',
        value: candidate.user_ratings_total,
        confidence: 1.0,
        source: 'google_places'
      });
      
      // High engagement signal
      if (candidate.user_ratings_total > 100) {
        signals.push({
          type: 'high_customer_engagement',
          value: true,
          confidence: 0.9,
          source: 'google_places'
        });
      }
    }
    
    // Business hours signal
    if (candidate.opening_hours) {
      signals.push({
        type: 'has_business_hours',
        value: true,
        confidence: 1.0,
        source: 'google_places'
      });
      
      if (candidate.opening_hours.open_now !== undefined) {
        signals.push({
          type: 'currently_open',
          value: candidate.opening_hours.open_now,
          confidence: 1.0,
          source: 'google_places'
        });
      }
    }
    
    // Phone availability
    if (candidate.formatted_phone_number) {
      signals.push({
        type: 'has_phone',
        value: true,
        confidence: 1.0,
        source: 'google_places'
      });
    }
    
    // Business type signals
    if (candidate.types && candidate.types.length > 0) {
      signals.push({
        type: 'business_types',
        value: candidate.types.join(','),
        confidence: 1.0,
        source: 'google_places'
      });
    }
    
    // Pass enriched data to scoring
    await scoreQueue.add('business', { 
      business: candidate, 
      searchId,
      dsl,
      signals,
      placeId
    });
    
    logger.info({ 
      business: candidate.name, 
      signalCount: signals.length 
    }, 'Enrichment completed');
    
  } catch (error) {
    logger.error({ error, business: candidate.name }, 'Enrichment failed');
    // Still send to scoring even if enrichment partially fails
    await scoreQueue.add('business', { 
      business: candidate, 
      searchId,
      dsl,
      signals,
      placeId
    });
  }
}, { 
  connection,
  concurrency: 5 // Process multiple enrichments in parallel
});

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

