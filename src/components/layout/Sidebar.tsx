import {
  memo,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import { CheckSquare2, LayoutDashboard, Plus, X } from 'lucide-react'

import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: () => void
}

interface SidebarContentProps {
  isMobile?: boolean
  closeButtonRef?: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onCreateTask: () => void
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function SidebarContent({
  isMobile = false,
  closeButtonRef,
  onClose,
  onCreateTask,
}: SidebarContentProps) {
  const handleCreateTask = (): void => {
    onCreateTask()

    if (isMobile) {
      onClose()
    }
  }

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <a
          className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          href="#main-content"
          onClick={isMobile ? onClose : undefined}
        >
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-blue-600">
            <CheckSquare2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </a>

        {isMobile ? (
          <button
            ref={closeButtonRef}
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 px-3 py-6" aria-label="Main navigation">
        <a
          className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          href="#main-content"
          aria-current="page"
          onClick={isMobile ? onClose : undefined}
        >
          <LayoutDashboard className="size-5" aria-hidden="true" />
          Dashboard
        </a>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <Button
          className="w-full"
          icon={<Plus className="size-4" />}
          onClick={handleCreateTask}
        >
          New Task
        </Button>
      </div>
    </>
  )
}

function SidebarComponent({
  isOpen,
  onClose,
  onCreateTask,
}: SidebarProps) {
  const mobileSidebarRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const animationFrameId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = originalOverflow
      previouslyFocusedElement?.focus()
    }
  }, [isOpen, onClose])

  const handleMobileKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
  ): void => {
    if (event.key !== 'Tab' || !mobileSidebarRef.current) {
      return
    }

    const focusableElements = Array.from(
      mobileSidebarRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (!firstElement || !lastElement) {
      event.preventDefault()
      return
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          'fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-label="Close navigation menu"
        tabIndex={-1}
      />

      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800 bg-slate-950 text-white lg:flex"
      >
        <SidebarContent
          onClose={onClose}
          onCreateTask={onCreateTask}
        />
      </aside>

      <aside
        ref={mobileSidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-xl transition-transform duration-200 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="TaskFlow navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        onKeyDown={handleMobileKeyDown}
      >
        <SidebarContent
          isMobile
          closeButtonRef={closeButtonRef}
          onClose={onClose}
          onCreateTask={onCreateTask}
        />
      </aside>
    </>
  )
}

export const Sidebar = memo(SidebarComponent)

export default Sidebar