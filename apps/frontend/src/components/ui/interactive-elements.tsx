'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, Star, Heart, Bookmark } from 'lucide-react'

// Magnetic button with cursor following effect
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  strength?: number
  className?: string
}

export function MagneticButton({ children, strength = 30, className, ...props }: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)
    
    setPosition({
      x: deltaX * strength,
      y: deltaY * strength,
    })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative transition-all duration-300 ease-out',
        'hover:scale-105 active:scale-95',
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

// Floating action button with expandable menu
interface FloatingActionButtonProps {
  children: React.ReactNode
  actions?: Array<{
    icon: React.ComponentType<any>
    label: string
    onClick: () => void
    color?: string
  }>
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function FloatingActionButton({ 
  children, 
  actions = [], 
  position = 'bottom-right' 
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  return (
    <div className={cn('fixed z-50', positionClasses[position])}>
      {/* Action Items */}
      {isExpanded && actions.map((action, index) => {
        const Icon = action.icon
        return (
          <div
            key={index}
            className="mb-3 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              onClick={() => {
                action.onClick()
                setIsExpanded(false)
              }}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
            >
              <Icon className={cn('w-5 h-5', action.color || 'text-gray-700')} />
              <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {action.label}
              </span>
            </button>
          </div>
        )
      })}

      {/* Main Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-14 h-14 rounded-full bg-primary-600 shadow-lg hover:shadow-xl',
          'flex items-center justify-center text-white',
          'transition-all duration-300 hover:scale-110 active:scale-95',
          isExpanded && 'rotate-45'
        )}
      >
        {children}
      </button>
    </div>
  )
}

// Interactive rating component
interface InteractiveRatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ComponentType<any>
  readonly?: boolean
  className?: string
}

export function InteractiveRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  icon: Icon = Star,
  readonly = false,
  className,
}: InteractiveRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: max }, (_, index) => {
        const rating = index + 1
        const isFilled = rating <= (hoveredValue ?? value)
        
        return (
          <button
            key={index}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => !readonly && setHoveredValue(rating)}
            onMouseLeave={() => setHoveredValue(null)}
            disabled={readonly}
            className={cn(
              'transition-all duration-150',
              !readonly && 'hover:scale-110 active:scale-95',
              readonly && 'cursor-default'
            )}
          >
            <Icon
              className={cn(
                sizeClasses[size],
                'transition-colors duration-150',
                isFilled 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// Expandable card with smooth animation
interface ExpandableCardProps {
  children: React.ReactNode
  title: string
  preview?: React.ReactNode
  className?: string
  defaultExpanded?: boolean
}

export function ExpandableCard({ 
  children, 
  title, 
  preview, 
  className,
  defaultExpanded = false 
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {preview && !isExpanded && (
            <div className="mt-1 text-sm text-gray-500">{preview}</div>
          )}
        </div>
        <ChevronRight 
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-200',
            isExpanded && 'rotate-90'
          )} 
        />
      </button>
      
      <div
        className={cn(
          'transition-all duration-300 ease-out overflow-hidden',
          isExpanded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: isExpanded ? 'auto' : 0,
        }}
      >
        <div ref={contentRef} className="p-4 pt-0 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  )
}

// Ripple effect button
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  rippleColor?: string
}

export function RippleButton({ children, className, rippleColor = 'rgba(255, 255, 255, 0.6)', ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    
    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
    
    props.onClick?.(e)
  }

  return (
    <button
      {...props}
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '100px',
            height: '100px',
            backgroundColor: rippleColor,
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  )
}

// Parallax scroll component
interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const [offset, setOffset] = useState(0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const scrolled = window.pageYOffset
        const rate = scrolled * speed
        setOffset(rate)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div ref={elementRef} className={cn('relative', className)}>
      <div
        style={{
          transform: `translateY(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}