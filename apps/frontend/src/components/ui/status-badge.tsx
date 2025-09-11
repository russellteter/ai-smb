import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  type: 'no-chat' | 'no-book' | 'owner' | 'qualified' | 'new' | 'contacted' | 'rejected'
  className?: string
  children?: React.ReactNode
}

const badgeStyles = {
  'no-chat': 'bg-yellow-600 text-white',
  'no-book': 'bg-yellow-600 text-white', 
  'owner': 'bg-green-600 text-white',
  'qualified': 'bg-blue-600 text-white',
  'new': 'bg-green-600 text-white',
  'contacted': 'bg-gray-600 text-gray-200',
  'rejected': 'bg-red-600 text-white',
}

const badgeLabels = {
  'no-chat': 'No Chat',
  'no-book': 'No Book',
  'owner': 'Owner',
  'qualified': 'Qualified',
  'new': 'New',
  'contacted': 'Contacted',
  'rejected': 'Rejected',
}

export function StatusBadge({ type, className, children }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      badgeStyles[type],
      className
    )}>
      {children || badgeLabels[type]}
    </span>
  )
}