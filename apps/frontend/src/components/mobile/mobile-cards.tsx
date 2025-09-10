'use client'

import { useState } from 'react'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  TrendingUp,
  Star,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Bookmark,
  Share,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Lead } from '@/types'

interface MobileLeadCardProps {
  lead: Lead
  onSelect?: (lead: Lead) => void
  onContact?: (lead: Lead) => void
  onSave?: (lead: Lead) => void
  onShare?: (lead: Lead) => void
  className?: string
}

export function MobileLeadCard({
  lead,
  onSelect,
  onContact,
  onSave,
  onShare,
  className
}: MobileLeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const scoreColor = lead.score >= 80 
    ? 'text-success-600 bg-success-100' 
    : lead.score >= 60 
    ? 'text-warning-600 bg-warning-100'
    : 'text-gray-600 bg-gray-100'

  const handleCardTap = () => {
    setIsExpanded(!isExpanded)
    onSelect?.(lead)
  }

  return (
    <div className={cn('glass rounded-xl overflow-hidden transition-all duration-200', className)}>
      {/* Main Card Content */}
      <div 
        className="p-4 cursor-pointer active:bg-gray-50/50 transition-colors"
        onClick={handleCardTap}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-purple/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{lead.name}</h3>
              <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{lead.location}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-sm text-gray-500">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span>{lead.size}</span>
                <span className="mx-1">•</span>
                <span className="truncate">{lead.industry}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn('px-2 py-1 rounded-lg text-xs font-semibold', scoreColor)}>
              {lead.score}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Signals Preview */}
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.signals.slice(0, 2).map((signal, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/50 border border-gray-200/50 text-xs"
            >
              <TrendingUp className="w-2.5 h-2.5 text-success-600" />
              {signal}
            </span>
          ))}
          {lead.signals.length > 2 && (
            <span className="text-xs text-gray-500 px-2 py-0.5">
              +{lead.signals.length - 2} more
            </span>
          )}
        </div>

        {/* Expand/Collapse Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {lead.phone && (
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                <Phone className="w-3 h-3 text-blue-600" />
              </div>
            )}
            {lead.email && (
              <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                <Mail className="w-3 h-3 text-green-600" />
              </div>
            )}
            {lead.website && (
              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                <Globe className="w-3 h-3 text-purple-600" />
              </div>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">Details</span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )} />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100/50 animate-slide-down">
          <div className="pt-4 space-y-4">
            {/* Contact Info */}
            {(lead.phone || lead.email || lead.website) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Contact</h4>
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
                {lead.website && (
                  <a 
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="truncate">{new URL(lead.website).hostname}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                )}
              </div>
            )}

            {/* All Signals */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Buying Signals</h4>
              <div className="space-y-1">
                {lead.signals.map((signal, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-3 h-3 text-success-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{signal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onContact?.(lead)
                }}
                className="flex-1 py-2 px-3 bg-gradient-primary text-white rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Contact
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSave?.(lead)
                }}
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShare?.(lead)
                }}
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Menu */}
      {showActions && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowActions(false)}
          />
          <div className="absolute top-16 right-4 z-50 glass rounded-lg shadow-lg border border-white/20 py-2 animate-scale-in">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onContact?.(lead)
                setShowActions(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/50 transition-colors flex items-center gap-2 text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Contact
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.(lead)
                setShowActions(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/50 transition-colors flex items-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSave?.(lead)
                setShowActions(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/50 transition-colors flex items-center gap-2 text-sm"
            >
              <Bookmark className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShare?.(lead)
                setShowActions(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-white/50 transition-colors flex items-center gap-2 text-sm"
            >
              <Share className="w-4 h-4" />
              Share
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Compact card for list views
export function CompactLeadCard({ lead, onSelect, className }: {
  lead: Lead
  onSelect?: (lead: Lead) => void
  className?: string
}) {
  const scoreColor = lead.score >= 80 
    ? 'text-success-600 bg-success-100' 
    : lead.score >= 60 
    ? 'text-warning-600 bg-warning-100'
    : 'text-gray-600 bg-gray-100'

  return (
    <div 
      className={cn(
        'glass rounded-lg p-3 cursor-pointer active:bg-gray-50/50 transition-colors',
        className
      )}
      onClick={() => onSelect?.(lead)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-accent-purple/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{lead.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="truncate">{lead.location}</span>
              <span className="mx-1">•</span>
              <span>{lead.size}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn('px-2 py-1 rounded text-xs font-semibold', scoreColor)}>
            {lead.score}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}

// Swipeable card for mobile gestures
export function SwipeableLeadCard({ 
  lead, 
  onSwipeLeft, 
  onSwipeRight, 
  className 
}: {
  lead: Lead
  onSwipeLeft?: (lead: Lead) => void
  onSwipeRight?: (lead: Lead) => void
  className?: string
}) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 100
    if (currentX > threshold) {
      onSwipeRight?.(lead)
    } else if (currentX < -threshold) {
      onSwipeLeft?.(lead)
    }
    
    setCurrentX(0)
    setIsDragging(false)
  }

  const transform = isDragging ? `translateX(${currentX}px) rotate(${currentX * 0.1}deg)` : 'translateX(0px)'

  return (
    <div className="relative">
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-success-100 rounded-xl flex items-center justify-start px-6">
          <MessageSquare className="w-6 h-6 text-success-600" />
        </div>
        <div className="flex-1 bg-error-100 rounded-xl flex items-center justify-end px-6">
          <Bookmark className="w-6 h-6 text-error-600" />
        </div>
      </div>
      
      {/* Card */}
      <div
        className={cn('relative z-10', className)}
        style={{ transform }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <MobileLeadCard lead={lead} />
      </div>
    </div>
  )
}