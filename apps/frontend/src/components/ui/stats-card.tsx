'use client'

import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  className?: string
  children?: ReactNode
}

const variantStyles = {
  default: 'from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700',
  primary: 'from-blue-50 to-white dark:from-blue-950 dark:to-gray-900 border-blue-200 dark:border-blue-800',
  success: 'from-green-50 to-white dark:from-green-950 dark:to-gray-900 border-green-200 dark:border-green-800',
  warning: 'from-yellow-50 to-white dark:from-yellow-950 dark:to-gray-900 border-yellow-200 dark:border-yellow-800',
  error: 'from-red-50 to-white dark:from-red-950 dark:to-gray-900 border-red-200 dark:border-red-800',
}

const iconColors = {
  default: 'text-gray-600 dark:text-gray-400',
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  children,
}: StatsCardProps) {
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null
  const trendColor = trend
    ? trend.value > 0
      ? 'text-green-600 dark:text-green-400'
      : trend.value < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-400'
    : ''

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100',
        variantStyles[variant],
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {Icon && (
                <div className={cn('rounded-lg bg-white/50 dark:bg-gray-800/50 p-2', iconColors[variant])}>
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            </div>
            
            <div className="mt-3">
              <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
              
              {trend && TrendIcon && (
                <div className={cn('mt-3 flex items-center gap-1 text-sm font-medium', trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  <span>{Math.abs(trend.value)}%</span>
                  <span className="text-gray-500 dark:text-gray-400">{trend.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  )
}

interface StatsGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return <div className={cn('grid gap-4', gridCols[columns], className)}>{children}</div>
}