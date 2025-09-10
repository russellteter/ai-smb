import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ 
  title = 'Something went wrong', 
  message, 
  onRetry,
  className 
}: ErrorDisplayProps) {
  return (
    <Card className={className}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-100">
            <AlertCircle className="h-6 w-6 text-error-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-heading-3 text-gray-900">{title}</h3>
            <p className="text-body text-gray-600 max-w-md">{message}</p>
          </div>

          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}