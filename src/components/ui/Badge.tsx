import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../utils/cn'

export type BadgeVariant =
  | 'high'
  | 'medium'
  | 'low'
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'overdue'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  high: 'bg-red-50 text-red-700 ring-red-600/20',
  medium: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  low: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  open: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  completed: 'bg-green-50 text-green-700 ring-green-600/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
}

const dotClasses: Record<BadgeVariant, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  open: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  overdue: 'bg-red-500',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-1 text-sm',
}

export function Badge({
  variant,
  size = 'md',
  dot = false,
  children,
  className,
  ...spanProps
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium ring-1 ring-inset',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...spanProps}
    >
      {dot ? (
        <span
          className={cn('size-1.5 shrink-0 rounded-full', dotClasses[variant])}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  )
}

export default Badge