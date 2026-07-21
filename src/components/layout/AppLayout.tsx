import { useCallback, useState, type ReactNode } from 'react'
import { CheckSquare2, Menu } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Sidebar } from './Sidebar'

export interface AppLayoutProps {
  children: ReactNode
  onCreateTask: () => void
}

export function AppLayout({ children, onCreateTask }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const closeSidebar = useCallback((): void => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <div className="h-dvh overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onCreateTask={onCreateTask}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex h-full min-w-0 flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="inline-flex items-center gap-2.5">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CheckSquare2 className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle
              theme={theme}
              onToggle={toggleTheme}
              showLabel={false}
            />
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isSidebarOpen}
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto" id="main-content">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout