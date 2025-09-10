'use client'

import { useState } from 'react'
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  Mail,
  CheckCircle,
  Settings,
  Calendar,
  Filter,
  Zap,
  Cloud,
  Link
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Lead } from '@/types'

interface ExportModalProps {
  leads: Lead[]
  isOpen: boolean
  onClose: () => void
  onExport?: (format: string, fields: string[], leads: Lead[]) => void
}

const exportFormats = [
  {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet format, compatible with Excel',
    icon: FileSpreadsheet,
    popular: true,
  },
  {
    id: 'xlsx',
    name: 'Excel',
    description: 'Microsoft Excel format with formatting',
    icon: FileSpreadsheet,
    popular: true,
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format for developers',
    icon: Database,
    popular: false,
  },
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Professional report with charts and insights',
    icon: FileText,
    popular: false,
  },
]

const availableFields = [
  { id: 'name', label: 'Company Name', category: 'basic', required: true },
  { id: 'website', label: 'Website', category: 'basic', required: false },
  { id: 'email', label: 'Email', category: 'contact', required: false },
  { id: 'phone', label: 'Phone', category: 'contact', required: false },
  { id: 'location', label: 'Location', category: 'basic', required: false },
  { id: 'industry', label: 'Industry', category: 'basic', required: false },
  { id: 'size', label: 'Company Size', category: 'basic', required: false },
  { id: 'revenue', label: 'Revenue', category: 'financials', required: false },
  { id: 'score', label: 'Lead Score', category: 'analysis', required: false },
  { id: 'signals', label: 'Buying Signals', category: 'analysis', required: false },
  { id: 'lastUpdated', label: 'Last Updated', category: 'meta', required: false },
]

const integrations = [
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    description: 'Export directly to your HubSpot contacts',
    icon: Link,
    color: 'text-orange-600',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Add leads to Salesforce automatically',
    icon: Link,
    color: 'text-blue-600',
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Import leads into Pipedrive pipeline',
    icon: Link,
    color: 'text-green-600',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Add to email marketing campaigns',
    icon: Mail,
    color: 'text-yellow-600',
  },
]

export function ExportModal({ leads, isOpen, onClose, onExport }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'email', 'phone', 'website', 'location', 'industry', 'score'
  ])
  const [includeFilters, setIncludeFilters] = useState(false)
  const [includeCharts, setIncludeCharts] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'format' | 'fields' | 'integrations'>('format')

  const handleFieldToggle = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId)
    if (field?.required) return

    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    )
  }

  const handleSelectAll = (category?: string) => {
    const fieldsToSelect = category 
      ? availableFields.filter(f => f.category === category).map(f => f.id)
      : availableFields.map(f => f.id)
    
    setSelectedFields(fieldsToSelect)
  }

  const handleExport = async () => {
    setIsExporting(true)
    await onExport?.(selectedFormat, selectedFields, leads)
    setIsExporting(false)
    onClose()
  }

  const categories = {
    basic: 'Company Info',
    contact: 'Contact Details',
    financials: 'Financial Data',
    analysis: 'AI Analysis',
    meta: 'Metadata',
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-surface rounded-2xl animate-scale-in">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Export Leads</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Export {leads.length} selected lead{leads.length > 1 ? 's' : ''} in your preferred format
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              {(['format', 'fields', 'integrations'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium capitalize rounded-lg transition-colors',
                    activeTab === tab
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {tab === 'integrations' ? 'CRM Integration' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'format' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format) => {
                  const Icon = format.icon
                  return (
                    <GlassCard
                      key={format.id}
                      variant={selectedFormat === format.id ? 'highlight' : 'default'}
                      className={cn(
                        'p-4 cursor-pointer transition-all hover:scale-[1.02]',
                        selectedFormat === format.id && 'ring-2 ring-primary-500/20'
                      )}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-purple/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{format.name}</h3>
                            {format.popular && (
                              <span className="badge-success text-xs">Popular</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                        </div>
                        {selectedFormat === format.id && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            )}

            {activeTab === 'fields' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAll()}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFields(['name'])}
                  >
                    Clear All
                  </Button>
                  {Object.entries(categories).map(([key, label]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSelectAll(key)}
                      className="text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Field Groups */}
                {Object.entries(categories).map(([category, label]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableFields
                        .filter(field => field.category === category)
                        .map((field) => (
                          <label
                            key={field.id}
                            className={cn(
                              'flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors',
                              selectedFields.includes(field.id)
                                ? 'bg-primary-50 border border-primary-200'
                                : 'bg-white/50 border border-gray-200/50 hover:bg-gray-50',
                              field.required && 'opacity-75 cursor-not-allowed'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFields.includes(field.id)}
                              onChange={() => handleFieldToggle(field.id)}
                              disabled={field.required}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {field.label}
                              {field.required && <span className="text-gray-400 ml-1">*</span>}
                            </span>
                          </label>
                        ))
                      }
                    </div>
                  </div>
                ))}

                {/* Export Options */}
                <div className="border-t border-gray-200/20 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={includeFilters}
                        onChange={(e) => setIncludeFilters(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      Include filter settings in export
                    </label>
                    {selectedFormat === 'pdf' && (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={includeCharts}
                          onChange={(e) => setIncludeCharts(e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        Include charts and visualizations
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Connect to Your CRM</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Export leads directly to your existing tools and workflows
                  </p>
                </div>

                {integrations.map((integration) => {
                  const Icon = integration.icon
                  return (
                    <GlassCard
                      key={integration.id}
                      className="p-4 cursor-pointer hover:shadow-float transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Icon className={cn('w-6 h-6', integration.color)} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </GlassCard>
                  )
                })}

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Don&apos;t see your CRM? <a href="#" className="text-primary-600 hover:text-primary-700">Request an integration</a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>{selectedFields.length} fields selected • {leads.length} leads</p>
                {selectedFormat === 'csv' && (
                  <p className="mt-1">Estimated file size: ~{Math.ceil(leads.length * selectedFields.length * 0.01)}KB</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || selectedFields.length === 0}
                  className="button-primary"
                >
                  {isExporting ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export {exportFormats.find(f => f.id === selectedFormat)?.name}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}