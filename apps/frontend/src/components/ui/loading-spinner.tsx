import * as React from 'react'
import { cn } from '../../lib/utils'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const LoadingSpinner = ({ className, size = 'md', ...props }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  )
}

interface LoadingStateProps {
  children: React.ReactNode
  className?: string
}

const LoadingState = ({ children, className }: LoadingStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 py-12', className)}>
      <LoadingSpinner size="lg" />
      <div className="text-body-sm text-center">{children}</div>
    </div>
  )
}

export { LoadingSpinner, LoadingState }