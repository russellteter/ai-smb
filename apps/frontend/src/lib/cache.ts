'use client'

import { useState, useEffect, useCallback } from 'react'

// Simple in-memory cache with TTL support
class Cache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })

    // Clean up expired entries periodically
    if (this.cache.size > 100) {
      this.cleanup()
    }
  }

  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) return false
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    })
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Global cache instance
export const cache = new Cache()

// Cache keys
export const CACHE_KEYS = {
  LEADS: (filters: string) => `leads:${filters}`,
  SEARCH_RESULTS: (searchId: string) => `search:${searchId}`,
  ANALYTICS: (timeRange: string) => `analytics:${timeRange}`,
  LEAD_DETAILS: (leadId: string) => `lead:${leadId}`,
  TEMPLATES: () => 'templates',
  USER_PREFERENCES: () => 'user:preferences',
} as const

// TTL constants (in milliseconds)
export const TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const

// Cached fetch wrapper
export async function cachedFetch<T = any>(
  url: string,
  options: RequestInit & { ttl?: number; cacheKey?: string } = {}
): Promise<T> {
  const { ttl = TTL.MEDIUM, cacheKey, ...fetchOptions } = options
  const key = cacheKey || `fetch:${url}:${JSON.stringify(fetchOptions)}`

  // Return cached data if available and not expired
  const cached = cache.get<T>(key)
  if (cached) {
    return cached
  }

  // Fetch fresh data
  try {
    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Cache the successful response
    cache.set(key, data, ttl)
    
    return data
  } catch (error) {
    // If we have stale cached data, return it instead of throwing
    const staleData = cache.get<T>(key)
    if (staleData) {
      console.warn('Using stale cached data due to fetch error:', error)
      return staleData
    }
    
    throw error
  }
}

// Optimistic cache update
export function updateCache<T>(key: string, updater: (data: T | null) => T): void {
  const currentData = cache.get<T>(key)
  const updatedData = updater(currentData)
  cache.set(key, updatedData)
}

// Preload cache entries
export function preloadCache(entries: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>): void {
  entries.forEach(async ({ key, fetcher, ttl = TTL.MEDIUM }) => {
    if (!cache.has(key)) {
      try {
        const data = await fetcher()
        cache.set(key, data, ttl)
      } catch (error) {
        console.warn(`Failed to preload cache for key: ${key}`, error)
      }
    }
  })
}

// Cache invalidation patterns
export function invalidatePattern(pattern: RegExp): void {
  const keys = cache.keys()
  keys.forEach(key => {
    if (pattern.test(key)) {
      cache.delete(key)
    }
  })
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const { ttl = TTL.MEDIUM, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    // Check cache first
    const cached = cache.get<T>(key)
    if (cached) {
      setData(cached)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cache.set(key, result, ttl)
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, ttl, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(async () => {
    cache.delete(key)
    await fetchData()
  }, [key, fetchData])

  return { data, isLoading, error, refetch }
}

// Debounced cache setter for rapid updates
export function debouncedCacheSet(key: string, data: any, ttl: number = TTL.MEDIUM, delay: number = 300): void {
  const timeoutKey = `timeout:${key}`
  
  // Clear existing timeout
  const existingTimeout = (globalThis as any)[timeoutKey]
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }
  
  // Set new timeout
  (globalThis as any)[timeoutKey] = setTimeout(() => {
    cache.set(key, data, ttl)
    delete (globalThis as any)[timeoutKey]
  }, delay)
}