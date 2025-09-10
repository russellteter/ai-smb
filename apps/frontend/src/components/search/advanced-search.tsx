'use client'

import { useState } from 'react'
import { 
  Search, 
  Plus, 
  X, 
  MapPin, 
  Building2, 
  DollarSign, 
  Users, 
  Globe,
  Sparkles,
  Filter,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

interface SearchFilter {
  id: string
  type: 'location' | 'industry' | 'size' | 'revenue' | 'technology'
  value: string
  label: string
}

const filterTypes = [
  { type: 'location', icon: MapPin, label: 'Location', color: 'text-blue-600' },
  { type: 'industry', icon: Building2, label: 'Industry', color: 'text-purple-600' },
  { type: 'size', icon: Users, label: 'Company Size', color: 'text-green-600' },
  { type: 'revenue', icon: DollarSign, label: 'Revenue', color: 'text-yellow-600' },
  { type: 'technology', icon: Globe, label: 'Technology', color: 'text-pink-600' },
]

const searchTemplates = [
  {
    id: '1',
    title: 'AI-Ready Businesses',
    description: 'Companies likely to adopt AI solutions',
    icon: Sparkles,
    filters: [
      { type: 'size', value: '50-500 employees' },
      { type: 'technology', value: 'No AI tools detected' },
    ],
  },
  {
    id: '2',
    title: 'High-Growth Startups',
    description: 'Fast-growing companies with funding',
    icon: TrendingUp,
    filters: [
      { type: 'size', value: '10-100 employees' },
      { type: 'revenue', value: 'Series A-C funded' },
    ],
  },
  {
    id: '3',
    title: 'Enterprise Targets',
    description: 'Large companies with big budgets',
    icon: Building2,
    filters: [
      { type: 'size', value: '500+ employees' },
      { type: 'revenue', value: '$50M+ revenue' },
    ],
  },
]

export function AdvancedSearch({ onSearch }: { onSearch: (query: string, filters: SearchFilter[]) => void }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilter[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleAddFilter = (type: string, value: string, label: string) => {
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      type: type as any,
      value,
      label,
    }
    setFilters([...filters, newFilter])
    setActiveFilterType(null)
  }

  const handleRemoveFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const handleApplyTemplate = (template: any) => {
    const newFilters = template.filters.map((f: any, i: number) => ({
      id: Date.now().toString() + i,
      type: f.type,
      value: f.value,
      label: f.value,
    }))
    setFilters(newFilters)
    setQuery(template.title)
  }

  const handleSearch = () => {
    setIsSearching(true)
    onSearch(query, filters)
    setTimeout(() => setIsSearching(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <GlassCard variant="elevated" className="p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your ideal customer..."
              className="w-full pl-12 pr-4 py-3 bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            className="hover:bg-white/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showAdvanced ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>
          <Button
            onClick={handleSearch}
            className="bg-gradient-primary text-white px-6 hover:shadow-glow"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div className="loading-spinner mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Find Leads
              </>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/20">
            {filters.map((filter) => {
              const filterType = filterTypes.find(ft => ft.type === filter.type)
              const Icon = filterType?.icon || Globe
              return (
                <div
                  key={filter.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-gray-200/50 animate-scale-in"
                >
                  <Icon className={cn('w-3 h-3', filterType?.color)} />
                  <span className="text-sm">{filter.label}</span>
                  <button
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="ml-1 hover:bg-gray-200/50 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              )
            })}
            <button
              onClick={() => setFilters([])}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              Clear all
            </button>
          </div>
        )}
      </GlassCard>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-down">
          {/* Filter Options */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Filters</h3>
            <div className="space-y-2">
              {filterTypes.map((filterType) => {
                const Icon = filterType.icon
                return (
                  <button
                    key={filterType.type}
                    onClick={() => setActiveFilterType(
                      activeFilterType === filterType.type ? null : filterType.type
                    )}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      activeFilterType === filterType.type
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', filterType.color)} />
                    <span className="text-sm font-medium">{filterType.label}</span>
                    <Plus className="w-4 h-4 ml-auto text-gray-400" />
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* Filter Values */}
          {activeFilterType && (
            <GlassCard className="p-4 animate-slide-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Select {filterTypes.find(ft => ft.type === activeFilterType)?.label}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getFilterOptions(activeFilterType).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAddFilter(activeFilterType, option.value, option.label)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs text-gray-500 mt-0.5">{option.description}</span>
                    )}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Search Templates */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Templates</h3>
            <div className="space-y-2">
              {searchTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <button
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{template.title}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Recent Searches */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Recent:</span>
          <button className="text-primary-600 hover:text-primary-700">
            &quot;SaaS companies in SF&quot;
          </button>
          <span className="text-gray-400">•</span>
          <button className="text-primary-600 hover:text-primary-700">
            &quot;E-commerce startups&quot;
          </button>
        </div>
      </div>
    </div>
  )
}

function getFilterOptions(type: string) {
  const options: Record<string, Array<{ value: string; label: string; description?: string }>> = {
    location: [
      { value: 'san-francisco', label: 'San Francisco Bay Area', description: 'SF, Oakland, San Jose' },
      { value: 'new-york', label: 'New York Metro', description: 'NYC, Newark, Jersey City' },
      { value: 'los-angeles', label: 'Los Angeles Area', description: 'LA, Long Beach, Anaheim' },
      { value: 'chicago', label: 'Chicago Metro', description: 'Chicago, Naperville, Elgin' },
      { value: 'boston', label: 'Boston Area', description: 'Boston, Cambridge, Newton' },
      { value: 'austin', label: 'Austin', description: 'Austin, Round Rock' },
      { value: 'seattle', label: 'Seattle Area', description: 'Seattle, Tacoma, Bellevue' },
    ],
    industry: [
      { value: 'saas', label: 'SaaS & Software', description: 'B2B software companies' },
      { value: 'ecommerce', label: 'E-commerce & Retail', description: 'Online retail & marketplaces' },
      { value: 'fintech', label: 'Financial Services', description: 'Banking, payments, crypto' },
      { value: 'healthcare', label: 'Healthcare & Biotech', description: 'Medical, pharma, wellness' },
      { value: 'education', label: 'Education & EdTech', description: 'Schools, online learning' },
      { value: 'realestate', label: 'Real Estate', description: 'Property, construction' },
      { value: 'manufacturing', label: 'Manufacturing', description: 'Industrial, production' },
    ],
    size: [
      { value: '1-10', label: '1-10 employees', description: 'Micro businesses' },
      { value: '11-50', label: '11-50 employees', description: 'Small businesses' },
      { value: '51-200', label: '51-200 employees', description: 'Medium businesses' },
      { value: '201-500', label: '201-500 employees', description: 'Large SMBs' },
      { value: '501-1000', label: '501-1000 employees', description: 'Mid-market' },
      { value: '1000+', label: '1000+ employees', description: 'Enterprise' },
    ],
    revenue: [
      { value: '<1m', label: 'Under $1M', description: 'Early stage' },
      { value: '1-10m', label: '$1M - $10M', description: 'Growing businesses' },
      { value: '10-50m', label: '$10M - $50M', description: 'Established SMBs' },
      { value: '50-100m', label: '$50M - $100M', description: 'Large SMBs' },
      { value: '100m+', label: 'Over $100M', description: 'Enterprise level' },
    ],
    technology: [
      { value: 'no-ai', label: 'No AI Tools', description: 'Not using AI yet' },
      { value: 'basic-website', label: 'Basic Website', description: 'Simple web presence' },
      { value: 'ecommerce-platform', label: 'E-commerce Platform', description: 'Shopify, WooCommerce' },
      { value: 'crm-system', label: 'CRM System', description: 'Salesforce, HubSpot' },
      { value: 'cloud-infrastructure', label: 'Cloud Infrastructure', description: 'AWS, Azure, GCP' },
    ],
  }
  
  return options[type] || []
}