'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Sparkles,
  Filter,
  MapPin,
  Building2,
  Users,
  DollarSign,
  Globe,
  Briefcase,
  Tag,
  Clock,
  TrendingUp,
  X,
  ChevronDown,
  ChevronRight,
  Zap
} from 'lucide-react'

interface SearchFilter {
  id: string
  label: string
  value: string | number | boolean
  type: 'location' | 'industry' | 'size' | 'revenue' | 'technology' | 'signal'
}

interface EnhancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void
  className?: string
}

const quickFilters = [
  { id: 'no-ai', label: 'No AI Tools', icon: Zap, type: 'signal' },
  { id: 'high-growth', label: 'High Growth', icon: TrendingUp, type: 'signal' },
  { id: 'funded', label: 'Recently Funded', icon: DollarSign, type: 'signal' },
  { id: 'hiring', label: 'Actively Hiring', icon: Users, type: 'signal' },
]

const industryOptions = [
  'SaaS & Software',
  'Healthcare',
  'E-commerce',
  'Financial Services',
  'Manufacturing',
  'Real Estate',
  'Professional Services',
  'Retail',
  'Hospitality',
  'Education',
]

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
]

const revenueRanges = [
  'Under $1M',
  '$1M - $5M',
  '$5M - $10M',
  '$10M - $50M',
  '$50M+',
]

export function EnhancedSearch({ onSearch, className }: EnhancedSearchProps) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedRevenue, setSelectedRevenue] = useState<string>('')
  const [location, setLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleQuickFilter = (filter: typeof quickFilters[0]) => {
    const existing = activeFilters.find(f => f.id === filter.id)
    if (existing) {
      setActiveFilters(activeFilters.filter(f => f.id !== filter.id))
    } else {
      setActiveFilters([...activeFilters, {
        id: filter.id,
        label: filter.label,
        value: true,
        type: filter.type as SearchFilter['type']
      }])
    }
  }

  const handleSearch = () => {
    if (!query.trim() && activeFilters.length === 0) return
    
    setIsSearching(true)
    const allFilters = [...activeFilters]
    
    if (location) {
      allFilters.push({
        id: 'location',
        label: `Location: ${location}`,
        value: location,
        type: 'location'
      })
    }
    
    if (selectedIndustries.length > 0) {
      selectedIndustries.forEach(ind => {
        allFilters.push({
          id: `industry-${ind}`,
          label: ind,
          value: ind,
          type: 'industry'
        })
      })
    }
    
    if (selectedSize) {
      allFilters.push({
        id: 'size',
        label: selectedSize,
        value: selectedSize,
        type: 'size'
      })
    }
    
    if (selectedRevenue) {
      allFilters.push({
        id: 'revenue',
        label: selectedRevenue,
        value: selectedRevenue,
        type: 'revenue'
      })
    }
    
    onSearch(query, allFilters)
    setTimeout(() => setIsSearching(false), 1000)
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    setSelectedIndustries([])
    setSelectedSize('')
    setSelectedRevenue('')
    setLocation('')
  }

  const totalActiveFilters = activeFilters.length + 
    (location ? 1 : 0) + 
    selectedIndustries.length + 
    (selectedSize ? 1 : 0) + 
    (selectedRevenue ? 1 : 0)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Describe your ideal customer (e.g., 'Dental clinics in Texas without online booking')"
            className={cn(
              'w-full pl-12 pr-32 py-4 text-base',
              'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
              'border-2 border-gray-200/50 dark:border-gray-700/50',
              'rounded-2xl transition-all duration-200',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:border-primary-500 dark:focus:border-primary-400',
              'focus:bg-white dark:focus:bg-gray-900',
              'focus:shadow-lg focus:shadow-primary-500/10',
              'focus:outline-none'
            )}
          />
          <div className="absolute right-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                'gap-2 text-gray-600 dark:text-gray-400',
                showAdvanced && 'text-primary-600 dark:text-primary-400'
              )}
            >
              <Filter className="w-4 h-4" />
              {totalActiveFilters > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                  {totalActiveFilters}
                </span>
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
              disabled={!query.trim() && activeFilters.length === 0}
              className="gap-2 px-4"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 dark:text-gray-400">Quick filters:</span>
        {quickFilters.map((filter) => {
          const isActive = activeFilters.some(f => f.id === filter.id)
          const Icon = filter.icon
          return (
            <button
              key={filter.id}
              onClick={() => handleQuickFilter(filter)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                'transition-all duration-200 border',
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="glass-card p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
            {totalActiveFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State, or ZIP"
                className="w-full px-3 py-2 text-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Industry
              </label>
              <select
                multiple
                value={selectedIndustries}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  setSelectedIndustries(values)
                }}
                className="w-full px-3 py-2 text-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {industryOptions.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Company Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="">Any size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Revenue */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Annual Revenue
              </label>
              <select
                value={selectedRevenue}
                onChange={(e) => setSelectedRevenue(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="">Any revenue</option>
                {revenueRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Templates */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Popular Search Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setQuery('Dental practices without online booking systems')
                  setLocation('Texas')
                  setSelectedIndustries(['Healthcare'])
                }}
                className="text-left p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">Healthcare Digital Transformation</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dental practices in Texas lacking online booking</p>
              </button>
              <button
                onClick={() => {
                  setQuery('Restaurants without delivery apps or online ordering')
                  setSelectedIndustries(['Hospitality'])
                  setSelectedSize('11-50 employees')
                }}
                className="text-left p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">Restaurant Digitalization</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mid-size restaurants without online ordering</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}