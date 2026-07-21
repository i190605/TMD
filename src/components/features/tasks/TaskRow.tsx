import {
  memo,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { format, isPast, parseISO } from 'date-fns'

import type { Status, Task } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

export interface TaskRowProps {
  task: Task
  onSelect: (task: Task) => void
  onStatusChange: (taskId: string, status: Status) => void
}

const priorityBorderClasses = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
} as const

function TaskRowComponent({
  task,
  onSelect,
  onStatusChange,
}: TaskRowProps) {
  const dueDate = parseISO(task.dueDate)
  const isOverdue = task.status !== 'completed' && isPast(dueDate)

  const handleSelect = (): void => {
    onSelect(task)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>): void => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect()
    }
  }

  const stopPropagation = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation()
  }

  return (
    <tr
      className={cn(
        'cursor-pointer border-l-4 border-b border-slate-100 bg-white transition-colors hover:bg-slate-50 focus-visible:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
        isOverdue ? 'border-l-amber-500' : priorityBorderClasses[task.priority],
      )}
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={`View task: ${task.title}`}
    >
      <td className="whitespace-nowrap px-4 py-4">
        <TaskPriorityBadge priority={task.priority} size="sm" />
      </td>
      <th className="min-w-0 max-w-0 px-4 py-4 text-left font-normal" scope="row">
        <p
          className="truncate font-semibold text-slate-900"
          title={task.title}
        >
          {task.title}
        </p>
        <p className="mt-1 truncate text-sm text-slate-500">
          {task.customer.name}
        </p>
      </th>
      <td className="whitespace-nowrap px-4 py-4" onClick={stopPropagation}>
        <TaskStatusBadge
          status={task.status}
          interactive
          onChange={(status) => onStatusChange(task.id, status)}
        />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
        <time dateTime={task.dueDate}>{format(dueDate, 'MMM d, yyyy')}</time>
        {isOverdue ? (
          <span className="mt-1 block text-xs font-semibold text-red-600">
            Overdue
          </span>
        ) : null}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-700">
        {task.assignee.name}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right" onClick={stopPropagation}>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={handleSelect}
          aria-label={`View ${task.title}`}
        >
          View
        </button>
      </td>
    </tr>
  )
}

export const TaskRow = memo(TaskRowComponent)

export default TaskRow