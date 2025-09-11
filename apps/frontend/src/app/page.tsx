'use client'

import { useState, useEffect } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/layout/header'
import { AdvancedSearch } from '@/components/search/advanced-search'
import { StreamStatus } from '@/components/streaming/stream-status'
import { LiveFeed } from '@/components/streaming/live-feed'
import { LeadTable } from '@/components/leads/lead-table'
import { LeadDetailPanel } from '@/components/leads/lead-detail-panel'
import { ContactModal } from '@/components/contact/contact-modal'
import { ExportModal } from '@/components/export/export-modal'
import { MobileNavigation, MobileActionBar, MobileFloatingButton } from '@/components/mobile/mobile-navigation'
import { MobileLeadCard } from '@/components/mobile/mobile-cards'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
import { AnimatedGradient } from '@/components/ui/animated-gradient'
import { FloatingElements } from '@/components/ui/floating-elements'
import { ProgressChart, ProgressBar } from '@/components/ui/progress-chart'
import { Button } from '@/components/ui/button'
import { 
  Plus, Search, Filter, Download, Mail, TrendingUp, Users, Target, Zap,
  Building2, MapPin, DollarSign, Activity, ArrowRight, Sparkles, Globe
} from 'lucide-react'
import { Lead, SearchJob } from '@/types'
import { cn } from '@/lib/utils'
import { SkeletonLeadCard, SkeletonStats, SkeletonTable } from '@/components/ui/skeleton'
import { parsePrompt, createSearchJob, SearchStreamClient, transformAPILead } from '@/lib/api'

// Mock data removed - using real API now
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    website: 'https://techcorp.com',
    location: 'San Francisco, CA',
    industry: 'SaaS & Software',
    size: '50-200 employees',
    revenue: '$10M-$50M',
    score: 85,
    signals: ['No AI tools detected', 'High growth trajectory', 'Recent funding round'],
    phone: '+1 (555) 123-4567',
    email: 'contact@techcorp.com',
    lastUpdated: new Date(),
    status: 'new',
    contacts: [
      { name: 'John Smith', title: 'CEO', email: 'john@techcorp.com', phone: '+1 (555) 123-4567' },
      { name: 'Sarah Johnson', title: 'CTO', email: 'sarah@techcorp.com' }
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    socialLinks: {
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: 'https://twitter.com/techcorp'
    }
  },
  {
    id: '2',
    name: 'DataFlow Analytics',
    website: 'https://dataflow.io',
    location: 'Austin, TX',
    industry: 'Data Analytics',
    size: '20-50 employees',
    revenue: '$5M-$10M',
    score: 78,
    signals: ['Manual processes detected', 'Growing team'],
    phone: '+1 (555) 234-5678',
    email: 'hello@dataflow.io',
    lastUpdated: new Date(),
    status: 'qualified',
    contacts: [
      { name: 'Mike Davis', title: 'Founder', email: 'mike@dataflow.io' }
    ],
    technologies: ['Python', 'PostgreSQL', 'AWS'],
    socialLinks: {
      linkedin: 'https://linkedin.com/company/dataflow'
    }
  }
]

const mockSearchJob: SearchJob = {
  id: 'job-123',
  prompt: 'Find SaaS companies in California that might need AI automation',
  status: 'streaming',
  progress: 65,
  totalLeads: 142,
  processedLeads: 92,
  startedAt: new Date(),
  currentStep: 'Enriching lead data with signals'
}

function HomePage() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [currentTab, setCurrentTab] = useState<'search' | 'leads' | 'analytics'>('search')
  const [searchJob, setSearchJob] = useState<SearchJob | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState<string | null>(null)

  // Initialize component after mount
  useEffect(() => {
    // Don't load mock data - wait for real searches
    setIsLoading(false)
  }, [])

  const handleStartSearch = async (prompt: string) => {
    setIsStreaming(true)
    setError(null)
    setLeads([]) // Clear any existing leads
    
    let streamClient: SearchStreamClient | null = null
    
    try {
      // Step 1: Parse the prompt to get DSL
      console.log('Parsing prompt:', prompt)
      const parseResult = await parsePrompt(prompt)
      
      if (parseResult.warnings && parseResult.warnings.length > 0) {
        console.warn('Parse warnings:', parseResult.warnings)
      }
      
      // Step 2: Create search job with the DSL
      console.log('Creating search job with DSL:', parseResult.dsl)
      const searchResult = await createSearchJob(undefined, parseResult.dsl)
      
      // Step 3: Set up search job tracking
      setSearchJob({
        id: searchResult.job_id,
        prompt,
        status: 'streaming',
        progress: 0,
        totalLeads: parseResult.dsl.result_size?.target || 50,
        processedLeads: 0,
        startedAt: new Date(),
        currentStep: 'Searching for businesses...'
      })
      
      // Step 4: Connect to SSE stream for real-time updates
      streamClient = new SearchStreamClient(searchResult.job_id)
      
      streamClient.connect({
        onProgress: (data) => {
          console.log('Progress update:', data)
          
          // Update search job progress
          setSearchJob(prev => prev ? {
            ...prev,
            progress: data.processed ? (data.processed / (data.total || 50)) * 100 : prev.progress,
            processedLeads: data.processed || prev.processedLeads,
            totalLeads: data.total || prev.totalLeads,
            currentStep: data.message || prev.currentStep
          } : null)
          
          // Add new leads if they come with progress
          if (data.leads && Array.isArray(data.leads)) {
            const newLeads = data.leads.map((lead: any) => transformAPILead(lead))
            setLeads(prev => [...prev, ...newLeads])
          }
        },
        
        onLead: (leadData) => {
          console.log('New lead:', leadData)
          const transformedLead = transformAPILead(leadData)
          setLeads(prev => [...prev, transformedLead])
        },
        
        onComplete: (summary) => {
          console.log('Search completed:', summary)
          setIsStreaming(false)
          setSearchJob(prev => prev ? {
            ...prev,
            status: 'completed',
            progress: 100,
            currentStep: 'Search complete!'
          } : null)
        },
        
        onError: (error) => {
          console.error('Stream error:', error)
          setError(error.message || 'Search failed. Please try again.')
          setIsStreaming(false)
          setSearchJob(prev => prev ? {
            ...prev,
            status: 'error',
            currentStep: 'Search failed'
          } : null)
        }
      })
      
    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'Failed to start search. Please try again.')
      setIsStreaming(false)
      setSearchJob(null)
      
      // Disconnect stream if connected
      if (streamClient) {
        streamClient.disconnect()
      }
    }
  }

  const handleExport = (format: string) => {
    console.log('Exporting in format:', format)
    setShowExportModal(false)
  }

  const handleContactLead = (lead: Lead) => {
    setSelectedLead(lead)
    setShowContactModal(true)
  }

  return (
    <>
      <AnimatedGradient variant="mesh" opacity={0.15} className="fixed inset-0" />
      <FloatingElements />
      
      <div className="min-h-screen relative">
        <div className="relative z-10">
          <Header />
          
          <main className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Desktop View */}
            <div className="hidden lg:block space-y-8">
              {/* Enhanced Hero Section */}
              <div className="relative mb-12">
                <div className="text-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/50 dark:bg-primary-900/20 backdrop-blur-xl border border-primary-200/50 dark:border-primary-800/50 mb-6">
                    <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">AI-Powered Lead Discovery</span>
                  </div>
                  <h1 className="text-6xl font-bold mb-4">
                    <span className="gradient-text">Find Your Next</span>
                    <br />
                    <span className="gradient-text-subtle">Best Customer</span>
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Discover high-quality SMB leads with AI-powered insights. 
                    Identify businesses ready for your AI services.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center justify-center gap-8 mt-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold gradient-text">10K+</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Leads Found</p>
                    </div>
                    <div className="h-12 w-px bg-gray-200 dark:bg-gray-700" />
                    <div className="text-center">
                      <p className="text-3xl font-bold gradient-text">85%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Match Rate</p>
                    </div>
                    <div className="h-12 w-px bg-gray-200 dark:bg-gray-700" />
                    <div className="text-center">
                      <p className="text-3xl font-bold gradient-text">3min</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Search</p>
                    </div>
                  </div>
                </div>
                
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-200/20 via-transparent to-transparent dark:from-primary-800/20 blur-3xl" />
                </div>
              </div>
              
              {/* Stats Overview */}
              {isLoading ? (
                <SkeletonStats />
              ) : (
                <StatsGrid columns={4}>
                <StatsCard
                  title="Active Searches"
                  value={searchJob ? 1 : 0}
                  icon={Search}
                  trend={{ value: 12, label: 'vs last week' }}
                  variant="primary"
                />
                <StatsCard
                  title="Total Leads"
                  value={leads.length}
                  icon={Users}
                  trend={{ value: 25, label: 'vs last week' }}
                  variant="success"
                />
                <StatsCard
                  title="Qualified"
                  value={leads.filter(l => l.score > 70).length}
                  icon={Target}
                  trend={{ value: -5, label: 'vs last week' }}
                  variant="warning"
                />
                <StatsCard
                  title="Conversion Rate"
                  value="32%"
                  icon={TrendingUp}
                  trend={{ value: 8, label: 'improvement' }}
                  variant="default"
                />
                </StatsGrid>
              )}

              {/* Enhanced Search Section */}
              <div className="glass-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start New Search</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Describe your ideal customer in natural language</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="w-4 h-4" />
                    Search Templates
                  </Button>
                </div>
                <AdvancedSearch onSearch={(query, filters) => handleStartSearch(query)} />
              </div>

              {/* Streaming Status */}
              {searchJob && (
                <div className="space-y-4">
                  <StreamStatus 
                    status={searchJob.status}
                    metrics={searchJob.metrics}
                    message={searchJob.currentStep}
                  />
                  {searchJob.status === 'streaming' && (
                    <LiveFeed 
                      leads={leads.map(lead => ({ ...lead, timestamp: new Date() }))} 
                      isStreaming={true} 
                    />
                  )}
                </div>
              )}

              {/* Enhanced Results Section */}
              <div className="space-y-6">
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Results</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {leads.length} leads found • {leads.filter(l => l.score > 70).length} highly qualified
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowExportModal(true)}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {/* Lead Progress Visualization */}
                {searchJob && searchJob.status === 'streaming' && (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Search Progress</h3>
                      <span className="text-sm text-gray-500">{searchJob.processedLeads}/{searchJob.totalLeads} processed</span>
                    </div>
                    <ProgressBar 
                      value={searchJob.progress || 0} 
                      variant="gradient" 
                      size="lg" 
                      animated 
                    />
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <ProgressChart 
                          value={65} 
                          size="sm" 
                          variant="primary" 
                          label="Discovery" 
                        />
                      </div>
                      <div className="text-center">
                        <ProgressChart 
                          value={45} 
                          size="sm" 
                          variant="success" 
                          label="Enrichment" 
                        />
                      </div>
                      <div className="text-center">
                        <ProgressChart 
                          value={searchJob.progress || 0} 
                          size="sm" 
                          variant="gradient" 
                          label="Scoring" 
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error State */}
                {error && (
                  <div className="glass-card p-4 border-l-4 border-error-500">
                    <p className="text-error-600 font-medium">{error}</p>
                  </div>
                )}
                
                {/* Results Table */}
                <div className="grid grid-cols-12 gap-6">
                  <div className={selectedLead ? 'col-span-8' : 'col-span-12'}>
                    <div className="glass-card p-6">
                      {isLoading ? (
                        <SkeletonTable />
                      ) : (
                        <LeadTable 
                          leads={leads}
                          onContact={(selectedLeads) => {
                            if (selectedLeads.length > 0) {
                              handleContactLead(selectedLeads[0])
                            }
                          }}
                          onExport={(selectedLeads) => {
                            console.log('Exporting leads:', selectedLeads)
                            setShowExportModal(true)
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {selectedLead && (
                    <div className="col-span-4">
                      <div className="glass-card p-6">
                        <LeadDetailPanel
                          lead={selectedLead}
                          isOpen={true}
                          onClose={() => setSelectedLead(null)}
                          onUpdate={(updatedLead) => {
                            setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l))
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Quick Actions */}
              <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="group flex items-center gap-3 px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">Export Leads</span>
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => handleStartSearch('Find AI-ready companies')}
                  className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary-600 to-accent-purple rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">Quick Search</span>
                  <div className="relative">
                    <Plus className="w-6 h-6 text-white" />
                    <div className="absolute inset-0 animate-ping">
                      <Plus className="w-6 h-6 text-white opacity-50" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
              {currentTab === 'search' && !isLoading && (
                <div className="space-y-6">
                  <AdvancedSearch onSearch={(query, filters) => handleStartSearch(query)} />
                  {searchJob && (
                    <StreamStatus 
                      status={searchJob.status}
                      metrics={searchJob.metrics}
                      message={searchJob.currentStep}
                    />
                  )}
                </div>
              )}

              {currentTab === 'leads' && (
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonLeadCard key={i} />
                    ))
                  ) : (
                    leads.map(lead => (
                      <MobileLeadCard
                        key={lead.id}
                        lead={lead}
                        onSelect={() => setSelectedLead(lead)}
                        onContact={() => handleContactLead(lead)}
                      />
                    ))
                  )}
                </div>
              )}

              {currentTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <p className="text-sm text-gray-500">Total Leads</p>
                      <p className="text-2xl font-bold">{leads.length}</p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-sm text-gray-500">Avg Score</p>
                      <p className="text-2xl font-bold">81.5</p>
                    </div>
                  </div>
                </div>
              )}

              <MobileActionBar
                actions={[
                  { icon: Search, label: 'Search', onClick: () => setCurrentTab('search') },
                  { icon: Filter, label: 'Leads', onClick: () => setCurrentTab('leads') },
                  { icon: Download, label: 'Export', onClick: () => setShowExportModal(true) }
                ]}
              />

              <MobileFloatingButton
                icon={Plus}
                onClick={() => handleStartSearch('Find AI-ready companies')}
              />

              <MobileNavigation currentPage={currentTab} />
            </div>
          </main>
        </div>

        {/* Modals */}
        {showContactModal && selectedLead && (
          <ContactModal
            leads={[selectedLead]}
            isOpen={true}
            onClose={() => setShowContactModal(false)}
            onSend={(method, message, leads) => {
              console.log('Sending:', method, message, leads)
              setShowContactModal(false)
            }}
          />
        )}

        {showExportModal && (
          <ExportModal
            leads={leads}
            isOpen={true}
            onExport={handleExport}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  )
}