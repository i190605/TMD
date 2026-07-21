import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'

describe('KeyboardShortcutsModal', () => {
  it('lists every implemented shortcut and closes accessibly', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<KeyboardShortcutsModal isOpen onClose={onClose} />)

    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
    for (const description of [
      'New task',
      'Search',
      'Command palette',
      'Close',
      'Navigate task list',
      'Open selected task',
      'Toggle row selection',
      'Select a row range (table)',
    ]) {
      expect(screen.getByText(description)).toBeVisible()
    }

    await user.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})