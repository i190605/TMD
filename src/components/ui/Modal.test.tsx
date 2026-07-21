import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { expect, vi } from 'vitest'

import { Modal } from './Modal'

describe('Modal focus and dismissal behavior', () => {
  it('does not render while closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Task details">
        Content
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('labels the dialog, locks scrolling, focuses its first control, and restores focus', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open task'
    document.body.append(trigger)
    trigger.focus()
    document.body.style.overflow = 'scroll'
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen onClose={onClose} title="Task details">
        <button type="button">Child action</button>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Task details' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(document.body).toHaveStyle({ overflow: 'hidden' })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close modal' })).toHaveFocus()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenCalledOnce()

    rerender(
      <Modal isOpen={false} onClose={onClose} title="Task details">
        <button type="button">Child action</button>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body).toHaveStyle({ overflow: 'scroll' })
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('closes on Escape, prevents its default action, and ignores other keys', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Keyboard dialog">
        Content
      </Modal>,
    )

    const otherKey = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(otherKey)
    expect(onClose).not.toHaveBeenCalled()
    expect(otherKey.defaultPrevented).toBe(false)

    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(escape)

    expect(escape.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps forward and reverse Tab focus inside the dialog', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Focus trap">
        <button type="button" aria-hidden="true">
          Aria hidden
        </button>
        <button type="button" hidden>
          Hidden
        </button>
        <input aria-label="Task title" />
        <button type="button">Last action</button>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Focus trap' })
    const first = screen.getByRole('button', { name: 'Close modal' })
    const last = screen.getByRole('button', { name: 'Last action' })
    await waitFor(() => expect(first).toHaveFocus())

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()

    first.focus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()

    dialog.focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(first).toHaveFocus()

    dialog.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()

    last.focus()
    fireEvent.keyDown(last, { key: 'ArrowDown' })
    expect(last).toHaveFocus()
  })

  it('falls back to the dialog when no focusable descendants are available', () => {
    const animationCallbacks: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationCallbacks.push(callback)
      return animationCallbacks.length
    })
    const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()} title="No controls">
        Plain content
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'No controls' })
    vi.spyOn(dialog, 'querySelectorAll').mockReturnValue(
      [] as unknown as NodeListOf<Element>,
    )

    act(() => {
      animationCallbacks.forEach((callback) => callback(0))
    })

    expect(dialog).toHaveFocus()
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    dialog.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(true)
    expect(dialog).toHaveFocus()

    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('only treats a direct backdrop press as dismissal', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Backdrop dialog">
        <span>Dialog content</span>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Backdrop dialog' })
    const backdrop = dialog.parentElement

    expect(backdrop).not.toBeNull()
    fireEvent.mouseDown(screen.getByText('Dialog content'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.mouseDown(backdrop!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('runs both closed and open lifecycle branches on the same instance', async () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Lifecycle dialog">
        <button type="button">Action</button>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(
      <Modal isOpen onClose={onClose} title="Lifecycle dialog">
        <button type="button">Action</button>
      </Modal>,
    )
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Lifecycle dialog' })).toBeVisible()
    })

    rerender(
      <Modal isOpen={false} onClose={onClose} title="Lifecycle dialog">
        <button type="button">Action</button>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not move focus when Tab starts on a middle control', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Middle focus">
        <input aria-label="First field" />
        <input aria-label="Middle field" />
        <button type="button">Last action</button>
      </Modal>,
    )
    const middle = screen.getByRole('textbox', { name: 'Middle field' })

    middle.focus()
    fireEvent.keyDown(middle, { key: 'Tab' })
    expect(middle).toHaveFocus()

    fireEvent.keyDown(middle, { key: 'Tab', shiftKey: true })
    expect(middle).toHaveFocus()
  })

  it('cancels pending focus work when closed before the animation frame', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42)
    const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame')
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="Pending focus">
        Content
      </Modal>,
    )

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Pending focus">
        Content
      </Modal>,
    )

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42)
  })

  it('handles opening when the document has no HTML element focused', () => {
    const activeElementSpy = vi
      .spyOn(document, 'activeElement', 'get')
      .mockReturnValue(null)

    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()} title="No prior focus">
        Content
      </Modal>,
    )

    activeElementSpy.mockRestore()
    expect(() => unmount()).not.toThrow()
  })

  it('handles focus setup when the dialog ref is temporarily unavailable', () => {
    const callbacks: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callbacks.push(callback)
      return callbacks.length
    })
    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()} title="Detached dialog">
        Content
      </Modal>,
    )

    unmount()
    expect(() => callbacks.forEach((callback) => callback(0))).not.toThrow()
  })
})