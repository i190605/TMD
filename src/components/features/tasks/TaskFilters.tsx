import {
  memo,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { ChevronDown, ListFilter, Search, X } from 'lucide-react'

import type {
  Assignee,
  Priority,
  Status,
  TaskFilters as TaskFilterValues,
} from '../../../types/task'
import { cn } from '../../../utils/cn'

export interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filters: TaskFilterValues
  onFiltersChange: (filters: TaskFilterValues) => void
  onClearFilters: () => void
  activeFilterCount: number
  assignees: Assignee[]
}

interface FilterSelectProps {
  id: string
  label: string
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  isActive: boolean
  onChange: (value: string) => void
  className?: string
}

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const

function FilterSelect({
  id,
  label,
  value,
  options,
  isActive,
  onChange,
  className,
}: FilterSelectProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onChange(event.target.value)
  }

  return (
    <div className={cn('relative', className)}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-lg border bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          isActive
            ? 'border-blue-400 bg-blue-50 text-blue-800'
            : 'border-slate-300 hover:border-slate-400',
        )}
        id={id}
        value={value}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
    </div>
  )
}

function TaskFiltersComponent({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  assignees,
}: TaskFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const mobilePanelId = `${generatedId}-mobile-filters`
  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    ...assignees.map((assignee) => ({
      value: assignee.id,
      label: assignee.name,
    })),
  ]

  const updatePriority = (priority: string): void => {
    onFiltersChange({
      ...filters,
      priority: priority as Priority | 'all',
    })
  }

  const updateStatus = (status: string): void => {
    onFiltersChange({
      ...filters,
      status: status as Status | 'all',
    })
  }

  const updateAssignee = (assigneeId: string): void => {
    onFiltersChange({ ...filters, assigneeId })
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(event.target.value)
  }

  const clearSearch = (): void => {
    onSearchChange('')
    searchInputRef.current?.focus()
  }

  const filterControls = (idPrefix: string) => (
    <>
      <FilterSelect
        id={`${generatedId}-${idPrefix}-priority`}
        label="Filter by priority"
        value={filters.priority}
        options={priorityOptions}
        isActive={filters.priority !== 'all'}
        onChange={updatePriority}
        className="min-w-36"
      />
      <FilterSelect
        id={`${generatedId}-${idPrefix}-status`}
        label="Filter by status"
        value={filters.status}
        options={statusOptions}
        isActive={filters.status !== 'all'}
        onChange={updateStatus}
        className="min-w-36"
      />
      <FilterSelect
        id={`${generatedId}-${idPrefix}-assignee`}
        label="Filter by assignee"
        value={filters.assigneeId}
        options={assigneeOptions}
        isActive={filters.assigneeId !== 'all'}
        onChange={updateAssignee}
        className="min-w-40"
      />
    </>
  )

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
      aria-label="Search and filter tasks"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 basis-64">
          <label className="sr-only" htmlFor={`${generatedId}-search`}>
            Search tasks or customers
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            id={`${generatedId}-search`}
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search tasks or customers..."
          />
          {search ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          {filterControls('desktop')}
        </div>

        <button
          type="button"
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden',
            activeFilterCount > 0
              ? 'border-blue-400 bg-blue-50 text-blue-800'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
          )}
          onClick={() => setIsMobileFiltersOpen((isOpen) => !isOpen)}
          aria-controls={mobilePanelId}
          aria-expanded={isMobileFiltersOpen}
        >
          <ListFilter className="size-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            className="h-10 rounded-lg px-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={onClearFilters}
          >
            Clear ({activeFilterCount})
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 lg:hidden',
          isMobileFiltersOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
        id={mobilePanelId}
        aria-hidden={!isMobileFiltersOpen}
        inert={!isMobileFiltersOpen}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 border-t border-slate-200 pt-3 mt-3 sm:grid-cols-3">
            {filterControls('mobile')}
          </div>
        </div>
      </div>
    </section>
  )
}

export const TaskFilters = memo(TaskFiltersComponent)

export default TaskFilters