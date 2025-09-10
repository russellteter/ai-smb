import * as React from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'destructive' | 'default'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon'

const buttonVariants = {
  variant: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-blue-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-blue-500',
    ghost: 'hover:bg-gray-100 focus-visible:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-blue-500',
  },
  size: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-6 text-lg',
    xl: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10 p-2',
  }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'button-base',
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }