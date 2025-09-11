'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ProgressChartProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  showValue?: boolean
  label?: string
  subtitle?: string
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gradient'
  className?: string
  animated?: boolean
}

const sizeConfig = {
  sm: { size: 80, fontSize: 'text-sm', strokeWidth: 6 },
  md: { size: 120, fontSize: 'text-lg', strokeWidth: 8 },
  lg: { size: 160, fontSize: 'text-2xl', strokeWidth: 10 },
  xl: { size: 200, fontSize: 'text-3xl', strokeWidth: 12 },
}

const variantColors = {
  primary: { stroke: 'stroke-blue-600', bg: 'stroke-gray-200 dark:stroke-gray-700' },
  success: { stroke: 'stroke-green-600', bg: 'stroke-gray-200 dark:stroke-gray-700' },
  warning: { stroke: 'stroke-yellow-500', bg: 'stroke-gray-200 dark:stroke-gray-700' },
  error: { stroke: 'stroke-red-600', bg: 'stroke-gray-200 dark:stroke-gray-700' },
  gradient: { stroke: 'url(#gradient)', bg: 'stroke-gray-200 dark:stroke-gray-700' },
}

export function ProgressChart({
  value,
  max = 100,
  size = 'md',
  strokeWidth: customStrokeWidth,
  showValue = true,
  label,
  subtitle,
  variant = 'primary',
  className,
  animated = true,
}: ProgressChartProps) {
  const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value)
  const config = sizeConfig[size]
  const colors = variantColors[variant]
  const strokeW = customStrokeWidth || config.strokeWidth
  
  const percentage = Math.min(Math.max((animatedValue / max) * 100, 0), 100)
  const radius = (config.size - strokeW) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedValue(value), 100)
      return () => clearTimeout(timer)
    }
  }, [value, animated])
  
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          {variant === 'gradient' && (
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          )}
          
          {/* Background Circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            strokeWidth={strokeW}
            className={cn('fill-none', colors.bg)}
          />
          
          {/* Progress Circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            strokeWidth={strokeW}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'fill-none transition-all duration-1000 ease-out',
              variant !== 'gradient' && colors.stroke
            )}
            style={variant === 'gradient' ? { stroke: colors.stroke } : undefined}
          />
        </svg>
        
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-bold text-gray-900 dark:text-white', config.fontSize)}>
              {Math.round(percentage)}%
            </span>
            {label && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            )}
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">{subtitle}</p>
      )}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'primary',
  size = 'md',
  className,
  animated = true,
}: ProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value)
  const percentage = Math.min(Math.max((animatedValue / max) * 100, 0), 100)
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedValue(value), 100)
      return () => clearTimeout(timer)
    }
  }, [value, animated])
  
  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }
  
  const bgColors = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error: 'bg-red-600',
    gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
  }
  
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showValue && <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div className={cn('w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden',
            bgColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
        </div>
      </div>
    </div>
  )
}