import { memo } from 'react'
import { format, isPast, parseISO } from 'date-fns'

import type { Status, Task } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

export interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
  onStatusChange: (taskId: string, status: Status) => void
}

const priorityBorderClasses = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
} as const

function TaskCardComponent({
  task,
  onSelect,
  onStatusChange,
}: TaskCardProps) {
  const dueDate = parseISO(task.dueDate)
  const isOverdue = task.status !== 'completed' && isPast(dueDate)

  const handleSelect = (): void => {
    onSelect(task)
  }

  return (
    <article
      className={cn(
        'relative rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        isOverdue ? 'border-l-amber-500' : priorityBorderClasses[task.priority],
      )}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-pointer rounded-xl focus:outline-none"
        onClick={handleSelect}
        aria-label={`View task: ${task.title}`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-none relative z-10">
          <TaskPriorityBadge priority={task.priority} size="sm" />
        </div>
        <div className="relative z-10">
          <TaskStatusBadge
            status={task.status}
            interactive
            onChange={(status) => onStatusChange(task.id, status)}
          />
        </div>
      </div>

      <h3
        className="pointer-events-none relative z-10 mt-3 line-clamp-2 text-base font-semibold leading-6 text-slate-900"
        title={task.title}
      >
        {task.title}
      </h3>
      <p className="pointer-events-none relative z-10 mt-1 truncate text-sm text-slate-500">
        {task.customer.name} · {task.customer.company}
      </p>

      <div className="pointer-events-none relative z-10 mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="min-w-0 text-sm text-slate-600">
          <time
            className={cn(isOverdue && 'font-semibold text-red-600')}
            dateTime={task.dueDate}
          >
            {format(dueDate, 'MMM d, yyyy')}
          </time>
          {isOverdue ? (
            <span className="mt-0.5 block text-xs font-semibold text-red-600">
              Overdue
            </span>
          ) : null}
        </div>
        <p className="truncate text-right text-sm font-medium text-slate-700">
          {task.assignee.name}
        </p>
      </div>
    </article>
  )
}

export const TaskCard = memo(TaskCardComponent)

export default TaskCard