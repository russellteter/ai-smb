'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  blurDataURL?: string
  threshold?: number
  className?: string
  fallback?: React.ReactNode
}

export function LazyImage({
  src,
  alt,
  placeholder,
  blurDataURL,
  threshold = 0.1,
  className,
  fallback,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    const container = containerRef.current
    if (container) {
      observer.observe(container)
    }

    return () => observer.disconnect()
  }, [threshold])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(false)
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Blur */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          {blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
            />
          )}
          {placeholder && !blurDataURL && (
            <div className="text-gray-400 text-sm">{placeholder}</div>
          )}
        </div>
      )}

      {/* Main Image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          {fallback || (
            <div className="text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="text-sm">Failed to load image</div>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  )
}

// Lazy background image hook
export function useLazyBackgroundImage(src: string, threshold: number = 0.1) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    const element = elementRef.current
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [threshold])

  useEffect(() => {
    if (isInView && src) {
      const img = new Image()
      img.onload = () => setIsLoaded(true)
      img.onerror = () => setIsLoaded(false)
      img.src = src
    }
  }, [isInView, src])

  return {
    elementRef,
    isLoaded,
    isInView,
    style: isLoaded ? { backgroundImage: `url(${src})` } : undefined,
  }
}