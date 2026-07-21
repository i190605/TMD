import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import {
  Building2,
  CalendarDays,
  Clock3,
  Mail,
  Pencil,
  UserRound,
  X,
} from 'lucide-react'
import {
  differenceInCalendarDays,
  format,
  isPast,
  parseISO,
} from 'date-fns'

import type { Status, Task } from '../../../types/task'
import { cn } from '../../../utils/cn'
import { Button } from '../../ui/Button'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

export interface TaskDetailProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onEdit: (task: Task) => void
  onStatusChange: (id: string, status: Status) => void
  triggerRef?: RefObject<HTMLElement | null>
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const planClasses: Record<Task['customer']['plan'], string> = {
  enterprise: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  pro: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  starter: 'bg-gray-100 text-gray-700 ring-gray-500/20',
}

const planLabels: Record<Task['customer']['plan'], string> = {
  enterprise: 'Enterprise',
  pro: 'Pro',
  starter: 'Starter',
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      element.getAttribute('aria-hidden') !== 'true' &&
      !element.hasAttribute('hidden'),
  )
}

export function TaskDetail({
  task,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  triggerRef,
}: TaskDetailProps) {
  const titleId = useId()
  const confirmationTitleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)
  const cancelConfirmationRef = useRef<HTMLButtonElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null)

  useEffect(() => {
    if (!isOpen || !task) {
      setIsVisible(false)
      return undefined
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      setIsVisible(true)
      titleRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [isOpen, task])

  useEffect(() => {
    setPendingStatus(null)
  }, [isOpen, task?.id])

  useEffect(() => {
    if (!isOpen || !task) {
      return undefined
    }

    const previouslyFocusedElement =
      triggerRef?.current ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
      previouslyFocusedElement?.focus()
    }
  }, [isOpen, task, triggerRef])

  useEffect(() => {
    if (!isOpen || !task) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()

        if (pendingStatus) {
          setPendingStatus(null)
        } else {
          onClose()
        }

        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const activeContainer = pendingStatus
        ? confirmationRef.current
        : panelRef.current

      if (!activeContainer) {
        return
      }

      const focusableElements = getFocusableElements(activeContainer)
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        event.preventDefault()
        activeContainer.focus()
        return
      }

      if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          document.activeElement === activeContainer)
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement ||
          document.activeElement === activeContainer)
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen, onClose, pendingStatus, task])

  useEffect(() => {
    if (!pendingStatus) {
      return undefined
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      cancelConfirmationRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [pendingStatus])

  if (!task || !isOpen) {
    return null
  }

  const dueDate = parseISO(task.dueDate)
  const isOverdue = task.status !== 'completed' && isPast(dueDate)
  const overdueDays = isOverdue
    ? Math.max(1, differenceInCalendarDays(new Date(), dueDate))
    : 0

  const handleBackdropClick = (
    event: ReactMouseEvent<HTMLDivElement>,
  ): void => {
    if (!pendingStatus && event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleStatusChange = (status: Status): void => {
    const isReopening = status === 'open' && task.status !== 'open'

    if (isReopening) {
      setPendingStatus(status)
      return
    }

    onStatusChange(task.id, status)
  }

  const confirmStatusChange = (): void => {
    if (pendingStatus) {
      onStatusChange(task.id, pendingStatus)
      setPendingStatus(null)
    }
  }

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:items-stretch lg:justify-end',
        isVisible ? 'opacity-100' : 'opacity-0',
      )}
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className={cn(
          'relative flex h-dvh w-full flex-col overflow-hidden bg-white text-left shadow-2xl transition-transform duration-300 ease-out lg:max-w-xl',
          isVisible
            ? 'translate-y-0 lg:translate-x-0'
            : 'translate-y-full lg:translate-y-0 lg:translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header
          className="shrink-0 border-b border-slate-200 px-5 py-5 sm:px-6"
          inert={Boolean(pendingStatus)}
          aria-hidden={pendingStatus ? true : undefined}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                ref={titleRef}
                className="text-xl font-bold leading-7 text-slate-950 outline-none sm:text-2xl"
                id={titleId}
                tabIndex={-1}
              >
                {task.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <TaskPriorityBadge priority={task.priority} />
                <TaskStatusBadge
                  status={task.status}
                  interactive
                  onChange={handleStatusChange}
                />
              </div>
            </div>
            <button
              type="button"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={onClose}
              aria-label="Close task details"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          inert={Boolean(pendingStatus)}
          aria-hidden={pendingStatus ? true : undefined}
        >
          <section className="border-b border-slate-200 px-5 py-6 sm:px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Task Details
            </h3>
            {task.description.trim() ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {task.description}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-slate-500">
                No description provided
              </p>
            )}
          </section>

          <section className="border-b border-slate-200 px-5 py-6 sm:px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Customer
            </h3>
            <div className="mt-4 flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {task.customer.name}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  {task.customer.company}
                </p>
                <a
                  className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  href={`mailto:${task.customer.email}`}
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {task.customer.email}
                </a>
                <div className="mt-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                      planClasses[task.customer.plan],
                    )}
                  >
                    {planLabels[task.customer.plan]} plan
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-slate-200 px-5 py-6 sm:px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Assignment
            </h3>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarDays
                  className="mt-0.5 size-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    <time dateTime={task.dueDate}>
                      {format(dueDate, 'MMM d, yyyy')}
                    </time>
                    {isOverdue ? (
                      <span className="mt-1 block font-semibold text-red-600">
                        Overdue by {overdueDays}{' '}
                        {overdueDays === 1 ? 'day' : 'days'}
                      </span>
                    ) : null}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserRound
                  className="mt-0.5 size-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assignee
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {task.assignee.name}
                  </dd>
                  <dd className="mt-0.5 break-all text-sm text-slate-600">
                    {task.assignee.email}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          <section className="px-5 py-6 sm:px-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Metadata
            </h3>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Clock3
                  className="mt-0.5 size-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    <time dateTime={task.createdAt}>
                      {format(parseISO(task.createdAt), 'MMM d, yyyy')}
                    </time>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3
                  className="mt-0.5 size-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last updated
                  </dt>
                  <dd className="mt-1 text-sm text-slate-700">
                    <time dateTime={task.updatedAt}>
                      {format(parseISO(task.updatedAt), 'MMM d, yyyy')}
                    </time>
                  </dd>
                </div>
              </div>
            </dl>
          </section>
        </div>

        <footer
          className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6"
          inert={Boolean(pendingStatus)}
          aria-hidden={pendingStatus ? true : undefined}
        >
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            icon={<Pencil className="size-4" />}
            onClick={() => onEdit(task)}
          >
            Edit Task
          </Button>
        </footer>

        {pendingStatus ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div
              ref={confirmationRef}
              className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl outline-none"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={confirmationTitleId}
              tabIndex={-1}
            >
              <h3
                className="text-lg font-semibold text-slate-950"
                id={confirmationTitleId}
              >
                Reopen task?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Are you sure you want to reopen this task?
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  ref={cancelConfirmationRef}
                  variant="secondary"
                  onClick={() => setPendingStatus(null)}
                >
                  Cancel
                </Button>
                <Button onClick={confirmStatusChange}>Confirm</Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export default TaskDetail