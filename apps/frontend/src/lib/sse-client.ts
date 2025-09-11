import { Lead } from '@/types'

export interface SSEMessage {
  type: 'lead' | 'progress' | 'status' | 'error' | 'complete'
  data: any
  timestamp: Date
}

export interface SSEOptions {
  onMessage?: (message: SSEMessage) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export class SSEClient {
  private eventSource: EventSource | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isConnected = false
  private options: SSEOptions

  constructor(private url: string, options: SSEOptions = {}) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options
    }
  }

  connect() {
    if (this.eventSource) {
      this.disconnect()
    }

    try {
      this.eventSource = new EventSource(this.url)
      
      this.eventSource.onopen = () => {
        this.isConnected = true
        this.reconnectAttempts = 0
        this.options.onConnect?.()
        console.log('SSE Connected:', this.url)
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const message: SSEMessage = {
            type: data.type || 'lead',
            data: data.data || data,
            timestamp: new Date()
          }
          this.options.onMessage?.(message)
        } catch (error) {
          console.error('SSE Parse Error:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error)
        this.isConnected = false
        this.options.onError?.(new Error('SSE connection error'))
        this.options.onDisconnect?.()
        
        // Attempt reconnection
        if (this.reconnectAttempts < (this.options.maxReconnectAttempts ?? 5)) {
          this.scheduleReconnect()
        } else {
          console.error('Max reconnection attempts reached')
          this.disconnect()
        }
      }

      // Handle specific event types
      this.eventSource.addEventListener('lead', (event) => {
        const lead: Lead = JSON.parse(event.data)
        this.options.onMessage?.({
          type: 'lead',
          data: lead,
          timestamp: new Date()
        })
      })

      this.eventSource.addEventListener('progress', (event) => {
        const progress = JSON.parse(event.data)
        this.options.onMessage?.({
          type: 'progress',
          data: progress,
          timestamp: new Date()
        })
      })

      this.eventSource.addEventListener('complete', (event) => {
        this.options.onMessage?.({
          type: 'complete',
          data: JSON.parse(event.data),
          timestamp: new Date()
        })
        // Auto-disconnect after completion
        setTimeout(() => this.disconnect(), 1000)
      })

    } catch (error) {
      console.error('SSE Connection Failed:', error)
      this.options.onError?.(error as Error)
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.options.reconnectInterval ?? 3000
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.isConnected = false
    this.options.onDisconnect?.()
    console.log('SSE Disconnected')
  }

  getState(): 'connecting' | 'connected' | 'disconnected' {
    if (!this.eventSource) return 'disconnected'
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting'
      case EventSource.OPEN:
        return 'connected'
      default:
        return 'disconnected'
    }
  }

  isActive(): boolean {
    return this.isConnected
  }
}

// Hook for React components
import { useEffect, useRef, useState } from 'react'

export function useSSE(url: string | null, options: SSEOptions = {}) {
  const [state, setState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [messages, setMessages] = useState<SSEMessage[]>([])
  const clientRef = useRef<SSEClient | null>(null)

  useEffect(() => {
    if (!url) {
      setState('idle')
      return
    }

    setState('connecting')
    
    const client = new SSEClient(url, {
      ...options,
      onConnect: () => {
        setState('connected')
        options.onConnect?.()
      },
      onDisconnect: () => {
        setState('idle')
        options.onDisconnect?.()
      },
      onError: (error) => {
        setState('error')
        options.onError?.(error)
      },
      onMessage: (message) => {
        setMessages(prev => [...prev, message])
        options.onMessage?.(message)
      }
    })

    client.connect()
    clientRef.current = client

    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [url])

  const disconnect = () => {
    clientRef.current?.disconnect()
    setState('idle')
    setMessages([])
  }

  const clearMessages = () => {
    setMessages([])
  }

  return {
    state,
    messages,
    disconnect,
    clearMessages,
    isConnected: state === 'connected'
  }
}