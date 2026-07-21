import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
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
  { label: 'Select', sortKey: null },
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
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(tasks[0]?.id ?? null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(() => new Set())
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>())

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

  useEffect(() => {
    const visibleIds = new Set(sortedTasks.map((task) => task.id))
    setSelectedTaskIds((current) => {
      const next = new Set([...current].filter((id) => visibleIds.has(id)))
      return next.size === current.size ? current : next
    })
    setFocusedTaskId((current) =>
      current && visibleIds.has(current) ? current : (sortedTasks[0]?.id ?? null),
    )
    setSelectionAnchorId((current) =>
      current && visibleIds.has(current) ? current : null,
    )
  }, [sortedTasks])

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

  const setTaskSelection = (
    task: Task,
    selected: boolean,
    extendSelection: boolean,
  ): void => {
    setFocusedTaskId(task.id)
    setSelectedTaskIds((current) => {
      const next = new Set(current)
      const anchorIndex = selectionAnchorId
        ? sortedTasks.findIndex((item) => item.id === selectionAnchorId)
        : -1
      const taskIndex = sortedTasks.findIndex((item) => item.id === task.id)

      if (extendSelection && anchorIndex >= 0 && taskIndex >= 0) {
        const start = Math.min(anchorIndex, taskIndex)
        const end = Math.max(anchorIndex, taskIndex)
        sortedTasks.slice(start, end + 1).forEach((item) => {
          if (selected) next.add(item.id)
          else next.delete(item.id)
        })
      } else if (selected) {
        next.add(task.id)
      } else {
        next.delete(task.id)
      }

      return next
    })

    if (!extendSelection || !selectionAnchorId) {
      setSelectionAnchorId(task.id)
    }
  }

  const handleActivate = (task: Task, extendSelection: boolean): void => {
    if (extendSelection) {
      setTaskSelection(task, true, true)
      return
    }

    onSelectTask(task)
  }

  const handleRowKeyDown = (
    task: Task,
    event: KeyboardEvent<HTMLTableRowElement>,
  ): void => {
    const currentIndex = sortedTasks.findIndex((item) => item.id === task.id)

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const offset = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex = Math.min(
        sortedTasks.length - 1,
        Math.max(0, currentIndex + offset),
      )
      const nextTask = sortedTasks[nextIndex]
      setFocusedTaskId(nextTask.id)
      rowRefs.current.get(nextTask.id)?.focus()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      onSelectTask(task)
    } else if (event.key === ' ') {
      event.preventDefault()
      setTaskSelection(task, !selectedTaskIds.has(task.id), event.shiftKey)
    }
  }

  if (loading) {
    return <EmptyState type="loading" />
  }

  if (tasks.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-200 px-4 py-2 text-sm text-slate-600" aria-live="polite">
        {selectedTaskIds.size === 0
          ? 'No tasks selected'
          : `${selectedTaskIds.size} ${selectedTaskIds.size === 1 ? 'task' : 'tasks'} selected`}
      </p>
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
                  {column.label === 'Select' ? (
                    <span className="sr-only">Select task</span>
                  ) : column.sortKey ? (
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
          {sortedTasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              isSelected={selectedTaskIds.has(task.id)}
              tabIndex={focusedTaskId === task.id || (!focusedTaskId && index === 0) ? 0 : -1}
              rowRef={(element) => {
                if (element) rowRefs.current.set(task.id, element)
                else rowRefs.current.delete(task.id)
              }}
              onActivate={handleActivate}
              onFocus={setFocusedTaskId}
              onKeyDown={handleRowKeyDown}
              onSelectionChange={setTaskSelection}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TaskTable