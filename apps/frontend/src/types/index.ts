export interface Lead {
  id: string
  name: string
  website?: string
  location: string
  industry: string
  size: string
  score: number
  signals: string[]
  phone?: string
  email?: string
  revenue?: string
  lastUpdated: Date
  status: 'new' | 'contacted' | 'qualified' | 'rejected'
  contacts?: Array<{
    name: string
    title: string
    email?: string
    phone?: string
  }>
  opportunities?: Array<{
    type: string
    value: string
    confidence: number
  }>
  history?: Array<{
    date: Date
    action: string
    user: string
  }>
  technologies?: string[]
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  description?: string
  founded?: string
  address?: string
}

export interface SearchJob {
  id: string
  status: 'idle' | 'connecting' | 'streaming' | 'completed' | 'error'
  metrics?: {
    totalFound: number
    processed: number
    enriched: number
    qualified: number
    speed: number
    eta: number
  }
}

export interface SearchFilter {
  id: string
  type: 'location' | 'industry' | 'size' | 'revenue' | 'technology'
  value: string
  label: string
}