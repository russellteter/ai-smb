'use client'

import { useState } from 'react'
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
import { FloatingElements } from '@/components/ui/floating-elements'
import { AnimatedGradient } from '@/components/ui/animated-gradient'
import { Plus, Search, Filter, Download, Mail } from 'lucide-react'
import { Lead, SearchJob } from '@/types'

// Mock data for demonstration
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
    size: '10-50 employees',
    revenue: '$1M-$10M',
    score: 72,
    signals: ['Manual reporting processes', 'Growing team', 'Looking for automation'],
    email: 'hello@dataflow.io',
    lastUpdated: new Date(),
    status: 'new',
    contacts: [
      { name: 'Mike Chen', title: 'Founder', email: 'mike@dataflow.io' }
    ],
    technologies: ['Python', 'PostgreSQL', 'Tableau']
  }
]

export default function Home() {
  const [searchJob, setSearchJob] = useState<SearchJob>({ id: '', status: 'idle' })
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [contactLeads, setContactLeads] = useState<Lead[]>([])
  const [exportLeads, setExportLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  const handleSearch = (query: string, filters: any[]) => {
    console.log('Starting search with query:', query, 'and filters:', filters)
    
    setSearchJob({
      id: Date.now().toString(),
      status: 'streaming',
      metrics: {
        totalFound: 0,
        processed: 0,
        enriched: 0,
        qualified: 0,
        speed: 2.3,
        eta: 45
      }
    })

    // Simulate streaming results
    setTimeout(() => {
      setLeads(mockLeads)
      setSearchJob(prev => ({
        ...prev,
        status: 'completed',
        metrics: {
          ...prev.metrics!,
          totalFound: mockLeads.length,
          processed: mockLeads.length,
          enriched: mockLeads.length,
          qualified: mockLeads.filter(l => l.score >= 70).length,
        }
      }))
    }, 3000)
  }

  const handleContactLeads = (leads: Lead[]) => {
    setContactLeads(leads)
    setShowContactModal(true)
  }

  const handleExportLeads = (leads: Lead[]) => {
    setExportLeads(leads)
    setShowExportModal(true)
  }

  const handleSendMessage = (method: string, message: string, leads: Lead[]) => {
    console.log('Sending message via', method, 'to', leads.length, 'leads:', message)
    setShowContactModal(false)
    // Here you would integrate with your backend API
  }

  const handleExport = (format: string, fields: string[], leads: Lead[]) => {
    console.log('Exporting', leads.length, 'leads as', format, 'with fields:', fields)
    setShowExportModal(false)
    // Here you would integrate with your backend API
  }

  const mobileActions = [
    { icon: Search, label: 'Search', onClick: () => {}, variant: 'primary' as const },
    { icon: Filter, label: 'Filter', onClick: () => {}, variant: 'secondary' as const },
    { icon: Download, label: 'Export', onClick: () => handleExportLeads(leads), variant: 'secondary' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
      {/* Background Elements */}
      <FloatingElements count={3} size="lg" color="primary" />
      <AnimatedGradient variant="mesh" opacity={0.1} className="fixed inset-0 pointer-events-none" />
      
      {/* Mobile Navigation */}
      <MobileNavigation currentPage="dashboard" />
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* Main Content */}
      <main className="pt-16 md:pt-0">
        <div className="container-app py-6 md:py-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-display gradient-text">Find Your Next Best Customers</h1>
            <p className="text-body-lg max-w-2xl mx-auto text-balance">
              Use natural language and advanced filters to discover SMB leads with specific characteristics,
              missing technologies, or growth opportunities.
            </p>
          </div>

          {/* Advanced Search */}
          <div className="mb-8">
            <AdvancedSearch onSearch={handleSearch} />
          </div>

          {/* Results Section */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Stream Status */}
            {searchJob.status !== 'idle' && (
              <div className="xl:col-span-1">
                <StreamStatus
                  status={searchJob.status}
                  metrics={searchJob.metrics}
                  message="Analyzing businesses and enriching data..."
                />
              </div>
            )}

            {/* Results */}
            <div className={`xl:col-span-${searchJob.status !== 'idle' ? '3' : '4'}`}>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                {leads.length > 0 && (
                  <LeadTable
                    leads={leads}
                    onContact={handleContactLeads}
                    onExport={handleExportLeads}
                  />
                )}
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {leads.map((lead) => (
                  <MobileLeadCard
                    key={lead.id}
                    lead={lead}
                    onSelect={setSelectedLead}
                    onContact={(lead) => handleContactLeads([lead])}
                    onSave={(lead) => console.log('Save lead:', lead)}
                    onShare={(lead) => console.log('Share lead:', lead)}
                  />
                ))}
              </div>

              {/* Empty State */}
              {leads.length === 0 && searchJob.status === 'idle' && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-accent-purple/10 flex items-center justify-center">
                    <Search className="w-10 h-10 text-primary-600" />
                  </div>
                  <h3 className="text-heading-4 mb-2">Ready to Find Leads</h3>
                  <p className="text-body max-w-md mx-auto">
                    Use the search above to start finding your next best customers.
                    Try something like "SaaS companies in SF without AI tools".
                  </p>
                </div>
              )}

              {/* Live Feed for Streaming */}
              {searchJob.status === 'streaming' && (
                <div className="mt-6">
                  <LiveFeed
                    leads={leads.map(lead => ({
                      ...lead,
                      timestamp: new Date()
                    }))}
                    isStreaming={searchJob.status === 'streaming'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Action Bar */}
      {leads.length > 0 && (
        <div className="md:hidden">
          <MobileActionBar actions={mobileActions} />
          <MobileFloatingButton
            icon={Plus}
            onClick={() => console.log('Add new search')}
          />
        </div>
      )}

      {/* Modals */}
      <ContactModal
        leads={contactLeads}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSend={handleSendMessage}
      />

      <ExportModal
        leads={exportLeads}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      {/* Lead Detail Panel */}
      <LeadDetailPanel
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={(updatedLead) => {
          setLeads(prev => prev.map(lead => 
            lead.id === updatedLead.id ? updatedLead : lead
          ))
        }}
      />
    </div>
  )
}