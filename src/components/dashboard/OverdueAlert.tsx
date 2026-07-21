import { memo, useEffect, useState } from 'react'
import { ArrowRight, TriangleAlert, X } from 'lucide-react'

export interface OverdueAlertProps {
  overdueCount: number
  onViewOverdue: () => void
}

function OverdueAlertComponent({
  overdueCount,
  onViewOverdue,
}: OverdueAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (overdueCount === 0) {
      setIsDismissed(false)
    }
  }, [overdueCount])

  if (overdueCount <= 0 || isDismissed) {
    return null
  }

  return (
    <aside
      className="flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
      aria-label="Overdue task alert"
    >
      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="font-medium">
          {overdueCount} tasks are overdue and need attention
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 sm:mt-0"
          onClick={onViewOverdue}
        >
          View overdue tasks
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-amber-700 transition hover:bg-amber-100 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss overdue task alert"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </aside>
  )
}

export const OverdueAlert = memo(OverdueAlertComponent)

export default OverdueAlert