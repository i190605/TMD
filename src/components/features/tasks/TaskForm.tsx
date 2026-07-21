import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  addBusinessDays,
  format,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ASSIGNEES } from '../../../constants'
import type { CreateTaskPayload } from '../../../types/task'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Modal } from '../../ui/Modal'
import { Select } from '../../ui/Select'
import { Textarea } from '../../ui/Textarea'
import { useToast } from '../../ui/Toast'

export type TaskFormMode = 'create' | 'edit'

export interface TaskFormProps {
  mode: TaskFormMode
  initialValues: Partial<CreateTaskPayload>
  isOpen: boolean
  onSubmit: (payload: CreateTaskPayload) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const assigneeOptions = ASSIGNEES.map((assignee) => ({
  value: assignee.id,
  label: assignee.name,
}))

const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be 100 characters or fewer'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer'),
  priority: z.enum(['high', 'medium', 'low']),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((value) => {
      if (!value) {
        return true
      }

      const date = parseISO(value)

      return (
        isValid(date) &&
        startOfDay(date).getTime() >= startOfDay(new Date()).getTime()
      )
    }, 'Due date cannot be in the past'),
  assigneeId: z
    .string()
    .min(1, 'Please select an assignee')
    .refine(
      (id) => ASSIGNEES.some((assignee) => assignee.id === id),
      'Please select an assignee',
    ),
  customerName: z
    .string()
    .trim()
    .min(2, 'Customer name must be at least 2 characters'),
  customerCompany: z
    .string()
    .trim()
    .min(2, 'Company must be at least 2 characters'),
  customerEmail: z
    .string()
    .trim()
    .min(1, 'Customer email is required')
    .email('Enter a valid email address'),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

function toDateInputValue(value: string | undefined): string {
  if (!value) {
    return format(addBusinessDays(new Date(), 3), 'yyyy-MM-dd')
  }

  const parsedDate = parseISO(value)

  return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : value
}

function createDefaultValues(
  initialValues: Partial<CreateTaskPayload>,
): TaskFormValues {
  return {
    title: initialValues.title ?? '',
    description: initialValues.description ?? '',
    priority: initialValues.priority ?? 'medium',
    dueDate: toDateInputValue(initialValues.dueDate),
    assigneeId: initialValues.assignee?.id ?? '',
    customerName: initialValues.customer?.name ?? '',
    customerCompany: initialValues.customer?.company ?? '',
    customerEmail: initialValues.customer?.email ?? '',
  }
}

export function TaskForm({
  mode,
  initialValues,
  isOpen,
  onSubmit,
  onCancel,
  isSubmitting,
}: TaskFormProps) {
  const { toast } = useToast()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const keepEditingRef = useRef<HTMLButtonElement>(null)
  const generatedCustomerIdRef = useRef(`customer-${crypto.randomUUID()}`)
  const [showCancelWarning, setShowCancelWarning] = useState(false)
  const modalTitle = mode === 'create' ? 'New Task' : 'Edit Task'
  const submitLabel = mode === 'create' ? 'Create Task' : 'Save Changes'
  const submittingLabel = mode === 'create' ? 'Creating...' : 'Saving...'
  const defaultValues = useMemo(
    () => createDefaultValues(initialValues),
    [initialValues],
  )
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    criteriaMode: 'all',
  })
  const titleRegistration = register('title')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    reset(defaultValues)
    setShowCancelWarning(false)
  }, [defaultValues, isOpen, mode, reset])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    let timeoutId: number | undefined
    const animationFrameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        titleInputRef.current?.focus()
      }, 0)
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (!showCancelWarning) {
      return undefined
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      keepEditingRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [showCancelWarning])

  const requestCancel = useCallback((): void => {
    if (isDirty) {
      setShowCancelWarning(true)
      return
    }

    onCancel()
  }, [isDirty, onCancel])

  const submitForm = async (values: TaskFormValues): Promise<void> => {
    const assignee = ASSIGNEES.find(
      (currentAssignee) => currentAssignee.id === values.assigneeId,
    )

    if (!assignee) {
      toast({
        type: 'error',
        message: 'Please select a valid assignee.',
      })
      return
    }

    const payload: CreateTaskPayload = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
      assignee,
      customer: {
        id:
          initialValues.customer?.id ?? generatedCustomerIdRef.current,
        name: values.customerName,
        company: values.customerCompany,
        email: values.customerEmail,
        plan: initialValues.customer?.plan ?? 'starter',
      },
      tags: initialValues.tags,
    }

    try {
      await onSubmit(payload)
    } catch (error: unknown) {
      toast({
        type: 'error',
        message:
          error instanceof Error && error.message
            ? error.message
            : `Failed to ${mode === 'create' ? 'create' : 'save'} task. Please try again.`,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={requestCancel} title={modalTitle} size="xl">
      <form
        className="space-y-6"
        onSubmit={handleSubmit(submitForm)}
        aria-label={mode === 'create' ? 'Create task form' : 'Edit task form'}
        noValidate
      >
        <Input
          {...titleRegistration}
          ref={(element) => {
            titleRegistration.ref(element)
            titleInputRef.current = element
          }}
          label="Title *"
          error={errors.title?.message}
          placeholder="Enter a clear task title"
          maxLength={100}
          autoFocus
          required
          aria-required="true"
        />

        <Textarea
          {...register('description')}
          label="Description"
          error={errors.description?.message}
          placeholder="Add context, requirements, or next steps"
          rows={4}
          maxLength={1000}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            {...register('priority')}
            label="Priority *"
            error={errors.priority?.message}
            options={priorityOptions}
            required
            aria-required="true"
          />
          <Input
            {...register('dueDate')}
            label="Due Date *"
            error={errors.dueDate?.message}
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            required
            aria-required="true"
          />
        </div>

        <Select
          {...register('assigneeId')}
          label="Assignee *"
          error={errors.assigneeId?.message}
          options={assigneeOptions}
          placeholder="Select an assignee"
          required
          aria-required="true"
        />

        <fieldset className="border-t border-slate-200 pt-6">
          <legend className="px-1 text-base font-semibold text-slate-900">
            Customer Information
          </legend>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Input
              {...register('customerName')}
              label="Customer Name *"
              error={errors.customerName?.message}
              placeholder="Customer name"
              required
              aria-required="true"
            />
            <Input
              {...register('customerCompany')}
              label="Company *"
              error={errors.customerCompany?.message}
              placeholder="Company name"
              required
              aria-required="true"
            />
            <Input
              {...register('customerEmail')}
              label="Email *"
              error={errors.customerEmail?.message}
              type="email"
              placeholder="customer@company.com"
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>
        </fieldset>

        {showCancelWarning ? (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 p-4"
            role="alert"
          >
            <p className="text-sm font-semibold text-amber-950">
              You have unsaved changes. Are you sure you want to cancel?
            </p>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button
                ref={keepEditingRef}
                variant="secondary"
                size="sm"
                onClick={() => setShowCancelWarning(false)}
              >
                Keep Editing
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onCancel}
              >
                Discard
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={requestCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskForm