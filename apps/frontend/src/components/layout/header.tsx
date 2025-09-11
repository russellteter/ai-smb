'use client'

import { cn } from '@/lib/utils'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown,
  LogOut,
  HelpCircle,
  CreditCard,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">Mothership</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Lead Finder</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink href="/dashboard" active>Dashboard</NavLink>
              <NavLink href="/searches">Searches</NavLink>
              <NavLink href="/leads">Leads</NavLink>
              <NavLink href="/analytics">Analytics</NavLink>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-white/10"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-white/10"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full animate-pulse" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle className="hidden sm:block" />
            
            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex hover:bg-white/10"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-white/10"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 hidden sm:block" />
              </Button>

              {/* Profile Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 glass rounded-xl border border-white/20 shadow-float animate-slide-down z-50">
                    <div className="p-4 border-b border-gray-200/20">
                      <p className="text-sm font-semibold">John Doe</p>
                      <p className="text-xs text-gray-500">john@company.com</p>
                    </div>
                    <div className="p-2">
                      <ProfileMenuItem icon={User} label="Profile" />
                      <ProfileMenuItem icon={CreditCard} label="Billing" />
                      <ProfileMenuItem icon={BarChart3} label="Usage" />
                      <ProfileMenuItem icon={Settings} label="Settings" />
                      <ProfileMenuItem icon={HelpCircle} label="Help & Support" />
                      <div className="my-2 divider-horizontal" />
                      <ProfileMenuItem icon={LogOut} label="Sign Out" variant="danger" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-200/20 animate-slide-down">
            <div className="flex flex-col gap-1">
              <MobileNavLink href="/dashboard" active>Dashboard</MobileNavLink>
              <MobileNavLink href="/searches">Searches</MobileNavLink>
              <MobileNavLink href="/leads">Leads</MobileNavLink>
              <MobileNavLink href="/analytics">Analytics</MobileNavLink>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

function NavLink({ 
  href, 
  children, 
  active = false 
}: { 
  href: string
  children: React.ReactNode
  active?: boolean 
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        active
          ? 'bg-white/10 text-gray-900'
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/5'
      )}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ 
  href, 
  children, 
  active = false 
}: { 
  href: string
  children: React.ReactNode
  active?: boolean 
}) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
        active
          ? 'bg-white/10 text-gray-900'
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/5'
      )}
    >
      {children}
    </Link>
  )
}

function ProfileMenuItem({ 
  icon: Icon, 
  label, 
  variant = 'default' 
}: { 
  icon: any
  label: string
  variant?: 'default' | 'danger' 
}) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
        variant === 'danger'
          ? 'text-error-600 hover:bg-error-50 hover:text-error-700'
          : 'text-gray-700 hover:bg-gray-50'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}