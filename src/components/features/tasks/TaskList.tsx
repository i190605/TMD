import type { ReactNode } from 'react'

import type { Status, Task } from '../../../types/task'
import { EmptyState } from './EmptyState'
import { TaskCard } from './TaskCard'
import { TaskTable } from './TaskTable'

export interface TaskListProps {
  tasks: Task[]
  loading: boolean
  error: string | null
  onSelectTask: (task: Task) => void
  onStatusChange: (taskId: string, status: Status) => void
  onRetry: () => void
  onCreateTask: () => void
  search: string
}

export function TaskList({
  tasks,
  loading,
  error,
  onSelectTask,
  onStatusChange,
  onRetry,
  onCreateTask,
  search,
}: TaskListProps) {
  let emptyState: ReactNode = null

  if (error) {
    emptyState = <EmptyState type="error" onAction={onRetry} />
  } else if (tasks.length === 0 && search.trim()) {
    emptyState = (
      <EmptyState
        type="no-results"
        searchQuery={search.trim()}
        onAction={onRetry}
        actionLabel="Clear Filters"
      />
    )
  } else if (tasks.length === 0) {
    emptyState = <EmptyState type="no-tasks" onAction={onCreateTask} />
  }

  if (loading) {
    return <EmptyState type="loading" />
  }

  if (error || tasks.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <>
      <div className="hidden lg:block">
        <TaskTable
          tasks={tasks}
          loading={false}
          onSelectTask={onSelectTask}
          onStatusChange={onStatusChange}
          emptyState={emptyState}
        />
      </div>
      <div className="grid gap-3 lg:hidden" aria-label="Tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelect={onSelectTask}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </>
  )
}

export default TaskList