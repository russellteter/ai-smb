'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Home,
  Search,
  BarChart3,
  User,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Filter,
  Download
} from 'lucide-react'
import { Lead } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Enhanced Mobile Navigation with larger touch targets
export function EnhancedMobileNav({ 
  currentPage,
  onPageChange 
}: { 
  currentPage: string
  onPageChange?: (page: string) => void 
}) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'search', icon: Search, label: 'Search', href: '/search' },
    { id: 'leads', icon: BarChart3, label: 'Leads', href: '/leads' },
    { id: 'profile', icon: User, label: 'Profile', href: '/profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* iOS-style safe area padding */}
      <div className="glass border-t border-white/20 pb-safe">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onPageChange?.(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-2 rounded-xl',
                  'transition-all duration-200',
                  'min-h-[60px] touch-manipulation', // Minimum touch target size
                  isActive
                    ? 'bg-primary-100/20 dark:bg-primary-900/20'
                    : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50',
                  'active:scale-95'
                )}
              >
                <Icon className={cn(
                  'w-6 h-6 mb-1',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// Enhanced Mobile Lead Card with swipe gestures
export function EnhancedMobileLeadCard({ 
  lead,
  onContact,
  onDismiss,
  onSave
}: { 
  lead: Lead
  onContact?: () => void
  onDismiss?: () => void
  onSave?: () => void
}) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    const distance = touchStart - e.targetTouches[0].clientX
    
    if (Math.abs(distance) > 50) {
      setSwipeDirection(distance > 0 ? 'left' : 'right')
    } else {
      setSwipeDirection(null)
    }
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 100
    const isRightSwipe = distance < -100

    if (isLeftSwipe) {
      onDismiss?.()
    } else if (isRightSwipe) {
      onSave?.()
    }
    
    setSwipeDirection(null)
    setTouchStart(0)
    setTouchEnd(0)
  }

  const scoreColor = lead.score >= 80 
    ? 'bg-green-100 text-green-700' 
    : lead.score >= 60 
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-gray-100 text-gray-700'

  return (
    <div className="relative overflow-hidden">
      {/* Swipe indicators */}
      {swipeDirection === 'left' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-500/20 z-0" />
      )}
      {swipeDirection === 'right' && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent z-0" />
      )}
      
      <div
        className={cn(
          'glass-card p-5 relative z-10',
          'transition-transform duration-200',
          swipeDirection === 'left' && '-translate-x-2',
          swipeDirection === 'right' && 'translate-x-2'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              {lead.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {lead.location}
            </p>
          </div>
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-bold',
            scoreColor
          )}>
            {lead.score}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Industry:</span>
            <span>{lead.industry}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Size:</span>
            <span>{lead.size}</span>
          </div>
          {lead.revenue && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Revenue:</span>
              <span>{lead.revenue}</span>
            </div>
          )}
        </div>

        {/* Signals */}
        {lead.signals && lead.signals.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {lead.signals.slice(0, 3).map((signal, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-primary-100/50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs"
              >
                {signal}
              </span>
            ))}
          </div>
        )}

        {/* Actions - Large touch targets */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onContact}
            variant="primary"
            className="min-h-[44px] text-sm font-medium"
          >
            Contact
          </Button>
          <Button
            onClick={onSave}
            variant="outline"
            className="min-h-[44px] text-sm font-medium"
          >
            Save
          </Button>
        </div>

        {/* Swipe hint */}
        <p className="text-xs text-gray-400 text-center mt-3">
          Swipe right to save, left to dismiss
        </p>
      </div>
    </div>
  )
}

// Mobile FAB (Floating Action Button)
export function MobileFAB({ 
  onClick,
  icon: Icon = Plus
}: { 
  onClick: () => void
  icon?: any 
}) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={cn(
        'fixed bottom-20 right-4 z-40',
        'w-14 h-14 rounded-full',
        'bg-gradient-primary shadow-lg shadow-primary-500/30',
        'flex items-center justify-center',
        'transition-all duration-200',
        'touch-manipulation',
        isPressed ? 'scale-90' : 'hover:scale-110',
        'active:scale-90'
      )}
    >
      <Icon className="w-6 h-6 text-white" />
      {!isPressed && (
        <div className="absolute inset-0 rounded-full bg-gradient-primary animate-ping opacity-20" />
      )}
    </button>
  )
}

// Mobile Filter Sheet
export function MobileFilterSheet({
  isOpen,
  onClose,
  onApply
}: {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: any) => void
}) {
  const [filters, setFilters] = useState({
    scoreMin: 0,
    scoreMax: 100,
    industries: [],
    sizes: []
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 glass rounded-t-3xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-5 pb-safe max-h-[60vh] overflow-y-auto">
          {/* Score Range */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Score Range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={filters.scoreMin}
                onChange={(e) => setFilters(prev => ({ ...prev, scoreMin: parseInt(e.target.value) }))}
                className="input-glass flex-1 min-h-[44px]"
                min="0"
                max="100"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={filters.scoreMax}
                onChange={(e) => setFilters(prev => ({ ...prev, scoreMax: parseInt(e.target.value) }))}
                className="input-glass flex-1 min-h-[44px]"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Quick Filters
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-3 rounded-xl bg-primary-100/50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium">
                High Score (80+)
              </button>
              <button className="px-4 py-3 rounded-xl bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium">
                New Leads
              </button>
              <button className="px-4 py-3 rounded-xl bg-purple-100/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium">
                AI Ready
              </button>
              <button className="px-4 py-3 rounded-xl bg-yellow-100/50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                High Growth
              </button>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-5 border-t border-gray-200/20">
          <Button
            onClick={() => {
              setFilters({ scoreMin: 0, scoreMax: 100, industries: [], sizes: [] })
            }}
            variant="outline"
            className="flex-1 min-h-[48px]"
          >
            Clear All
          </Button>
          <Button
            onClick={() => {
              onApply(filters)
              onClose()
            }}
            variant="primary"
            className="flex-1 min-h-[48px]"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}