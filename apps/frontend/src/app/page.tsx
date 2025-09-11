'use client'

import { useState } from 'react'
import { LeadTable } from '@/components/leads/lead-table'
import { ContactModal } from '@/components/contact/contact-modal'
import { ExportModal } from '@/components/export/export-modal'
import { Button } from '@/components/ui/button'
import { 
  Search, Filter, Download, RefreshCw, Plus
} from 'lucide-react'
import { Lead, SearchJob } from '@/types'
import { parsePrompt, createSearchJob, SearchStreamClient, transformAPILead } from '@/lib/api'

// Example searches for CRM
const exampleSearches = [
  "Dentists in Columbia, SC with no chat widget",
  "Law firms in Charleston without online booking",
  "HVAC contractors in Atlanta with owner identified",
  "Roofing companies in Dallas with no website"
]

// Recent searches with mock data - will be replaced with real data
const recentSearches = [
  { query: "law_firm in Charleston, SC", date: "9/10/2025", count: 20, status: "completed" },
  { query: "roofing in Dallas, TX", date: "9/10/2025", count: 20, status: "completed" },
  { query: "hvac in Atlanta, GA", date: "9/10/2025", count: 20, status: "completed" },
  { query: "dentist in Atlanta, GA", date: "9/10/2025", count: 20, status: "completed" },
  { query: "dentist in Charleston, SC", date: "9/10/2025", count: 20, status: "completed" },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [searchJob, setSearchJob] = useState<SearchJob | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'table' | 'board'>('dashboard')

  const handleStartSearch = async (prompt: string) => {
    console.log('Starting search with prompt:', prompt)
    setIsStreaming(true)
    setError(null)
    setLeads([])
    
    let streamClient: SearchStreamClient | null = null
    
    try {
      console.log('Calling parsePrompt API...')
      const parseResult = await parsePrompt(prompt)
      console.log('Parse result:', parseResult)
      
      if (parseResult.warnings && parseResult.warnings.length > 0) {
        console.warn('Parse warnings:', parseResult.warnings)
      }
      
      console.log('Creating search job with DSL:', parseResult.dsl)
      const searchResult = await createSearchJob(undefined, parseResult.dsl)
      console.log('Search job created:', searchResult)
      
      setSearchJob({
        id: searchResult.job_id,
        prompt,
        status: 'streaming',
        progress: 0,
        totalLeads: parseResult.dsl.result_size?.target || 20,
        processedLeads: 0,
        startedAt: new Date(),
        currentStep: 'Searching...'
      })
      
      streamClient = new SearchStreamClient(searchResult.job_id)
      
      streamClient.connect({
        onProgress: (data) => {
          setSearchJob(prev => prev ? {
            ...prev,
            progress: data.processed ? (data.processed / (data.total || 20)) * 100 : prev.progress,
            processedLeads: data.processed || prev.processedLeads,
            totalLeads: data.total || prev.totalLeads,
            currentStep: data.message || prev.currentStep
          } : null)
          
          if (data.leads && Array.isArray(data.leads)) {
            const newLeads = data.leads.map((lead: any) => transformAPILead(lead))
            setLeads(prev => [...prev, ...newLeads])
          }
        },
        
        onLead: (leadData) => {
          const transformedLead = transformAPILead(leadData)
          setLeads(prev => [...prev, transformedLead])
        },
        
        onComplete: (summary) => {
          setIsStreaming(false)
          setSearchJob(prev => prev ? {
            ...prev,
            status: 'completed',
            progress: 100,
            currentStep: 'Complete'
          } : null)
        },
        
        onError: (error) => {
          setError(error.message || 'Search failed')
          setIsStreaming(false)
          setSearchJob(null)
        }
      })
      
    } catch (err: any) {
      console.error('Search error details:', err)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to start search'
      
      if (err.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to the API. Please check your connection and try again.'
      } else if (err.message?.includes('CORS')) {
        errorMessage = 'Cross-origin request blocked. This is a configuration issue.'
      } else if (err.message?.includes('Parser returned invalid DSL')) {
        errorMessage = 'Failed to understand your search query. Please try rephrasing.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setIsStreaming(false)
      setSearchJob(null)
      
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
    <div className="h-full bg-crm-bg">
      {/* Top Bar */}
      <div className="border-b border-crm-border bg-crm-panel px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">SMB Lead Finder</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back, russell.teter@gmail.com
            </p>
          </div>
          
          {/* View Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('table')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'table' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setCurrentView('board')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'board' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Board View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-green">20 of 20 leads</span>
            <span className="text-sm text-gray-400">Status: {searchJob?.status || 'completed'}</span>
            <Button
              onClick={() => setShowExportModal(true)}
              className="button-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartSearch(searchQuery)}
                placeholder="e.g., dentists in Columbia, SC with no chat widget"
                className="input-base pl-10 w-full"
              />
            </div>
            <Button
              onClick={() => handleStartSearch(searchQuery)}
              disabled={!searchQuery || isStreaming}
              className="button-primary"
            >
              Find Leads
            </Button>
          </div>
          
          {/* Example Searches */}
          <div className="text-xs text-gray-500">
            <span className="mr-2">Example searches:</span>
            {exampleSearches.map((example, i) => (
              <span key={i}>
                <button
                  onClick={() => setSearchQuery(example)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {example}
                </button>
                {i < exampleSearches.length - 1 && <span className="mx-1">•</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        {searchJob && (
          <div className="mb-6 p-3 bg-crm-panel border border-crm-border rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Status:</span>
                <span className={`badge-${searchJob.status === 'completed' ? 'green' : 'yellow'}`}>
                  {searchJob.status}
                </span>
                <span className="text-sm text-gray-300">{searchJob.currentStep}</span>
              </div>
              {searchJob.status === 'streaming' && (
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${searchJob.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {searchJob.processedLeads}/{searchJob.totalLeads}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-800 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-9">
            {currentView === 'dashboard' && leads.length === 0 && !isStreaming && (
              <div className="bg-crm-panel border border-crm-border rounded-md p-8 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No search results</h3>
                <p className="text-sm text-gray-500">
                  Enter a search query above to find leads
                </p>
              </div>
            )}

            {(leads.length > 0 || isStreaming) && (
              <div className="bg-crm-panel border border-crm-border rounded-md overflow-hidden">
                <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-300">
                    Search Results ({leads.length} leads)
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-200">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-200">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <LeadTable 
                  leads={leads}
                  onContact={(selectedLeads) => {
                    if (selectedLeads.length > 0) {
                      handleContactLead(selectedLeads[0])
                    }
                  }}
                  onExport={(selectedLeads) => {
                    setShowExportModal(true)
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Recent Searches */}
            <div className="bg-crm-panel border border-crm-border rounded-md">
              <div className="px-4 py-3 border-b border-crm-border">
                <h3 className="text-sm font-medium text-gray-300">Recent Searches</h3>
              </div>
              <div className="p-2">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(search.query)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-800/50 rounded transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{search.query}</p>
                        <p className="text-xs text-gray-500">
                          {search.date} • {search.count} leads found
                        </p>
                      </div>
                      <span className="badge-green text-xs">{search.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Searches */}
            <div className="bg-crm-panel border border-crm-border rounded-md">
              <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Saved Searches</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">
                  <Plus className="w-3 h-3 inline mr-1" />
                  Create Template
                </button>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No saved searches yet</p>
              </div>
            </div>
          </div>
        </div>
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
  )
}