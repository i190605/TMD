import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react'

import type { Priority } from '../../../types/task'
import { cn } from '../../../utils/cn'

export type TaskPriorityBadgeSize = 'sm' | 'md'

export interface TaskPriorityBadgeProps {
  priority: Priority
  showLabel?: boolean
  size?: TaskPriorityBadgeSize
}

interface PriorityDisplay {
  label: string
  icon: LucideIcon
  className: string
}

const priorityDisplay: Record<Priority, PriorityDisplay> = {
  high: {
    label: 'High',
    icon: ArrowUp,
    className: 'bg-red-50 text-red-700 ring-red-600/20',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    className: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  },
  low: {
    label: 'Low',
    icon: ArrowDown,
    className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
}

const sizeClasses: Record<TaskPriorityBadgeSize, string> = {
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-1 text-sm',
}

const iconSizeClasses: Record<TaskPriorityBadgeSize, string> = {
  sm: 'size-3',
  md: 'size-3.5',
}

export function TaskPriorityBadge({
  priority,
  showLabel = true,
  size = 'md',
}: TaskPriorityBadgeProps) {
  const display = priorityDisplay[priority]
  const Icon = display.icon

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset',
        display.className,
        sizeClasses[size],
      )}
      aria-label={showLabel ? undefined : `${display.label} priority`}
    >
      <Icon className={iconSizeClasses[size]} aria-hidden="true" />
      <span className={showLabel ? undefined : 'sr-only'}>{display.label}</span>
    </span>
  )
}

export default TaskPriorityBadge