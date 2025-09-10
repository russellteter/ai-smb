'use client'

import { useEffect, useState } from 'react'
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Loader2,
  Zap,
  TrendingUp,
  Users,
  Globe,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'

interface StreamMetrics {
  totalFound: number
  processed: number
  enriched: number
  qualified: number
  speed: number
  eta: number
}

interface StreamStatusProps {
  status: 'idle' | 'connecting' | 'streaming' | 'completed' | 'error'
  metrics?: StreamMetrics
  message?: string
}

export function StreamStatus({ status, metrics, message }: StreamStatusProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)

  useEffect(() => {
    if (status === 'streaming' && metrics) {
      const progress = (metrics.processed / Math.max(metrics.totalFound, 1)) * 100
      setProgressWidth(progress)
      setPulseAnimation(true)
      const timer = setTimeout(() => setPulseAnimation(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [status, metrics])

  const statusConfig = {
    idle: {
      icon: Activity,
      color: 'text-gray-400',
      bgColor: 'bg-gray-100',
      label: 'Ready to search',
      animate: '',
    },
    connecting: {
      icon: Loader2,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100',
      label: 'Connecting...',
      animate: 'animate-spin',
    },
    streaming: {
      icon: Zap,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      label: 'Finding leads',
      animate: pulseAnimation ? 'animate-pulse' : '',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      label: 'Search complete',
      animate: '',
    },
    error: {
      icon: XCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-100',
      label: 'Connection error',
      animate: '',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <GlassCard variant="elevated" className="p-4">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              config.bgColor,
              config.animate
            )}>
              <Icon className={cn('w-5 h-5', config.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{config.label}</p>
              {message && (
                <p className="text-xs text-gray-500 mt-0.5">{message}</p>
              )}
            </div>
          </div>
          {status === 'streaming' && metrics && (
            <div className="text-right">
              <p className="text-2xl font-bold gradient-text">{metrics.totalFound}</p>
              <p className="text-xs text-gray-500">leads found</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {status === 'streaming' && metrics && (
          <div className="space-y-2">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressWidth}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{metrics.processed} processed</span>
              <span>{Math.round(progressWidth)}%</span>
              <span>ETA: {formatETA(metrics.eta)}</span>
            </div>
          </div>
        )}

        {/* Live Metrics */}
        {status === 'streaming' && metrics && (
          <div className="grid grid-cols-4 gap-3">
            <MetricCard
              icon={Search}
              value={metrics.processed}
              label="Analyzed"
              color="text-blue-600"
            />
            <MetricCard
              icon={Globe}
              value={metrics.enriched}
              label="Enriched"
              color="text-purple-600"
            />
            <MetricCard
              icon={Users}
              value={metrics.qualified}
              label="Qualified"
              color="text-success-600"
            />
            <MetricCard
              icon={TrendingUp}
              value={`${metrics.speed}/s`}
              label="Speed"
              color="text-orange-600"
            />
          </div>
        )}

        {/* Connection Status Indicator */}
        {status === 'streaming' && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="relative">
              <div className="w-2 h-2 bg-success-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-success-500 rounded-full animate-ping" />
            </div>
            <span>Live connection active</span>
            <span className="ml-auto">Latency: 42ms</span>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

function MetricCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: any
  value: number | string
  label: string
  color: string 
}) {
  return (
    <div className="text-center">
      <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function formatETA(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  return `${Math.floor(seconds / 3600)}h`
}