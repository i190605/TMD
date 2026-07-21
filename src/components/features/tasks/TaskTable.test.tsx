import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

import { makeTask } from '../../../test/factories'
import { TaskTable } from './TaskTable'

const tasks = [
  makeTask({ id: 'one', title: 'First task' }),
  makeTask({ id: 'two', title: 'Second task' }),
  makeTask({ id: 'three', title: 'Third task' }),
]

function renderTable(onSelectTask = vi.fn()) {
  render(
    <TaskTable
      tasks={tasks}
      loading={false}
      onSelectTask={onSelectTask}
      onStatusChange={vi.fn()}
      emptyState={null}
    />,
  )
  return { onSelectTask }
}

describe('TaskTable keyboard navigation and selection', () => {
  it('uses roving focus with bounded Up and Down navigation', () => {
    renderTable()
    const rows = screen.getAllByRole('row').slice(1)

    act(() => rows[0].focus())
    fireEvent.keyDown(rows[0], { key: 'ArrowDown' })
    expect(rows[1]).toHaveFocus()
    expect(rows[1]).toHaveAttribute('tabindex', '0')

    fireEvent.keyDown(rows[1], { key: 'ArrowDown' })
    fireEvent.keyDown(rows[2], { key: 'ArrowDown' })
    expect(rows[2]).toHaveFocus()

    fireEvent.keyDown(rows[2], { key: 'ArrowUp' })
    expect(rows[1]).toHaveFocus()
  })

  it('opens the focused task with Enter and selects it with Space', () => {
    const { onSelectTask } = renderTable()
    const row = screen.getByRole('row', { name: 'View task: Second task' })

    act(() => row.focus())
    fireEvent.keyDown(row, { key: 'Enter' })
    expect(onSelectTask).toHaveBeenCalledWith(tasks[1])

    fireEvent.keyDown(row, { key: ' ' })
    expect(row).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('1 task selected')).toBeInTheDocument()

    fireEvent.keyDown(row, { key: ' ' })
    expect(row).toHaveAttribute('aria-selected', 'false')
  })

  it('selects a contiguous range with Shift+click without opening a task', async () => {
    const user = userEvent.setup()
    const { onSelectTask } = renderTable()
    const first = screen.getByRole('checkbox', { name: 'Select First task' })
    const third = screen.getByRole('checkbox', { name: 'Select Third task' })

    await user.click(first)
    fireEvent.click(third, { shiftKey: true })

    expect(screen.getByText('3 tasks selected')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ checked: true }),
      ]),
    )
    expect(screen.getAllByRole('checkbox').every((checkbox) =>
      (checkbox as HTMLInputElement).checked,
    )).toBe(true)
    expect(onSelectTask).not.toHaveBeenCalled()
  })

  it('uses Shift+click on a row as range selection and ordinary click as activation', () => {
    const { onSelectTask } = renderTable()
    const first = screen.getByRole('row', { name: 'View task: First task' })
    const third = screen.getByRole('row', { name: 'View task: Third task' })

    fireEvent.keyDown(first, { key: ' ' })
    fireEvent.click(third, { shiftKey: true })
    expect(screen.getByText('3 tasks selected')).toBeInTheDocument()
    expect(onSelectTask).not.toHaveBeenCalled()

    fireEvent.click(third)
    expect(onSelectTask).toHaveBeenCalledWith(tasks[2])
  })
})