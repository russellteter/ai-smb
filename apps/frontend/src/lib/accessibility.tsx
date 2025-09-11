import { useEffect, useRef, useState, useCallback } from 'react'

// Keyboard navigation hook
export function useKeyboardNavigation(items: any[], options: {
  onSelect?: (item: any, index: number) => void
  onEscape?: () => void
  orientation?: 'vertical' | 'horizontal'
  loop?: boolean
} = {}) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const { onSelect, onEscape, orientation = 'vertical', loop = true } = options

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!items.length) return

      const key = e.key
      const maxIndex = items.length - 1

      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          if ((orientation === 'vertical' && key === 'ArrowDown') ||
              (orientation === 'horizontal' && key === 'ArrowRight')) {
            e.preventDefault()
            setFocusedIndex(prev => {
              if (prev === maxIndex) return loop ? 0 : maxIndex
              return Math.min(prev + 1, maxIndex)
            })
          }
          break

        case 'ArrowUp':
        case 'ArrowLeft':
          if ((orientation === 'vertical' && key === 'ArrowUp') ||
              (orientation === 'horizontal' && key === 'ArrowLeft')) {
            e.preventDefault()
            setFocusedIndex(prev => {
              if (prev <= 0) return loop ? maxIndex : 0
              return prev - 1
            })
          }
          break

        case 'Enter':
        case ' ':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex <= maxIndex) {
            onSelect?.(items[focusedIndex], focusedIndex)
          }
          break

        case 'Escape':
          e.preventDefault()
          setFocusedIndex(-1)
          onEscape?.()
          break

        case 'Home':
          e.preventDefault()
          setFocusedIndex(0)
          break

        case 'End':
          e.preventDefault()
          setFocusedIndex(maxIndex)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, focusedIndex, onSelect, onEscape, orientation, loop])

  return {
    focusedIndex,
    setFocusedIndex,
    resetFocus: () => setFocusedIndex(-1)
  }
}

// Focus trap hook for modals and overlays
export function useFocusTrap(isActive = true) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    previousActiveElement.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first element
    firstFocusable?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus to previous element
      previousActiveElement.current?.focus()
    }
  }, [isActive])

  return containerRef
}

// Announce messages to screen readers
export function useAnnounce() {
  const [announcement, setAnnouncement] = useState('')

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear and set to trigger announcement
    setAnnouncement('')
    setTimeout(() => setAnnouncement(message), 100)
  }, [])

  return { announcement, announce }
}

// Skip to main content link helper
export function getSkipToMainProps() {
  return {
    href: '#main-content',
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    children: 'Skip to main content'
  }
}

// Visually hidden but accessible to screen readers
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Live region for dynamic content updates
export function LiveRegion({ 
  message,
  type = 'polite' 
}: { 
  message: string
  type?: 'polite' | 'assertive' 
}) {
  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Keyboard shortcut manager
export class KeyboardShortcuts {
  private shortcuts: Map<string, () => void> = new Map()
  private enabled = true

  register(key: string, callback: () => void, description?: string) {
    const normalizedKey = this.normalizeKey(key)
    this.shortcuts.set(normalizedKey, callback)
  }

  unregister(key: string) {
    const normalizedKey = this.normalizeKey(key)
    this.shortcuts.delete(normalizedKey)
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase().replace(/\s+/g, '')
  }

  handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return

    const key = this.getKeyCombo(event)
    const handler = this.shortcuts.get(key)
    
    if (handler) {
      event.preventDefault()
      handler()
    }
  }

  private getKeyCombo(event: KeyboardEvent): string {
    const parts = []
    
    if (event.metaKey || event.ctrlKey) parts.push('cmd')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    
    const key = event.key.toLowerCase()
    if (key !== 'control' && key !== 'meta' && key !== 'alt' && key !== 'shift') {
      parts.push(key)
    }
    
    return parts.join('+')
  }

  getShortcuts() {
    return Array.from(this.shortcuts.entries())
  }
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const manager = new KeyboardShortcuts()
    
    Object.entries(shortcuts).forEach(([key, callback]) => {
      manager.register(key, callback)
    })
    
    const handleKeyDown = (e: KeyboardEvent) => manager.handleKeyDown(e)
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}

// ARIA labels and descriptions helper
export function getAriaProps(props: {
  label?: string
  description?: string
  labelledBy?: string
  describedBy?: string
  required?: boolean
  invalid?: boolean
  expanded?: boolean
  selected?: boolean
  pressed?: boolean
  hidden?: boolean
}) {
  const ariaProps: Record<string, any> = {}
  
  if (props.label) ariaProps['aria-label'] = props.label
  if (props.description) ariaProps['aria-description'] = props.description
  if (props.labelledBy) ariaProps['aria-labelledby'] = props.labelledBy
  if (props.describedBy) ariaProps['aria-describedby'] = props.describedBy
  if (props.required !== undefined) ariaProps['aria-required'] = props.required
  if (props.invalid !== undefined) ariaProps['aria-invalid'] = props.invalid
  if (props.expanded !== undefined) ariaProps['aria-expanded'] = props.expanded
  if (props.selected !== undefined) ariaProps['aria-selected'] = props.selected
  if (props.pressed !== undefined) ariaProps['aria-pressed'] = props.pressed
  if (props.hidden !== undefined) ariaProps['aria-hidden'] = props.hidden
  
  return ariaProps
}

// Focus visible only for keyboard users
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = () => setIsFocusVisible(true)
    const handleMouseDown = () => setIsFocusVisible(false)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
  
  return isFocusVisible
}