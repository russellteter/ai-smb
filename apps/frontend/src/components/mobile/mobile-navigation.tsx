'use client'

import { useState, useEffect } from 'react'
import {
  Home,
  Search,
  Users,
  BarChart3,
  Menu,
  X,
  Bell,
  User,
  Settings,
  Plus,
  Filter,
  SortDesc,
  Download,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface MobileNavigationProps {
  currentPage?: string
}

export function MobileNavigation({ currentPage = 'dashboard' }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close menu when page changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentPage])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'search', label: 'Search', icon: Search, href: '/search' },
    { id: 'leads', label: 'Leads', icon: Users, href: '/leads' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  ]

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg gradient-text">Mothership</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full animate-pulse" />
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pt-14"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="md:hidden fixed top-14 left-0 right-0 glass-surface z-50 animate-slide-down">
            <div className="p-4">
              {/* Profile Section */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">john@company.com</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 mb-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.id
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                        isActive
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-700 hover:bg-white/50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Settings */}
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white/50 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'text-primary-600 scale-105'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/10'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

// Mobile action bar for specific pages
interface MobileActionBarProps {
  actions: Array<{
    icon: React.ComponentType<any>
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
  }>
}

export function MobileActionBar({ actions }: MobileActionBarProps) {
  return (
    <div className="md:hidden fixed bottom-16 left-4 right-4 z-30 safe-bottom">
      <div className="glass rounded-xl p-3 flex gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon
          const variants = {
            primary: 'bg-gradient-primary text-white shadow-md',
            secondary: 'bg-white text-gray-700 border border-gray-200',
            ghost: 'text-gray-600 hover:bg-gray-100'
          }
          
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 justify-center text-sm font-medium',
                variants[action.variant || 'secondary']
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden xs:inline">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Mobile floating action button
interface MobileFloatingButtonProps {
  icon: React.ComponentType<any>
  onClick: () => void
  className?: string
}

export function MobileFloatingButton({ icon: Icon, onClick, className }: MobileFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'md:hidden fixed bottom-20 right-4 z-30',
        'w-14 h-14 rounded-full bg-gradient-primary shadow-lg',
        'flex items-center justify-center text-white',
        'transition-all hover:scale-110 active:scale-95 safe-bottom',
        className
      )}
    >
      <Icon className="w-6 h-6" />
    </button>
  )
}

// Mobile search bar
interface MobileSearchBarProps {
  value: string
  onChange: (value: string) => void
  onFilter?: () => void
  onSort?: () => void
  placeholder?: string
  showActions?: boolean
}

export function MobileSearchBar({ 
  value, 
  onChange, 
  onFilter, 
  onSort, 
  placeholder = "Search...",
  showActions = true 
}: MobileSearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      
      {showActions && (
        <>
          {onFilter && (
            <button
              onClick={onFilter}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white/50 hover:bg-white transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {onSort && (
            <button
              onClick={onSort}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white/50 hover:bg-white transition-colors"
            >
              <SortDesc className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

// Mobile pull-to-refresh
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  className?: string
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  className 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const distance = currentY - startY
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5))
      e.preventDefault()
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const refreshProgress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div className="flex justify-center py-4 transition-transform">
          <div 
            className={cn(
              'w-6 h-6 rounded-full border-2 border-primary-200',
              isRefreshing ? 'animate-spin border-t-primary-600' : '',
              refreshProgress >= 1 ? 'border-t-primary-600' : ''
            )}
            style={{
              transform: `rotate(${refreshProgress * 360}deg)`,
            }}
          />
        </div>
      )}
      
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}