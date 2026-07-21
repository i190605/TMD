import { Moon, Sun } from 'lucide-react'

import type { Theme } from '../../hooks/useTheme'
import { cn } from '../../utils/cn'

export interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
  showLabel?: boolean
  variant?: 'default' | 'sidebar'
  className?: string
}

export function ThemeToggle({
  theme,
  onToggle,
  showLabel = true,
  variant = 'default',
  className,
}: ThemeToggleProps) {
  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : Moon
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        variant === 'sidebar'
          ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-800 focus-visible:ring-offset-slate-950'
          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950',
        !showLabel && 'size-10 min-h-10 px-0',
        className,
      )}
      onClick={onToggle}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={isDark}
      title={`Switch to ${nextTheme} mode`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {showLabel ? <span>{isDark ? 'Light mode' : 'Dark mode'}</span> : null}
    </button>
  )
}

export default ThemeToggle