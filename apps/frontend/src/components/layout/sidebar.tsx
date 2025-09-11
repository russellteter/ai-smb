'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Search,
  Users,
  History,
  BookmarkCheck,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Table,
  Kanban,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/',
      active: pathname === '/'
    },
    {
      icon: Table,
      label: 'Table View',
      href: '/table',
      active: pathname === '/table'
    },
    {
      icon: Kanban,
      label: 'Board View',
      href: '/board',
      active: pathname === '/board'
    },
  ]

  const searchItems = [
    {
      icon: History,
      label: 'Recent Searches',
      href: '/searches/recent',
      active: pathname === '/searches/recent'
    },
    {
      icon: BookmarkCheck,
      label: 'Saved Searches',
      href: '/searches/saved',
      active: pathname === '/searches/saved'
    },
  ]

  const bottomItems = [
    { icon: Activity, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
  ]

  return (
    <aside className={cn("w-64 h-screen bg-crm-panel border-r border-crm-border flex flex-col", className)}>
      {/* Logo */}
      <div className="p-4 border-b border-crm-border">
        <h1 className="text-lg font-semibold text-white">Mothership Leads</h1>
        <p className="text-xs text-gray-500">SMB Lead Finder</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Primary Nav */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                item.active
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Search Section */}
        <div className="pt-4 mt-4 border-t border-crm-border">
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800/50 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isSearchExpanded && "rotate-180"
            )} />
          </button>
          
          {isSearchExpanded && (
            <div className="mt-1 ml-4 space-y-1">
              {searchItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    item.active
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Items */}
        <div className="pt-4 mt-4 border-t border-crm-border space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-crm-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-300">RT</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">russell.teter@gmail.com</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
        <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-md transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}