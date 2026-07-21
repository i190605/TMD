import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

import type { Status, Task } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { EmptyState } from './EmptyState'
import { TaskRow } from './TaskRow'

export type TaskSortOrder = 'asc' | 'desc'

export interface TaskTableProps {
  tasks: Task[]
  loading: boolean
  onSelectTask: (task: Task) => void
  onStatusChange: (taskId: string, status: Status) => void
  emptyState: ReactNode
}

interface ColumnDefinition {
  label: string
  sortKey: keyof Task | null
  className?: string
}

const columns: ColumnDefinition[] = [
  { label: 'Priority', sortKey: 'priority' },
  { label: 'Task', sortKey: 'title', className: 'w-full' },
  { label: 'Status', sortKey: 'status' },
  { label: 'Due Date', sortKey: 'dueDate' },
  { label: 'Assignee', sortKey: 'assignee' },
  { label: 'Actions', sortKey: null, className: 'text-right' },
]

function getSortValue(task: Task, sortBy: keyof Task): string | number {
  const value = task[sortBy]

  if (sortBy === 'assignee') {
    return task.assignee.name.toLowerCase()
  }

  if (sortBy === 'customer') {
    return task.customer.name.toLowerCase()
  }

  if (Array.isArray(value)) {
    return value.join(',').toLowerCase()
  }

  return String(value ?? '').toLowerCase()
}

export function TaskTable({
  tasks,
  loading,
  onSelectTask,
  onStatusChange,
  emptyState,
}: TaskTableProps) {
  const [sortBy, setSortBy] = useState<keyof Task | null>(null)
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('asc')

  const sortedTasks = useMemo(() => {
    if (!sortBy) {
      return tasks
    }

    return [...tasks].sort((firstTask, secondTask) => {
      const firstValue = getSortValue(firstTask, sortBy)
      const secondValue = getSortValue(secondTask, sortBy)
      const comparison = String(firstValue).localeCompare(
        String(secondValue),
        undefined,
        { numeric: true },
      )

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [sortBy, sortOrder, tasks])

  const handleSort = (sortKey: keyof Task): void => {
    if (sortBy === sortKey) {
      setSortOrder((currentOrder) =>
        currentOrder === 'asc' ? 'desc' : 'asc',
      )
      return
    }

    setSortBy(sortKey)
    setSortOrder('asc')
  }

  if (loading) {
    return <EmptyState type="loading" />
  }

  if (tasks.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full table-fixed" role="grid" aria-label="Tasks">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            {columns.map((column) => {
              const isSorted = column.sortKey === sortBy
              const ariaSort = column.sortKey
                ? isSorted
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
                : undefined

              return (
                <th
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                    column.className,
                  )}
                  key={column.label}
                  scope="col"
                  aria-sort={ariaSort}
                >
                  {column.sortKey ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      onClick={() => {
                        if (column.sortKey) {
                          handleSort(column.sortKey)
                        }
                      }}
                    >
                      {column.label}
                      {isSorted ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown
                          className="size-3.5 text-slate-400"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onSelect={onSelectTask}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TaskTable