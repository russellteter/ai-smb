'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Activity, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Loader2, 
  AlertCircle,
  Zap,
  Database,
  Globe,
  Brain,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress-chart'

interface StreamStep {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress?: number
  message?: string
  icon: any
  startTime?: Date
  endTime?: Date
}

interface EnhancedStreamProps {
  isActive: boolean
  currentStep?: string
  progress: number
  totalLeads?: number
  processedLeads?: number
  className?: string
}

const streamSteps: Omit<StreamStep, 'status' | 'progress'>[] = [
  { id: 'parsing', label: 'Parsing Query', icon: Brain },
  { id: 'discovery', label: 'Discovering Leads', icon: Globe },
  { id: 'enrichment', label: 'Enriching Data', icon: Database },
  { id: 'scoring', label: 'AI Scoring', icon: TrendingUp },
  { id: 'complete', label: 'Finalizing', icon: CheckCircle2 },
]

export function EnhancedStream({
  isActive,
  currentStep = 'parsing',
  progress,
  totalLeads = 0,
  processedLeads = 0,
  className
}: EnhancedStreamProps) {
  const [steps, setSteps] = useState<StreamStep[]>(() => 
    streamSteps.map(s => ({ ...s, status: 'pending' }))
  )
  const [animatedLeads, setAnimatedLeads] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const currentIndex = streamSteps.findIndex(s => s.id === currentStep)
    
    setSteps(streamSteps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? 'completed' : 
              index === currentIndex ? 'in_progress' : 'pending',
      progress: index === currentIndex ? progress : 
                index < currentIndex ? 100 : 0,
      startTime: index <= currentIndex ? new Date() : undefined,
      endTime: index < currentIndex ? new Date() : undefined,
    })))
  }, [currentStep, progress, isActive])

  useEffect(() => {
    if (processedLeads > animatedLeads) {
      const timer = setTimeout(() => {
        setAnimatedLeads(prev => Math.min(prev + 1, processedLeads))
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [processedLeads, animatedLeads])

  const currentStepData = steps.find(s => s.status === 'in_progress')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {isActive && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 animate-ping opacity-20" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isActive ? 'Search in Progress' : 'Search Complete'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentStepData?.label || 'Initializing...'}
            </p>
          </div>
        </div>
        
        {/* Lead Counter */}
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text">
            {animatedLeads}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            of {totalLeads} leads
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="glass-card p-4">
        <ProgressBar
          value={progress}
          max={100}
          variant="gradient"
          size="lg"
          animated
          showValue
        />
      </div>

      {/* Stream Steps */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary-200 via-purple-200 to-pink-200 dark:from-primary-800 dark:via-purple-800 dark:to-pink-800" />
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.status === 'in_progress'
            const isCompleted = step.status === 'completed'
            const isPending = step.status === 'pending'
            
            return (
              <div
                key={step.id}
                className={cn(
                  'relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300',
                  isActive && 'bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200/50 dark:border-primary-800/50',
                  isCompleted && 'opacity-75',
                  isPending && 'opacity-40'
                )}
              >
                {/* Step Icon */}
                <div className="relative z-10">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isActive && 'bg-gradient-to-r from-primary-500 to-purple-500 shadow-lg shadow-primary-500/30',
                    isCompleted && 'bg-green-500 shadow-lg shadow-green-500/30',
                    isPending && 'bg-gray-200 dark:bg-gray-700',
                    !isPending && 'text-white'
                  )}>
                    {isActive ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Pulse animation for active step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 animate-ping opacity-20" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={cn(
                      'font-medium transition-colors',
                      isActive && 'text-primary-700 dark:text-primary-300',
                      isCompleted && 'text-green-700 dark:text-green-400',
                      isPending && 'text-gray-500 dark:text-gray-400'
                    )}>
                      {step.label}
                    </h4>
                    {step.endTime && step.startTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round((step.endTime.getTime() - step.startTime.getTime()) / 1000)}s
                      </span>
                    )}
                  </div>
                  
                  {/* Step Progress */}
                  {isActive && (
                    <div className="space-y-2">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      {step.message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">{step.message}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Step Message */}
                  {isCompleted && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completed successfully
                    </p>
                  )}
                </div>
                
                {/* Step Status Badge */}
                {isActive && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                    <Activity className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                      Active
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Live Stats */}
      {isActive && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Speed</span>
            </div>
            <p className="text-2xl font-bold gradient-text">
              {Math.round((processedLeads / Math.max(1, progress)) * 100)}/min
            </p>
          </div>
          
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quality</span>
            </div>
            <p className="text-2xl font-bold gradient-text">85%</p>
          </div>
          
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ETA</span>
            </div>
            <p className="text-2xl font-bold gradient-text">
              {Math.max(1, Math.round((100 - progress) / 20))}m
            </p>
          </div>
        </div>
      )}
    </div>
  )
}