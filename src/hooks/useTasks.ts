import { useEffect, useMemo } from 'react'

import { useTaskStore } from '../store/taskStore'
import { useTaskFilters } from './useTaskFilters'

export function useTasks() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    updateStatus,
    clearError,
  } = useTaskStore()
  const {
    filteredTasks,
    filters,
    setFilters,
    search,
    setSearch,
    clearFilters,
    activeFilterCount,
  } = useTaskFilters(tasks)

  const overdueCount = useMemo(() => {
    const now = Date.now()

    return tasks.filter(
      (task) =>
        task.status !== 'completed' && Date.parse(task.dueDate) < now,
    ).length
  }, [tasks])

  useEffect(() => {
    void fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    document.title =
      overdueCount > 0 ? `TaskFlow (${overdueCount} overdue)` : 'TaskFlow'
  }, [overdueCount])

  return {
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
    clearError,
  }
}