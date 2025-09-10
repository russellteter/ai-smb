'use client'

import { useState, useMemo } from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Mail,
  Phone,
  Globe,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Star,
  MoreVertical,
  CheckSquare,
  Square,
  Search,
  SlidersHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Lead } from '@/types'

interface LeadTableProps {
  leads: Lead[]
  onExport?: (leads: Lead[]) => void
  onContact?: (leads: Lead[]) => void
}

type SortField = 'name' | 'score' | 'size' | 'lastUpdated'
type SortDirection = 'asc' | 'desc'

export function LeadTable({ leads, onExport, onContact }: LeadTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterText, setFilterText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<[number, number]>([0, 100])
  const [showFilters, setShowFilters] = useState(false)

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)))
    }
  }

  const handleSelectLead = (leadId: string) => {
    const newSelection = new Set(selectedLeads)
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId)
    } else {
      newSelection.add(leadId)
    }
    setSelectedLeads(newSelection)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesText = filterText === '' || 
        lead.name.toLowerCase().includes(filterText.toLowerCase()) ||
        lead.industry.toLowerCase().includes(filterText.toLowerCase()) ||
        lead.location.toLowerCase().includes(filterText.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
      
      const matchesScore = lead.score >= scoreFilter[0] && lead.score <= scoreFilter[1]
      
      return matchesText && matchesStatus && matchesScore
    })
  }, [leads, filterText, statusFilter, scoreFilter])

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'size') {
        aValue = parseInt(a.size.split('-')[0])
        bValue = parseInt(b.size.split('-')[0])
      }
      
      if (sortField === 'lastUpdated') {
        aValue = a.lastUpdated.getTime()
        bValue = b.lastUpdated.getTime()
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    return sorted
  }, [filteredLeads, sortField, sortDirection])

  const selectedLeadsData = leads.filter(l => selectedLeads.has(l.id))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search leads..."
              className="input-glass pl-10 w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="hover:bg-white/10"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {(statusFilter !== 'all' || scoreFilter[0] > 0 || scoreFilter[1] < 100) && (
                <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </Button>

            {selectedLeads.size > 0 && (
              <>
                <Button
                  onClick={() => onContact?.(selectedLeadsData)}
                  className="button-primary"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact ({selectedLeads.size})
                </Button>
                <Button
                  onClick={() => onExport?.(selectedLeadsData)}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200/20 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
            {/* Status Filter */}
            <div>
              <label className="label-base">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-glass w-full"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Score Filter */}
            <div>
              <label className="label-base">Score Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={scoreFilter[0]}
                  onChange={(e) => setScoreFilter([parseInt(e.target.value), scoreFilter[1]])}
                  className="input-glass w-20"
                  min="0"
                  max="100"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={scoreFilter[1]}
                  onChange={(e) => setScoreFilter([scoreFilter[0], parseInt(e.target.value)])}
                  className="input-glass w-20"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="label-base">Quick Filters</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setScoreFilter([80, 100])}
                  className="badge-primary"
                >
                  High Score
                </button>
                <button
                  onClick={() => setStatusFilter('new')}
                  className="badge-success"
                >
                  New Leads
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setScoreFilter([0, 100])
                    setFilterText('')
                  }}
                  className="badge-gray"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200/20">
              <tr>
                <th className="p-4 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Company
                    <SortIcon field="name" currentField={sortField} direction={sortDirection} />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <span className="text-sm font-semibold text-gray-700">Location</span>
                </th>
                <th className="p-4 text-left">
                  <span className="text-sm font-semibold text-gray-700">Industry</span>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('size')}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Size
                    <SortIcon field="size" currentField={sortField} direction={sortDirection} />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <span className="text-sm font-semibold text-gray-700">Signals</span>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('score')}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Score
                    <SortIcon field="score" currentField={sortField} direction={sortDirection} />
                  </button>
                </th>
                <th className="p-4 text-left">
                  <span className="text-sm font-semibold text-gray-700">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeads.has(lead.id)}
                  onSelect={() => handleSelectLead(lead.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedLeads.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No leads match your filters</p>
            <button
              onClick={() => {
                setFilterText('')
                setStatusFilter('all')
                setScoreFilter([0, 100])
              }}
              className="text-primary-600 hover:text-primary-700 text-sm mt-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </GlassCard>

      {/* Pagination */}
      {sortedLeads.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {sortedLeads.length} of {leads.length} leads
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function LeadRow({ 
  lead, 
  isSelected, 
  onSelect 
}: { 
  lead: Lead
  isSelected: boolean
  onSelect: () => void 
}) {
  const scoreColor = lead.score >= 80 
    ? 'text-success-600 bg-success-100' 
    : lead.score >= 60 
    ? 'text-warning-600 bg-warning-100'
    : 'text-gray-600 bg-gray-100'

  const statusColors = {
    new: 'badge-success',
    contacted: 'badge-primary',
    qualified: 'badge-warning',
    rejected: 'badge-gray',
  }

  return (
    <tr className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors">
      <td className="p-4">
        <button
          onClick={onSelect}
          className="hover:bg-gray-100 rounded p-1 transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-primary-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-accent-purple/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{lead.name}</p>
            {lead.website && (
              <a 
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                {new URL(lead.website).hostname}
              </a>
            )}
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-3 h-3" />
          {lead.location}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-600">{lead.industry}</span>
      </td>
      <td className="p-4">
        <span className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-3 h-3" />
          {lead.size}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          {lead.signals.slice(0, 2).map((signal, i) => (
            <span key={i} className="badge-gray text-xs">
              {signal}
            </span>
          ))}
          {lead.signals.length > 2 && (
            <span className="text-xs text-gray-500">+{lead.signals.length - 2}</span>
          )}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded-lg text-sm font-semibold', scoreColor)}>
            {lead.score}
          </span>
          <span className={cn('text-xs', statusColors[lead.status])}>
            {lead.status}
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1">
          {lead.phone && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="w-4 h-4" />
            </Button>
          )}
          {lead.email && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Mail className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function SortIcon({ 
  field, 
  currentField, 
  direction 
}: { 
  field: string
  currentField: string
  direction: SortDirection 
}) {
  if (field !== currentField) {
    return <ArrowUpDown className="w-3 h-3 text-gray-400" />
  }
  
  return direction === 'asc' 
    ? <ArrowUp className="w-3 h-3 text-primary-600" />
    : <ArrowDown className="w-3 h-3 text-primary-600" />
}