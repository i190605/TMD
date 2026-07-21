import type { ChangeEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import type { Status } from '../../../types/task'
import { cn } from '../../../utils/cn'

export interface TaskStatusBadgeProps {
  status: Status
  interactive?: boolean
  onChange?: (status: Status) => void
}

interface StatusDisplay {
  label: string
  className: string
}

const statusDisplay: Record<Status, StatusDisplay> = {
  open: {
    label: 'Open',
    className: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700 ring-green-600/20',
  },
}

function StatusIndicator({ status }: { status: Status }) {
  if (status === 'completed') {
    return <Check className="size-3.5" aria-hidden="true" />
  }

  return (
    <span
      className={cn(
        'size-1.5 shrink-0 rounded-full',
        status === 'in_progress' ? 'animate-pulse bg-blue-500' : 'bg-gray-500',
      )}
      aria-hidden="true"
    />
  )
}

export function TaskStatusBadge({
  status,
  interactive = false,
  onChange,
}: TaskStatusBadgeProps) {
  const display = statusDisplay[status]

  if (interactive) {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
      onChange?.(event.target.value as Status)
    }

    return (
      <span className="relative inline-flex">
        <select
          className={cn(
            'h-7 appearance-none rounded-full py-1 pl-6 pr-7 text-xs font-semibold outline-none ring-1 ring-inset transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
            display.className,
          )}
          value={status}
          onChange={handleChange}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          disabled={!onChange}
          aria-label="Change task status"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
          <StatusIndicator status={status} />
        </span>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2"
          aria-hidden="true"
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        display.className,
      )}
    >
      <StatusIndicator status={status} />
      {display.label}
    </span>
  )
}

export default TaskStatusBadge