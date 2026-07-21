import { act, renderHook } from '@testing-library/react'
import { expect, vi } from 'vitest'

import { DEFAULT_FILTERS } from '../constants'
import { makeTask } from '../test/factories'
import { useTaskFilters } from './useTaskFilters'

const tasks = [
  makeTask({
    id: 'task-high',
    title: 'Urgent outage investigation',
    priority: 'high',
    status: 'open',
    assignee: {
      id: 'assignee-1',
      name: 'Maya Chen',
      email: 'maya@example.com',
    },
    customer: {
      id: 'customer-acme',
      name: 'Acme Customer',
      company: 'Acme Inc.',
      email: 'ops@acme.example',
      plan: 'enterprise',
    },
  }),
  makeTask({
    id: 'task-medium',
    title: 'Renew annual contract',
    priority: 'medium',
    status: 'in_progress',
    assignee: {
      id: 'assignee-2',
      name: 'Liam Patel',
      email: 'liam@example.com',
    },
    customer: {
      id: 'customer-beta',
      name: 'Beta Industries',
      company: 'Beta Industries',
      email: 'buyer@beta.example',
      plan: 'pro',
    },
  }),
  makeTask({
    id: 'task-low',
    title: 'Prepare adoption report',
    priority: 'low',
    status: 'completed',
    assignee: {
      id: 'assignee-1',
      name: 'Maya Chen',
      email: 'maya@example.com',
    },
    customer: {
      id: 'customer-gamma',
      name: 'Gamma Labs',
      company: 'Gamma Labs',
      email: 'team@gamma.example',
      plan: 'starter',
    },
  }),
]

describe('useTaskFilters filter classification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('classifies an empty filter set as inactive and returns every task', () => {
    const { result } = renderHook(() => useTaskFilters(tasks))

    expect(result.current.filters).toEqual(DEFAULT_FILTERS)
    expect(result.current.search).toBe('')
    expect(result.current.activeFilterCount).toBe(0)
    expect(result.current.filteredTasks).toEqual(tasks)
  })

  it('debounces search and matches normalized task titles or customer names', () => {
    const { result } = renderHook(() => useTaskFilters(tasks))

    act(() => {
      result.current.setSearch('  OUTAGE  ')
    })

    expect(result.current.search).toBe('  OUTAGE  ')
    expect(result.current.filters.search).toBe('')
    expect(result.current.filteredTasks).toEqual(tasks)

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.filters.search).toBe('  OUTAGE  ')
    expect(result.current.activeFilterCount).toBe(1)
    expect(result.current.filteredTasks.map((task) => task.id)).toEqual([
      'task-high',
    ])

    act(() => {
      result.current.setSearch('bEtA')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.filteredTasks.map((task) => task.id)).toEqual([
      'task-medium',
    ])

    act(() => {
      result.current.setSearch('does not exist')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.filteredTasks).toEqual([])
  })

  it.each([
    [
      'priority',
      { ...DEFAULT_FILTERS, priority: 'medium' as const },
      ['task-medium'],
    ],
    [
      'status',
      { ...DEFAULT_FILTERS, status: 'completed' as const },
      ['task-low'],
    ],
    [
      'assignee',
      { ...DEFAULT_FILTERS, assigneeId: 'assignee-1' },
      ['task-high', 'task-low'],
    ],
  ])('classifies a selected %s filter and applies it', (_name, filters, ids) => {
    const { result } = renderHook(() => useTaskFilters(tasks))

    act(() => {
      result.current.setFilters(filters)
    })

    expect(result.current.activeFilterCount).toBe(1)
    expect(result.current.filteredTasks.map((task) => task.id)).toEqual(ids)
  })

  it('uses AND semantics for combined filters and counts every active dimension', () => {
    const { result } = renderHook(() => useTaskFilters(tasks))

    act(() => {
      result.current.setFilters({
        search: 'acme',
        priority: 'high',
        status: 'open',
        assigneeId: 'assignee-1',
      })
    })

    expect(result.current.activeFilterCount).toBe(4)
    expect(result.current.filteredTasks.map((task) => task.id)).toEqual([
      'task-high',
    ])

    act(() => {
      result.current.setFilters((current) => ({
        ...current,
        status: 'completed',
      }))
    })

    expect(result.current.filteredTasks).toEqual([])
  })

  it('clears both the immediate search value and all applied filters', () => {
    const { result } = renderHook(() => useTaskFilters(tasks))

    act(() => {
      result.current.setSearch('outage')
      result.current.setFilters({
        search: 'outage',
        priority: 'high',
        status: 'open',
        assigneeId: 'assignee-1',
      })
    })

    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.search).toBe('')
    expect(result.current.filters).toEqual(DEFAULT_FILTERS)
    expect(result.current.activeFilterCount).toBe(0)
    expect(result.current.filteredTasks).toEqual(tasks)
  })

  it('reclassifies results when the task collection changes', () => {
    const { result, rerender } = renderHook(
      ({ currentTasks }) => useTaskFilters(currentTasks),
      { initialProps: { currentTasks: tasks } },
    )

    act(() => {
      result.current.setFilters({ ...DEFAULT_FILTERS, priority: 'high' })
    })

    const replacement = makeTask({ id: 'new-high-priority-task' })
    rerender({ currentTasks: [replacement] })

    expect(result.current.filteredTasks).toEqual([replacement])
  })
})