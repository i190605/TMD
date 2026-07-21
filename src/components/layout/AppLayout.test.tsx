import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

import { AppLayout } from './AppLayout'

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

describe('AppLayout keyboard access', () => {
  it('renders focus-only skip links to both landmarks', () => {
    render(
      <AppLayout onCreateTask={vi.fn()} onOpenShortcuts={vi.fn()}>
        <div id="task-list">Tasks</div>
      </AppLayout>,
    )

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('link', { name: 'Skip to task list' })).toHaveAttribute('href', '#task-list')
    expect(document.getElementById('main-content')).toHaveAttribute('tabindex', '-1')
  })

  it('exposes the keyboard shortcuts control', async () => {
    const user = userEvent.setup()
    const onOpenShortcuts = vi.fn()
    render(
      <AppLayout onCreateTask={vi.fn()} onOpenShortcuts={onOpenShortcuts}>
        Content
      </AppLayout>,
    )

    await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }))
    expect(onOpenShortcuts).toHaveBeenCalledOnce()
  })
})