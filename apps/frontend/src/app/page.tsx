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

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [currentTab, setCurrentTab] = useState<'search' | 'leads' | 'analytics'>('search')
  const [searchJob, setSearchJob] = useState<SearchJob | null>(null)
  const [leads, setLeads] = useState<Lead[]>(mockLeads)

  const handleStartSearch = (prompt: string) => {
    setIsStreaming(true)
    setSearchJob({
      ...mockSearchJob,
      prompt,
      status: 'streaming',
      progress: 0
    })
    
    // Simulate streaming progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        setIsStreaming(false)
        setSearchJob(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null)
        clearInterval(interval)
      } else {
        setSearchJob(prev => prev ? { ...prev, progress: Math.min(progress, 99) } : null)
      }
    }, 1000)
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
      <AnimatedGradient />
      <FloatingElements />
      
      <div className="min-h-screen relative">
        <div className="relative z-10">
          <Header />
          
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Desktop View */}
            <div className="hidden lg:block space-y-8">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
                  Mothership Leads
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  AI-Powered SMB Discovery & Outreach Platform
                </p>
              </div>

              {/* Search Section */}
              <AdvancedSearch onSearch={(query, filters) => handleStartSearch(query)} />

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

              {/* Results Section */}
              <div className="grid grid-cols-12 gap-6">
                <div className={selectedLead ? 'col-span-8' : 'col-span-12'}>
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
                </div>
                
                {selectedLead && (
                  <div className="col-span-4">
                    <LeadDetailPanel
                      lead={selectedLead}
                      isOpen={true}
                      onClose={() => setSelectedLead(null)}
                      onUpdate={(updatedLead) => {
                        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l))
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="fixed bottom-8 right-8 space-y-4">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="group flex items-center justify-center w-14 h-14 bg-white dark:bg-dark-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                >
                  <Download className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-primary-600" />
                </button>
                <button
                  onClick={() => handleStartSearch('Find AI-ready companies')}
                  className="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
              {currentTab === 'search' && (
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
                  {leads.map(lead => (
                    <MobileLeadCard
                      key={lead.id}
                      lead={lead}
                      onSelect={() => setSelectedLead(lead)}
                      onContact={() => handleContactLead(lead)}
                    />
                  ))}
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