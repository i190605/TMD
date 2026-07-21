import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

import { ASSIGNEES } from '../../../constants'
import type { CreateTaskPayload } from '../../../types/task'
import { ToastProvider } from '../../ui/Toast'
import { TaskForm, type TaskFormProps } from './TaskForm'

const initialValues: Partial<CreateTaskPayload> = {
  title: 'Existing customer task',
  description: 'Follow up with the customer.',
  priority: 'medium',
  dueDate: '2099-12-31',
  assignee: ASSIGNEES[0],
  customer: {
    id: 'customer-existing',
    name: 'Ada Lovelace',
    company: 'Analytical Engines',
    email: 'ada@example.com',
    plan: 'enterprise',
  },
  tags: ['retention'],
}

function renderTaskForm(overrides: Partial<TaskFormProps> = {}) {
  const props: TaskFormProps = {
    mode: 'edit',
    initialValues,
    isOpen: true,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    isSubmitting: false,
    ...overrides,
  }

  const view = render(
    <ToastProvider>
      <TaskForm {...props} />
    </ToastProvider>,
  )

  return { ...view, props }
}

async function makeFormDirty(): Promise<void> {
  const user = userEvent.setup()
  const title = screen.getByRole('textbox', { name: 'Title *' })
  await user.type(title, ' updated')
}

function fillRequiredCreateFields(): void {
  fireEvent.change(screen.getByRole('textbox', { name: 'Title *' }), {
    target: { value: 'Launch onboarding plan' },
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Assignee *' }), {
    target: { value: ASSIGNEES[1].id },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Customer Name *' }), {
    target: { value: 'Grace Hopper' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Company *' }), {
    target: { value: 'Compiler Labs' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Email *' }), {
    target: { value: 'grace@example.com' },
  })
}

describe('TaskForm dirty-form cancellation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('cancels a pristine form immediately', async () => {
    const user = userEvent.setup()
    const { props } = renderTaskForm()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(props.onCancel).toHaveBeenCalledOnce()
    expect(
      screen.queryByText(/you have unsaved changes/i),
    ).not.toBeInTheDocument()
  })

  it('warns before canceling a dirty form and lets the user keep editing', async () => {
    const user = userEvent.setup()
    const { props } = renderTaskForm()
    await makeFormDirty()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(props.onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'You have unsaved changes. Are you sure you want to cancel?',
    )
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Keep Editing' })).toHaveFocus()
    })

    await user.click(screen.getByRole('button', { name: 'Keep Editing' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(props.onCancel).not.toHaveBeenCalled()
  })

  it('only calls onCancel after the user discards dirty changes', async () => {
    const user = userEvent.setup()
    const { props } = renderTaskForm()
    await makeFormDirty()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: 'Discard' }))

    expect(props.onCancel).toHaveBeenCalledOnce()
  })

  it.each(['Escape', 'close button', 'backdrop'])(
    'routes the modal %s path through the dirty-form warning',
    async (closePath) => {
      const user = userEvent.setup()
      const { props } = renderTaskForm()
      await makeFormDirty()

      if (closePath === 'Escape') {
        fireEvent.keyDown(document, { key: 'Escape' })
      } else if (closePath === 'close button') {
        await user.click(screen.getByRole('button', { name: 'Close modal' }))
      } else {
        const backdrop = screen.getByRole('dialog').parentElement
        expect(backdrop).not.toBeNull()
        fireEvent.mouseDown(backdrop!)
      }

      expect(props.onCancel).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toHaveTextContent(/unsaved changes/i)
    },
  )

  it('allows Escape to close a pristine form', () => {
    const { props } = renderTaskForm()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(props.onCancel).toHaveBeenCalledOnce()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('resets the dirty warning after the form is closed and reopened', async () => {
    const user = userEvent.setup()
    const { props, rerender } = renderTaskForm()
    await makeFormDirty()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <ToastProvider>
        <TaskForm {...props} isOpen={false} />
      </ToastProvider>,
    )
    rerender(
      <ToastProvider>
        <TaskForm {...props} isOpen />
      </ToastProvider>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onCancel).toHaveBeenCalledOnce()
  })

  it('moves initial focus to the task title when opened', async () => {
    renderTaskForm()

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Title *' })).toHaveFocus()
    })
  })

  it('builds an edit payload without losing customer identity, plan, or tags', async () => {
    const { props } = renderTaskForm()

    fireEvent.submit(screen.getByRole('form', { name: 'Edit task form' }))

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledOnce())
    expect(props.onSubmit).toHaveBeenCalledWith({
      title: initialValues.title,
      description: initialValues.description,
      priority: initialValues.priority,
      dueDate: initialValues.dueDate,
      assignee: initialValues.assignee,
      customer: initialValues.customer,
      tags: initialValues.tags,
    })
  })

  it('supplies safe create defaults and generates starter customer identity', async () => {
    const { props } = renderTaskForm({
      mode: 'create',
      initialValues: {},
    })
    const dueDate = screen.getByLabelText<HTMLInputElement>('Due Date *')

    expect(screen.getByRole('dialog', { name: 'New Task' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Priority *' })).toHaveValue(
      'medium',
    )
    expect(dueDate.value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const dueDateValue = dueDate.value
    fillRequiredCreateFields()
    fireEvent.submit(screen.getByRole('form', { name: 'Create task form' }))

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledOnce())
    expect(props.onSubmit).toHaveBeenCalledWith({
      title: 'Launch onboarding plan',
      description: '',
      priority: 'medium',
      dueDate: dueDateValue,
      assignee: ASSIGNEES[1],
      customer: {
        id: expect.stringMatching(/^customer-/),
        name: 'Grace Hopper',
        company: 'Compiler Labs',
        email: 'grace@example.com',
        plan: 'starter',
      },
      tags: undefined,
    })
  })

  it('keeps an invalid initial date visible to form validation', async () => {
    const { props } = renderTaskForm({
      mode: 'create',
      initialValues: { ...initialValues, dueDate: 'not-a-date' },
    })

    fireEvent.submit(screen.getByRole('form', { name: 'Create task form' }))

    expect(
      await screen.findByText('Due date cannot be in the past'),
    ).toBeInTheDocument()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('reports a required due date without running the later date comparison', async () => {
    const { props } = renderTaskForm()
    fireEvent.change(screen.getByLabelText('Due Date *'), {
      target: { value: '' },
    })

    fireEvent.submit(screen.getByRole('form', { name: 'Edit task form' }))

    expect(await screen.findByText('Due date is required')).toBeInTheDocument()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a valid but past due date', async () => {
    const { props } = renderTaskForm()
    fireEvent.change(screen.getByLabelText('Due Date *'), {
      target: { value: '2000-01-01' },
    })

    fireEvent.submit(screen.getByRole('form', { name: 'Edit task form' }))

    expect(
      await screen.findByText('Due date cannot be in the past'),
    ).toBeInTheDocument()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('shows a defensive error if a selected assignee disappears before submit', async () => {
    const { props } = renderTaskForm()
    vi.spyOn(ASSIGNEES, 'find').mockReturnValue(undefined)

    fireEvent.submit(screen.getByRole('form', { name: 'Edit task form' }))

    expect(
      await screen.findByText('Please select a valid assignee.'),
    ).toBeInTheDocument()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('surfaces a submit error message returned by the service', async () => {
    renderTaskForm({
      onSubmit: vi.fn().mockRejectedValue(new Error('Customer is locked.')),
    })

    fireEvent.submit(screen.getByRole('form', { name: 'Edit task form' }))

    expect(await screen.findByText('Customer is locked.')).toBeInTheDocument()
  })

  it.each([
    ['create' as const, 'Failed to create task. Please try again.'],
    ['edit' as const, 'Failed to save task. Please try again.'],
  ])('uses the %s fallback when submission rejects without a message', async (mode, message) => {
    renderTaskForm({
      mode,
      onSubmit: vi.fn().mockRejectedValue('unknown failure'),
    })

    fireEvent.submit(
      screen.getByRole('form', {
        name: mode === 'create' ? 'Create task form' : 'Edit task form',
      }),
    )

    expect(await screen.findByText(message)).toBeInTheDocument()
  })

  it.each([
    ['create' as const, 'Creating...'],
    ['edit' as const, 'Saving...'],
  ])('locks the %s actions while submission is in progress', (mode, label) => {
    renderTaskForm({ mode, isSubmitting: true })

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: label })).toBeDisabled()
    expect(screen.getByRole('button', { name: label })).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })

  it('renders nothing and skips focus work when initially closed', () => {
    renderTaskForm({ mode: 'create', initialValues: {}, isOpen: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})