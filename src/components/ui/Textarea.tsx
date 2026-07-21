import {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
} from 'react'

import { cn } from '../../utils/cn'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      hint,
      id,
      rows = 4,
      className,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...textareaProps
    },
    ref,
  ) {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const errorId = `${textareaId}-error`
    const hintId = `${textareaId}-hint`
    const describedBy = [
      ariaDescribedBy,
      error ? errorId : undefined,
      hint ? hintId : undefined,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="w-full">
        <label
          className="mb-1.5 block text-sm font-medium text-gray-700"
          htmlFor={textareaId}
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'block w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300',
            className,
          )}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={describedBy || undefined}
          {...textareaProps}
        />
        {error ? (
          <p className="mt-1.5 text-sm text-red-600" id={errorId} role="alert">
            {error}
          </p>
        ) : null}
        {hint ? (
          <p className="mt-1.5 text-sm text-gray-500" id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)

export default Textarea