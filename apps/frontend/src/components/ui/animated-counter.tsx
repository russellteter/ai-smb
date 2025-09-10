'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimal?: number
  separator?: string
}

export function AnimatedCounter({
  value,
  duration = 1000,
  className,
  prefix = '',
  suffix = '',
  decimal = 0,
  separator = ',',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const increment = end / (duration / 16)
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, duration])

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimal)
    const parts = fixed.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join('.')
  }

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  )
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  duration?: number
  delay?: number
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  duration = 1000,
  delay = 0,
}: AnimatedProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, delay)

    return () => clearTimeout(timer)
  }, [percentage, delay])

  return (
    <div className={cn('relative', className)}>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-gradient-to-r from-primary-500 to-accent-purple rounded-full transition-all ease-out',
            barClassName
          )}
          style={{
            width: `${animatedValue}%`,
            transitionDuration: `${duration}ms`,
          }}
        />
      </div>
      {showLabel && (
        <div className="absolute -top-6 left-0 text-xs text-gray-600">
          {Math.round(animatedValue)}%
        </div>
      )}
    </div>
  )
}

// Skeleton loading with shimmer effect
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = {
    text: 'h-4',
    rectangular: 'rounded',
    circular: 'rounded-full',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-gray-200',
        baseClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

// Staggered animation container
interface StaggeredAnimationProps {
  children: React.ReactNode[]
  stagger?: number
  animation?: string
  className?: string
}

export function StaggeredAnimation({
  children,
  stagger = 100,
  animation = 'animate-slide-up',
  className,
}: StaggeredAnimationProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={animation}
          style={{
            animationDelay: `${index * stagger}ms`,
            animationFillMode: 'both',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Morphing number display
interface MorphingNumberProps {
  value: number
  className?: string
  digits?: number
}

export function MorphingNumber({ value, className, digits = 1 }: MorphingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [value, displayValue])

  const formatValue = (num: number) => {
    return num.toFixed(digits)
  }

  return (
    <span
      className={cn(
        'inline-block transition-all duration-150 tabular-nums',
        isAnimating && 'scale-110',
        className
      )}
    >
      {formatValue(displayValue)}
    </span>
  )
}