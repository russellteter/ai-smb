'use client'

import { useVirtualScroll, useInfiniteScroll } from '@/lib/hooks/use-lazy-load'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight,
    overscan,
  })

  return (
    <div
      ref={scrollElementRef}
      className={cn('relative overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface InfiniteListProps<T> {
  initialItems: T[]
  loadMore: () => Promise<T[]>
  renderItem: (item: T, index: number) => React.ReactNode
  hasMore?: boolean
  threshold?: number
  className?: string
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  errorComponent?: (error: string, retry: () => void) => React.ReactNode
}

export function InfiniteList<T>({
  initialItems,
  loadMore,
  renderItem,
  hasMore = true,
  threshold = 200,
  className,
  loadingComponent,
  emptyComponent,
  errorComponent,
}: InfiniteListProps<T>) {
  const {
    containerRef,
    items,
    isLoading,
    error,
    loadMore: handleLoadMore,
    reset,
  } = useInfiniteScroll({
    initialItems,
    loadMore,
    hasMore,
    threshold,
  })

  if (items.length === 0 && !isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <p>No items found</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          {loadingComponent || (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center p-4">
          {errorComponent ? (
            errorComponent(error, handleLoadMore)
          ) : (
            <div className="text-center">
              <p className="text-error-600 text-sm mb-2">{error}</p>
              <button
                onClick={handleLoadMore}
                className="text-primary-600 hover:text-primary-700 text-sm underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* End of List */}
      {!hasMore && !isLoading && items.length > 0 && (
        <div className="text-center p-4 text-gray-500 text-sm">
          No more items to load
        </div>
      )}
    </div>
  )
}

// Grid version for card layouts
interface VirtualGridProps<T> {
  items: T[]
  itemHeight: number
  itemsPerRow: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  gap?: number
  overscan?: number
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  itemsPerRow,
  containerHeight,
  renderItem,
  className,
  gap = 16,
  overscan = 2,
}: VirtualGridProps<T>) {
  const rowHeight = itemHeight + gap
  const totalRows = Math.ceil(items.length / itemsPerRow)
  
  const {
    scrollElementRef,
    visibleItems: visibleRows,
    totalHeight,
    offsetY,
    handleScroll,
  } = useVirtualScroll({
    items: Array.from({ length: totalRows }, (_, i) => i),
    itemHeight: rowHeight,
    containerHeight,
    overscan,
  })

  return (
    <div
      ref={scrollElementRef}
      className={cn('relative overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleRows.map(({ item: rowIndex, index }) => {
            const startIndex = rowIndex * itemsPerRow
            const endIndex = Math.min(startIndex + itemsPerRow, items.length)
            const rowItems = items.slice(startIndex, endIndex)

            return (
              <div
                key={rowIndex}
                style={{ height: rowHeight, gap }}
                className="flex"
              >
                {rowItems.map((item, itemIndex) => (
                  <div
                    key={startIndex + itemIndex}
                    style={{ height: itemHeight }}
                    className="flex-1"
                  >
                    {renderItem(item, startIndex + itemIndex)}
                  </div>
                ))}
                {/* Fill empty slots in the last row */}
                {Array.from({ length: itemsPerRow - rowItems.length }, (_, i) => (
                  <div key={`empty-${i}`} className="flex-1" />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}