import { useCallback, useState, type ReactNode } from 'react'
import { CheckSquare2, CircleHelp, Menu } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Sidebar } from './Sidebar'

export interface AppLayoutProps {
  children: ReactNode
  onCreateTask: () => void
  onOpenShortcuts: () => void
}

export function AppLayout({ children, onCreateTask, onOpenShortcuts }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const closeSidebar = useCallback((): void => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <div className="h-dvh overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <nav aria-label="Skip links">
        <a className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-white px-4 py-2 font-semibold text-slate-950 shadow-lg focus:not-sr-only focus-visible:ring-2 focus-visible:ring-accent" href="#main-content">
          Skip to main content
        </a>
        <a className="sr-only fixed left-4 top-16 z-[100] rounded-lg bg-white px-4 py-2 font-semibold text-slate-950 shadow-lg focus:not-sr-only focus-visible:ring-2 focus-visible:ring-accent" href="#task-list">
          Skip to task list
        </a>
      </nav>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onCreateTask={onCreateTask}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex h-full min-w-0 flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 lg:justify-end lg:px-8">
          <div className="inline-flex items-center gap-2.5 lg:hidden">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CheckSquare2 className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              onClick={onOpenShortcuts}
              aria-label="Keyboard shortcuts"
            >
              <CircleHelp className="size-5" aria-hidden="true" />
            </button>
            <ThemeToggle
              theme={theme}
              onToggle={toggleTheme}
              showLabel={false}
            />
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-900 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto" id="main-content" tabIndex={-1}>
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout