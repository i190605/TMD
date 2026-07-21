import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'

import { DEFAULT_FILTERS } from '../constants'
import type { Task, TaskFilters } from '../types/task'
import { useDebounce } from './useDebounce'

export interface UseTaskFiltersResult {
  filteredTasks: Task[]
  filters: TaskFilters
  setFilters: Dispatch<SetStateAction<TaskFilters>>
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  clearFilters: () => void
  activeFilterCount: number
}

export function useTaskFilters(tasks: Task[]): UseTaskFiltersResult {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const [search, setSearch] = useState<string>(DEFAULT_FILTERS.search)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      search: debouncedSearch,
    }))
  }, [debouncedSearch])

  const filteredTasks = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesSearch =
        normalizedSearch === '' ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.customer.name.toLowerCase().includes(normalizedSearch)
      const matchesPriority =
        filters.priority === 'all' || task.priority === filters.priority
      const matchesStatus =
        filters.status === 'all' || task.status === filters.status
      const matchesAssignee =
        filters.assigneeId === 'all' ||
        task.assignee.id === filters.assigneeId

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesAssignee
      )
    })
  }, [filters, tasks])

  const clearFilters = useCallback((): void => {
    setFilters({ ...DEFAULT_FILTERS })
    setSearch(DEFAULT_FILTERS.search)
  }, [])

  const activeFilterCount = useMemo(
    () =>
      Number(filters.search.trim() !== DEFAULT_FILTERS.search) +
      Number(filters.priority !== DEFAULT_FILTERS.priority) +
      Number(filters.status !== DEFAULT_FILTERS.status) +
      Number(filters.assigneeId !== DEFAULT_FILTERS.assigneeId),
    [filters],
  )

  return {
    filteredTasks,
    filters,
    setFilters,
    search,
    setSearch,
    clearFilters,
    activeFilterCount,
  }
}