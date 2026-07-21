import { memo } from 'react'
import { AlertCircle, ClipboardList, SearchX } from 'lucide-react'

import { Button } from '../../ui/Button'
import { Skeleton } from '../../ui/Skeleton'

export type EmptyStateType =
  | 'no-tasks'
  | 'no-results'
  | 'error'
  | 'loading'

export interface EmptyStateProps {
  type: EmptyStateType
  searchQuery?: string
  onAction?: () => void
  actionLabel?: string
}

function LoadingState() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      role="status"
      aria-label="Loading tasks"
    >
      <span className="sr-only">Loading tasks</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          className="grid grid-cols-[minmax(0,2fr)_minmax(6rem,1fr)] items-center gap-4 border-b border-slate-100 px-4 py-5 last:border-b-0 sm:grid-cols-[minmax(0,2fr)_minmax(7rem,1fr)_minmax(6rem,0.75fr)_2.5rem]"
          key={index}
          aria-hidden="true"
        >
          <div className="min-w-0 space-y-2">
            <Skeleton height="h-4" width="w-4/5" />
            <Skeleton height="h-3" width="w-2/5" />
          </div>
          <Skeleton className="justify-self-start" height="h-6" width="w-20" />
          <Skeleton className="hidden sm:block" height="h-4" width="w-24" />
          <Skeleton className="hidden rounded-full sm:block" height="h-8" width="w-8" />
        </div>
      ))}
    </div>
  )
}

function EmptyStateComponent({
  type,
  searchQuery,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  if (type === 'loading') {
    return <LoadingState />
  }

  const content = {
    'no-tasks': {
      icon: ClipboardList,
      iconClassName: 'bg-blue-50 text-blue-600',
      title: 'No tasks yet',
      description: 'Create your first task to get started',
      defaultActionLabel: 'Create Task',
    },
    'no-results': {
      icon: SearchX,
      iconClassName: 'bg-slate-100 text-slate-600',
      title: 'No tasks match your search',
      description: 'Try different keywords or clear your filters',
      defaultActionLabel: 'Clear Filters',
    },
    error: {
      icon: AlertCircle,
      iconClassName: 'bg-red-50 text-red-600',
      title: 'Something went wrong',
      description: 'Failed to load tasks. Please try again.',
      defaultActionLabel: 'Retry',
    },
  }[type]
  const Icon = content.icon

  return (
    <div
      className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span
        className={`inline-flex size-14 items-center justify-center rounded-2xl ${content.iconClassName}`}
      >
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-slate-900">
        {content.title}
      </h2>
      {type === 'no-results' && searchQuery ? (
        <p className="mt-2 max-w-md text-sm text-slate-600">
          No results for{' '}
          <span className="font-semibold text-slate-800">“{searchQuery}”</span>.
        </p>
      ) : null}
      <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
        {content.description}
      </p>
      <Button className="mt-6" onClick={onAction} disabled={!onAction}>
        {actionLabel ?? content.defaultActionLabel}
      </Button>
    </div>
  )
}

export const EmptyState = memo(EmptyStateComponent)

export default EmptyState