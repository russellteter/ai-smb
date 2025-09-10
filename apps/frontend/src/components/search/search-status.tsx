import { CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { LoadingSpinner } from '../ui/loading-spinner'

interface SearchJob {
  job_id: string
  dsl: any
  status: string
}

interface SearchStatusProps {
  searchJob: SearchJob | null
  leadsCount: number
  streaming: boolean
}

export function SearchStatus({ searchJob, leadsCount, streaming }: SearchStatusProps) {
  if (!searchJob) return null

  const getStatusIcon = () => {
    if (streaming) {
      return <LoadingSpinner size="sm" />
    }
    
    switch (searchJob.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-error-600" />
      default:
        return <Clock className="h-4 w-4 text-warning-600" />
    }
  }

  const getStatusText = () => {
    if (streaming) {
      return `Streaming leads... (${leadsCount} found)`
    }
    
    switch (searchJob.status) {
      case 'completed':
        return `Search completed (${leadsCount} leads found)`
      case 'failed':
        return 'Search failed'
      case 'active':
        return 'Search in progress...'
      default:
        return `Status: ${searchJob.status}`
    }
  }

  const getStatusVariant = () => {
    if (streaming) return 'warning'
    
    switch (searchJob.status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Zap className="h-5 w-5 mr-2 text-blue-600" />
          Search Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <span className="text-body">{getStatusText()}</span>
            </div>
            <Badge variant={getStatusVariant()}>
              {searchJob.status}
            </Badge>
          </div>

          {/* Job Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-caption">Job ID</span>
                <div className="font-mono text-xs text-gray-600 mt-1">
                  {searchJob.job_id}
                </div>
              </div>
              <div>
                <span className="text-caption">Leads Found</span>
                <div className="font-semibold text-blue-600 mt-1">
                  {leadsCount}
                </div>
              </div>
            </div>

            {/* DSL Preview */}
            {searchJob.dsl && (
              <div>
                <span className="text-caption">Query Parameters</span>
                <div className="mt-2 p-3 bg-white border rounded-md">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(searchJob.dsl, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {streaming && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>Searching for more leads...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}