'use client'

import { useEffect, useState, useRef } from 'react'
import { 
  Building2,
  MapPin,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Lead } from '@/types'

interface LiveFeedProps {
  leads: (Lead & { timestamp: Date })[]
  isStreaming: boolean
}

export function LiveFeed({ leads, isStreaming }: LiveFeedProps) {
  const [visibleLeads, setVisibleLeads] = useState<(Lead & { timestamp: Date })[]>([])
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (leads.length > visibleLeads.length) {
      const newLeads = leads.slice(visibleLeads.length)
      newLeads.forEach((lead, index) => {
        setTimeout(() => {
          setVisibleLeads(prev => [...prev, lead])
          if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight
          }
        }, index * 200)
      })
    }
  }, [leads])

  return (
    <div className="space-y-4">
      {/* Live Indicator */}
      {isStreaming && (
        <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl animate-pulse">
          <div className="relative">
            <div className="w-3 h-3 bg-error-500 rounded-full" />
            <div className="absolute inset-0 w-3 h-3 bg-error-500 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-medium">LIVE</span>
          <span className="text-sm text-gray-500">New leads incoming...</span>
        </div>
      )}

      {/* Feed Container */}
      <div 
        ref={feedRef}
        className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar"
      >
        {visibleLeads.map((lead, index) => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            isNew={index >= visibleLeads.length - 3}
          />
        ))}
      </div>

      {/* Empty State */}
      {visibleLeads.length === 0 && !isStreaming && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No leads yet. Start a search to see results!</p>
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, isNew }: { lead: Lead & { timestamp: Date }; isNew: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const scoreColor = lead.score >= 80 
    ? 'text-success-600 bg-success-100' 
    : lead.score >= 60 
    ? 'text-warning-600 bg-warning-100'
    : 'text-gray-600 bg-gray-100'

  return (
    <div
      className={cn(
        'glass rounded-xl p-4 transition-all duration-300 hover:shadow-float cursor-pointer',
        isNew && 'animate-slide-up',
        expanded && 'ring-2 ring-primary-500/20'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-purple/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {lead.name}
                {lead.website && (
                  <a 
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lead.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {lead.size}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {lead.industry}
                </span>
              </div>
            </div>
          </div>

          {/* Signals */}
          <div className="flex flex-wrap gap-2 mt-3">
            {lead.signals.slice(0, expanded ? undefined : 3).map((signal, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/50 border border-gray-200/50 text-xs"
              >
                <TrendingUp className="w-3 h-3 text-success-600" />
                {signal}
              </span>
            ))}
            {!expanded && lead.signals.length > 3 && (
              <span className="text-xs text-gray-500 py-1">
                +{lead.signals.length - 3} more
              </span>
            )}
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200/20 space-y-3 animate-slide-down">
              {/* Contact Info */}
              <div className="flex gap-4">
                {lead.phone && (
                  <a 
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-4 h-4" />
                    {lead.phone}
                  </a>
                )}
                {lead.email && (
                  <a 
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="w-4 h-4" />
                    {lead.email}
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="button-primary text-xs px-3 py-1.5">
                  Add to CRM
                </button>
                <button className="button-secondary text-xs px-3 py-1.5">
                  View Details
                </button>
                <button className="button-ghost text-xs px-3 py-1.5">
                  Save for Later
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="ml-4">
          <div className={cn(
            'w-16 h-16 rounded-xl flex flex-col items-center justify-center',
            scoreColor
          )}>
            <span className="text-2xl font-bold">{lead.score}</span>
            <span className="text-xs">score</span>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      {isNew && (
        <div className="mt-2 text-xs text-gray-400 animate-fade-in">
          Just found • {new Date(lead.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}