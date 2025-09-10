'use client'

import { cn } from '@/lib/utils'
import { ReactNode, useEffect, useState } from 'react'

interface AnimatedGradientProps {
  children?: ReactNode
  className?: string
  variant?: 'primary' | 'aurora' | 'sunset' | 'ocean' | 'mesh'
  animate?: boolean
  opacity?: number
}

export function AnimatedGradient({
  children,
  className,
  variant = 'primary',
  animate = true,
  opacity = 0.3,
}: AnimatedGradientProps) {
  const [gradientPosition, setGradientPosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    if (!animate) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setGradientPosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [animate])

  const gradients = {
    primary: 'from-primary-400 via-accent-purple to-accent-pink',
    aurora: 'from-purple-400 via-pink-300 to-cyan-400',
    sunset: 'from-orange-400 via-pink-400 to-purple-500',
    ocean: 'from-blue-400 via-cyan-400 to-teal-400',
    mesh: 'from-primary-300 via-transparent to-accent-purple',
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-all duration-1000',
          gradients[variant],
          animate && 'animate-gradient'
        )}
        style={{
          opacity,
          background: animate
            ? `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, var(--tw-gradient-from), var(--tw-gradient-to))`
            : undefined,
        }}
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}