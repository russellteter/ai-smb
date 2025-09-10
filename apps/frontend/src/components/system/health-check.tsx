import { useState } from 'react'
import { Activity, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { LoadingSpinner } from '../ui/loading-spinner'

interface HealthStatus {
  status: 'checking' | 'healthy' | 'unhealthy'
  message?: string
  timestamp?: string
}

export function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ status: 'healthy' })
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    setHealthStatus({ status: 'checking' })

    try {
      const response = await fetch('/health')
      const data = await response.json()
      
      if (response.ok) {
        setHealthStatus({
          status: 'healthy',
          message: 'All systems operational',
          timestamp: new Date().toLocaleTimeString()
        })
      } else {
        setHealthStatus({
          status: 'unhealthy',
          message: data.error || 'Health check failed',
          timestamp: new Date().toLocaleTimeString()
        })
      }
    } catch (error) {
      setHealthStatus({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Connection failed',
        timestamp: new Date().toLocaleTimeString()
      })
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case 'checking':
        return <LoadingSpinner size="sm" />
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-error-600" />
    }
  }

  const getStatusBadge = () => {
    switch (healthStatus.status) {
      case 'checking':
        return <Badge variant="warning">Checking</Badge>
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <span className="text-body">
                {healthStatus.message || 'Ready to check system health'}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {healthStatus.timestamp && (
            <div className="text-sm text-gray-500">
              Last checked: {healthStatus.timestamp}
            </div>
          )}

          <Button
            onClick={checkHealth}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isChecking ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Checking...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Check System Health
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}