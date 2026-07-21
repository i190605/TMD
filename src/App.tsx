import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { ASSIGNEES } from './constants'
import { OverdueAlert } from './components/dashboard/OverdueAlert'
import { StatsBar } from './components/dashboard/StatsBar'
import { TaskDetail } from './components/features/tasks/TaskDetail'
import { TaskFilters } from './components/features/tasks/TaskFilters'
import { TaskForm } from './components/features/tasks/TaskForm'
import { TaskList } from './components/features/tasks/TaskList'
import { AppLayout } from './components/layout/AppLayout'
import { CommandPalette } from './components/ui/CommandPalette'
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal'
import { ToastProvider, useToast } from './components/ui/Toast'
import { useTasks } from './hooks/useTasks'
import type { CreateTaskPayload, Status, Task } from './types/task'

const EMPTY_FORM_VALUES: Partial<CreateTaskPayload> = {}

function taskToFormValues(
  task: Task,
): Partial<CreateTaskPayload> {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    assignee: task.assignee,
    customer: task.customer,
    tags: task.tags,
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

function TaskDashboard() {
  const { toast: showToast } = useToast()
  const {
    tasks,
    filteredTasks,
    loading,
    error,
    filters,
    setFilters,
    search,
    setSearch,
    clearFilters,
    activeFilterCount,
    overdueCount,
    fetchTasks,
    createTask,
    updateTask,
    updateStatus,
  } = useTasks()
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const openCreateForm = useCallback((): void => {
    setIsCreateFormOpen(true)
  }, [])

  const closeCreateForm = useCallback((): void => {
    setIsCreateFormOpen(false)
  }, [])

  const closeEditForm = useCallback((): void => {
    setIsEditFormOpen(false)
  }, [])

  const closeTaskDetail = useCallback((): void => {
    setIsDetailOpen(false)
  }, [])

  const focusSearch = useCallback((): void => {
    window.requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [])

  const focusTaskList = useCallback((): void => {
    window.requestAnimationFrame(() => {
      const taskList = document.getElementById('task-list')
      const firstRow = taskList?.querySelector<HTMLElement>('[data-task-row]')
      ;(firstRow ?? taskList)?.focus()
    })
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent): void => {
      if (
        event.key.toLowerCase() === 'k' &&
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !isCreateFormOpen &&
        !isEditFormOpen &&
        !isDetailOpen &&
        !isShortcutsOpen
      ) {
        event.preventDefault()
        setIsCommandPaletteOpen(true)
        return
      }

      if (
        isTypingTarget(event.target) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        isCreateFormOpen ||
        isEditFormOpen ||
        isDetailOpen ||
        isShortcutsOpen ||
        isCommandPaletteOpen
      ) {
        return
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        openCreateForm()
      } else if (event.key === '/') {
        event.preventDefault()
        focusSearch()
      }
    }

    document.addEventListener('keydown', handleShortcut)

    return () => {
      document.removeEventListener('keydown', handleShortcut)
    }
  }, [focusSearch, isCommandPaletteOpen, isCreateFormOpen, isDetailOpen, isEditFormOpen, isShortcutsOpen, openCreateForm])

  useEffect(() => {
    if (!selectedTask) {
      return
    }

    const currentTask = tasks.find((task) => task.id === selectedTask.id)

    if (currentTask && currentTask !== selectedTask) {
      setSelectedTask(currentTask)
    }
  }, [selectedTask, tasks])

  const editInitialValues = useMemo(
    () => (selectedTask ? taskToFormValues(selectedTask) : EMPTY_FORM_VALUES),
    [selectedTask],
  )

  const handleSelectTask = useCallback((task: Task): void => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }, [])

  const handleEditTask = useCallback((task: Task): void => {
    setSelectedTask(task)
    setIsDetailOpen(false)
    setIsEditFormOpen(true)
  }, [])

  const handleStatusChange = useCallback(
    async (id: string, status: Status): Promise<void> => {
      try {
        await updateStatus(id, status)
        showToast({ message: 'Task status updated', type: 'success' })
      } catch {
        showToast({
          message: 'Failed to update task status. Please try again.',
          type: 'error',
        })
      }
    },
    [showToast, updateStatus],
  )

  const handleCreateTask = async (
    payload: CreateTaskPayload,
  ): Promise<void> => {
    setIsSubmitting(true)

    try {
      await createTask(payload)
      closeCreateForm()
      showToast({ message: 'Task created successfully', type: 'success' })
    } catch {
      showToast({
        message: 'Failed to create task. Please try again.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTask = async (
    payload: CreateTaskPayload,
  ): Promise<void> => {
    if (!selectedTask) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateTask(selectedTask.id, payload)
      closeEditForm()
      showToast({ message: 'Task updated successfully', type: 'success' })
    } catch {
      showToast({
        message: 'Failed to update task. Please try again.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewOverdue = (): void => {
    clearFilters()

    window.requestAnimationFrame(() => {
      document.getElementById('task-list')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <>
      <AppLayout
        onCreateTask={openCreateForm}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      >
        <div className="space-y-5 sm:space-y-6">
          <header>
            <p className="text-sm font-semibold text-blue-700">Task Management</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Track customer work, priorities, and deadlines in one place.
            </p>
          </header>

          <OverdueAlert
            overdueCount={overdueCount}
            onViewOverdue={handleViewOverdue}
          />
          <StatsBar tasks={tasks} />
          <TaskFilters
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
            assignees={[...ASSIGNEES]}
            searchInputRef={searchInputRef}
          />
          <div className="scroll-mt-6" id="task-list" tabIndex={-1}>
            <TaskList
              tasks={filteredTasks}
              loading={loading}
              error={error}
              onSelectTask={handleSelectTask}
              onStatusChange={handleStatusChange}
              onRetry={() => void fetchTasks()}
              onCreateTask={openCreateForm}
              onClearFilters={clearFilters}
              search={search}
            />
          </div>
        </div>
      </AppLayout>

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewTask={openCreateForm}
        onSearch={focusSearch}
        onTaskList={focusTaskList}
        onShortcuts={() => setIsShortcutsOpen(true)}
      />

      <TaskDetail
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={closeTaskDetail}
        onEdit={handleEditTask}
        onStatusChange={handleStatusChange}
      />

      <TaskForm
        mode="create"
        initialValues={EMPTY_FORM_VALUES}
        isOpen={isCreateFormOpen}
        onSubmit={handleCreateTask}
        onCancel={closeCreateForm}
        isSubmitting={isSubmitting}
      />

      <TaskForm
        mode="edit"
        initialValues={editInitialValues}
        isOpen={isEditFormOpen}
        onSubmit={handleUpdateTask}
        onCancel={closeEditForm}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

function App() {
  return (
    <ToastProvider>
      <TaskDashboard />
    </ToastProvider>
  )
}

export default App