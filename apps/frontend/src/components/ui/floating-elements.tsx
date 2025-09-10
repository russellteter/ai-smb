'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface FloatingElementsProps {
  className?: string
  count?: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
  blur?: boolean
}

export function FloatingElements({
  className,
  count = 5,
  size = 'md',
  color = 'primary',
  blur = true,
}: FloatingElementsProps) {
  const [elements, setElements] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const newElements = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }))
    setElements(newElements)
  }, [count])

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
  }

  const colorClasses = {
    primary: 'from-primary-400/20 to-primary-600/20',
    accent: 'from-accent-purple/20 to-accent-pink/20',
    gradient: 'from-primary-400/20 via-accent-purple/20 to-accent-pink/20',
  }

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {elements.map((element) => (
        <div
          key={element.id}
          className={cn(
            'absolute rounded-full bg-gradient-to-br animate-float',
            sizeClasses[size],
            colorClasses[color as keyof typeof colorClasses],
            blur && 'blur-3xl'
          )}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${15 + element.delay}s`,
          }}
        />
      ))}
    </div>
  )
}