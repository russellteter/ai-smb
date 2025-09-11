'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group relative flex h-10 w-10 items-center justify-center rounded-xl',
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl',
          'border border-gray-200/50 dark:border-gray-700/50',
          'transition-all duration-200',
          'hover:bg-gray-100/80 dark:hover:bg-gray-700/80',
          'hover:shadow-lg hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
        )}
        aria-label="Toggle theme"
      >
        <div className="relative h-5 w-5">
          <Sun className={cn(
            'absolute inset-0 h-5 w-5 transition-all duration-300',
            resolvedTheme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          )} />
          <Moon className={cn(
            'absolute inset-0 h-5 w-5 transition-all duration-300',
            resolvedTheme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          )} />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400 to-purple-400 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={cn(
            'absolute right-0 z-50 mt-2 w-36',
            'rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl',
            'border border-gray-200/50 dark:border-gray-700/50',
            'shadow-xl shadow-gray-900/10 dark:shadow-black/20',
            'animate-in fade-in slide-in-from-top-1'
          )}>
            <div className="p-1">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2',
                    'text-sm font-medium transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    theme === value
                      ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function ThemeToggleCompact({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative h-7 w-14 rounded-full',
        'bg-gray-200 dark:bg-gray-700',
        'transition-colors duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className
      )}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          'absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg',
          'transition-transform duration-300',
          'flex items-center justify-center',
          resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        )}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-3 w-3 text-gray-700" />
        ) : (
          <Sun className="h-3 w-3 text-yellow-500" />
        )}
      </div>
    </button>
  )
}