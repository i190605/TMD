import { memo, useMemo, type ComponentType } from 'react'
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  ListTodo,
  TriangleAlert,
  type LucideProps,
} from 'lucide-react'

import type { Task } from '../../types/task'
import { cn } from '../../utils/cn'

export interface StatsBarProps {
  tasks: Task[]
}

interface StatCard {
  label: string
  value: number
  icon: ComponentType<LucideProps>
  iconClassName: string
  backgroundClassName: string
  valueClassName?: string
}

function StatsBarComponent({ tasks }: StatsBarProps) {
  const stats = useMemo<StatCard[]>(() => {
    const now = Date.now()
    const counts = tasks.reduce(
      (currentCounts, task) => {
        currentCounts.total += 1
        currentCounts[task.status] += 1

        if (task.status !== 'completed' && Date.parse(task.dueDate) < now) {
          currentCounts.overdue += 1
        }

        return currentCounts
      },
      {
        total: 0,
        open: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
      },
    )

    return [
      {
        label: 'Total Tasks',
        value: counts.total,
        icon: ListTodo,
        iconClassName: 'text-violet-600',
        backgroundClassName: 'bg-violet-50',
      },
      {
        label: 'Open',
        value: counts.open,
        icon: CircleDot,
        iconClassName: 'text-slate-600',
        backgroundClassName: 'bg-slate-100',
      },
      {
        label: 'In Progress',
        value: counts.in_progress,
        icon: Clock3,
        iconClassName: 'text-blue-600',
        backgroundClassName: 'bg-blue-50',
      },
      {
        label: 'Completed',
        value: counts.completed,
        icon: CheckCircle2,
        iconClassName: 'text-green-600',
        backgroundClassName: 'bg-green-50',
      },
      {
        label: 'Overdue',
        value: counts.overdue,
        icon: TriangleAlert,
        iconClassName: 'text-red-600',
        backgroundClassName: 'bg-amber-50',
        valueClassName: 'text-red-700',
      },
    ]
  }, [tasks])

  return (
    <section
      className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4"
      aria-label="Task statistics"
    >
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <article
            className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            key={stat.label}
          >
            <span
              className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-lg',
                stat.backgroundClassName,
                stat.iconClassName,
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-2xl font-bold leading-none text-slate-900',
                  stat.valueClassName,
                )}
              >
                {stat.value}
              </p>
              <p className="mt-1 truncate text-xs font-medium text-slate-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}

export const StatsBar = memo(StatsBarComponent)

export default StatsBar