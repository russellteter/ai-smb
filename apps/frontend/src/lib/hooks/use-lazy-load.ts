'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  enabled?: boolean
}

export function useLazyLoad<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '50px',
  enabled = true,
}: UseLazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef<T>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, enabled, hasLoaded])

  const load = useCallback(() => {
    if (!hasLoaded) {
      setIsVisible(true)
      setHasLoaded(true)
    }
  }, [hasLoaded])

  return {
    elementRef,
    isVisible,
    hasLoaded,
    load,
  }
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
  }))

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  }
}

// Infinite scroll hook
export function useInfiniteScroll<T>({
  initialItems,
  loadMore,
  hasMore = true,
  threshold = 200,
}: {
  initialItems: T[]
  loadMore: () => Promise<T[]>
  hasMore?: boolean
  threshold?: number
}) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const newItems = await loadMore()
      setItems(prev => [...prev, ...newItems])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, loadMore])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      
      if (scrollHeight - scrollTop - clientHeight <= threshold) {
        handleLoadMore()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleLoadMore, threshold])

  const reset = useCallback(() => {
    setItems(initialItems)
    setError(null)
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [initialItems])

  return {
    containerRef,
    items,
    isLoading,
    error,
    loadMore: handleLoadMore,
    reset,
  }
}