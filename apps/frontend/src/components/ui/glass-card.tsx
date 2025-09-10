import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'interactive' | 'highlight'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  gradient?: boolean
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  blur = 'lg',
  gradient = false,
  hover = true,
  onClick,
}: GlassCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  const variantClasses = {
    default: 'bg-white/70 border-white/20',
    elevated: 'bg-white/80 border-white/30 shadow-float',
    interactive: 'bg-white/60 border-white/25 cursor-pointer active:scale-[0.99]',
    highlight: 'bg-gradient-to-br from-primary-50/40 to-accent-purple/10 border-primary-200/30',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border p-6 transition-all duration-300',
        blurClasses[blur],
        variantClasses[variant],
        hover && 'hover:shadow-float hover:-translate-y-0.5',
        gradient && 'bg-gradient-to-br from-white/80 to-white/40',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {gradient && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-mesh opacity-20 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}