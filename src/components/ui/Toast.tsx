import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  CheckCircle,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '../../utils/cn'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
}

interface ToastItem extends Required<ToastOptions> {
  id: string
}

export interface ToastContextValue {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

export interface ToastProviderProps {
  children: ReactNode
}

const ToastContext = createContext<ToastContextValue | null>(null)

const iconByType: Record<ToastType, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const toastClasses: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
}

const iconClasses: Record<ToastType, string> = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
}

function ToastNotification({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  const Icon = iconByType[item.type]

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(item.id)
    }, 4_000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [item.id, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg transition duration-200 ease-out',
        toastClasses[item.type],
      )}
      role={item.type === 'error' ? 'alert' : 'status'}
    >
      <Icon
        className={cn('mt-0.5 size-5 shrink-0', iconClasses[item.type])}
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">
        {item.message}
      </p>
      <button
        type="button"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string): void => {
    setToasts((currentToasts) =>
      currentToasts.filter((currentToast) => currentToast.id !== id),
    )
  }, [])

  const toast = useCallback((options: ToastOptions): string => {
    const id = crypto.randomUUID()
    const newToast: ToastItem = {
      id,
      message: options.message,
      type: options.type ?? 'info',
    }

    setToasts((currentToasts) => [...currentToasts, newToast])

    return id
  }, [])

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toast, dismiss }),
    [dismiss, toast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm sm:items-stretch"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <ToastNotification key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- The requested module co-locates its provider and consumer hook.
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}

export default ToastProvider