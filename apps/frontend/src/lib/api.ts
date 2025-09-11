/**
 * API Service Layer for Mothership Frontend
 * Handles all communication with the backend API
 */

import { Lead, SearchJob } from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Helper function for API requests
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle non-JSON responses (like CSV export)
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('text/csv')) {
      if (!response.ok) {
        throw new APIError('Export failed', response.status)
      }
      return await response.text() as T
    }

    // Handle JSON responses
    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data.details || data.issues
      )
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Network or other errors
    throw new APIError(
      error instanceof Error ? error.message : 'Network request failed'
    )
  }
}

/**
 * Health Check API
 */
export async function checkHealth() {
  return fetchAPI<{
    ok: boolean
    timestamp: string
    services: {
      database: { status: string; error?: string }
      redis: { status: string; error?: string }
      openai: { configured: boolean; warning?: string }
      google_maps: { configured: boolean; warning?: string }
    }
  }>('/health')
}

/**
 * Job Health API
 */
export async function getJobHealth() {
  return fetchAPI<{
    status: string
    timestamp: string
    queue: {
      name: string
      counts: Record<string, number>
      success_rate: string
      workers: {
        count: number
        active: number
      }
    }
    recent_jobs: {
      waiting: any[]
      active: any[]
      completed: any[]
      failed: any[]
    }
    recommendations: string[]
  }>('/api/job_health')
}

/**
 * Parse Prompt API
 */
export async function parsePrompt(prompt: string) {
  return fetchAPI<{
    dsl: {
      version: number
      vertical: string
      geo: {
        city: string
        state: string
        radius_km?: number
      }
      lead_profile: string
      result_size?: { target: number }
      constraints?: any
      exclusions?: any[]
      sort_by?: string
      output?: { contract: string }
      notify?: { on_complete: boolean }
      compliance_flags?: string[]
    }
    warnings?: string[]
  }>('/api/parse_prompt', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })
}

/**
 * Search Jobs API
 */
export async function createSearchJob(prompt?: string, dsl?: any) {
  const body: any = {}
  
  if (prompt) {
    body.prompt = prompt
  }
  
  if (dsl) {
    body.dsl = dsl
  }
  
  return fetchAPI<{
    job_id: string
    dsl: any
    status: string
    stream_url: string
  }>('/api/search_jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Export Leads API
 */
export async function exportLeads(
  searchJobId: string,
  format: 'csv' | 'json' = 'csv'
) {
  if (format === 'json') {
    return fetchAPI<{
      search_job_id: string
      export_date: string
      total_results: number
      results: any[]
    }>(`/api/export?search_job_id=${searchJobId}&format=json`)
  }
  
  // CSV export returns plain text
  return fetchAPI<string>(`/api/export?search_job_id=${searchJobId}&format=csv`)
}

/**
 * SSE Streaming Client for Search Results
 */
export class SearchStreamClient {
  private eventSource: EventSource | null = null
  private jobId: string
  
  constructor(jobId: string) {
    this.jobId = jobId
  }
  
  connect(handlers: {
    onProgress?: (data: any) => void
    onLead?: (lead: any) => void
    onComplete?: (summary: any) => void
    onError?: (error: any) => void
    onStatus?: (status: any) => void
  }) {
    const url = `${API_BASE_URL}/api/search_jobs/${this.jobId}/stream`
    
    this.eventSource = new EventSource(url)
    
    // Handle different event types
    this.eventSource.addEventListener('connected', (event) => {
      console.log('SSE connected:', event.data)
    })
    
    this.eventSource.addEventListener('status', (event) => {
      try {
        const data = JSON.parse(event.data)
        handlers.onStatus?.(data)
      } catch (error) {
        console.error('Failed to parse status event:', error)
      }
    })
    
    this.eventSource.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse(event.data)
        handlers.onProgress?.(data)
      } catch (error) {
        console.error('Failed to parse progress event:', error)
      }
    })
    
    this.eventSource.addEventListener('lead', (event) => {
      try {
        const data = JSON.parse(event.data)
        handlers.onLead?.(data.lead)
      } catch (error) {
        console.error('Failed to parse lead event:', error)
      }
    })
    
    this.eventSource.addEventListener('completed', (event) => {
      try {
        const data = JSON.parse(event.data)
        handlers.onComplete?.(data.summary_stats)
        this.disconnect()
      } catch (error) {
        console.error('Failed to parse completed event:', error)
      }
    })
    
    this.eventSource.addEventListener('error', (event) => {
      try {
        const data = JSON.parse((event as any).data || '{}')
        handlers.onError?.(data)
      } catch (error) {
        handlers.onError?.({ message: 'Stream connection error' })
      }
    })
    
    // Handle connection errors
    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      handlers.onError?.({ message: 'Lost connection to server' })
      this.disconnect()
    }
  }
  
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }
}

/**
 * Mock data generator for development
 */
export function generateMockLead(index: number): Lead {
  const verticals = ['SaaS', 'E-commerce', 'Healthcare', 'Finance', 'Retail']
  const cities = ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston']
  
  return {
    id: `mock-${index}`,
    name: `Company ${index}`,
    website: `https://company${index}.com`,
    location: `${cities[index % cities.length]}, ${['CA', 'NY', 'TX', 'WA', 'MA'][index % 5]}`,
    industry: verticals[index % verticals.length],
    size: `${10 + index * 5}-${50 + index * 10} employees`,
    revenue: `$${1 + index}M-$${5 + index}M`,
    score: 60 + Math.floor(Math.random() * 40),
    signals: [
      'No AI tools detected',
      'Manual processes identified',
      'Growth opportunity'
    ],
    phone: `+1 (555) ${String(100 + index).padStart(3, '0')}-${String(1000 + index).padStart(4, '0')}`,
    email: `contact@company${index}.com`,
    lastUpdated: new Date(),
    status: 'new',
    contacts: [
      {
        name: `CEO ${index}`,
        title: 'CEO',
        email: `ceo@company${index}.com`,
        phone: `+1 (555) ${String(200 + index).padStart(3, '0')}-${String(2000 + index).padStart(4, '0')}`
      }
    ],
    technologies: ['React', 'Node.js', 'AWS'],
    socialLinks: {
      linkedin: `https://linkedin.com/company/company${index}`,
      twitter: `https://twitter.com/company${index}`
    }
  }
}

/**
 * Transform API lead data to frontend Lead type
 */
export function transformAPILead(apiLead: any): Lead {
  return {
    id: apiLead.business_id || apiLead.id,
    name: apiLead.name,
    website: apiLead.website || '',
    location: `${apiLead.city || ''}, ${apiLead.state || ''}`.trim(),
    industry: apiLead.vertical || 'Unknown',
    size: apiLead.estimated_employees || 'Unknown',
    revenue: apiLead.estimated_revenue || 'Unknown',
    score: apiLead.score || 0,
    signals: apiLead.signals?.map((s: any) => 
      typeof s === 'string' ? s : `${s.type}: ${s.value}`
    ) || [],
    phone: apiLead.phone || '',
    email: apiLead.email || '',
    lastUpdated: apiLead.created_at ? new Date(apiLead.created_at) : new Date(),
    status: 'new',
    contacts: apiLead.contacts || [],
    technologies: apiLead.tech_stack?.split(',') || [],
    socialLinks: apiLead.social_links || {}
  }
}